/**
 * Advanced SEO Growth Roadmap Generator (30 - 60 - 90 Day Phased Action Plan)
 * 
 * Transforms genuine audit findings, category scores, and link metrics into an actionable,
 * prioritized 4-phase strategic roadmap.
 */
class SeoRoadmapGenerator {
  static generate({ analyzedPages = [], scoreResult = {}, context = {} }) {
    const websiteUrl = context.websiteUrl || 'https://example.com';
    const targetKeyword = context.targetKeyword || '';
    const businessName = context.businessName || '';
    const issues = scoreResult.issues || [];
    const overallScore = scoreResult.overallScore || 50;

    const tasks = [];
    let taskIdCounter = 1;

    // Helper to add a task
    const addTask = (taskData) => {
      tasks.push({
        id: `task-${taskIdCounter++}`,
        status: 'todo',
        ...taskData
      });
    };

    // =========================================================================
    // PHASE 1: Immediate Critical Fixes & Crawlability Foundation (Days 1–14)
    // =========================================================================
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');

    // 1.1 Insecure HTTP
    const httpIssues = issues.filter(i => i.type === 'insecure_http');
    if (httpIssues.length > 0) {
      addTask({
        phase: 1,
        phaseName: 'Phase 1: Foundation & Crawlability (Days 1–14)',
        title: 'Enforce Full HTTPS Encryption & HSTS Protocol',
        category: 'Technical',
        priority: 'P0 - Blocker',
        difficulty: 'Low',
        estimatedEffort: '30 mins',
        expectedImpact: '+15% indexing confidence; prevents browser security warnings and rank demotions',
        affectedUrls: httpIssues.map(i => i.page),
        actionSteps: [
          'Install or renew TLS/SSL certificate on hosting server or via Cloudflare.',
          'Add 301 permanent redirect in web server (Nginx/Apache/.htaccess) from HTTP to HTTPS.',
          'Update internal links to use secure https:// protocol.'
        ],
        suggestedFix: `# Apache (.htaccess) HTTPS Redirect:\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`
      });
    }

    // 1.2 Broken Pages / 4xx/5xx Errors
    const brokenPages = issues.filter(i => i.type === 'http_error_status');
    if (brokenPages.length > 0) {
      addTask({
        phase: 1,
        phaseName: 'Phase 1: Foundation & Crawlability (Days 1–14)',
        title: `Repair ${brokenPages.length} Broken Page(s) & HTTP Error Routes`,
        category: 'Technical',
        priority: 'P0 - Blocker',
        difficulty: 'Medium',
        estimatedEffort: '1 - 2 hours',
        expectedImpact: 'Reclaims lost crawl budget and eliminates 404 dead ends for users and Googlebot',
        affectedUrls: brokenPages.map(i => i.page),
        actionSteps: [
          'Inspect server logs for 404 or 500 status codes.',
          'Redirect discontinued pages to the closest relevant live URL with HTTP 301.',
          'Update or remove broken internal links pointing to these endpoints.'
        ],
        suggestedFix: `// Express.js 301 Redirect Example:\napp.get('/old-service-url', (req, res) => {\n  res.redirect(301, '/new-service-url');\n});`
      });
    }

    // 1.3 Noindex Directives
    const noindexIssues = issues.filter(i => i.type === 'robots_noindex');
    if (noindexIssues.length > 0) {
      addTask({
        phase: 1,
        phaseName: 'Phase 1: Foundation & Crawlability (Days 1–14)',
        title: 'Remove "noindex" Directives on Key Landing Pages',
        category: 'Technical',
        priority: 'P0 - Blocker',
        difficulty: 'Low',
        estimatedEffort: '15 mins',
        expectedImpact: 'Allows Google and Bing to immediately index these critical pages into search results',
        affectedUrls: noindexIssues.map(i => i.page),
        actionSteps: [
          'Open header template of the flagged page(s).',
          'Remove <meta name="robots" content="noindex"> or change to "index, follow".',
          'Submit the URL for live re-indexing via Google Search Console.'
        ],
        suggestedFix: `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">`
      });
    }

    // 1.4 Missing Viewport Meta Tag
    const viewportIssues = issues.filter(i => i.type === 'missing_viewport');
    if (viewportIssues.length > 0) {
      addTask({
        phase: 1,
        phaseName: 'Phase 1: Foundation & Crawlability (Days 1–14)',
        title: 'Add Responsive Mobile Viewport Tag',
        category: 'Technical',
        priority: 'P1 - High',
        difficulty: 'Low',
        estimatedEffort: '15 mins',
        expectedImpact: 'Enables mobile-first indexing compliance; critical for modern smartphone SERP ranking',
        affectedUrls: viewportIssues.map(i => i.page),
        actionSteps: [
          'Locate HTML <head> section across all layout templates.',
          'Inject standard mobile responsive viewport tag.'
        ],
        suggestedFix: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
      });
    }

    // 1.5 Missing Primary H1
    const missingH1Issues = issues.filter(i => i.type === 'missing_h1');
    if (missingH1Issues.length > 0) {
      addTask({
        phase: 1,
        phaseName: 'Phase 1: Foundation & Crawlability (Days 1–14)',
        title: `Implement Primary <h1> Headings on ${missingH1Issues.length} Page(s)`,
        category: 'On-Page',
        priority: 'P1 - High',
        difficulty: 'Low',
        estimatedEffort: '45 mins',
        expectedImpact: '+12% topical relevance boost; clarifies primary page subject to search algorithms',
        affectedUrls: missingH1Issues.map(i => i.page),
        actionSteps: [
          'Ensure every page has exactly one distinct <h1> element.',
          'Include the primary focus topic and location in the header.',
          'Keep header succinct and front-loaded with primary keyword.'
        ],
        suggestedFix: `<h1>${targetKeyword ? targetKeyword : 'Premier Services & Solutions'}${businessName ? ` | ${businessName}` : ''}</h1>`
      });
    }

    // Always ensure at least 2 foundation tasks exist
    if (tasks.filter(t => t.phase === 1).length === 0) {
      addTask({
        phase: 1,
        phaseName: 'Phase 1: Foundation & Crawlability (Days 1–14)',
        title: 'Audit Server Latency & Verify Robots.txt Directives',
        category: 'Technical',
        priority: 'P1 - High',
        difficulty: 'Low',
        estimatedEffort: '30 mins',
        expectedImpact: 'Secures seamless crawler access and fast TTFB across all international nodes',
        affectedUrls: [websiteUrl],
        actionSteps: [
          'Verify robots.txt does not disallow valuable CSS, JS, or image directories.',
          'Confirm XML sitemap location is declared at the bottom of robots.txt.',
          'Enable Gzip or Brotli compression at web server level.'
        ],
        suggestedFix: `User-agent: *\nAllow: /\nSitemap: ${websiteUrl.replace(/\/+$/, '')}/sitemap.xml`
      });
    }

    // =========================================================================
    // PHASE 2: On-Page Relevance & Content Quality (Days 15–30)
    // =========================================================================
    // 2.1 Missing or Short Title Tags
    const titleIssues = issues.filter(i => i.type === 'missing_title' || i.type === 'short_title' || i.type === 'long_title');
    if (titleIssues.length > 0) {
      addTask({
        phase: 2,
        phaseName: 'Phase 2: On-Page Relevance & Metadata (Days 15–30)',
        title: 'Optimize Title Tags Between 45–60 Characters with Primary Keywords',
        category: 'On-Page',
        priority: 'P1 - High',
        difficulty: 'Low',
        estimatedEffort: '1 hour',
        expectedImpact: '+20-30% organic click-through rate (CTR); high-weight relevancy signal in SERP',
        affectedUrls: titleIssues.map(i => i.page),
        actionSteps: [
          'Position primary target keyword in the first 3 words of the title.',
          'Add unique value proposition or location.',
          'Append brand name separated by pipe (|) or hyphen (-).'
        ],
        suggestedFix: `<title>${targetKeyword ? `${targetKeyword} - Top Rated Services` : 'Professional Solutions'} | ${businessName || 'Company'}</title>`
      });
    }

    // 2.2 Meta Descriptions
    const metaDescIssues = issues.filter(i => i.type.includes('meta_description'));
    if (metaDescIssues.length > 0) {
      addTask({
        phase: 2,
        phaseName: 'Phase 2: On-Page Relevance & Metadata (Days 15–30)',
        title: 'Craft Compelling 130–160 Character Meta Descriptions with CTAs',
        category: 'On-Page',
        priority: 'P1 - High',
        difficulty: 'Low',
        estimatedEffort: '1.5 hours',
        expectedImpact: '+18% snippet click-through rate; prevents auto-generated clipped search snippets',
        affectedUrls: metaDescIssues.map(i => i.page),
        actionSteps: [
          'Write unique meta descriptions for each page (no duplicate snippets).',
          'Include primary target keyword and secondary benefit.',
          'Finish with an active call-to-action (e.g., "Explore now", "Call for free quote").'
        ],
        suggestedFix: `<meta name="description" content="Discover top-tier ${targetKeyword || 'professional services'} with ${businessName || 'our team'}. Fast turnaround, transparent pricing, and trusted customer support. Get a quote today!">`
      });
    }

    // 2.3 Image Alt Attributes
    const imageAltIssues = issues.filter(i => i.type.includes('image_alt'));
    if (imageAltIssues.length > 0) {
      addTask({
        phase: 2,
        phaseName: 'Phase 2: On-Page Relevance & Metadata (Days 15–30)',
        title: 'Add Descriptive Keyword-Rich Alt Text to Images',
        category: 'On-Page',
        priority: 'P2 - Medium',
        difficulty: 'Low',
        estimatedEffort: '1 hour',
        expectedImpact: 'Unlocks Google Image Search impressions and fulfills ADA / WCAG accessibility compliance',
        affectedUrls: imageAltIssues.map(i => i.page),
        actionSteps: [
          'Add meaningful, concise alt text describing each product, feature, or illustration.',
          'Avoid stuffing raw keywords; describe the actual image context naturally.',
          'Use alt="" only for purely decorative design dividers.'
        ],
        suggestedFix: `<img src="/images/service-preview.jpg" alt="${businessName || 'Company'} ${targetKeyword || 'service overview'} illustration" loading="lazy">`
      });
    }

    // 2.4 Thin Content Pages
    const thinContent = issues.filter(i => i.type === 'thin_content' || i.type === 'low_word_count');
    if (thinContent.length > 0) {
      addTask({
        phase: 2,
        phaseName: 'Phase 2: On-Page Relevance & Metadata (Days 15–30)',
        title: 'Expand Thin Content Pages to 600+ In-Depth Words',
        category: 'Content',
        priority: 'P1 - High',
        difficulty: 'Medium',
        estimatedEffort: '3 - 5 hours',
        expectedImpact: 'Escapes Google thin content penalties and improves dwell time / topical authority',
        affectedUrls: thinContent.map(i => i.page),
        actionSteps: [
          'Add detailed FAQ section with accordion answers.',
          'Incorporate step-by-step process guides or customer testimonials.',
          'Include comparison tables, feature breakdowns, and actionable tips.'
        ],
        suggestedFix: `<h2>Frequently Asked Questions</h2>\n<div class="faq-item">\n  <h3>What makes our ${targetKeyword || 'solution'} unique?</h3>\n  <p>Detailed explanatory paragraph with authentic insights...</p>\n</div>`
      });
    }

    // 2.5 Canonical Tag Standardization
    const canonicalIssues = issues.filter(i => i.type.includes('canonical'));
    if (canonicalIssues.length > 0) {
      addTask({
        phase: 2,
        phaseName: 'Phase 2: On-Page Relevance & Metadata (Days 15–30)',
        title: 'Add Self-Referential Canonical Tags to Prevent Duplicate Content',
        category: 'Technical',
        priority: 'P2 - Medium',
        difficulty: 'Low',
        estimatedEffort: '30 mins',
        expectedImpact: 'Prevents URL parameter and trailing-slash duplicate content index splits',
        affectedUrls: canonicalIssues.map(i => i.page),
        actionSteps: [
          'Add a canonical tag in <head> referencing the authoritative URL.',
          'Ensure absolute URLs with correct protocol (https://) and domain are specified.'
        ],
        suggestedFix: `<link rel="canonical" href="${websiteUrl}">`
      });
    }

    // =========================================================================
    // PHASE 3: Backlinks, Anchor Words & Internal Linking (Days 31–60)
    // =========================================================================
    addTask({
      phase: 3,
      phaseName: 'Phase 3: Backlinks & Anchor Words Architecture (Days 31–60)',
      title: 'Optimize Internal Anchor Text Distribution & Fix Empty Anchors',
      category: 'Backlinks',
      priority: 'P1 - High',
      difficulty: 'Medium',
      estimatedEffort: '2 hours',
      expectedImpact: '+18% PageRank flow distribution; stops keyword cannibalization across internal pages',
      affectedUrls: [websiteUrl],
      actionSteps: [
        'Eliminate generic anchor words like "click here", "read more", and "link".',
        'Replace empty <a> tags with descriptive keyword-rich anchor text.',
        'Link from top-ranking authoritative pages to newer or under-performing service pages.'
      ],
      suggestedFix: `<!-- Before: <a href="/services">Click here</a> -->\n<!-- After: -->\n<a href="/services" title="Explore our specialized ${targetKeyword || 'offerings'}">Explore our complete ${targetKeyword || 'services'}</a>`
    });

    addTask({
      phase: 3,
      phaseName: 'Phase 3: Backlinks & Anchor Words Architecture (Days 31–60)',
      title: 'Launch Targeted Backlink Campaign with Balanced Anchor Text Portfolio',
      category: 'Backlinks',
      priority: 'P1 - High',
      difficulty: 'High',
      estimatedEffort: '4 - 8 hours',
      expectedImpact: 'Significant Domain Authority (DA) jump and top-3 ranking positions for target terms',
      affectedUrls: [websiteUrl],
      actionSteps: [
        'Target a 50% Branded, 25% Partial Keyword, 15% Exact Match, 10% URL anchor text ratio.',
        'Identify 10-15 industry-relevant blogs or local directories in your niche.',
        'Execute guest post outreach and unlinked brand mention link reclamation campaigns.'
      ],
      suggestedFix: `Anchor Text Target Strategy:\n- Branded (50%): "${businessName || 'Our Brand'}"\n- Partial Match (25%): "${businessName || 'Brand'} ${targetKeyword || 'services'}"\n- Exact Match (15%): "${targetKeyword || 'best local specialist'}"\n- Naked URL (10%): "${websiteUrl}"`
    });

    addTask({
      phase: 3,
      phaseName: 'Phase 3: Backlinks & Anchor Words Architecture (Days 31–60)',
      title: 'Build Topic Cluster Pillar Content & Interlinking Silos',
      category: 'Content',
      priority: 'P2 - Medium',
      difficulty: 'Medium',
      estimatedEffort: '4 hours',
      expectedImpact: 'Establishes topical authority and increases average pages visited per session',
      affectedUrls: [websiteUrl],
      actionSteps: [
        'Designate a comprehensive "Ultimate Guide" pillar page for your primary keyword.',
        'Create 3-5 subtopic cluster articles answering specific user search questions.',
        'Ensure bidirectional internal links connecting every cluster article back to the pillar.'
      ],
      suggestedFix: `<p>For a detailed breakdown of options, review our complete <a href="/guide" class="font-semibold text-brand-600 underline">definitive guide to ${targetKeyword || 'industry solutions'}</a>.</p>`
    });

    // =========================================================================
    // PHASE 4: Authority Scaling, Rich Snippets & Core Web Vitals (Days 61–90+)
    // =========================================================================
    addTask({
      phase: 4,
      phaseName: 'Phase 4: Scaling Authority & Rich Snippets (Days 61–90+)',
      title: 'Implement Schema.org JSON-LD (LocalBusiness, Organization & FAQPage)',
      category: 'Schema',
      priority: 'P1 - High',
      difficulty: 'Medium',
      estimatedEffort: '1.5 hours',
      expectedImpact: 'Qualifies site for Google Rich Snippets (star ratings, FAQ drop-downs, Knowledge Panel)',
      affectedUrls: [websiteUrl],
      actionSteps: [
        'Add Schema.org Organization or LocalBusiness markup to the homepage.',
        'Inject FAQPage JSON-LD on pages with question and answer blocks.',
        'Test implementation using Google Rich Results Test tool.'
      ],
      suggestedFix: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness",\n  "name": "${businessName || 'Business Name'}",\n  "url": "${websiteUrl}",\n  "description": "Premier ${targetKeyword || 'service'} provider.",\n  "telephone": "+1-800-555-0199"\n}\n</script>`
    });

    addTask({
      phase: 4,
      phaseName: 'Phase 4: Scaling Authority & Rich Snippets (Days 61–90+)',
      title: 'Optimize Core Web Vitals (LCP < 2.5s, TTFB < 600ms, CLS < 0.1)',
      category: 'Performance',
      priority: 'P2 - Medium',
      difficulty: 'Medium',
      estimatedEffort: '2 - 3 hours',
      expectedImpact: 'Passes Google PageSpeed CWV assessment; boosts mobile SERP priority',
      affectedUrls: [websiteUrl],
      actionSteps: [
        'Convert legacy PNG/JPG images to next-gen WebP or AVIF format.',
        'Defer non-critical third-party analytics and tracking scripts.',
        'Configure HTTP cache-control headers (max-age=31536000 for static assets).'
      ],
      suggestedFix: `# Nginx Static Asset Caching:\nlocation ~* \\.(jpg|jpeg|png|gif|webp|svg|css|js|woff2)$ {\n    expires 365d;\n    add_header Cache-Control "public, no-transform";\n}`
    });

    // 4.3 Social Metadata
    const socialIssues = issues.filter(i => i.type.includes('open_graph') || i.type.includes('twitter'));
    if (socialIssues.length > 0) {
      addTask({
        phase: 4,
        phaseName: 'Phase 4: Scaling Authority & Rich Snippets (Days 61–90+)',
        title: 'Configure Open Graph & Twitter Summary Large Card Previews',
        category: 'Social',
        priority: 'P3 - Growth',
        difficulty: 'Low',
        estimatedEffort: '45 mins',
        expectedImpact: 'Dramatically increases social click-throughs on LinkedIn, Twitter, and messaging apps',
        affectedUrls: socialIssues.map(i => i.page),
        actionSteps: [
          'Design a high-contrast 1200x630px social banner graphic.',
          'Add og:title, og:description, og:image, and twitter:card tags in <head>.'
        ],
        suggestedFix: `<meta property="og:title" content="${targetKeyword || 'Professional Services'} | ${businessName || 'Company'}">\n<meta property="og:image" content="${websiteUrl.replace(/\/+$/, '')}/assets/social-card.jpg">\n<meta name="twitter:card" content="summary_large_image">`
      });
    }

    // Calculate Summary Metrics
    const totalTasks = tasks.length;
    const p1Count = tasks.filter(t => t.phase === 1).length;
    const p2Count = tasks.filter(t => t.phase === 2).length;
    const p3Count = tasks.filter(t => t.phase === 3).length;
    const p4Count = tasks.filter(t => t.phase === 4).length;

    const projectedScoreLift = Math.min(100 - overallScore, Math.max(15, Math.round(totalTasks * 3.5)));

    return {
      websiteUrl,
      generatedAt: new Date().toISOString(),
      summary: {
        totalTasks,
        phaseCounts: {
          phase1: p1Count,
          phase2: p2Count,
          phase3: p3Count,
          phase4: p4Count
        },
        categoryCounts: {
          technical: tasks.filter(t => t.category === 'Technical').length,
          onpage: tasks.filter(t => t.category === 'On-Page').length,
          content: tasks.filter(t => t.category === 'Content').length,
          backlinks: tasks.filter(t => t.category === 'Backlinks').length,
          schema: tasks.filter(t => t.category === 'Schema').length,
          performance: tasks.filter(t => t.category === 'Performance').length,
          social: tasks.filter(t => t.category === 'Social').length,
        },
        currentScore: overallScore,
        projectedScore: Math.min(100, overallScore + projectedScoreLift),
        projectedScoreLift: `+${projectedScoreLift} pts`,
        estimatedTotalTime: `${Math.round(totalTasks * 0.9)} - ${Math.round(totalTasks * 1.5)} hours`
      },
      phases: [
        {
          id: 1,
          name: 'Phase 1: Foundation & Crawlability (Days 1–14)',
          description: 'Eliminate indexing roadblocks, broken URLs, security alerts, and missing mobile tags.',
          badge: 'Immediate Priority',
          tasks: tasks.filter(t => t.phase === 1)
        },
        {
          id: 2,
          name: 'Phase 2: On-Page Relevance & Metadata (Days 15–30)',
          description: 'Supercharge CTR with optimized title tags, meta descriptions, image alt text, and content expansion.',
          badge: 'High Impact',
          tasks: tasks.filter(t => t.phase === 2)
        },
        {
          id: 3,
          name: 'Phase 3: Backlinks & Anchor Words Architecture (Days 31–60)',
          description: 'Strengthen internal link equity, diversify anchor words, eliminate empty links, and launch backlink outreach.',
          badge: 'Authority Growth',
          tasks: tasks.filter(t => t.phase === 3)
        },
        {
          id: 4,
          name: 'Phase 4: Scaling Authority & Rich Snippets (Days 61–90+)',
          description: 'Implement Schema.org JSON-LD, optimize Core Web Vitals, and capture Google Rich Snippet real estate.',
          badge: 'Long-term Scale',
          tasks: tasks.filter(t => t.phase === 4)
        }
      ],
      allTasks: tasks
    };
  }
}

module.exports = SeoRoadmapGenerator;
