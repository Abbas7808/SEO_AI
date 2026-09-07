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
