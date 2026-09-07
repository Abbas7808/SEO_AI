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

// Google Antigravity Autonomous SEO Auto-Fixer
router.post('/antigravity/repair-issue', optionalAuth, auditController.repairIssueWithAntigravity);

router.get('/:id', optionalAuth, auditController.getAuditById);
router.delete('/:id', optionalAuth, auditController.deleteAudit);
router.get('/:id/pages', optionalAuth, auditController.getPages);
router.get('/:id/issues', optionalAuth, auditController.getIssues);
router.get('/:id/roadmap', optionalAuth, auditController.getRoadmap);
router.get('/:id/backlinks', optionalAuth, auditController.getBacklinkAnalysis);
router.get('/:id/antigravity/session', optionalAuth, auditController.getAntigravitySession);
router.get('/:id/antigravity/blueprint', optionalAuth, auditController.getAntigravityBlueprint);
router.post('/:id/antigravity/resolve-issue', optionalAuth, auditController.resolveIssueWithAntigravity);
router.get('/:id/antigravity/download-patch', optionalAuth, auditController.downloadAntigravityPatch);

module.exports = router;
