const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { optionalAuth } = require('../middleware/authMiddleware');

// ═══ Client CRM ═══
router.get('/clients', optionalAuth, agencyController.getClients);
router.post('/clients', optionalAuth, agencyController.createClient);
router.get('/clients/:id', optionalAuth, agencyController.getClientById);
router.put('/clients/:id', optionalAuth, agencyController.updateClient);
router.delete('/clients/:id', optionalAuth, agencyController.deleteClient);
router.get('/clients/:id/projects', optionalAuth, agencyController.getProjects);
router.post('/clients/:id/projects', optionalAuth, agencyController.createProject);

// ═══ Keyword Rank Tracker ═══
router.get('/keywords', optionalAuth, agencyController.getKeywords);
router.post('/keywords', optionalAuth, agencyController.addKeyword);
router.get('/keywords/:id/history', optionalAuth, agencyController.getKeywordHistory);
router.delete('/keywords/:id', optionalAuth, agencyController.removeKeyword);
router.post('/keywords/track-all', optionalAuth, agencyController.trackAllKeywords);

// ═══ Scheduled Audits ═══
router.get('/schedules', optionalAuth, agencyController.getSchedules);
router.post('/schedules', optionalAuth, agencyController.createSchedule);
router.put('/schedules/:id/toggle', optionalAuth, agencyController.toggleSchedule);
router.delete('/schedules/:id', optionalAuth, agencyController.deleteSchedule);

// ═══ Score Trends ═══
router.get('/trends/scores', optionalAuth, agencyController.getScoreHistory);
router.get('/trends/issues', optionalAuth, agencyController.getIssuesTrend);

// ═══ Proposals ═══
router.get('/proposals', optionalAuth, agencyController.getProposals);
router.post('/proposals', optionalAuth, agencyController.createProposal);
router.put('/proposals/:id', optionalAuth, agencyController.updateProposal);
router.delete('/proposals/:id', optionalAuth, agencyController.deleteProposal);

// ═══ Invoices ═══
router.get('/invoices', optionalAuth, agencyController.getInvoices);
router.post('/invoices', optionalAuth, agencyController.createInvoice);
router.put('/invoices/:id', optionalAuth, agencyController.updateInvoice);
router.delete('/invoices/:id', optionalAuth, agencyController.deleteInvoice);

// ═══ Client Portal ═══
router.post('/portal/generate', optionalAuth, agencyController.generatePortalLink);
router.get('/portal/links', optionalAuth, agencyController.getPortalLinks);
router.get('/portal/:token', agencyController.getPortalData); // Public — no auth

// ═══ Schema Generator & Sitemap Validator ═══
router.post('/tools/schema', optionalAuth, agencyController.generateSchema);
router.post('/tools/sitemap-validate', optionalAuth, agencyController.validateSitemap);

module.exports = router;
