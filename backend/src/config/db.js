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

    // Step 5: Agency platform migrations (client_id, project_id, user agency branding)
    try {
      const [clientCol] = await pool.query("SHOW COLUMNS FROM audits LIKE 'client_id'");
      if (clientCol.length === 0) {
        await pool.query("ALTER TABLE audits ADD COLUMN client_id INT NULL AFTER user_id");
        await pool.query("ALTER TABLE audits ADD COLUMN project_id INT NULL AFTER client_id");
        logger.info('Audits table migrated with client_id and project_id columns.');
      }
    } catch (e) { logger.warn(`Agency audit migration: ${e.message}`); }

    try {
      const [agencyCol] = await pool.query("SHOW COLUMNS FROM users LIKE 'agency_name'");
      if (agencyCol.length === 0) {
        await pool.query("ALTER TABLE users ADD COLUMN agency_name VARCHAR(255) NULL DEFAULT 'SEO Pro Agency' AFTER password");
        await pool.query("ALTER TABLE users ADD COLUMN agency_logo_url VARCHAR(2048) NULL AFTER agency_name");
        await pool.query("ALTER TABLE users ADD COLUMN agency_email VARCHAR(255) NULL AFTER agency_logo_url");
        await pool.query("ALTER TABLE users ADD COLUMN agency_phone VARCHAR(50) NULL AFTER agency_email");
        await pool.query("ALTER TABLE users ADD COLUMN agency_color VARCHAR(20) NULL DEFAULT '#6366f1' AFTER agency_phone");
        await pool.query("ALTER TABLE users ADD COLUMN agency_tagline VARCHAR(255) NULL AFTER agency_color");
        await pool.query("ALTER TABLE users ADD COLUMN default_currency VARCHAR(10) NULL DEFAULT 'PKR' AFTER agency_tagline");
        logger.info('Users table migrated with agency branding columns.');
      }
    } catch (e) { logger.warn(`Agency user migration: ${e.message}`); }

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
