/**
 * SEO Scoring Engine (0 - 100)
 * 
 * Strict Weight Distribution:
 * - Technical SEO:       25 points
 * - On-Page SEO:         25 points
 * - Content SEO:         20 points
 * - Performance:         15 points
 * - Structured Data:      5 points
 * - Social SEO:           5 points
 * - Local SEO:            5 points
 * --------------------------------
 * Total:                100 points
 */
class SeoScorer {
  constructor(analyzedPages = [], context = {}) {
    this.pages = analyzedPages;
    this.context = context;
    this.issues = [];
  }

  scoreAudit() {
    if (!this.pages || this.pages.length === 0) {
      return {
        overallScore: 0,
        technicalScore: 0,
        onPageScore: 0,
        contentScore: 0,
        performanceScore: 0,
        structuredDataScore: 0,
        socialScore: 0,
        localScore: 0,
        issues: [
          {
            type: 'crawl_failed',
            severity: 'critical',
            title: 'Website Crawl Failed',
            page: this.context.websiteUrl || 'N/A',
            description: 'The crawler was unable to retrieve any pages from the specified website URL.',
            impact: 'Search engines and users cannot access the website content.',
            recommendation: 'Verify the server is running, DNS resolves properly, and no firewall blocks web requests.'
          }
        ],
        summary: {
          critical: 1,
          high: 0,
          medium: 0,
          low: 0,
          passed: 0
        }
      };
    }

    const allIssues = [];
    const pageScores = [];

    // Evaluate each page and collect issues
    this.pages.forEach(page => {
      const pageResult = this.evaluatePage(page);
      pageScores.push(pageResult);
      allIssues.push(...pageResult.issues);
    });

    // Calculate aggregated category scores averaged across pages
    const numPages = pageScores.length;
    const avgMobile = Math.round(pageScores.reduce((acc, p) => acc + (p.scores.mobile || 0), 0) / numPages);
    const avgDesktop = Math.round(pageScores.reduce((acc, p) => acc + (p.scores.desktop || 0), 0) / numPages);
    const avgTech = Math.round(pageScores.reduce((acc, p) => acc + p.scores.technical, 0) / numPages);
    const avgOnPage = Math.round(pageScores.reduce((acc, p) => acc + p.scores.onPage, 0) / numPages);
    const avgContent = Math.round(pageScores.reduce((acc, p) => acc + p.scores.content, 0) / numPages);
    const avgPerf = Math.round(pageScores.reduce((acc, p) => acc + p.scores.performance, 0) / numPages);
    const avgSchema = Math.round(pageScores.reduce((acc, p) => acc + p.scores.structuredData, 0) / numPages);
    const avgSocial = Math.round(pageScores.reduce((acc, p) => acc + p.scores.social, 0) / numPages);
    const avgLocal = Math.round(pageScores.reduce((acc, p) => acc + p.scores.local, 0) / numPages);

    // Weighted Overall Score out of 100:
    // Tech: 25%, OnPage: 25%, Content: 20%, Perf: 15%, Schema: 5%, Social: 5%, Local: 5%
    const weightedOverall = Math.round(
      (avgTech * 0.25) +
      (avgOnPage * 0.25) +
      (avgContent * 0.20) +
      (avgPerf * 0.15) +
      (avgSchema * 0.05) +
      (avgSocial * 0.05) +
      (avgLocal * 0.05)
    );

    const overallScore = Math.min(Math.max(weightedOverall, 0), 100);

    // Group issue counts
    const summary = {
      critical: allIssues.filter(i => i.severity === 'critical').length,
      high: allIssues.filter(i => i.severity === 'high').length,
      medium: allIssues.filter(i => i.severity === 'medium').length,
      low: allIssues.filter(i => i.severity === 'low').length,
      passed: allIssues.filter(i => i.severity === 'passed').length
    };

    return {
      overallScore,
      mobileScore: Math.min(Math.max(avgMobile, 0), 100),
      desktopScore: Math.min(Math.max(avgDesktop, 0), 100),
      technicalScore: avgTech,
      onPageScore: avgOnPage,
      contentScore: avgContent,
      performanceScore: avgPerf,
      structuredDataScore: avgSchema,
      socialScore: avgSocial,
      localScore: avgLocal,
      issues: allIssues,
      pageScores,
      summary
    };
  }

  evaluatePage(page) {
    const issues = [];
    const url = page.url;

    // -------------------------------------------------------------
    // 1. Technical SEO (Max 100 base)
    // -------------------------------------------------------------
    let techScore = 100;

    // HTTP Status
    if (page.statusCode >= 400) {
      techScore -= 40;
      issues.push({
        type: 'http_error_status',
        severity: 'critical',
        title: `HTTP ${page.statusCode} Error`,
        page: url,
        description: `Page returned HTTP error status ${page.statusCode}.`,
        impact: 'Search crawlers cannot index this page and users see broken links.',
        recommendation: 'Resolve server configuration, broken routes, or redirect permanently (301).'
      });
    } else {
      issues.push({
        type: 'http_status_ok',
        severity: 'passed',
        title: 'HTTP Status Valid',
        page: url,
        description: `Page returned valid status code ${page.statusCode}.`,
        impact: 'Search bots and users can successfully access the page.',
        recommendation: 'Maintain healthy server uptime.'
      });
    }

    // HTTPS
    if (!page.technical.isHttps) {
      techScore -= 25;
      issues.push({
        type: 'insecure_http',
        severity: 'critical',
        title: 'Insecure Connection (HTTP)',
        page: url,
        description: 'The page is served over unencrypted HTTP instead of HTTPS.',
        impact: 'Google flags HTTP sites as insecure and imposes ranking penalties.',
        recommendation: 'Install an SSL certificate and redirect all HTTP requests to HTTPS.'
      });
    } else {
      issues.push({
        type: 'secure_https',
        severity: 'passed',
        title: 'Secure HTTPS Enabled',
        page: url,
        description: 'Page is served over encrypted HTTPS connection.',
        impact: 'Builds user trust and satisfies Google HTTPS ranking criteria.',
        recommendation: 'Keep SSL certificate renewed.'
      });
    }

    // Viewport Mobile
    if (!page.technical.viewportMeta) {
      techScore -= 15;
      issues.push({
        type: 'missing_viewport',
        severity: 'high',
        title: 'Missing Viewport Meta Tag',
        page: url,
        description: 'Page does not declare a viewport meta tag for mobile devices.',
        impact: 'Fails Google mobile-friendliness inspection and hurts mobile rankings.',
        recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to <head>.'
      });
    } else {
      issues.push({
        type: 'viewport_present',
        severity: 'passed',
        title: 'Mobile Viewport Tag Present',
        page: url,
        description: 'Mobile viewport tag is properly configured.',
        impact: 'Enables responsive rendering on smartphones and tablets.',
        recommendation: 'Ensure responsive CSS rules are maintained across breakpoints.'
      });
    }

    // Language attribute
    if (!page.technical.htmlLang) {
      techScore -= 10;
      issues.push({
        type: 'missing_html_lang',
        severity: 'low',
        title: 'Missing HTML lang Attribute',
        page: url,
        description: 'The <html> element does not specify a language attribute.',
        impact: 'Screen readers and international search crawlers may misidentify page language.',
        recommendation: 'Add lang="en" (or appropriate language code) to the <html> tag.'
      });
    }

    // Canonical tag
    if (!page.technical.canonicalTag) {
      techScore -= 10;
      issues.push({
        type: 'missing_canonical',
        severity: 'medium',
        title: 'Missing Canonical Tag',
        page: url,
        description: 'Page lacks a rel="canonical" link tag.',
        impact: 'Increases risk of duplicate content penalties when URL parameters or protocol variants exist.',
        recommendation: `Add <link rel="canonical" href="${url}" /> to the <head> section.`
      });
    }

    // Robots meta tag
    if (page.technical.robotsMeta && page.technical.robotsMeta.toLowerCase().includes('noindex')) {
      techScore -= 30;
      issues.push({
        type: 'robots_noindex',
        severity: 'critical',
        title: 'Page Marked as Noindex',
        page: url,
        description: `Page header contains robots meta tag: "${page.technical.robotsMeta}".`,
        impact: 'Search engines are explicitly prohibited from indexing this page in search results.',
        recommendation: 'If this page is intended for public search, remove the "noindex" directive.'
      });
    }

    techScore = Math.max(techScore, 0);

    // -------------------------------------------------------------
    // 2. On-Page SEO (Max 100 base)
    // -------------------------------------------------------------
    let onPageScore = 100;

    // Title tag
    if (!page.onPage.title) {
      onPageScore -= 35;
      issues.push({
        type: 'missing_title',
        severity: 'critical',
        title: 'Missing Title Tag',
        page: url,
        description: 'The page does not contain a <title> tag in the HTML head.',
        impact: 'Title tags are the single most critical on-page ranking and click-through factor.',
        recommendation: 'Add a descriptive <title> tag between 40 and 60 characters.'
      });
    } else {
      const tLen = page.onPage.titleLength;
      if (tLen < 20) {
        onPageScore -= 10;
        issues.push({
          type: 'short_title',
          severity: 'medium',
          title: 'Title Tag Is Too Short',
          page: url,
          description: `Title tag is only ${tLen} characters long ("${page.onPage.title}").`,
          impact: 'Short titles miss out on primary and secondary keyword opportunities.',
          recommendation: 'Expand title to 45-60 characters including your brand and target keyword.'
        });
      } else if (tLen > 65) {
        onPageScore -= 8;
        issues.push({
          type: 'long_title',
          severity: 'low',
          title: 'Title Tag May Be Truncated',
          page: url,
          description: `Title tag is ${tLen} characters long, exceeding standard search SERP display limits.`,
          impact: 'Google will truncate the title with ellipsis (...) in search results.',
          recommendation: 'Keep title tag under 60 characters to ensure full readability on mobile & desktop SERPs.'
        });
      } else {
        issues.push({
          type: 'title_optimal',
          severity: 'passed',
          title: 'Title Tag Length Optimal',
          page: url,
          description: `Title is ${tLen} characters: "${page.onPage.title}".`,
          impact: 'Displays cleanly in search engine result pages without truncation.',
          recommendation: 'Review periodically to ensure target keyword alignment.'
        });
      }
    }

    // Meta Description
    if (!page.onPage.metaDescription) {
      onPageScore -= 25;
      issues.push({
        type: 'missing_meta_description',
        severity: 'high',
        title: 'Missing Meta Description',
        page: url,
        description: 'The page does not contain a meta description tag.',
        impact: 'Search engines will auto-generate snippets which often look disjointed or incomplete.',
        recommendation: 'Add a concise, compelling meta description between 130 and 160 characters with a clear call-to-action.'
      });
    } else {
      const dLen = page.onPage.metaDescriptionLength;
      if (dLen < 70) {
        onPageScore -= 8;
        issues.push({
          type: 'short_meta_description',
          severity: 'medium',
          title: 'Meta Description Is Too Short',
          page: url,
          description: `Meta description is only ${dLen} characters.`,
          impact: 'Under-utilized snippet area reduces search user click-through rate (CTR).',
          recommendation: 'Expand description to 130-160 characters describing benefits and including relevant keywords.'
        });
      } else if (dLen > 165) {
        onPageScore -= 5;
        issues.push({
          type: 'long_meta_description',
          severity: 'low',
          title: 'Meta Description Exceeds SERP Limit',
          page: url,
          description: `Meta description is ${dLen} characters and will be clipped in search snippets.`,
          impact: 'Crucial call-to-action text at the end of the description may be cut off.',
          recommendation: 'Trim meta description to under 160 characters.'
        });
      } else {
        issues.push({
          type: 'meta_description_optimal',
          severity: 'passed',
          title: 'Meta Description Length Optimal',
          page: url,
          description: `Meta description is well formatted (${dLen} characters).`,
          impact: 'Maximizes organic click-through rate in search snippets.',
          recommendation: 'Maintain persuasive, value-focused copy.'
        });
      }
    }

    // Headings (H1)
    if (page.onPage.h1Count === 0) {
      onPageScore -= 25;
      issues.push({
        type: 'missing_h1',
        severity: 'high',
        title: 'Missing H1 Heading Tag',
        page: url,
        description: 'Page does not have an <h1> heading tag.',
        impact: 'H1 indicates the primary topic to search crawlers and sets visual hierarchy for users.',
        recommendation: 'Add exactly one descriptive <h1> tag summarizing the main theme of the page.'
      });
    } else if (page.onPage.h1Count > 1) {
      onPageScore -= 10;
      issues.push({
        type: 'multiple_h1',
        severity: 'medium',
        title: 'Multiple H1 Heading Tags Found',
        page: url,
        description: `Page has ${page.onPage.h1Count} <h1> headings.`,
        impact: 'Can dilute topical focus and confuse crawler heading hierarchy.',
        recommendation: 'Reserve <h1> for the primary title and convert secondary headers to <h2> or <h3>.'
      });
    } else {
      issues.push({
        type: 'h1_valid',
        severity: 'passed',
        title: 'Single H1 Heading Present',
        page: url,
        description: `H1: "${page.onPage.h1s[0]}".`,
        impact: 'Clearly communicates the main topic of the page to search engines.',
        recommendation: 'Ensure your primary keyword appears naturally in the H1.'
      });
    }

    // Images Alt Attributes
    if (page.images.total > 0 && page.images.missingAltCount > 0) {
      const missing = page.images.missingAltCount;
      const severity = missing > 5 ? 'high' : 'medium';
      onPageScore -= Math.min(missing * 3, 20);
      issues.push({
        type: 'missing_image_alt',
        severity,
        title: `${missing} Image(s) Missing Alt Attributes`,
        page: url,
        description: `Out of ${page.images.total} images on this page, ${missing} lack descriptive alt text.`,
        impact: 'Degrades web accessibility for screen readers and forfeits Google Image Search rankings.',
        recommendation: 'Add descriptive, keyword-relevant alt attributes to every meaningful image.'
      });
    } else if (page.images.total > 0) {
      issues.push({
        type: 'image_alt_passed',
        severity: 'passed',
        title: 'All Images Have Alt Attributes',
        page: url,
        description: `All ${page.images.total} images include alt text.`,
        impact: 'Enhances accessibility and image search indexing.',
        recommendation: 'Keep alt descriptions descriptive and concise.'
      });
    }

    onPageScore = Math.max(onPageScore, 0);

    // -------------------------------------------------------------
    // 3. Content SEO (Max 100 base)
    // -------------------------------------------------------------
    let contentScore = 100;
    const words = page.content.wordCount;

    if (words < 150) {
      contentScore -= 45;
      issues.push({
        type: 'thin_content',
        severity: 'high',
        title: 'Thin Content Detected (<150 words)',
        page: url,
        description: `Page has only ${words} words of readable body text.`,
        impact: 'Google algorithms penalize thin content pages with poor search rankings.',
        recommendation: 'Expand comprehensive content to at least 400-600 words with in-depth answers.'
      });
    } else if (words < 350) {
      contentScore -= 15;
      issues.push({
        type: 'low_word_count',
        severity: 'medium',
        title: 'Moderate Word Count (<350 words)',
        page: url,
        description: `Page has ${words} words.`,
        impact: 'May struggle to compete against comprehensive competitor articles.',
        recommendation: 'Add supporting sections, FAQs, and detailed explanations.'
      });
    } else {
      issues.push({
        type: 'content_depth_good',
        severity: 'passed',
        title: 'Healthy Content Length',
        page: url,
        description: `Page contains ${words} words of body content.`,
        impact: 'Provides sufficient depth for search engine relevance scoring.',
        recommendation: 'Continuously update content with fresh insights.'
      });
    }

    // Target Keyword optimization if provided
    if (page.content.targetKeyword) {
      if (page.content.keywordCount === 0) {
        contentScore -= 25;
        issues.push({
          type: 'missing_target_keyword',
          severity: 'high',
          title: `Target Keyword "${page.content.targetKeyword}" Not Found`,
          page: url,
          description: 'The specified target keyword does not appear in the page body text.',
          impact: 'Page is unlikely to rank for the user\'s intended search query.',
          recommendation: `Incorporate "${page.content.targetKeyword}" naturally in title, H1, and first paragraph.`
        });
      } else {
        if (!page.content.inTitle) {
          contentScore -= 10;
          issues.push({
            type: 'keyword_not_in_title',
            severity: 'medium',
            title: `Keyword Not in Title Tag`,
            page: url,
            description: `Target keyword "${page.content.targetKeyword}" was not found in the <title> tag.`,
            impact: 'Misses a primary relevancy signal used by search engine ranking algorithms.',
            recommendation: `Add "${page.content.targetKeyword}" near the beginning of your title tag.`
          });
        }
        if (!page.content.inH1) {
          contentScore -= 8;
          issues.push({
            type: 'keyword_not_in_h1',
            severity: 'medium',
            title: `Keyword Not in H1 Heading`,
            page: url,
            description: `Target keyword "${page.content.targetKeyword}" was not found in the <h1> heading.`,
            impact: 'Weakens topical alignment between page heading and search intent.',
            recommendation: `Include "${page.content.targetKeyword}" inside your primary <h1>.`
          });
        }
      }
    }

    contentScore = Math.max(contentScore, 0);

    // -------------------------------------------------------------
    // 4. Performance (Max 100 base)
    // -------------------------------------------------------------
    let perfScore = 100;
    const ms = page.performance.responseTimeMs;

    if (ms > 3500) {
      perfScore -= 40;
      issues.push({
        type: 'slow_response_time',
        severity: 'critical',
        title: 'Very Slow Server Response Time',
        page: url,
        description: `Initial response took ${ms}ms (>3.5 seconds).`,
        impact: 'Drives high bounce rates and fails Google Core Web Vitals thresholds (TTFB).',
        recommendation: 'Enable server-side caching, upgrade hosting resources, or use a CDN (Cloudflare).'
      });
    } else if (ms > 1500) {
      perfScore -= 20;
      issues.push({
        type: 'moderate_response_time',
        severity: 'medium',
        title: 'Suboptimal Response Time',
        page: url,
        description: `Response time was ${ms}ms.`,
        impact: 'Slight drag on user experience and crawling speed.',
        recommendation: 'Optimize backend database queries and gzip/brotli compression.'
      });
    } else {
      issues.push({
        type: 'fast_response_time',
        severity: 'passed',
        title: 'Fast Server Response',
        page: url,
        description: `Server responded quickly in ${ms}ms.`,
        impact: 'Delivers snappy user experience and efficient crawl budget utilization.',
        recommendation: 'Maintain cache headers and low server latency.'
      });
    }

    if (page.performance.htmlSizeBytes > 1500000) { // >1.5MB
      perfScore -= 20;
      issues.push({
        type: 'large_html_size',
        severity: 'medium',
        title: 'Excessive HTML Document Size',
        page: url,
        description: `HTML document is ${(page.performance.htmlSizeBytes / 1024).toFixed(1)} KB.`,
        impact: 'Increases DOM parsing latency on mobile devices.',
        recommendation: 'Remove inline base64 images and minified scripts from initial HTML payload.'
      });
    }

    perfScore = Math.max(perfScore, 0);

    // -------------------------------------------------------------
    // 5. Structured Data (Max 100 base)
    // -------------------------------------------------------------
    let schemaScore = 100;
    if (!page.structuredData.hasJsonLd) {
      schemaScore = 30;
      issues.push({
        type: 'missing_structured_data',
        severity: 'medium',
        title: 'No Structured Data (Schema.org) Detected',
        page: url,
        description: 'Page does not contain JSON-LD structured data markup.',
        impact: 'Forfeits Google Rich Snippets (star ratings, FAQ accordions, business cards).',
        recommendation: 'Add JSON-LD Schema markup for WebSite, Organization, or Article.'
      });
    } else {
      issues.push({
        type: 'schema_detected',
        severity: 'passed',
        title: 'Structured Data Found',
        page: url,
        description: `Detected schema types: ${page.structuredData.schemas.join(', ')}.`,
        impact: 'Enables rich search snippet eligibility in Google SERPs.',
        recommendation: 'Validate with Google Rich Results Test regularly.'
      });
    }

    // -------------------------------------------------------------
    // 6. Social SEO (Max 100 base)
    // -------------------------------------------------------------
    let socialScore = 100;
    if (!page.social.hasOpenGraph) {
      socialScore -= 50;
      issues.push({
        type: 'missing_open_graph',
        severity: 'medium',
        title: 'Missing Open Graph Tags',
        page: url,
        description: 'Page lacks og:title, og:description, or og:image tags.',
        impact: 'Social media links on Facebook, LinkedIn, and WhatsApp will appear bland without preview cards.',
        recommendation: 'Add <meta property="og:title">, <meta property="og:description">, and <meta property="og:image">.'
      });
    } else {
      issues.push({
        type: 'open_graph_valid',
        severity: 'passed',
        title: 'Open Graph Tags Present',
        page: url,
        description: 'Social sharing preview tags are configured.',
        impact: 'Generates professional social preview cards when shared.',
        recommendation: 'Ensure high-resolution 1200x630px social preview image is supplied.'
      });
    }

    if (!page.social.hasTwitterCard) {
      socialScore -= 30;
      issues.push({
        type: 'missing_twitter_card',
        severity: 'low',
        title: 'Missing Twitter/X Card Tags',
        page: url,
        description: 'Page does not specify twitter:card meta tags.',
        impact: 'Links shared on X/Twitter will not render large summary card previews.',
        recommendation: 'Add <meta name="twitter:card" content="summary_large_image">.'
      });
    }

    socialScore = Math.max(socialScore, 0);

    // -------------------------------------------------------------
    // 7. Local SEO (Max 100 base)
    // -------------------------------------------------------------
    let localScore = 100;
    if (!page.local.hasPhone && !page.local.hasLocalSchema) {
      localScore = 40;
      issues.push({
        type: 'missing_local_signals',
        severity: 'low',
        title: 'No Direct Local SEO Contact Signals',
        page: url,
        description: 'No clickable phone link (tel:) or LocalBusiness schema detected.',
        impact: 'May reduce Google Maps and local pack visibility.',
        recommendation: 'Add clickable phone number, business address, and LocalBusiness schema markup.'
      });
    } else {
      issues.push({
        type: 'local_signals_passed',
        severity: 'passed',
        title: 'Local Contact & Identity Signals Found',
        page: url,
        description: 'Page includes phone links or localized business schema.',
        impact: 'Aids local search rankings and click-to-call conversions.',
        recommendation: 'Keep NAP (Name, Address, Phone) consistent with Google Business Profile.'
      });
    }

    // -------------------------------------------------------------
    // Mobile SEO Score (Max 100)
    // -------------------------------------------------------------
    let mobileScore = 100;
    if (!page.technical.viewportMeta) mobileScore -= 35;
    if (!page.technical.isHttps) mobileScore -= 15;
    if (page.responseTimeMs > 2500) mobileScore -= 20;
    else if (page.responseTimeMs > 1400) mobileScore -= 10;
    if (page.performance && page.performance.htmlSizeBytes > 1200000) mobileScore -= 15;
    if (page.images && page.images.missingAltCount > 0) mobileScore -= Math.min(12, page.images.missingAltCount * 3);
    if (page.links && page.links.emptyAnchorsCount > 0) mobileScore -= Math.min(10, page.links.emptyAnchorsCount * 2);
    if (page.onPage && page.onPage.titleLength > 65) mobileScore -= 8;
    mobileScore = Math.max(0, Math.min(100, Math.round(mobileScore)));

    // -------------------------------------------------------------
    // Desktop SEO Score (Max 100)
    // -------------------------------------------------------------
    let desktopScore = 100;
    if (page.statusCode >= 400) desktopScore -= 40;
    if (!page.technical.isHttps) desktopScore -= 15;
    if (!page.technical.canonicalTag) desktopScore -= 10;
    if (!page.onPage.title) desktopScore -= 25;
    else if (page.onPage.titleLength < 30 || page.onPage.titleLength > 70) desktopScore -= 10;
    if (page.onPage.h1Count !== 1) desktopScore -= 15;
    if (page.content && page.content.wordCount < 300) desktopScore -= 15;
    else if (page.content && page.content.wordCount < 600) desktopScore -= 8;
    if (!page.structuredData || !page.structuredData.hasJsonLd) desktopScore -= 12;
    if (page.responseTimeMs > 2500) desktopScore -= 15;
    desktopScore = Math.max(0, Math.min(100, Math.round(desktopScore)));

    // Enrich all issues with category, solutionSteps, suggestedFix, verificationSteps
    const enrichedIssues = issues.map(iss => this._enrichIssue(iss));

    // Page overall score (same weights)
    const pageOverall = Math.round(
      (techScore * 0.25) +
      (onPageScore * 0.25) +
      (contentScore * 0.20) +
      (perfScore * 0.15) +
      (schemaScore * 0.05) +
      (socialScore * 0.05) +
      (localScore * 0.05)
    );

    return {
      url,
      pageOverall: Math.min(Math.max(pageOverall, 0), 100),
      scores: {
        mobile: mobileScore,
        desktop: desktopScore,
        technical: techScore,
        onPage: onPageScore,
        content: contentScore,
        performance: perfScore,
        structuredData: schemaScore,
        social: socialScore,
        local: localScore
      },
      issues: enrichedIssues
    };
  }

  _enrichIssue(issue) {
    const type = (issue.type || issue.issue_type || '').toLowerCase();
    const title = (issue.title || '').toLowerCase();

    let category = issue.category || 'technical';
    let suggestedFix = issue.suggestedFix || issue.suggested_fix || null;
    let solutionSteps = issue.solutionSteps || [];
    let verificationSteps = issue.verificationSteps || [];

    if (type.includes('viewport') || title.includes('viewport')) {
      category = 'mobile';
      suggestedFix = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />';
      solutionSteps = [
        'Open your layout or <head> template.',
        'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> tag.',
        'Ensure container elements do not have fixed widths greater than 100vw.'
      ];
      verificationSteps = ['Toggle DevTools mobile view to confirm responsive scaling.'];
    } else if (type.includes('h1') || title.includes('h1')) {
      category = 'onpage';
      suggestedFix = '<h1>Premier Web Platform & Verified Services</h1>';
      solutionSteps = [
        'Identify the primary keyword and topic of the page.',
        'Add exactly one <h1> element inside the header or hero section.',
        'Replace any secondary H1 tags with <h2>.'
      ];
      verificationSteps = ['Run document.querySelectorAll("h1").length in console to verify count is 1.'];
    } else if (type.includes('description') || title.includes('description')) {
      category = 'onpage';
      suggestedFix = '<meta name="description" content="Discover our verified digital platform. Learn how our automated tools and solutions drive measurable search performance." />';
      solutionSteps = [
        'Draft a 140-155 character summary matching search intent.',
        'Add <meta name="description" content="..."> inside <head>.',
        'Verify character length is between 120 and 160 characters.'
      ];
      verificationSteps = ['Check page source to verify <meta name="description"> tag is present.'];
    } else if (type.includes('title') || title.includes('title')) {
      category = 'onpage';
      suggestedFix = '<title>Primary Keyword • Value Proposition | Brand Name</title>';
      solutionSteps = [
        'Write a 50-60 character title with your main keyword near the front.',
        'Place <title> inside the <head> section.',
        'Verify character length does not exceed 60 characters.'
      ];
      verificationSteps = ['Check browser tab and verify document.title.length <= 60.'];
    } else if (type.includes('alt') || title.includes('alt')) {
      category = 'content';
      suggestedFix = '<img src="/assets/image.webp" alt="Descriptive context of graphic" loading="lazy" />';
      solutionSteps = [
        'Locate all <img> tags missing an alt attribute.',
        'Add concise, descriptive alt text to each image.',
        'Add loading="lazy" to images below the fold.'
      ];
      verificationSteps = ['Run document.querySelectorAll("img:not([alt])").length to confirm 0.'];
    } else if (type.includes('schema') || title.includes('schema') || title.includes('json-ld')) {
      category = 'schema';
      suggestedFix = '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "My Enterprise",\n  "url": "https://example.com"\n}\n</script>';
      solutionSteps = [
        'Generate Schema.org Organization or WebSite JSON-LD.',
        'Embed the script tag inside <head> or at the end of <body>.',
        'Validate with Google Rich Results Test tool.'
      ];
      verificationSteps = ['Test URL in Google Rich Results Test to confirm valid structured data.'];
    } else if (type.includes('canonical') || title.includes('canonical')) {
      category = 'technical';
      suggestedFix = `<link rel="canonical" href="${issue.page || 'https://example.com'}" />`;
      solutionSteps = [
        'Identify the authoritative canonical URL of this page.',
        'Add <link rel="canonical" href="..."> to <head>.',
        'Ensure self-referencing canonical points to https and correct slug.'
      ];
      verificationSteps = ['Verify canonical link tag exists in page source.'];
    } else if (type.includes('https') || type.includes('ssl') || title.includes('insecure')) {
      category = 'technical';
      suggestedFix = 'server { listen 80; return 301 https://$host$request_uri; }';
      solutionSteps = [
        'Install or renew SSL/TLS certificate.',
        'Configure server 301 permanent redirect from HTTP to HTTPS.',
        'Update internal links to use https:// URLs.'
      ];
      verificationSteps = ['Run curl -I http://domain to confirm 301 redirect to https.'];
    } else if (type.includes('response_time') || type.includes('perf') || type.includes('speed') || title.includes('response time')) {
      category = 'performance';
      suggestedFix = 'gzip on; gzip_types text/plain text/css application/json application/javascript;';
      solutionSteps = [
        'Enable server-side Gzip or Brotli compression.',
        'Enable page and database query caching.',
        'Route traffic through a global CDN like Cloudflare.'
      ];
      verificationSteps = ['Test server response time with DevTools Network tab.'];
    } else if (type.includes('word_count') || type.includes('thin') || title.includes('thin')) {
      category = 'content';
      suggestedFix = '<!-- Expand content with high-value sections, FAQs, and topical guides -->';
      solutionSteps = [
        'Identify target search queries and intent for this page.',
        'Expand copy to at least 500-800 words of original, comprehensive content.',
        'Organize with clear <h2> subheadings and bullet lists.'
      ];
      verificationSteps = ['Count total words to ensure >= 500 words.'];
    }

    return {
      ...issue,
      category,
      suggestedFix,
      suggested_fix: suggestedFix,
      solutionSteps,
      verificationSteps
    };
  }
}

module.exports = SeoScorer;
