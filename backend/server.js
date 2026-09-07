const app = require('./src/app');
const config = require('./src/config/env');
const db = require('./src/config/db');
const logger = require('./src/utils/logger');

async function startServer() {
  try {
    // 1. Initialize MySQL Database & Run Schema
    logger.info('Initializing AI SEO Auditor database connection...');
    await db.initDatabase();
    logger.info('Database initialized successfully.');

    // 2. Start HTTP Server
    const PORT = config.port;
    const server = app.listen(PORT, () => {
      logger.info(`================================================`);
      logger.info(`🚀 AI SEO Auditor Backend Server running!`);
      logger.info(`🌐 Port: ${PORT}`);
      logger.info(`📡 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 API Health: http://localhost:${PORT}/api/health`);
      logger.info(`================================================`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          const pool = db.getPool();
          await pool.end();
          logger.info('Database pool closed.');
        } catch (e) {
          logger.error('Error closing DB pool:', e.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Fatal startup error:', error.message);
    process.exit(1);
  }
}

startServer();
