const ReportService = require('../services/reports');
const auditModel = require('../models/auditModel');
const pageModel = require('../models/pageModel');
const issueModel = require('../models/issueModel');

const reportController = {
  async getPdfReport(req, res, next) {
    try {
      const { auditId } = req.params;
      const audit = await auditModel.findById(auditId);

      if (!audit) {
        return res.status(404).json({
          success: false,
          message: 'Audit not found.'
        });
      }

      const pages = await pageModel.findByAudit(auditId);
      const issues = await issueModel.findByAudit(auditId);

      const auditData = {
        id: audit.id,
        websiteUrl: audit.website_url,
        seoScore: audit.seo_score,
        technicalScore: audit.technical_score,
        onPageScore: audit.onpage_score,
        contentScore: audit.content_score,
        performanceScore: audit.performance_score,
        structuredDataScore: audit.structured_data_score,
        socialScore: audit.social_score,
        localScore: audit.local_score,
        pagesCrawled: audit.pages_crawled,
        targetKeyword: audit.target_keyword,
        createdAt: audit.created_at,
        pages,
        issues
      };

      const filename = `seo-report-${new URL(audit.website_url).hostname}-${audit.id}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      ReportService.generatePdf(auditData, res);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reportController;
