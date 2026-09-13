const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../config/db');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const users = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}

async function optionalAuth(req, res, next) {
  try {
    // Check Authorization header first, then fall back to ?token= query param
    // (SSE/EventSource cannot set custom headers, so token must be in URL)
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const users = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [decoded.id]);
      if (users.length > 0) {
        req.user = users[0];
      }
    }
  } catch (err) {
    // Ignore invalid token in optional mode
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
