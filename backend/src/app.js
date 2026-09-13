const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// High-performance ETag generation for instant 304 Not Modified caching
app.set('etag', 'strong');

// High-speed Brotli / Gzip response compression (shrinks JSON payloads up to 85%)
app.use(compression({
  threshold: 512, // Compress any response larger than 512 bytes
  level: 6,       // Optimal trade-off between CPU cycles and compression ratio
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Browser Caching & Performance Headers Middleware
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  // Enable Stale-While-Revalidate caching semantics for non-auth GET requests
  if (req.method === 'GET' && !req.path.includes('/auth/')) {
    res.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=60');
  }
  next();
});

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in development
  },
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api', apiRoutes);

// Fallback & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
