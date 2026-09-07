const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { optionalAuth, requireAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, auditController.createAudit);
router.get('/', optionalAuth, auditController.getAudits);

// Advanced Unique SEO Services
router.post('/inspect-site', optionalAuth, auditController.inspectSite);
router.post('/compare', optionalAuth, auditController.compareAudits);
router.post('/backlit-words', optionalAuth, auditController.analyzeBacklitWords);

router.get('/:id', optionalAuth, auditController.getAuditById);
router.delete('/:id', optionalAuth, auditController.deleteAudit);
router.get('/:id/pages', optionalAuth, auditController.getPages);
router.get('/:id/issues', optionalAuth, auditController.getIssues);
router.get('/:id/roadmap', optionalAuth, auditController.getRoadmap);
router.get('/:id/backlinks', optionalAuth, auditController.getBacklinkAnalysis);

module.exports = router;
