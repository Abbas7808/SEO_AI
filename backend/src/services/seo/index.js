const PageAnalyzer = require('./analyzer');
const SeoScorer = require('./scorer');
const SeoRoadmapGenerator = require('./roadmapGenerator');
const BacklinkAnalyzer = require('./backlinkAnalyzer');
const SiteInspector = require('./siteInspector');

/**
 * High-level SEO Engine coordinating analysis and scoring
 */
class SeoEngine {
  /**
   * Run complete analysis on all crawled pages
   * @param {Array} crawledPages Raw crawled page objects from CrawlerService
   * @param {Object} context Audit context (websiteUrl, targetKeyword, businessName, businessLocation)
   */
  static analyzeAndScore(crawledPages = [], context = {}) {
    // 1. Analyze each crawled page
    const analyzedPages = crawledPages.map(pageData => {
      const analyzer = new PageAnalyzer(pageData, context);
      return analyzer.analyze();
    });

    // 2. Score overall audit and per-page metrics
    const scorer = new SeoScorer(analyzedPages, context);
    const scoreResult = scorer.scoreAudit();

    // 3. Generate 4-Phase SEO Growth Roadmap
    const roadmap = SeoRoadmapGenerator.generate({
      analyzedPages,
      scoreResult,
      context
    });

    // 4. Generate Backlink & Anchor Words Analysis
    const backlinkProfile = BacklinkAnalyzer.analyze({
      analyzedPages,
      context
    });

    return {
      analyzedPages,
      scoreResult,
      roadmap,
      backlinkProfile
    };
  }
}

module.exports = {
  SeoEngine,
  PageAnalyzer,
  SeoScorer,
  SeoRoadmapGenerator,
  BacklinkAnalyzer,
  SiteInspector
};
