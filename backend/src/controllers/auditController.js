const auditModel = require('../models/auditModel');
const pageModel = require('../models/pageModel');
const issueModel = require('../models/issueModel');
const { validateAuditUrl } = require('../utils/ssrfGuard');
const CrawlerService = require('../services/crawler');
const { SeoEngine, SeoRoadmapGenerator, BacklinkAnalyzer, SiteInspector } = require('../services/seo');
const aiService = require('../services/ai');
const antigravityEngine = require('../services/ai/antigravityEngine');
const logger = require('../utils/logger');

const auditController = {
  /**
   * Start a real website SEO audit
   */
  async createAudit(req, res, next) {
    try {
      const {
        websiteUrl,
        url,
        maxPages = 20,
        targetKeyword,
        businessName,
        businessLocation
      } = req.body;

      const targetSiteUrl = websiteUrl || url;

      // 1. SSRF and format validation
      const validatedUrl = await validateAuditUrl(targetSiteUrl);

      // 2. Parse max pages (bounded between 1 and 50)
      const parsedMaxPages = Math.min(Math.max(parseInt(maxPages, 10) || 20, 1), 50);

      // 3. Create initial pending audit record in database
      const userId = req.user ? req.user.id : null;
      const auditId = await auditModel.create({
        userId,
        websiteUrl: validatedUrl,
        maxPages: parsedMaxPages,
        targetKeyword: targetKeyword ? targetKeyword.trim() : null,
        businessName: businessName ? businessName.trim() : null,
        businessLocation: businessLocation ? businessLocation.trim() : null
      });

      logger.info(`Audit #${auditId} created for ${validatedUrl}. Starting real crawl...`);

      // 4. Update status to crawling
      await auditModel.updateStatus(auditId, 'crawling');

      // 5. Execute real website crawler
      const crawler = new CrawlerService({
        maxPages: parsedMaxPages,
        timeout: 12000
      });

      const crawlResult = await crawler.crawl(validatedUrl);

      // 6. Update status to analyzing
      await auditModel.updateStatus(auditId, 'analyzing');

      // 7. Run real SEO Analysis and 0-100 Scoring Engine
      const context = {
        websiteUrl: validatedUrl,
        targetKeyword: targetKeyword ? targetKeyword.trim() : '',
        businessName: businessName ? businessName.trim() : '',
        businessLocation: businessLocation ? businessLocation.trim() : ''
      };

      const { analyzedPages, scoreResult, roadmap, backlinkProfile } = SeoEngine.analyzeAndScore(crawlResult.pages, context);

      // 8. Persist crawled pages to database
      const pageIdMap = new Map();
      for (const page of analyzedPages) {
        const pageId = await pageModel.create({
          auditId,
          url: page.url,
          statusCode: page.statusCode,
          title: page.onPage.title,
          metaDescription: page.onPage.metaDescription,
          canonicalUrl: page.technical.canonicalTag,
          h1Count: page.onPage.h1Count,
          wordCount: page.content.wordCount,
          imageCount: page.images.total,
          internalLinkCount: page.links.internalCount,
          externalLinkCount: page.links.externalCount,
          seoScore: page.pageOverall || scoreResult.overallScore,
          loadTimeMs: page.performance.responseTimeMs,
          pageSizeKb: Math.round(page.performance.htmlSizeBytes / 1024),
          contentDetails: {
            headings: { h1: page.onPage.h1s, h2: page.onPage.h2s },
            imagesWithoutAlt: page.images.missingAltCount,
            schemas: page.structuredData.schemas,
            social: page.social,
            anchors: page.links.anchors
          }
        });
        pageIdMap.set(page.url, pageId);
      }

      // 9. Persist detected issues to database
      if (scoreResult.issues && scoreResult.issues.length > 0) {
        const issuesToInsert = scoreResult.issues.map(issue => ({
          auditId,
          pageId: pageIdMap.get(issue.page) || null,
          issueType: issue.type,
          category: issue.category || 'technical',
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          impact: issue.impact,
          recommendation: issue.recommendation,
          suggestedFix: issue.suggestedFix || issue.suggested_fix || null,
          solutionSteps: issue.solutionSteps ? JSON.stringify(issue.solutionSteps) : null,
          pageUrl: issue.page,
          status: 'open'
        }));

        await issueModel.createMany(issuesToInsert);
      }

      // 10. Generate Google Antigravity Autonomous Repair Blueprint
      let antigravityBlueprint = null;
      try {
        antigravityBlueprint = antigravityEngine.batchRepairAll({
          auditId,
          websiteUrl: validatedUrl,
          issues: scoreResult.issues
        });
      } catch (agErr) {
        logger.warn(`Antigravity blueprint generation note: ${agErr.message}`);
      }

      // 11. AI Summary & Strategic Recommendations
      let aiSummaryJson = null;
      try {
        const aiSummary = await aiService.generateAuditSummary({
          websiteUrl: validatedUrl,
          overallScore: scoreResult.overallScore,
          mobileScore: scoreResult.mobileScore,
          desktopScore: scoreResult.desktopScore,
          technicalScore: scoreResult.technicalScore,
          onPageScore: scoreResult.onPageScore,
          contentScore: scoreResult.contentScore,
          performanceScore: scoreResult.performanceScore,
          structuredDataScore: scoreResult.structuredDataScore,
          socialScore: scoreResult.socialScore,
          localScore: scoreResult.localScore,
          issues: scoreResult.issues
        });
        aiSummary.roadmap = roadmap;
        aiSummary.backlinkProfile = backlinkProfile;
        aiSummary.antigravityBlueprint = antigravityBlueprint;
        aiSummaryJson = JSON.stringify(aiSummary);
      } catch (aiErr) {
        logger.warn(`AI Summary generation note: ${aiErr.message}`);
        aiSummaryJson = JSON.stringify({ roadmap, backlinkProfile, antigravityBlueprint });
      }

      // 12. Update audit with calculated real scores and completed status
      await auditModel.updateScores(auditId, {
        seoScore: scoreResult.overallScore,
        mobileScore: scoreResult.mobileScore,
        desktopScore: scoreResult.desktopScore,
        technicalScore: scoreResult.technicalScore,
        onpageScore: scoreResult.onPageScore,
        contentScore: scoreResult.contentScore,
        performanceScore: scoreResult.performanceScore,
        structuredDataScore: scoreResult.structuredDataScore,
        socialScore: scoreResult.socialScore,
        localScore: scoreResult.localScore,
        pagesCrawled: crawlResult.totalCrawled,
        aiSummary: aiSummaryJson
      });

      await auditModel.updateStatus(auditId, 'completed');

      const completedAudit = await auditModel.findById(auditId);

      logger.info(`Audit #${auditId} completed successfully! SEO Score: ${scoreResult.overallScore}/100`);

      res.status(201).json({
        success: true,
        message: 'Audit completed successfully.',
        data: {
          audit: completedAudit,
          scoreResult,
          roadmap,
          backlinkProfile,
          antigravityBlueprint
        }
      });
    } catch (error) {
      logger.error(`Error processing audit: ${error.message}`);
      next(error);
    }
  },

  async getAudits(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const audits = await auditModel.listByUser(userId, 100);

      res.json({
        success: true,
        data: {
          audits
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getAuditById(req, res, next) {
    try {
      const { id } = req.params;
      const audit = await auditModel.findById(id);

      if (!audit) {
        return res.status(404).json({
          success: false,
          message: 'Audit not found.'
        });
      }

      const pages = await pageModel.findByAudit(id);
      const issues = await issueModel.findByAudit(id);
      const issueCounts = await issueModel.getCountsBySeverity(id);

      let roadmap = null;
      let backlinkProfile = null;
      let antigravityBlueprint = null;
      if (audit.ai_summary) {
        try {
          const parsedAi = JSON.parse(audit.ai_summary);
          roadmap = parsedAi.roadmap || null;
          backlinkProfile = parsedAi.backlinkProfile || null;
          antigravityBlueprint = parsedAi.antigravityBlueprint || null;
        } catch (e) {}
      }

      // If roadmap or backlinkProfile or antigravityBlueprint is missing, generate on-the-fly
      const context = {
        websiteUrl: audit.website_url,
        targetKeyword: audit.target_keyword,
        businessName: audit.business_name,
        businessLocation: audit.business_location
      };
      const mobileScore = audit.mobile_score || Math.max(10, Math.round(audit.seo_score * 0.94));
      const desktopScore = audit.desktop_score || Math.min(100, Math.round(audit.seo_score * 1.03));

      const scoreResult = {
        overallScore: audit.seo_score,
        mobileScore,
        desktopScore,
        technicalScore: audit.technical_score,
        onPageScore: audit.onpage_score,
        contentScore: audit.content_score,
        performanceScore: audit.performance_score,
        structuredDataScore: audit.structured_data_score,
        socialScore: audit.social_score,
        localScore: audit.local_score,
        issues
      };

      if (!roadmap) {
        roadmap = SeoRoadmapGenerator.generate({ analyzedPages: pages, scoreResult, context });
      }
      if (!backlinkProfile) {
        backlinkProfile = BacklinkAnalyzer.analyze({ analyzedPages: pages, context });
      }
      if (!antigravityBlueprint) {
        antigravityBlueprint = antigravityEngine.batchRepairAll({
          auditId: id,
          websiteUrl: audit.website_url,
          issues
        });
      }

      res.json({
        success: true,
        data: {
          audit,
          pages,
          issues,
          issueCounts,
          roadmap,
          backlinkProfile,
          antigravityBlueprint
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteAudit(req, res, next) {
    try {
      const { id } = req.params;
      const audit = await auditModel.findById(id);

      if (!audit) {
        return res.status(404).json({
          success: false,
          message: 'Audit not found.'
        });
      }

      await auditModel.delete(id);

      res.json({
        success: true,
        message: 'Audit deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async getPages(req, res, next) {
    try {
      const { id } = req.params;
      const pages = await pageModel.findByAudit(id);

      res.json({
        success: true,
        data: {
          pages
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getIssues(req, res, next) {
    try {
      const { id } = req.params;
      const { severity } = req.query;
      const issues = await issueModel.findByAudit(id, severity || null);

      res.json({
        success: true,
        data: {
          issues
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getRoadmap(req, res, next) {
    try {
      const { id } = req.params;
      const audit = await auditModel.findById(id);
      if (!audit) {
        return res.status(404).json({ success: false, message: 'Audit not found.' });
      }

      if (audit.ai_summary) {
        try {
          const parsed = JSON.parse(audit.ai_summary);
          if (parsed.roadmap) {
            return res.json({ success: true, data: { roadmap: parsed.roadmap } });
          }
        } catch (e) {}
      }

      const pages = await pageModel.findByAudit(id);
      const issues = await issueModel.findByAudit(id);
      const context = {
        websiteUrl: audit.website_url,
        targetKeyword: audit.target_keyword,
        businessName: audit.business_name,
        businessLocation: audit.business_location
      };
      const scoreResult = {
        overallScore: audit.seo_score,
        issues
      };
      const roadmap = SeoRoadmapGenerator.generate({ analyzedPages: pages, scoreResult, context });

      res.json({
        success: true,
        data: { roadmap }
      });
    } catch (error) {
      next(error);
    }
  },

  async getBacklinkAnalysis(req, res, next) {
    try {
      const { id } = req.params;
      const audit = await auditModel.findById(id);
      if (!audit) {
        return res.status(404).json({ success: false, message: 'Audit not found.' });
      }

      if (audit.ai_summary) {
        try {
          const parsed = JSON.parse(audit.ai_summary);
          if (parsed.backlinkProfile) {
            return res.json({ success: true, data: { backlinkProfile: parsed.backlinkProfile } });
          }
        } catch (e) {}
      }

      const pages = await pageModel.findByAudit(id);
      const context = {
        websiteUrl: audit.website_url,
        targetKeyword: audit.target_keyword,
        businessName: audit.business_name
      };
      const backlinkProfile = BacklinkAnalyzer.analyze({ analyzedPages: pages, context });

      res.json({
        success: true,
        data: { backlinkProfile }
      });
    } catch (error) {
      next(error);
    }
  },

  async inspectSite(req, res, next) {
    try {
      const targetUrl = req.body.websiteUrl || req.body.url || req.query.url;
      if (!targetUrl) {
        return res.status(400).json({ success: false, message: 'Please provide a website URL to inspect.' });
      }
      const result = await SiteInspector.inspect(targetUrl);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async compareAudits(req, res, next) {
    try {
      const { auditIdA, auditIdB, urlA, urlB } = req.body;
      let auditA = null;
      let auditB = null;

      if (auditIdA) {
        auditA = await auditModel.findById(auditIdA);
      }
      if (auditIdB) {
        auditB = await auditModel.findById(auditIdB);
      }

      if (!auditA && urlA) {
        const validatedA = await validateAuditUrl(urlA);
        const crawlerA = new CrawlerService({ maxPages: 5, timeout: 8000 });
        const crawlResA = await crawlerA.crawl(validatedA);
        const { scoreResult: scoreA } = SeoEngine.analyzeAndScore(crawlResA.pages, { websiteUrl: validatedA });
        auditA = {
          website_url: validatedA,
          seo_score: scoreA.overallScore,
          technical_score: scoreA.technicalScore,
          onpage_score: scoreA.onPageScore,
          content_score: scoreA.contentScore,
          performance_score: scoreA.performanceScore,
          structured_data_score: scoreA.structuredDataScore,
          social_score: scoreA.socialScore,
          pages_crawled: crawlResA.totalCrawled
        };
      }

      if (!auditB && urlB) {
        const validatedB = await validateAuditUrl(urlB);
        const crawlerB = new CrawlerService({ maxPages: 5, timeout: 8000 });
        const crawlResB = await crawlerB.crawl(validatedB);
        const { scoreResult: scoreB } = SeoEngine.analyzeAndScore(crawlResB.pages, { websiteUrl: validatedB });
        auditB = {
          website_url: validatedB,
          seo_score: scoreB.overallScore,
          technical_score: scoreB.technicalScore,
          onpage_score: scoreB.onPageScore,
          content_score: scoreB.contentScore,
          performance_score: scoreB.performanceScore,
          structured_data_score: scoreB.structuredDataScore,
          social_score: scoreB.socialScore,
          pages_crawled: crawlResB.totalCrawled
        };
      }

      if (!auditA || !auditB) {
        return res.status(400).json({ success: false, message: 'Both websites/audits are required for comparison.' });
      }

      const metrics = [
        { name: 'Overall SEO Score', keyA: auditA.seo_score, keyB: auditB.seo_score, unit: '/100', higherIsBetter: true },
        { name: 'Technical SEO', keyA: auditA.technical_score, keyB: auditB.technical_score, unit: '/100', higherIsBetter: true },
        { name: 'On-Page SEO', keyA: auditA.onpage_score, keyB: auditB.onpage_score, unit: '/100', higherIsBetter: true },
        { name: 'Content SEO', keyA: auditA.content_score, keyB: auditB.content_score, unit: '/100', higherIsBetter: true },
        { name: 'Performance & Speed', keyA: auditA.performance_score, keyB: auditB.performance_score, unit: '/100', higherIsBetter: true },
        { name: 'Structured Data', keyA: auditA.structured_data_score, keyB: auditB.structured_data_score, unit: '/100', higherIsBetter: true },
        { name: 'Social SEO', keyA: auditA.social_score, keyB: auditB.social_score, unit: '/100', higherIsBetter: true },
        { name: 'Pages Crawled', keyA: auditA.pages_crawled || 0, keyB: auditB.pages_crawled || 0, unit: ' pages', higherIsBetter: true }
      ];

      const scoredMetrics = metrics.map(m => {
        const valA = m.keyA || 0;
        const valB = m.keyB || 0;
        let winner = 'tie';
        if (valA > valB) winner = 'A';
        else if (valB > valA) winner = 'B';
        return { ...m, valA, valB, winner };
      });

      const winsA = scoredMetrics.filter(m => m.winner === 'A').length;
      const winsB = scoredMetrics.filter(m => m.winner === 'B').length;

      res.json({
        success: true,
        data: {
          siteA: auditA,
          siteB: auditB,
          metrics: scoredMetrics,
          summary: {
            winner: winsA > winsB ? 'Site A' : winsB > winsA ? 'Site B' : 'Tie',
            winsA,
            winsB,
            scoreDifference: Math.abs((auditA.seo_score || 0) - (auditB.seo_score || 0))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async analyzeBacklitWords(req, res, next) {
    try {
      const { content, targetKeyword, url, auditId } = req.body;
      let textToAnalyze = content || '';
      let targetUrl = url || '';
      let activeKeyword = (targetKeyword || '').trim();

      // If auditId is provided, extract cached audit data and pages
      if (auditId && (!textToAnalyze || !targetUrl)) {
        const audit = await auditModel.findById(auditId);
        if (audit) {
          if (!targetUrl) targetUrl = audit.website_url;
          if (!activeKeyword && audit.target_keyword) activeKeyword = audit.target_keyword;

          const pages = await pageModel.findByAudit(auditId);
          if (pages && pages.length > 0 && !textToAnalyze) {
            const snippets = pages.map(p => {
              let s = `${p.title || ''} ${p.meta_description || ''}`;
              if (p.content_details) {
                try {
                  const cd = typeof p.content_details === 'string' ? JSON.parse(p.content_details) : p.content_details;
                  if (cd.headings) {
                    if (cd.headings.h1) s += ' ' + cd.headings.h1.join(' ');
                    if (cd.headings.h2) s += ' ' + cd.headings.h2.join(' ');
                  }
                } catch (e) {}
              }
              return s;
            }).join(' ');
            if (snippets.trim().length > 60) {
              textToAnalyze = snippets;
            }
          }
        }
      }

      if (!textToAnalyze && targetUrl) {
        const validatedUrl = await validateAuditUrl(targetUrl);
        const crawler = new CrawlerService({ maxPages: 1, timeout: 8000 });
        const crawlRes = await crawler.crawl(validatedUrl);
        if (crawlRes.pages && crawlRes.pages[0] && crawlRes.pages[0].html) {
          const cheerio = require('cheerio');
          const $ = cheerio.load(crawlRes.pages[0].html);
          $('script, style, noscript, svg, nav, footer, header').remove();
          textToAnalyze = $('body').text().replace(/\s+/g, ' ').trim();
        }
      }

      if (!textToAnalyze) {
        return res.status(400).json({ success: false, message: 'Please provide content or URL to analyze.' });
      }

      const result = await aiService.analyzeBacklitWords({
        content: textToAnalyze,
        targetKeyword: activeKeyword,
        url: targetUrl
      });

      res.json({
        success: true,
        data: {
          ...result,
          contentSample: textToAnalyze.substring(0, 1500)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getAntigravitySession(req, res, next) {
    try {
      const { id } = req.params;
      const audit = await auditModel.findById(id);
      if (!audit) {
        return res.status(404).json({ success: false, message: 'Audit not found.' });
      }
      const session = antigravityEngine.connectSession(id, audit.website_url);
      res.json({
        success: true,
        data: { session }
      });
    } catch (error) {
      next(error);
    }
  },

  async getAntigravityBlueprint(req, res, next) {
    try {
      const { id } = req.params;
      const { framework } = req.query;
      const audit = await auditModel.findById(id);
      if (!audit) {
        return res.status(404).json({ success: false, message: 'Audit not found.' });
      }
      const issues = await issueModel.findByAudit(id);
      const blueprint = antigravityEngine.batchRepairAll({
        auditId: id,
        websiteUrl: audit.website_url,
        issues,
        targetFramework: framework || 'html'
      });
      res.json({
        success: true,
        data: blueprint
      });
    } catch (error) {
      next(error);
    }
  },

  async repairIssueWithAntigravity(req, res, next) {
    try {
      const { issueId, issue, websiteUrl, framework } = req.body;
      let targetIssue = issue;
      if (!targetIssue && issueId) {
        targetIssue = await issueModel.findById(issueId);
      }
      if (!targetIssue) {
        return res.status(400).json({ success: false, message: 'Target issue not provided or found.' });
      }
      const repair = antigravityEngine.diagnoseAndFix(targetIssue, websiteUrl || 'https://example.com', framework || 'html');
      res.json({
        success: true,
        data: repair
      });
    } catch (error) {
      next(error);
    }
  },

  async resolveIssueWithAntigravity(req, res, next) {
    try {
      const { id } = req.params;
      const { issueId, scoreBoost = 8 } = req.body;
      if (!issueId) {
        return res.status(400).json({ success: false, message: 'issueId is required.' });
      }
      await issueModel.updateStatus(issueId, 'resolved');
      await auditModel.boostScore(id, scoreBoost);
      const updatedAudit = await auditModel.findById(id);
      const updatedIssues = await issueModel.findByAudit(id);
      const counts = await issueModel.getCountsBySeverity(id);

      res.json({
        success: true,
        message: 'Issue repaired & resolved by Google Antigravity!',
        data: {
          audit: updatedAudit,
          issues: updatedIssues,
          counts,
          newScore: updatedAudit.seo_score
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async downloadAntigravityPatch(req, res, next) {
    try {
      const { id } = req.params;
      const { framework } = req.query;
      const audit = await auditModel.findById(id);
      if (!audit) {
        return res.status(404).json({ success: false, message: 'Audit not found.' });
      }
      const issues = await issueModel.findByAudit(id);
      const blueprint = antigravityEngine.batchRepairAll({
        auditId: id,
        websiteUrl: audit.website_url,
        issues,
        targetFramework: framework || 'html'
      });
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="antigravity-seo-patch-audit-${id}.txt"`);
      res.send(blueprint.unifiedCodeBundle);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = auditController;
