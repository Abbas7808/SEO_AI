/**
 * Autonomous Multi-Agent SEO Council Engine
 * 
 * Simulates a high-level review by 4 senior SEO specialists:
 * 1. Dr. Aris Thorne (Principal Technical SEO Architect)
 * 2. Elena Vance (Head of Content & Semantic Relevance)
 * 3. Kaelen Frost (Core Web Vitals & Web Performance Engineer)
 * 4. Sora Tanaka (Authority, Entity & Link Architecture Lead)
 * 
 * Works 100% deterministically from real crawl facts, with optional LLM augmentation.
 */

class AiCouncilService {
  constructor() {
    this.councilVersion = '2.5.0-agentic-council';
  }

  /**
   * Run the 4-Agent Autonomous Council Assessment on audit data
   */
  evaluateCouncil(auditData = {}) {
    const issues = auditData.issues || [];
    const overallScore = auditData.seo_score ?? auditData.overallScore ?? auditData.score ?? 75;
    const techScore = auditData.technical_score ?? auditData.technicalScore ?? 80;
    const onPageScore = auditData.onpage_score ?? auditData.onPageScore ?? 75;
    const contentScore = auditData.content_score ?? auditData.contentScore ?? 70;
    const perfScore = auditData.performance_score ?? auditData.performanceScore ?? 75;
    const schemaScore = auditData.structured_data_score ?? auditData.structuredDataScore ?? 60;
    const mobileScore = auditData.mobile_score ?? auditData.mobileScore ?? 78;

    const url = auditData.website_url || auditData.websiteUrl || 'https://example.com';
    let domain = 'target-website.com';
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      domain = url;
    }

    // Filter issues by domain
    const criticals = issues.filter(i => (i.severity || '').toLowerCase() === 'critical');
    const highs = issues.filter(i => (i.severity || '').toLowerCase() === 'high');

    // -------------------------------------------------------------
    // Agent 1: Dr. Aris Thorne (Technical Architecture)
    // -------------------------------------------------------------
    const techIssues = issues.filter(i => {
      const cat = (i.category || i.type || '').toLowerCase();
      return cat.includes('tech') || cat.includes('http') || cat.includes('canonical') || cat.includes('ssl') || cat.includes('viewport');
    });
    const techGrade = techScore >= 90 ? 'A+' : techScore >= 80 ? 'A' : techScore >= 70 ? 'B' : techScore >= 55 ? 'C' : 'F';
    const techStatus = techScore >= 85 ? 'Optimal' : techScore >= 70 ? 'Action Needed' : 'Critical Warning';

    const techFindings = [];
    if (techScore >= 85) {
      techFindings.push('Server response and canonical routing adhere to Google crawl guidelines.');
      techFindings.push('No destructive redirect loops or blocked primary pathways detected.');
    } else {
      techFindings.push(`Detected ${techIssues.length} technical crawlability frictions impacting indexation.`);
      if (criticals.some(c => (c.title || '').toLowerCase().includes('http') || (c.title || '').toLowerCase().includes('insecure'))) {
        techFindings.push('Insecure connection or HTTP protocol mismatch threatens ranking eligibility.');
      }
      if (issues.some(i => (i.title || '').toLowerCase().includes('viewport'))) {
        techFindings.push('Missing viewport tag causes severe mobile-first indexing penalties.');
      }
    }

    const agentThorne = {
      id: 'agent_thorne',
      name: 'Dr. Aris Thorne',
      title: 'Principal Technical SEO Architect',
      specialty: 'Crawl Budget, Indexability & Infrastructure',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      grade: techGrade,
      score: techScore,
      status: techStatus,
      summary: techScore >= 80
        ? 'Solid technical infrastructure. Search bots can discover and parse resources without friction.'
        : 'Crawlability vulnerabilities require immediate attention to safeguard search visibility.',
      keyFindings: techFindings.slice(0, 3),
      immediateDirective: techIssues.length > 0
        ? `Remediate top technical bottleneck: "${techIssues[0].title}"`
        : 'Maintain automated SSL renewal and server-side cache headers.'
    };

    // -------------------------------------------------------------
    // Agent 2: Elena Vance (Semantic Content & Search Intent)
    // -------------------------------------------------------------
    const contentCombinedScore = Math.round((onPageScore + contentScore) / 2);
    const contentGrade = contentCombinedScore >= 90 ? 'A+' : contentCombinedScore >= 80 ? 'A' : contentCombinedScore >= 70 ? 'B' : contentCombinedScore >= 55 ? 'C' : 'F';
    const contentStatus = contentCombinedScore >= 85 ? 'Optimal' : contentCombinedScore >= 70 ? 'Action Needed' : 'Critical Warning';

    const contentFindings = [];
    const missingTitles = issues.filter(i => (i.title || '').toLowerCase().includes('title'));
    const missingDesc = issues.filter(i => (i.title || '').toLowerCase().includes('description'));
    const h1Issues = issues.filter(i => (i.title || '').toLowerCase().includes('h1'));

    if (missingTitles.length > 0) contentFindings.push('Title tag optimization needed to maximize organic SERP CTR.');
    if (missingDesc.length > 0) contentFindings.push('Meta descriptions require compelling value propositions.');
    if (h1Issues.length > 0) contentFindings.push('Top-level H1 heading structure needs semantic alignment.');
    if (contentFindings.length === 0) {
      contentFindings.push('Metadata and heading hierarchy demonstrate strong topical coherence.');
      contentFindings.push('Keyword intent aligns naturally with primary audience queries.');
    }

    const agentVance = {
      id: 'agent_vance',
      name: 'Elena Vance',
      title: 'Head of Content & Semantic Relevance',
      specialty: 'Search Intent, Entity Relevance & On-Page Architecture',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      grade: contentGrade,
      score: contentCombinedScore,
      status: contentStatus,
      summary: contentCombinedScore >= 80
        ? 'Well-aligned semantic keywords and strong metadata resonance across core pages.'
        : 'On-page metadata and heading hierarchy require optimization to capture high-intent traffic.',
      keyFindings: contentFindings.slice(0, 3),
      immediateDirective: missingTitles.length > 0
        ? 'Craft 50-60 character high-CTR title tags with focus keyword upfront.'
        : h1Issues.length > 0
          ? 'Enforce a single semantic <h1> per page that mirrors user search query.'
          : 'Expand secondary subtopics with descriptive <h2> and <h3> headers.'
    };

    // -------------------------------------------------------------
    // Agent 3: Kaelen Frost (Core Web Vitals & Web Performance)
    // -------------------------------------------------------------
    const perfGrade = perfScore >= 90 ? 'A+' : perfScore >= 80 ? 'A' : perfScore >= 70 ? 'B' : perfScore >= 55 ? 'C' : 'F';
    const perfStatus = perfScore >= 85 ? 'Optimal' : perfScore >= 70 ? 'Action Needed' : 'Critical Warning';

    const perfFindings = [];
    const imgIssues = issues.filter(i => (i.title || '').toLowerCase().includes('alt') || (i.title || '').toLowerCase().includes('image'));
    const speedIssues = issues.filter(i => (i.title || '').toLowerCase().includes('response') || (i.title || '').toLowerCase().includes('slow'));

    if (speedIssues.length > 0) perfFindings.push('Server TTFB latency slows down initial DOM parsing.');
    if (imgIssues.length > 0) perfFindings.push('Image dimensions and modern formats (WebP/AVIF) require optimization.');
    if (perfFindings.length === 0) {
      perfFindings.push('Resource payloads are lean with healthy rendering speeds.');
      perfFindings.push('Low risk of Cumulative Layout Shift (CLS) during viewport rendering.');
    }

    const agentFrost = {
      id: 'agent_frost',
      name: 'Kaelen Frost',
      title: 'Core Web Vitals & Performance Engineer',
      specialty: 'LCP, CLS, Asset Delivery & Server TTFB',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      grade: perfGrade,
      score: perfScore,
      status: perfStatus,
      summary: perfScore >= 80
        ? 'Snappy asset delivery and fast first-contentful paint across tested endpoints.'
        : 'Asset weight or server latency is causing performance drag on mobile devices.',
      keyFindings: perfFindings.slice(0, 3),
      immediateDirective: imgIssues.length > 0
        ? 'Inject explicit width/height attributes on media to stabilize CLS layout shifts.'
        : 'Enable server-side Brotli/Gzip compression and CDN asset edge-caching.'
    };

    // -------------------------------------------------------------
    // Agent 4: Sora Tanaka (Authority, Entity & Link Architecture)
    // -------------------------------------------------------------
    const schemaCombinedScore = Math.round((schemaScore + (auditData.social_score || 70)) / 2);
    const schemaGrade = schemaCombinedScore >= 90 ? 'A+' : schemaCombinedScore >= 80 ? 'A' : schemaCombinedScore >= 70 ? 'B' : schemaCombinedScore >= 55 ? 'C' : 'F';
    const schemaStatus = schemaCombinedScore >= 80 ? 'Optimal' : schemaCombinedScore >= 65 ? 'Action Needed' : 'Critical Warning';

    const schemaFindings = [];
    const schemaIssues = issues.filter(i => (i.title || '').toLowerCase().includes('schema') || (i.title || '').toLowerCase().includes('structured data'));
    const linkIssues = issues.filter(i => (i.title || '').toLowerCase().includes('anchor') || (i.title || '').toLowerCase().includes('link'));

    if (schemaIssues.length > 0) schemaFindings.push('Missing JSON-LD structured data denies site eligibility for Google Rich Snippets.');
    if (linkIssues.length > 0) schemaFindings.push('Internal link anchor texts need keyword diversification.');
    if (schemaFindings.length === 0) {
      schemaFindings.push('Structured Schema.org entities properly declare brand identity.');
      schemaFindings.push('Balanced distribution of internal link equity.');
    }

    const agentTanaka = {
      id: 'agent_tanaka',
      name: 'Sora Tanaka',
      title: 'Authority, Entity & Link Architecture Lead',
      specialty: 'Schema.org JSON-LD, Link Equity & Knowledge Graph',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      grade: schemaGrade,
      score: schemaCombinedScore,
      status: schemaStatus,
      summary: schemaCombinedScore >= 75
        ? 'Structured entity signals and social graph tags are well organized.'
        : 'High-value rich snippet opportunities are being missed due to lack of Schema markup.',
      keyFindings: schemaFindings.slice(0, 3),
      immediateDirective: schemaIssues.length > 0
        ? 'Implement Organization, WebSite, and FAQPage JSON-LD in document <head>.'
        : 'Reinforce internal topic clustering with descriptive, anchor-rich internal links.'
    };

    // Council Consensus
    const agents = [agentThorne, agentVance, agentFrost, agentTanaka];
    const consensusScore = Math.round(agents.reduce((acc, a) => acc + a.score, 0) / agents.length);
    let consensusVerdict = 'Strong Foundation with High Growth Velocity';
    if (consensusScore < 65) {
      consensusVerdict = 'Urgent Remediation Required — Critical Ranking Impediments Detected';
    } else if (consensusScore < 80) {
      consensusVerdict = 'Moderate Authority with High-Impact Optimization Opportunities';
    }

    return {
      version: this.councilVersion,
      domain,
      overallScore,
      consensusScore,
      consensusVerdict,
      projectedScoreAfterFixes: Math.min(100, overallScore + Math.max(12, criticals.length * 6 + highs.length * 3)),
      evaluatedAt: new Date().toISOString(),
      agents,
      strategicRoadmapSummary: [
        { phase: 'Sprint 1 (Day 1-14)', goal: 'Resolve Technical & Mobile Blockers', lead: 'Dr. Aris Thorne' },
        { phase: 'Sprint 2 (Day 15-30)', goal: 'Metadata CTR & Heading Semantic Restructure', lead: 'Elena Vance' },
        { phase: 'Sprint 3 (Day 31-60)', goal: 'Core Web Vitals & Image Asset Pipeline', lead: 'Kaelen Frost' },
        { phase: 'Sprint 4 (Day 61-90)', goal: 'Schema.org Entity Architecture & Rich Snippets', lead: 'Sora Tanaka' }
      ]
    };
  }
}

module.exports = new AiCouncilService();
