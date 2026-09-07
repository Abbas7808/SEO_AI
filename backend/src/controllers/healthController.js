const db = require('../config/db');

const healthController = {
  async checkHealth(req, res) {
    let dbStatus = 'disconnected';
    let dbError = null;

    try {
      await db.query('SELECT 1');
      dbStatus = 'connected';
    } catch (err) {
      dbError = err.message;
    }

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          error: dbError
        },
        api: 'running'
      }
    });
  }
};

module.exports = healthController;
