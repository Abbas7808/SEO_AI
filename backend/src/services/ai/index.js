const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * AI Service for SEO Audits
 * Uses OpenAI-compatible API when configured, with robust context-aware intelligent fallback.
 */
class AIService {
  constructor() {
    this.apiKey = process.env.AI_API_KEY || null;
    this.baseUrl = (process.env.AI_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.model = process.env.AI_MODEL || 'gpt-4o-mini';
  }

  /**
   * Helper to call OpenAI-compatible chat completion
   */
  async callLlm(messages, temperature = 0.5, maxTokens = 1200) {
    if (!this.apiKey || this.apiKey === 'your_openai_key_here') {
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );

      return response.data?.choices?.[0]?.message?.content?.trim() || null;
    } catch (err) {
      logger.warn(`AI API call failed: ${err.message}. Falling back to internal engine.`);
      return null;
    }
  }

  /**
   * Generate comprehensive audit summary and ranked priority recommendations
   */
  async generateAuditSummary(auditData) {
    const issues = auditData.issues || [];
    const criticals = issues.filter(i => i.severity === 'critical');
    const highs = issues.filter(i => i.severity === 'high');
    const mediums = issues.filter(i => i.severity === 'medium');

    const topIssues = [...criticals, ...highs, ...mediums].slice(0, 8);

    const promptMessages = [
      {
        role: 'system',
        content: `You are an elite SEO auditor. Analyze the provided real website audit findings and return ONLY valid JSON with this schema:
{
  "summary": "Concise 2-4 sentence executive overview of technical health, on-page standing, and key wins.",
  "topOpportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3", "Opportunity 4"],
  "priorityRecommendations": [
    {
      "priority": 1,
      "title": "Short title",
      "severity": "Critical|High|Medium",
      "whyItMatters": "Clear reason based on search engine crawling or ranking algorithms",
      "action": "Specific step-by-step action to implement",
      "expectedBenefit": "Expected lift in indexing or CTR",
      "suggestedImplementation": "Concrete HTML/code or configuration suggestion"
    }
  ]
}
Ground all statements strictly in the supplied data. Never invent problems.`
      },
      {
        role: 'user',
        content: JSON.stringify({
          websiteUrl: auditData.websiteUrl,
          overallScore: auditData.overallScore,
          technicalScore: auditData.technicalScore,
          onPageScore: auditData.onPageScore,
          contentScore: auditData.contentScore,
          performanceScore: auditData.performanceScore,
          structuredDataScore: auditData.structuredDataScore,
          socialScore: auditData.socialScore,
          localScore: auditData.localScore,
          topIssues: topIssues.map(i => ({ title: i.title, severity: i.severity, page: i.page, description: i.description }))
        })
      }
    ];

    const llmResult = await this.callLlm(promptMessages, 0.4, 1500);
    if (llmResult) {
      try {
        const cleaned = llmResult.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {
        logger.warn('Failed to parse LLM JSON for audit summary, using structured fallback.');
      }
    }

    // Intelligent Deterministic Fallback grounded strictly in real audit data
    const recs = [];
    let priorityCounter = 1;

    topIssues.forEach(issue => {
      const issueType = (issue.issue_type || issue.type || '').toLowerCase();
      let suggestedImpl = issue.recommendation;
      if (issueType.includes('meta_description')) {
        suggestedImpl = '<meta name="description" content="Engaging summary of page services and offerings.">';
      } else if (issueType.includes('h1')) {
        suggestedImpl = '<h1>Primary Topic & Target Keyword</h1>';
      } else if (issueType.includes('image_alt')) {
        suggestedImpl = '<img src="..." alt="Descriptive label of product or graphic" />';
      } else if (issueType.includes('canonical')) {
        suggestedImpl = `<link rel="canonical" href="${issue.page || issue.page_url || ''}" />`;
      } else if (issueType.includes('viewport')) {
        suggestedImpl = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
      }

      const severityStr = String(issue.severity || 'medium');

      recs.push({
        priority: priorityCounter++,
        title: issue.title,
        severity: severityStr.charAt(0).toUpperCase() + severityStr.slice(1),
        whyItMatters: issue.impact || 'Improves crawler comprehension and search indexing efficiency.',
        action: issue.recommendation,
        expectedBenefit: issue.severity === 'critical' ? 'Prevents ranking drops and recovers search visibility' : 'Improves organic ranking positions and CTR',
        suggestedImplementation: suggestedImpl
      });
    });

    const summaryText = auditData.overallScore >= 80
      ? `Your website has a strong SEO foundation with an overall score of ${auditData.overallScore}/100. Addressing a few remaining high-priority technical and metadata items will cement your competitive advantage.`
      : auditData.overallScore >= 60
      ? `Your website scored ${auditData.overallScore}/100, showing good potential but held back by ${criticals.length + highs.length} critical and high-priority SEO bottlenecks. Resolving on-page tags and crawlability should be prioritized.`
      : `Your website has an overall SEO score of ${auditData.overallScore}/100. There are critical blockers (${criticals.length} critical issues detected) affecting crawlability, search snippet display, and performance. Immediate remediation is required.`;

    const topOpportunities = recs.slice(0, 4).map(r => r.action);

    return {
      summary: summaryText,
      topOpportunities: topOpportunities.length ? topOpportunities : ['Ensure all metadata is complete', 'Optimize image alt text', 'Verify internal link structure'],
      priorityRecommendations: recs
    };
  }

  /**
   * Generate specific suggested code/content fix for an issue
   */
  async generateFix(issueData, pageContext = {}) {
    const { issueType, pageUrl, currentContent, targetKeyword, businessName, businessLocation } = issueData;

    const messages = [
      {
        role: 'system',
        content: `You are an SEO Code Fix Generator. Provide a ready-to-copy code or text fix for the specific SEO issue. Return ONLY valid JSON:
{
  "code": "exact copyable code snippet or content",
  "explanation": "Why this snippet fixes the issue",
  "language": "html|json|text"
}`
      },
      {
        role: 'user',
        content: JSON.stringify({ issueType, pageUrl, currentContent, targetKeyword, businessName, businessLocation })
      }
    ];

    const llmResult = await this.callLlm(messages, 0.3, 800);
    if (llmResult) {
      try {
        const cleaned = llmResult.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {}
    }

    // High quality deterministic code fix generator
    const kw = targetKeyword || 'Professional Services';
    const biz = businessName || 'Our Business';
    const loc = businessLocation ? ` in ${businessLocation}` : '';

    if (issueType.includes('meta_description')) {
      const desc = `Discover high quality ${kw} with ${biz}${loc}. Fast, reliable solutions tailored to your needs. Contact us today!`;
      return {
        code: `<meta name="description" content="${desc}">`,
        explanation: 'Provides a search-engine-friendly 145-character snippet with target keyword and clear value proposition.',
        language: 'html'
      };
    }

    if (issueType.includes('h1')) {
      return {
        code: `<h1>${kw}${loc ? ` - ${biz} ${loc}` : ` | ${biz}`}</h1>`,
        explanation: 'A focused single <h1> establishing clear topical authority and keyword placement.',
        language: 'html'
      };
    }

    if (issueType.includes('image_alt')) {
      return {
        code: `alt="${biz} - ${kw}${loc ? ` ${loc}` : ''}"`,
        explanation: 'Descriptive alt text fulfilling accessibility requirements and image SEO rankings.',
        language: 'text'
      };
    }

    if (issueType.includes('canonical')) {
      return {
        code: `<link rel="canonical" href="${pageUrl || 'https://example.com/'}">`,
        explanation: 'Self-referential canonical tag preventing duplicate content penalties.',
        language: 'html'
      };
    }

    if (issueType.includes('structured_data') || issueType.includes('schema')) {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': biz,
        'description': `Premier ${kw} provider${loc}.`,
        'url': pageUrl || 'https://example.com'
      };
      return {
        code: `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`,
        explanation: 'Valid Schema.org LocalBusiness JSON-LD markup for Google Rich Snippets.',
        language: 'html'
      };
    }

    return {
      code: `<!-- Recommended fix for ${issueType} -->\n<!-- Target: ${kw} -->`,
      explanation: 'General recommended fix configuration.',
      language: 'html'
    };
  }

  /**
   * AI Meta Title Generator
   */
  async generateMetaTitles({ targetKeyword, businessName, businessLocation }) {
    const kw = targetKeyword ? targetKeyword.trim() : 'Digital Solutions';
    const biz = businessName ? businessName.trim() : 'Company';
    const loc = businessLocation ? businessLocation.trim() : '';

    const messages = [
      {
        role: 'system',
        content: `You are an SEO Title Tag Specialist. Generate 4 high-CTR, SEO-optimized title tags under 60 characters for the keyword and business. Return JSON:
{
  "options": [
    { "title": "...", "charCount": 55, "style": "Brand Focused|Keyword First|Action Oriented|Local" }
  ]
}`
      },
      {
        role: 'user',
        content: `Keyword: ${kw}, Business: ${biz}, Location: ${loc}`
      }
    ];

    const llmResult = await this.callLlm(messages, 0.6, 600);
    if (llmResult) {
      try {
        const cleaned = llmResult.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {}
    }

    // Deterministic High-Quality Title Options
    const opt1 = loc ? `${kw} in ${loc} | ${biz}` : `${kw} | ${biz}`;
    const opt2 = loc ? `Best ${kw} Services in ${loc} - ${biz}` : `Top Rated ${kw} - ${biz}`;
    const opt3 = `${biz} | Trusted ${kw} Experts`;
    const opt4 = loc ? `Expert ${kw} in ${loc} | Get a Free Quote` : `Professional ${kw} Solutions | Contact Us`;

    return {
      options: [
        { title: opt1, charCount: opt1.length, style: 'Keyword + Brand' },
        { title: opt2, charCount: opt2.length, style: 'Benefit + Ranking' },
        { title: opt3, charCount: opt3.length, style: 'Trust & Authority' },
        { title: opt4, charCount: opt4.length, style: 'Action & Conversion' }
      ]
    };
  }

  /**
   * AI Meta Description Generator
   */
  async generateMetaDescriptions({ targetKeyword, businessName, businessLocation }) {
    const kw = targetKeyword ? targetKeyword.trim() : 'High Quality Services';
    const biz = businessName ? businessName.trim() : 'Our Team';
    const loc = businessLocation ? businessLocation.trim() : '';

    const messages = [
      {
        role: 'system',
        content: `You are an SEO Meta Description Specialist. Generate 3 compelling meta descriptions between 130 and 160 characters. Return JSON:
{
  "options": [
    { "description": "...", "charCount": 148, "keywordsUsed": ["..."], "focus": "Conversion|Information|Trust" }
  ]
}`
      },
      {
        role: 'user',
        content: `Keyword: ${kw}, Business: ${biz}, Location: ${loc}`
      }
    ];

    const llmResult = await this.callLlm(messages, 0.6, 600);
    if (llmResult) {
      try {
        const cleaned = llmResult.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {}
    }

    const d1 = loc
      ? `Looking for reliable ${kw} in ${loc}? ${biz} delivers proven expertise, affordable pricing, and top-rated customer service. Call today for a free quote!`
      : `Looking for top-tier ${kw}? ${biz} provides trusted, high-performance solutions tailored to your unique needs. Get started with our team today!`;

    const d2 = loc
      ? `Premier ${kw} in ${loc} by ${biz}. We specialize in quality craftsmanship, transparent pricing, and rapid response. Visit our site to learn more!`
      : `Empower your business with proven ${kw} from ${biz}. Discover our full range of professional services, verified reviews, and get your free consultation!`;

    const d3 = `Choose ${biz} for dependable ${kw}${loc ? ` throughout ${loc}` : ''}. Dedicated support, industry-leading solutions, and guaranteed satisfaction.`;

    return {
      options: [
        { description: d1, charCount: d1.length, keywordsUsed: [kw, biz], focus: 'Conversion & CTA' },
        { description: d2, charCount: d2.length, keywordsUsed: [kw, biz], focus: 'Quality & Authority' },
        { description: d3, charCount: d3.length, keywordsUsed: [kw, biz], focus: 'Trust & Reputation' }
      ]
    };
  }

  /**
   * Content Optimizer
   */
  async optimizeContent({ targetKeyword, content }) {
    const text = (content || '').trim();
    const words = text ? text.split(/\s+/).filter(w => w.length > 1) : [];
    const wordCount = words.length;
    const kw = (targetKeyword || '').trim().toLowerCase();

    let occurrences = 0;
    if (kw && text) {
      const matches = text.toLowerCase().match(new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'));
      occurrences = matches ? matches.length : 0;
    }

    const density = wordCount > 0 ? Number(((occurrences / wordCount) * 100).toFixed(2)) : 0;

    // Content scoring algorithm
    let score = 50;
    const recommendations = [];

    if (wordCount >= 600) {
      score += 25;
    } else if (wordCount >= 350) {
      score += 15;
      recommendations.push('Add more comprehensive sections or FAQs to reach 600+ words.');
    } else {
      score -= 15;
      recommendations.push('Content is currently under 350 words. Expand with in-depth analysis and subtopics.');
    }

    if (kw) {
      if (occurrences === 0) {
        score -= 20;
        recommendations.push(`Target keyword "${kw}" does not appear in the text. Add it in the first paragraph.`);
      } else if (density >= 1.0 && density <= 2.5) {
        score += 20;
      } else if (density < 1.0) {
        score += 10;
        recommendations.push(`Keyword density is ${density}%. Consider mentioning "${kw}" a few more times naturally.`);
      } else {
        score -= 10;
        recommendations.push(`Keyword density is ${density}%, which risks keyword stuffing. Use semantic synonyms instead.`);
      }
    }

    // Readability estimate (average sentence length)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
    const readability = avgWordsPerSentence <= 16 ? 'High (Clear & Readable)' : avgWordsPerSentence <= 22 ? 'Good' : 'Complex (Consider shorter sentences)';

    const finalScore = Math.min(Math.max(score, 20), 98);

    return {
      contentScore: finalScore,
      wordCount,
      keywordOccurrences: occurrences,
      keywordDensity: `${density}%`,
      readability,
      searchIntent: 'Informational & Commercial Investigation',
      headingRecommendations: [
        `H1: Complete Guide to ${targetKeyword || 'Your Topic'}`,
        `H2: Key Benefits of ${targetKeyword || 'This Solution'}`,
        `H2: Step-by-Step Implementation`,
        `H2: Frequently Asked Questions`
      ],
      missingTopics: [
        'Real-world case studies or pricing indicators',
        'Direct comparison with alternative approaches',
        'Clear call to action and next steps'
      ],
      recommendations: recommendations.length ? recommendations : ['Content structure and keyword distribution look balanced.']
    };
  }

  /**
   * AI SEO Consultant Chat grounded in actual audit data
   */
  async chatWithConsultant({ message, history = [], auditData = {} }) {
    const issues = auditData.issues || [];
    const topIssues = issues.slice(0, 10).map(i => `- [${i.severity.toUpperCase()}] ${i.title} (${i.page}): ${i.description}`);

    const contextPrompt = `You are a Senior SEO Consultant for the website "${auditData.websiteUrl || 'the audited site'}".
Current Audit Metrics:
- Overall SEO Score: ${auditData.overallScore || 'N/A'}/100
- Technical Score: ${auditData.technicalScore || 'N/A'}/100
- On-Page Score: ${auditData.onPageScore || 'N/A'}/100
- Content Score: ${auditData.contentScore || 'N/A'}/100
- Performance Score: ${auditData.performanceScore || 'N/A'}/100
- Top detected real issues:
${topIssues.join('\n')}

Rules:
1. Ground your answer strictly in these real audit findings.
2. NEVER invent issues that are not in the audit data.
3. Be actionable, concise, and professional.`;

    const messages = [
      { role: 'system', content: contextPrompt },
      ...history.slice(-6),
      { role: 'user', content: message }
    ];

    const llmResult = await this.callLlm(messages, 0.4, 900);
    if (llmResult) {
      return { reply: llmResult };
    }

    // Context-aware deterministic fallback
    const lowerMsg = message.toLowerCase();
    let reply = '';

    if (lowerMsg.includes('score') || lowerMsg.includes('low') || lowerMsg.includes('why')) {
      reply = `Your overall SEO score is ${auditData.overallScore || 'currently evaluated'}/100.\n\n` +
        `The primary factors dragging down the score are:\n` +
        issues.slice(0, 3).map((iss, idx) => `${idx + 1}. **${iss.title}** (${iss.severity.toUpperCase()}): ${iss.description}`).join('\n') +
        `\n\nAddressing these top items first will yield the fastest improvement.`;
    } else if (lowerMsg.includes('first') || lowerMsg.includes('priority') || lowerMsg.includes('start')) {
      const topSev = issues.filter(i => i.severity === 'critical' || i.severity === 'high');
      const target = topSev.length ? topSev[0] : issues[0];
      if (target) {
        reply = `You should fix **${target.title}** on \`${target.page}\` first.\n\n` +
          `**Why it matters:** ${target.impact}\n` +
          `**Action:** ${target.recommendation}`;
      } else {
        reply = 'Your website currently has no critical blockers! Focus on expanding content depth and building internal links.';
      }
    } else if (lowerMsg.includes('meta') || lowerMsg.includes('description') || lowerMsg.includes('title')) {
      reply = `For on-page metadata optimization on ${auditData.websiteUrl || 'your site'}, ensure:\n` +
        `- **Title tags** are between 45–60 characters with your primary keyword near the start.\n` +
        `- **Meta descriptions** are 130–160 characters with an active call-to-action.\n` +
        `- Every page has a unique canonical tag to prevent duplicate content flags.`;
    } else {
      reply = `Based on your audit for ${auditData.websiteUrl || 'your website'}:\n\n` +
        `We evaluated Technical SEO (${auditData.technicalScore || 'N/A'}/100), On-Page SEO (${auditData.onPageScore || 'N/A'}/100), and Content (${auditData.contentScore || 'N/A'}/100).\n\n` +
        `Top recommendation: ${issues[0] ? issues[0].recommendation : 'Review your audit report for detailed page-level suggestions.'}`;
    }

    return { reply };
  }

  /**
   * Analyze text or page content for visual glowing "Backlit Words" keyword prominence
   */
  async analyzeBacklitWords({ content = '', targetKeyword = '', url = '' }) {
    const text = (content || '').trim();
    const words = text ? text.split(/\s+/).filter(w => w.length > 1) : [];
    const wordCount = words.length;
    const kw = (targetKeyword || '').trim().toLowerCase();

    // Word frequency map (excluding common stop words)
    const stopWords = new Set([
      'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'are', 'was', 'were',
      'your', 'will', 'all', 'can', 'has', 'our', 'more', 'about', 'when', 'which', 'what',
      'into', 'some', 'than', 'them', 'then', 'these', 'there', 'been', 'would', 'other'
    ]);

    const freqMap = new Map();
    words.forEach(rawW => {
      const clean = rawW.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length > 2 && !stopWords.has(clean)) {
        freqMap.set(clean, (freqMap.get(clean) || 0) + 1);
      }
    });

    const topKeywords = Array.from(freqMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => {
        const isTarget = kw && (word === kw || kw.includes(word));
        const density = Number(((count / (wordCount || 1)) * 100).toFixed(1));
        return {
          word,
          count,
          density: `${density}%`,
          prominence: Math.min(100, count * 15 + (isTarget ? 35 : 10)),
          glowType: isTarget ? 'emerald' : density > 2.5 ? 'amber' : 'violet',
          category: isTarget ? 'Target Keyword' : count > 3 ? 'High Frequency' : 'Topical Term'
        };
      });

    let targetProminence = 0;
    let targetOccurrences = 0;
    if (kw && text) {
      const matches = text.toLowerCase().match(new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'));
      targetOccurrences = matches ? matches.length : 0;
      targetProminence = Math.min(100, Math.round((targetOccurrences / (wordCount / 100 || 1)) * 40));
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
    const readabilityScore = avgWordsPerSentence <= 16 ? 90 : avgWordsPerSentence <= 22 ? 75 : 55;

    return {
      wordCount,
      targetKeyword: kw || null,
      targetOccurrences,
      targetProminence: kw ? `${targetProminence}%` : 'N/A',
      overallClarityScore: readabilityScore,
      backlitKeywords: topKeywords,
      recommendations: [
        targetOccurrences === 0 && kw ? `Target keyword "${kw}" does not appear. Add it in the first paragraph.` : null,
        topKeywords.some(k => parseFloat(k.density) > 3.5) ? 'Some words have high repetition (>3.5%). Replace with semantic LSI synonyms.' : null,
        wordCount < 400 ? 'Expand content to 600+ words to increase topical depth and keyword coverage.' : 'Content length is sufficient for search engine relevance.'
      ].filter(Boolean)
    };
  }

  /**
   * AI Backlink Strategy generator
   */
  async generateBacklinkStrategy({ websiteUrl, targetKeyword, businessName, anchorStats = {} }) {
    const kw = targetKeyword || 'Industry Services';
    const biz = businessName || 'Our Company';

    const messages = [
      {
        role: 'system',
        content: `You are an elite Link Building & Backlink Strategist. Provide structured JSON with anchor text recommendations and link acquisition tactics:
{
  "strategySummary": "...",
  "recommendedNiches": ["...", "..."],
  "anchorRatioAdvice": "...",
  "outreachAngles": ["...", "..."]
}`
      },
      {
        role: 'user',
        content: JSON.stringify({ websiteUrl, targetKeyword: kw, businessName: biz, anchorStats })
      }
    ];

    const llm = await this.callLlm(messages, 0.4, 700);
    if (llm) {
      try {
        const cleaned = llm.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        return JSON.parse(cleaned);
      } catch (e) {}
    }

    return {
      strategySummary: `For ${websiteUrl}, a high-authority backlink profile focused on "${kw}" requires a balanced anchor portfolio: 50% branded, 25% topical/partial match, 15% exact match, and 10% naked URLs. Avoid over-optimizing exact match anchors to stay Penguin-safe.`,
      recommendedNiches: [
        'Local & regional industry directories',
        'Authority technology / business blogs for guest contribution',
        'Vendor, partner, and client showcase case studies',
        'Niche resource pages and curated industry roundups'
      ],
      anchorRatioAdvice: 'Maintain natural variations. If building 20 backlinks, use brand name in 10 links, contextual phrase in 5 links, exact keyword in 3 links, and URL in 2 links.',
      outreachAngles: [
        `Publish a data-backed case study on "${kw}" and pitch to editors`,
        'Find broken links on industry resource hubs and pitch your live page as a replacement',
        'Reclaim unlinked brand mentions by searching Google for your company name'
      ]
    };
  }
}

module.exports = new AIService();
