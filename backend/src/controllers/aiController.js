const aiService = require('../services/ai');
const auditModel = require('../models/auditModel');
const issueModel = require('../models/issueModel');
const pageModel = require('../models/pageModel');

const aiController = {
  async analyze(req, res, next) {
    try {
      const { auditId } = req.body;
      let auditData = req.body;

      if (auditId) {
        const audit = await auditModel.findById(auditId);
        const issues = await issueModel.findByAudit(auditId);
        auditData = {
          websiteUrl: audit?.website_url,
          overallScore: audit?.seo_score,
          technicalScore: audit?.technical_score,
          onPageScore: audit?.onpage_score,
          contentScore: audit?.content_score,
          performanceScore: audit?.performance_score,
          structuredDataScore: audit?.structured_data_score,
          socialScore: audit?.social_score,
          localScore: audit?.local_score,
          issues
        };
      }

      const analysis = await aiService.generateAuditSummary(auditData);
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  },

  async generateMetaTitle(req, res, next) {
    try {
      const { targetKeyword, businessName, businessLocation } = req.body;
      const result = await aiService.generateMetaTitles({ targetKeyword, businessName, businessLocation });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async generateMetaDescription(req, res, next) {
    try {
      const { targetKeyword, businessName, businessLocation } = req.body;
      const result = await aiService.generateMetaDescriptions({ targetKeyword, businessName, businessLocation });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async optimizeContent(req, res, next) {
    try {
      const { targetKeyword, content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Content text is required.'
        });
      }
      const result = await aiService.optimizeContent({ targetKeyword, content });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async generateFix(req, res, next) {
    try {
      const { issueType, pageUrl, currentContent, targetKeyword, businessName, businessLocation } = req.body;
      const result = await aiService.generateFix({
        issueType,
        pageUrl,
        currentContent,
        targetKeyword,
        businessName,
        businessLocation
      });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async chat(req, res, next) {
    try {
      const { message, history = [], auditId, auditData: customData } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Message is required.'
        });
      }

      let auditData = customData || {};
      if (auditId && (!auditData || !auditData.overallScore)) {
        const audit = await auditModel.findById(auditId);
        const issues = await issueModel.findByAudit(auditId);
        if (audit) {
          auditData = {
            websiteUrl: audit.website_url,
            overallScore: audit.seo_score,
            technicalScore: audit.technical_score,
            onPageScore: audit.onpage_score,
            contentScore: audit.content_score,
            performanceScore: audit.performance_score,
            issues
          };
        }
      }

      const response = await aiService.chatWithConsultant({
        message,
        history,
        auditData
      });

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  },

  async getCouncil(req, res, next) {
    try {
      const { auditId, auditData: customData } = req.body;
      let auditData = customData || {};
      if (auditId && !auditData.overallScore) {
        const audit = await auditModel.findById(auditId);
        const issues = await issueModel.findByAudit(auditId);
        if (audit) {
          auditData = {
            websiteUrl: audit.website_url,
            overallScore: audit.seo_score,
            technicalScore: audit.technical_score,
            onPageScore: audit.onpage_score,
            contentScore: audit.content_score,
            performanceScore: audit.performance_score,
            structuredDataScore: audit.structured_data_score,
            socialScore: audit.social_score,
            localScore: audit.local_score,
            mobileScore: audit.mobile_score,
            desktopScore: audit.desktop_score,
            issues
          };
        }
      }
      const councilResult = aiService.getCouncilEvaluation(auditData);
      res.json({
        success: true,
        data: councilResult
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = aiController;
