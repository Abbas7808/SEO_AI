/**
 * Backlink & Anchor Words Intelligence Analyzer
 * Analyzes internal & external links, classifies anchor text distribution,
 * and generates actionable link building blueprints and outreach templates.
 */
class BacklinkAnalyzer {
  static analyze({ analyzedPages = [], context = {} }) {
    const websiteUrl = context.websiteUrl || 'https://example.com';
    const targetKeyword = (context.targetKeyword || '').toLowerCase().trim();
    const businessName = (context.businessName || '').toLowerCase().trim();

    let domainName = '';
    try {
      domainName = new URL(websiteUrl).hostname.replace(/^www\./, '').split('.')[0].toLowerCase();
    } catch (e) {
      domainName = '';
    }

    const allAnchors = [];
    let internalCount = 0;
    let externalCount = 0;
    let emptyCount = 0;
    let nofollowCount = 0;

    // Collect anchors from all pages
    analyzedPages.forEach(page => {
      const anchors = page.links?.anchors || [];
      anchors.forEach(a => {
        allAnchors.push(a);
        if (a.isInternal) internalCount++;
        else externalCount++;
        if (a.isEmpty) emptyCount++;
        if (a.isNofollow) nofollowCount++;
      });
    });

    // Top generic phrases in web development/SEO
    const genericPhrases = new Set([
      'click here', 'read more', 'learn more', 'visit here', 'here', 'more', 'details',
      'website', 'link', 'view more', 'source', 'page', 'check this', 'go here', 'homepage',
      'home', 'contact us', 'privacy policy', 'terms'
    ]);

    // Categorize anchor words
    let branded = 0;
    let exactMatch = 0;
    let partialMatch = 0;
    let generic = 0;
    let nakedUrl = 0;
    let other = 0;

    const anchorFrequency = new Map();

    allAnchors.forEach(a => {
      const rawText = (a.text || '').trim();
      const text = rawText.toLowerCase();

      // Track frequency
      if (rawText) {
        anchorFrequency.set(rawText, (anchorFrequency.get(rawText) || 0) + 1);
      }

      if (a.isEmpty) {
        return;
      }

      if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.')) {
        nakedUrl++;
      } else if (genericPhrases.has(text)) {
        generic++;
      } else if (businessName && text.includes(businessName) || (domainName && text.includes(domainName))) {
        branded++;
      } else if (targetKeyword && text === targetKeyword) {
        exactMatch++;
      } else if (targetKeyword && targetKeyword.split(/\s+/).some(word => word.length > 2 && text.includes(word))) {
        partialMatch++;
      } else {
        other++;
      }
    });

    const totalProcessed = allAnchors.length || 1;
    const nonEmptyProcessed = (allAnchors.length - emptyCount) || 1;

    // Build sorted top anchor words list
    const topAnchorList = Array.from(anchorFrequency.entries())
      .map(([text, count]) => ({
        text,
        count,
        percentage: Number(((count / allAnchors.length) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Distribution metrics
    const distribution = {
      branded: {
        count: branded,
        percentage: Number(((branded / nonEmptyProcessed) * 100).toFixed(1)),
        recommendedTarget: '45% - 55%'
      },
      exactMatch: {
        count: exactMatch,
        percentage: Number(((exactMatch / nonEmptyProcessed) * 100).toFixed(1)),
        recommendedTarget: '10% - 15%'
      },
      partialMatch: {
        count: partialMatch,
        percentage: Number(((partialMatch / nonEmptyProcessed) * 100).toFixed(1)),
        recommendedTarget: '20% - 25%'
      },
      generic: {
        count: generic,
        percentage: Number(((generic / nonEmptyProcessed) * 100).toFixed(1)),
        recommendedTarget: '< 10%'
      },
      nakedUrl: {
        count: nakedUrl,
        percentage: Number(((nakedUrl / nonEmptyProcessed) * 100).toFixed(1)),
        recommendedTarget: '10% - 15%'
      },
      emptyAnchors: {
        count: emptyCount,
        percentage: Number(((emptyCount / totalProcessed) * 100).toFixed(1)),
        recommendedTarget: '0% (Fix Immediately)'
      }
    };

    // Health Assessment
    let healthStatus = 'Healthy Profile';
    let riskLevel = 'Low Risk';
    const issues = [];

    if (emptyCount > 5) {
      issues.push(`Detected ${emptyCount} empty link tags without anchor text or image alt. These create dead link signals.`);
      riskLevel = 'Moderate Risk';
    }
    if (distribution.generic.percentage > 25) {
      issues.push(`High ratio of generic anchors (${distribution.generic.percentage}%). Replace generic "click here" with topical keywords.`);
      riskLevel = 'Moderate Risk';
    }
    if (distribution.exactMatch.percentage > 30) {
      issues.push(`Exact match keyword anchors are unusually high (${distribution.exactMatch.percentage}%). Risk of Google Penguin over-optimization penalty.`);
      healthStatus = 'Over-Optimized Anchor Profile';
      riskLevel = 'High Risk';
    }

    // Recommended Target Anchor Words for link acquisition campaigns
    const brandLabel = businessName || domainName || 'Our Brand';
    const kwLabel = targetKeyword || 'Digital Solutions';

    const targetAnchorRecommendations = [
      { text: brandLabel, category: 'Branded', targetPercentage: '45%' },
      { text: `${brandLabel} ${kwLabel}`, category: 'Partial Match', targetPercentage: '20%' },
      { text: kwLabel, category: 'Exact Match', targetPercentage: '15%' },
      { text: `Best ${kwLabel}`, category: 'Partial Match', targetPercentage: '10%' },
      { text: websiteUrl, category: 'Naked URL', targetPercentage: '10%' }
    ];

    // Ready-to-copy Outreach Templates
    const outreachTemplates = [
      {
        id: 'resource-page',
        type: 'Resource Page Link Insertion',
        subject: `Valuable addition for your [Topic] resource list`,
        body: `Hi [Name],\n\nI was reviewing your excellent guide on [Topic/Page Title] and found your recommendations extremely insightful.\n\nI noticed you linked to several industry resources. We recently published an in-depth breakdown on ${kwLabel} at ${websiteUrl} that covers [unique angle / real-world case study] which your readers would find very practical.\n\nWould you consider adding a link to it under your recommended section?\n\nBest regards,\n[Your Name]\n${businessName || 'SEO Specialist'}`
      },
      {
        id: 'guest-post',
        type: 'Guest Article Contribution Pitch',
        subject: `Content contribution ideas for [Website Name]`,
        body: `Hi [Editor Name],\n\nI’ve been reading [Website Name] for a while and loved your recent piece on [Recent Post Title].\n\nI’d love to contribute a high-value, comprehensive guest article for your audience. Here are three fresh topic ideas:\n1. The Definitive 2026 Guide to ${kwLabel}\n2. 5 Common Mistakes in ${kwLabel} and How to Avoid Them\n3. Future Trends: What’s Next for ${kwLabel}\n\nEach piece will include unique graphics and actionable steps. Let me know if any of these align with your editorial calendar!\n\nBest regards,\n[Your Name]`
      },
      {
        id: 'unlinked-mention',
        type: 'Unlinked Brand Mention Reclamation',
        subject: `Quick question regarding your mention of ${brandLabel}`,
        body: `Hi [Name],\n\nThank you so much for mentioning ${brandLabel} in your article: [Article URL]!\n\nI noticed that while you mentioned our name, there wasn’t a clickable link back to our site. Would it be possible to add a hyperlink to ${websiteUrl} so your readers can easily find us?\n\nEither way, thanks for the shout-out!\n\nBest,\n[Your Name]`
      }
    ];

    return {
      websiteUrl,
      stats: {
        totalLinksScanned: allAnchors.length,
        internalLinks: internalCount,
        externalLinks: externalCount,
        emptyAnchors: emptyCount,
        nofollowLinks: nofollowCount,
        uniqueAnchorWords: anchorFrequency.size
      },
      distribution,
      healthCheck: {
        status: healthStatus,
        riskLevel,
        issues: issues.length ? issues : ['Anchor profile is balanced with natural anchor diversity.']
      },
      topAnchorWords: topAnchorList,
      targetAnchorRecommendations,
      outreachTemplates
    };
  }
}

module.exports = BacklinkAnalyzer;
