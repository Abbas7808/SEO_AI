const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const auditRoutes = require('./auditRoutes');
const aiController = require('../controllers/aiController');
const reportController = require('../controllers/reportController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/audits', auditRoutes);

// AI Service Routes
router.post('/ai/analyze', optionalAuth, aiController.analyze);
router.post('/ai/generate-meta-title', optionalAuth, aiController.generateMetaTitle);
router.post('/ai/generate-meta-description', optionalAuth, aiController.generateMetaDescription);
router.post('/ai/optimize-content', optionalAuth, aiController.optimizeContent);
router.post('/ai/generate-fix', optionalAuth, aiController.generateFix);
router.post('/ai/chat', optionalAuth, aiController.chat);

// PDF Reports Download Route
router.get('/reports/:auditId', optionalAuth, reportController.getPdfReport);

module.exports = router;
