const assert = require('assert');
const { validateAuditUrl } = require('../src/utils/ssrfGuard');
const PageAnalyzer = require('../src/services/seo/analyzer');
const SeoScorer = require('../src/services/seo/scorer');
const SeoRoadmapGenerator = require('../src/services/seo/roadmapGenerator');
const BacklinkAnalyzer = require('../src/services/seo/backlinkAnalyzer');
const aiService = require('../src/services/ai');
const ReportService = require('../src/services/reports');
const { Writable } = require('stream');

async function runTests() {
  console.log('🧪 Starting AI SEO Auditor Backend Unit Tests...\n');
  let passed = 0;
  let failed = 0;

  function it(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${e.message}`);
      failed++;
    }
  }

  async function itAsync(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${e.message}`);
      failed++;
    }
  }

  // 1. SSRF Guard Tests
  console.log('--- 1. SSRF Guard & URL Validation ---');
  await itAsync('Should block localhost URL', async () => {
    let blocked = false;
    try {
      await validateAuditUrl('http://localhost:3000');
    } catch (e) {
      blocked = true;
    }
    assert.strictEqual(blocked, true, 'localhost should be blocked');
  });

  await itAsync('Should block 127.0.0.1 loopback', async () => {
    let blocked = false;
    try {
      await validateAuditUrl('http://127.0.0.1/admin');
    } catch (e) {
      blocked = true;
    }
    assert.strictEqual(blocked, true, '127.0.0.1 should be blocked');
  });

  await itAsync('Should block private class C IP (192.168.1.1)', async () => {
    let blocked = false;
    try {
      await validateAuditUrl('http://192.168.1.1:8080');
    } catch (e) {
      blocked = true;
    }
    assert.strictEqual(blocked, true, '192.168.1.1 should be blocked');
  });

  await itAsync('Should accept valid public HTTPS URL', async () => {
    const valid = await validateAuditUrl('https://example.com/test');
    assert.strictEqual(valid, 'https://example.com/test');
  });

  // 2. SEO PageAnalyzer Tests
  console.log('\n--- 2. SEO PageAnalyzer ---');
  it('Should correctly analyze HTML with missing tags', () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <img src="/banner.jpg" />
          <p>Short text</p>
        </body>
      </html>
    `;

    const analyzer = new PageAnalyzer({
      url: 'https://mysite.com/',
      statusCode: 200,
      responseTimeMs: 250,
      htmlSize: mockHtml.length,
      html: mockHtml
    });

    const result = analyzer.analyze();
    assert.strictEqual(result.onPage.title, null, 'Title should be null');
    assert.strictEqual(result.onPage.metaDescription, null, 'Meta description should be null');
    assert.strictEqual(result.onPage.h1Count, 0, 'H1 count should be 0');
    assert.strictEqual(result.images.missingAltCount, 1, 'Image missing alt count should be 1');
  });

  it('Should correctly analyze complete optimized HTML', () => {
    const optimizedHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Top Mobile Repair in Hangu | Safdar Store</title>
          <meta name="description" content="Professional smartphone and electronics repair services in Hangu. Fast, reliable, and affordable solutions. Contact our expert technicians today!">
          <link rel="canonical" href="https://mysite.com/" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta property="og:title" content="Top Mobile Repair in Hangu">
        </head>
        <body>
          <h1>Top Mobile Repair in Hangu</h1>
          <h2>Quality Parts & Fast Screen Replacement</h2>
          <p>${'Reliable smartphone repair service in Hangu with warranty. '.repeat(15)}</p>
          <img src="/store.jpg" alt="Safdar Mobile Store Front" />
          <a href="tel:+923001234567">Call Us</a>
        </body>
      </html>
    `;

    const analyzer = new PageAnalyzer({
      url: 'https://mysite.com/',
      statusCode: 200,
      responseTimeMs: 310,
      htmlSize: optimizedHtml.length,
      html: optimizedHtml
    }, {
      targetKeyword: 'mobile repair',
      businessName: 'Safdar',
      businessLocation: 'Hangu'
    });

    const result = analyzer.analyze();
    assert.strictEqual(result.onPage.titleLength > 30, true, 'Title length should be > 30');
    assert.strictEqual(result.onPage.h1Count, 1, 'Should have exactly 1 H1');
    assert.strictEqual(result.images.missingAltCount, 0, 'No missing alt tags');
    assert.strictEqual(result.content.inTitle, true, 'Target keyword found in title');
    assert.strictEqual(result.content.inH1, true, 'Target keyword found in H1');
    assert.strictEqual(result.local.hasPhone, true, 'Phone signal detected');
  });

  // 3. SEO Scorer Tests
  console.log('\n--- 3. SEO Scoring Engine (0-100 Weighted) ---');
  it('Should calculate high score for optimized pages and low score for broken pages', () => {
    const poorPage = {
      url: 'http://insecure-broken.com/',
      statusCode: 404,
      responseTimeMs: 4000,
      htmlSize: 200,
      technical: { isHttps: false, canonicalTag: null, robotsMeta: 'noindex', viewportMeta: null, htmlLang: null },
      onPage: { title: null, titleLength: 0, metaDescription: null, metaDescriptionLength: 0, h1Count: 0, h1s: [], h2Count: 0, h2s: [], h3Count: 0 },
      content: { wordCount: 20, textToCodeRatio: 5, targetKeyword: 'shoes', keywordCount: 0, keywordDensity: 0, inTitle: false, inDescription: false, inH1: false },
      images: { total: 4, missingAltCount: 4, list: [] },
      links: { internalCount: 0, externalCount: 0, emptyAnchorsCount: 0 },
      social: { hasOpenGraph: false, hasTwitterCard: false },
      structuredData: { schemas: [], hasJsonLd: false },
      local: { hasPhone: false, hasLocalSchema: false },
      performance: { responseTimeMs: 4000, htmlSizeBytes: 200, scriptCount: 0, styleCount: 0 }
    };

    const poorScorer = new SeoScorer([poorPage]);
    const poorResult = poorScorer.scoreAudit();

    assert.strictEqual(poorResult.overallScore < 40, true, `Poor page score should be < 40 (was ${poorResult.overallScore})`);
    assert.strictEqual(poorResult.summary.critical > 0, true, 'Should detect critical issues');
  });

  // 4. AI Service Tests
  console.log('\n--- 4. AI Service & Fix Generator ---');
  await itAsync('Should generate valid meta title options with char counts', async () => {
    const titles = await aiService.generateMetaTitles({
      targetKeyword: 'mobile repair',
      businessName: 'Safdar Mobile Store',
      businessLocation: 'Hangu'
    });
    assert.strictEqual(Array.isArray(titles.options), true);
    assert.strictEqual(titles.options.length >= 3, true);
    assert.strictEqual(titles.options[0].charCount > 0, true);
  });

  await itAsync('Should generate copyable HTML fix for missing meta description', async () => {
    const fix = await aiService.generateFix({
      issueType: 'missing_meta_description',
      pageUrl: 'https://example.com/',
      targetKeyword: 'organic coffee',
      businessName: 'Green Beans Roastery'
    });
    assert.strictEqual(fix.code.includes('<meta name="description"'), true);
    assert.strictEqual(fix.language, 'html');
  });

  await itAsync('Should optimize content and calculate score', async () => {
    const paragraph = 'Solar panels provide clean renewable energy for modern homes and commercial buildings. By capturing sunlight, photovoltaic cells produce clean electricity without carbon emissions. Investing in solar energy reduces long term utility costs while contributing to global sustainability goals. Many homeowners choose solar panels for their reliability and positive return on investment. ';
    const opt = await aiService.optimizeContent({
      targetKeyword: 'solar panels',
      content: paragraph.repeat(12) // ~480 words, natural density
    });
    assert.strictEqual(opt.contentScore > 50, true, `Score should be > 50 (was ${opt.contentScore})`);
    assert.strictEqual(opt.keywordOccurrences > 0, true, 'Occurrences should be > 0');
    assert.strictEqual(Array.isArray(opt.headingRecommendations), true, 'Heading recommendations should be an array');
  });

  // 5. PDF Report Service Tests
  console.log('\n--- 5. PDF Report Generator ---');
  await itAsync('Should generate valid PDF stream with %PDF header', async () => {
    const chunks = [];
    const testStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });

    const mockAudit = {
      id: 99,
      websiteUrl: 'https://mytestsite.com',
      seoScore: 84,
      technicalScore: 90,
      onPageScore: 82,
      contentScore: 78,
      performanceScore: 85,
      structuredDataScore: 70,
      socialScore: 80,
      localScore: 75,
      pagesCrawled: 4,
      issues: [
        { severity: 'critical', title: 'Insecure HTTP', page: 'https://mytestsite.com', description: 'HTTP used', recommendation: 'Switch to HTTPS' },
        { severity: 'high', title: 'Missing Meta Description', page: 'https://mytestsite.com/about', description: 'No description', recommendation: 'Add meta description' }
      ],
      pages: [
        { url: 'https://mytestsite.com/', statusCode: 200, wordCount: 450, imageCount: 3, internalLinkCount: 12, externalLinkCount: 2, seoScore: 88 }
      ]
    };

    await new Promise((resolve, reject) => {
      testStream.on('finish', resolve);
      testStream.on('error', reject);
      ReportService.generatePdf(mockAudit, testStream);
    });

    const buffer = Buffer.concat(chunks);
    assert.strictEqual(buffer.length > 500, true, 'PDF buffer should be non-empty');
    assert.strictEqual(buffer.slice(0, 4).toString(), '%PDF', 'PDF buffer must start with %PDF magic header');
  });

  // 6. SEO Roadmap Generator Tests
  console.log('\n--- 6. SEO Roadmap Generator (4 Strategic Phases) ---');
  it('Should generate structured 4-phase roadmap with tasks and metrics', () => {
    const mockPages = [
      { url: 'https://example.com/', onPage: { title: null, h1Count: 0 }, links: { anchors: [] } }
    ];
    const mockScoreResult = {
      overallScore: 62,
      issues: [
        { type: 'missing_h1', severity: 'high', title: 'Missing H1', page: 'https://example.com/', impact: 'Impact text', recommendation: 'Add H1' },
        { type: 'insecure_http', severity: 'critical', title: 'HTTP Insecure', page: 'https://example.com/', impact: 'Insecure', recommendation: 'Use HTTPS' },
        { type: 'missing_meta_description', severity: 'high', title: 'No Meta Desc', page: 'https://example.com/', impact: 'Low CTR', recommendation: 'Add desc' }
      ]
    };
    const roadmap = SeoRoadmapGenerator.generate({
      analyzedPages: mockPages,
      scoreResult: mockScoreResult,
      context: { websiteUrl: 'https://example.com', targetKeyword: 'seo audit' }
    });

    assert.strictEqual(roadmap.phases.length, 4, 'Should contain exactly 4 strategic phases');
    assert.strictEqual(roadmap.summary.totalTasks >= 4, true, 'Should produce at least 4 tasks');
    assert.strictEqual(roadmap.allTasks.some(t => t.phase === 1 && t.priority.includes('P0')), true, 'Phase 1 must have P0 critical blockers');
    assert.strictEqual(roadmap.allTasks.some(t => t.category === 'Backlinks'), true, 'Should include Backlinks tasks');
  });

  // 7. Backlink & Anchor Words Analyzer Tests
  console.log('\n--- 7. Backlink & Anchor Words Analyzer ---');
  it('Should correctly categorize anchor words and calculate distribution', () => {
    const mockPages = [
      {
        url: 'https://mysite.com/',
        links: {
          anchors: [
            { text: 'MySite', isInternal: true, isEmpty: false },
            { text: 'best mobile store', isInternal: true, isEmpty: false },
            { text: 'click here', isInternal: false, isEmpty: false },
            { text: '', isInternal: true, isEmpty: true }
          ]
        }
      }
    ];

    const analysis = BacklinkAnalyzer.analyze({
      analyzedPages: mockPages,
      context: { websiteUrl: 'https://mysite.com', targetKeyword: 'best mobile store', businessName: 'MySite' }
    });

    assert.strictEqual(analysis.stats.totalLinksScanned, 4);
    assert.strictEqual(analysis.stats.emptyAnchors, 1);
    assert.strictEqual(analysis.distribution.branded.count, 1);
    assert.strictEqual(analysis.distribution.exactMatch.count, 1);
    assert.strictEqual(analysis.distribution.generic.count, 1);
    assert.strictEqual(analysis.outreachTemplates.length, 3, 'Must include 3 ready-to-copy outreach templates');
  });

  await itAsync('Should analyze backlit words and calculate prominence', async () => {
    const sampleText = 'Antigravity SEO tools deliver high performance search optimization. Search optimization drives organic visitors, boosts organic rankings, and increases website visibility. Top search optimization techniques require technical excellence and structured metadata.';
    const result = await aiService.analyzeBacklitWords({
      content: sampleText,
      targetKeyword: 'search optimization'
    });

    assert.strictEqual(result.wordCount > 20, true);
    assert.strictEqual(result.targetOccurrences >= 3, true);
    assert.strictEqual(Array.isArray(result.backlitKeywords), true);
    assert.strictEqual(result.backlitKeywords.length > 0, true);
  });

  // 6. Google Antigravity Autonomous Repair Engine Tests
  console.log('--- 6. Google Antigravity Autonomous SEO Auto-Fixer ---');
  const antigravityEngine = require('../src/services/ai/antigravityEngine');

  await itAsync('Should establish Google Antigravity agentic session handshake', async () => {
    const session = antigravityEngine.connectSession(42, 'https://myenterprisesite.com');
    assert.strictEqual(session.connected, true);
    assert.strictEqual(session.protocol.includes('DeepMind'), true);
    assert.strictEqual(session.capabilities.length >= 5, true);
  });

  await itAsync('Should autonomously synthesize multi-framework patch and diff for missing H1', async () => {
    const repair = antigravityEngine.diagnoseAndFix(
      { id: 101, issue_type: 'missing_h1', title: 'Missing H1 Heading Tag' },
      'https://myenterprisesite.com',
      'nextjs'
    );
    assert.strictEqual(repair.scoreBoost > 0, true);
    assert.strictEqual(repair.confidence > 90, true);
    assert.strictEqual(repair.activePatch.includes('<h1'), true);
    assert.strictEqual(repair.diffView.includes('+'), true);
    assert.strictEqual(repair.agentExecutionSteps.length >= 4, true);
  });

  await itAsync('Should execute Antigravity batch repair across all audit issues and compile unified patch', async () => {
    const mockIssues = [
      { id: 1, issue_type: 'missing_meta_description', severity: 'critical', title: 'Missing Meta Description' },
      { id: 2, issue_type: 'images_missing_alt', severity: 'high', title: 'Images Missing Alt Text' },
      { id: 3, issue_type: 'missing_schema', severity: 'medium', title: 'Missing Schema JSON-LD' },
      { id: 4, issue_type: 'https_active', severity: 'passed', title: 'HTTPS Enforced' }
    ];

    const batch = antigravityEngine.batchRepairAll({
      auditId: 99,
      websiteUrl: 'https://myenterprisesite.com',
      issues: mockIssues,
      targetFramework: 'html'
    });

    assert.strictEqual(batch.totalIssuesFound, 4);
    assert.strictEqual(batch.repairableIssuesCount, 3, 'Should repair all non-passed issues');
    assert.strictEqual(batch.projectedScoreBoost > 0, true);
    assert.strictEqual(batch.unifiedCodeBundle.includes('GOOGLE ANTIGRAVITY'), true);
  });

  console.log(`\n========================================`);
  console.log(`🏁 Unit Tests Completed: ${passed} Passed, ${failed} Failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
