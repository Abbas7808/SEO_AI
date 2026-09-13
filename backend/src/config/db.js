const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('./env');
const logger = require('../utils/logger');

let pool = null;

async function initDatabase() {
  try {
    logger.info(`Connecting to MySQL host ${config.db.host}:${config.db.port}...`);
    
    // Step 1: Connect to server without specifying DB to ensure DB exists
    const rootConnection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      multipleStatements: true
    });

    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await rootConnection.end();
    logger.info(`Database "${config.db.database}" verified/created successfully.`);

    // Step 2: Create connection pool targeted at the application database
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: config.db.waitForConnections,
      connectionLimit: config.db.connectionLimit,
      queueLimit: config.db.queueLimit,
      multipleStatements: true
    });

    // Step 3: Run schema.sql migrations
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await pool.query(schemaSql);
      logger.info('Database schema verified/executed successfully.');
    } else {
      logger.warn(`Schema file not found at ${schemaPath}`);
    }

    // Step 4: Safe column migrations for dual scan mode and local codebase issues
    try {
      const [auditCols] = await pool.query("SHOW COLUMNS FROM audits LIKE 'scan_mode'");
      if (auditCols.length === 0) {
        await pool.query("ALTER TABLE audits ADD COLUMN scan_mode ENUM('online', 'local') NOT NULL DEFAULT 'online' AFTER max_pages");
        await pool.query("ALTER TABLE audits ADD COLUMN project_path VARCHAR(1024) NULL AFTER scan_mode");
        logger.info('Audits table migrated with scan_mode and project_path columns.');
      }
    } catch (e) {
      logger.warn(`Audits column check note: ${e.message}`);
    }

    try {
      const [issueCols] = await pool.query("SHOW COLUMNS FROM seo_issues LIKE 'file_path'");
      if (issueCols.length === 0) {
        await pool.query("ALTER TABLE seo_issues ADD COLUMN file_path VARCHAR(1024) NULL AFTER page_url");
        await pool.query("ALTER TABLE seo_issues ADD COLUMN line_number INT NULL AFTER file_path");
        await pool.query("ALTER TABLE seo_issues ADD COLUMN code_snippet TEXT NULL AFTER line_number");
        await pool.query("ALTER TABLE seo_issues ADD COLUMN code_diff TEXT NULL AFTER code_snippet");
        logger.info('SEO issues table migrated with local file and diff columns.');
      }
    } catch (e) {
      logger.warn(`SEO issues column check note: ${e.message}`);
    }

    return pool;
  } catch (error) {
    logger.error('Failed to initialize database:', error.message);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call initDatabase() first.');
  }
  return pool;
}

async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

module.exports = {
  initDatabase,
  getPool,
  query
};
