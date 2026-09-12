const cheerio = require('cheerio');
const { URL } = require('url');

/**
 * Enterprise-Grade Advanced SEO & Site Intelligence Page Analyzer
 * Analyzes HTML, metadata, Core Web Vitals, security headers, tech stack, and SERP simulation.
 */
class PageAnalyzer {
  constructor(pageData, context = {}) {
    this.pageData = pageData;
    this.url = pageData.url;
    this.statusCode = pageData.statusCode || 200;
    this.responseTimeMs = pageData.responseTimeMs || 0;
    this.ttfbMs = pageData.ttfbMs || pageData.responseTimeMs || 0;
    this.htmlSize = pageData.htmlSize || 0;
    this.headers = pageData.headers || {};
    this.html = pageData.html || '';
    this.internalLinks = pageData.internalLinks || [];
    this.externalLinks = pageData.externalLinks || [];
    this.linksDetail = pageData.linksDetail || [];
    this.resourceCounts = pageData.resourceCounts || {};

    this.targetKeyword = (context.targetKeyword || '').toLowerCase().trim();
    this.businessName = (context.businessName || '').toLowerCase().trim();
    this.businessLocation = (context.businessLocation || '').toLowerCase().trim();

    this.$ = cheerio.load(this.html);
  }

  analyze() {
    const $ = this.$;
    const parsedUrl = new URL(this.url);

    // 1. Technical SEO checks
    const isHttps = parsedUrl.protocol === 'https:';
    const canonicalTag = $('link[rel="canonical"]').attr('href') || null;
    const robotsMeta = $('meta[name="robots"]').attr('content') || $('meta[name="googlebot"]').attr('content') || null;
    const viewportMeta = $('meta[name="viewport"]').attr('content') || null;
    const htmlLang = $('html').attr('lang') || null;
    const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').attr('href') || null;
    const urlLength = this.url.length;
    const hasParams = parsedUrl.search.length > 0;

    // 2. On-Page Metadata
    const title = $('title').first().text().trim() || null;
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;

    // 3. Headings
    const h1s = [];
    $('h1').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1s.push(text);
    });

    const h2s = [];
    $('h2').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h2s.push(text);
    });

    const h3s = [];
    $('h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h3s.push(text);
    });

    // 4. Content & Text Extraction
    const contentClone = cheerio.load(this.html);
    contentClone('script, style, noscript, svg, iframe, nav, footer, header').remove();
    const rawText = contentClone('body').text().replace(/\s+/g, ' ').trim();
    const words = rawText ? rawText.split(/\s+/).filter(w => w.length > 1) : [];
    const wordCount = words.length;

    // Text-to-code ratio
    const textBytes = Buffer.byteLength(rawText, 'utf8');
    const textToCodeRatio = this.htmlSize > 0 ? Number(((textBytes / this.htmlSize) * 100).toFixed(1)) : 0;

    // Keyword Occurrences
    let keywordCount = 0;
    let inTitle = false;
    let inDescription = false;
    let inH1 = false;

    if (this.targetKeyword) {
      const lowerText = rawText.toLowerCase();
      const regex = new RegExp(`\\b${this.escapeRegex(this.targetKeyword)}\\b`, 'gi');
      const matches = lowerText.match(regex);
      keywordCount = matches ? matches.length : 0;

      if (title && title.toLowerCase().includes(this.targetKeyword)) inTitle = true;
      if (metaDescription && metaDescription.toLowerCase().includes(this.targetKeyword)) inDescription = true;
      if (h1s.some(h => h.toLowerCase().includes(this.targetKeyword))) inH1 = true;
    }

    const keywordDensity = wordCount > 0 && keywordCount > 0
      ? Number(((keywordCount / wordCount) * 100).toFixed(2))
      : 0;

    // 5. Images & Modern Formats
    const images = [];
    let imagesWithoutAlt = 0;
    let imagesWithoutDimensions = 0;
    let modernFormatImagesCount = 0;

    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      const alt = $(el).attr('alt');
      const width = $(el).attr('width');
      const height = $(el).attr('height');
      const hasAlt = typeof alt === 'string' && alt.trim().length > 0;
      const hasDimensions = !!(width && height);

      if (!hasAlt) imagesWithoutAlt++;
      if (!hasDimensions) imagesWithoutDimensions++;

      const isModern = src.toLowerCase().endsWith('.webp') || src.toLowerCase().endsWith('.avif') || src.toLowerCase().endsWith('.svg');
      if (isModern) modernFormatImagesCount++;

      images.push({
        src: src.substring(0, 200),
        alt: alt || null,
        hasAlt,
        hasDimensions,
        width: width || null,
        height: height || null,
        isModern
      });
    });

    // 6. Links & Anchor details
    let emptyAnchors = 0;
    let dofollowCount = 0;
    let nofollowCount = 0;
    const anchorList = [];
    const internalHost = parsedUrl.hostname.replace(/^www\./, '');
    const anchorMap = new Set();

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const text = $(el).text().trim();
      const imgInLink = $(el).find('img').length > 0;
      const rel = $(el).attr('rel') || '';
      const isNofollow = rel.toLowerCase().includes('nofollow');
      if (isNofollow) nofollowCount++;
      else dofollowCount++;

      let isInternal = true;
      try {
        const targetUrl = new URL(href, this.url);
        isInternal = targetUrl.hostname.replace(/^www\./, '') === internalHost;
      } catch (e) {
        isInternal = !href.startsWith('http://') && !href.startsWith('https://');
      }

      const isEmpty = !text && !imgInLink;
      if (isEmpty) emptyAnchors++;

      if (text) anchorMap.add(text.toLowerCase());

      anchorList.push({
        href: href.substring(0, 500),
        text: text || (imgInLink ? '[Image Link]' : ''),
        isInternal,
        isNofollow,
        isEmpty
      });
    });

    // 7. Social Metadata
    const ogTitle = $('meta[property="og:title"]').attr('content') || null;
    const ogDescription = $('meta[property="og:description"]').attr('content') || null;
    const ogImage = $('meta[property="og:image"]').attr('content') || null;
    const ogUrl = $('meta[property="og:url"]').attr('content') || null;
    const twitterCard = $('meta[name="twitter:card"]').attr('content') || null;
    const twitterTitle = $('meta[name="twitter:title"]').attr('content') || null;
    const twitterDescription = $('meta[name="twitter:description"]').attr('content') || null;
    const twitterImage = $('meta[name="twitter:image"]').attr('content') || null;

    // 8. Structured Data (JSON-LD)
    const detectedSchemas = [];
    const schemaDetails = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const rawJson = $(el).html();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          const collect = (item) => {
            if (item && item['@type']) {
              detectedSchemas.push(item['@type']);
              schemaDetails.push({
                type: item['@type'],
                name: item.name || null,
                url: item.url || null,
                isValid: true
              });
            }
          };
          if (Array.isArray(parsed)) parsed.forEach(collect);
          else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) parsed['@graph'].forEach(collect);
          else collect(parsed);
        }
      } catch (e) {
        schemaDetails.push({ type: 'InvalidJSON', isValid: false, error: e.message });
      }
    });

    // 9. Local SEO signals
    const telLinks = $('a[href^="tel:"]').length;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const textHasPhone = phoneRegex.test(rawText);
    const hasPhone = telLinks > 0 || textHasPhone;

    let hasBusinessNameInContent = false;
    if (this.businessName) hasBusinessNameInContent = rawText.toLowerCase().includes(this.businessName);
    let hasLocationInContent = false;
    if (this.businessLocation) hasLocationInContent = rawText.toLowerCase().includes(this.businessLocation);

    const hasLocalSchema = detectedSchemas.some(type => {
      const t = String(type).toLowerCase();
      return t.includes('localbusiness') || t.includes('store') || t.includes('restaurant') || t.includes('organization');
    });

    // 10. Performance & Core Web Vitals Intelligence
    const scriptCount = $('script[src]').length;
    const styleCount = $('link[rel="stylesheet"]').length;
    const iframeCount = $('iframe').length;
    const contentEncoding = this.headers['content-encoding'] || this.pageData.contentEncoding || 'none';
    const isCompressed = ['gzip', 'br', 'deflate'].includes(contentEncoding.toLowerCase());
    const ttfb = this.ttfbMs;
    const ttfbGrade = ttfb < 250 ? 'Good (<250ms)' : ttfb < 600 ? 'Needs Improvement' : 'Poor (>600ms)';

    // Core Web Vitals Estimations
    const estimatedFcpMs = Math.round(ttfb * 1.4 + (this.htmlSize / 1024) * 4);
    const estimatedLcpMs = Math.round(estimatedFcpMs + (images.length > 0 ? 320 : 120));
    const clsRiskScore = imagesWithoutDimensions > 5 ? 'High Risk' : imagesWithoutDimensions > 0 ? 'Moderate' : 'Low (<0.05)';
    const heroImagePreloaded = $('link[rel="preload"][as="image"]').length > 0;

    // 11. Security & HTTP Header Armor
    const hsts = this.headers['strict-transport-security'] || null;
    const csp = this.headers['content-security-policy'] || null;
    const xFrameOptions = this.headers['x-frame-options'] || null;
    const xContentTypeOptions = this.headers['x-content-type-options'] || null;
    const referrerPolicy = this.headers['referrer-policy'] || $('meta[name="referrer"]').attr('content') || null;
    const permissionsPolicy = this.headers['permissions-policy'] || this.headers['feature-policy'] || null;
    const serverHeader = this.headers['server'] || this.pageData.server || 'Protected/Hidden';

    // Mixed Content Scanner: check for http:// in scripts, links, images when page is https
    let mixedContentCount = 0;
    if (isHttps) {
      $('script[src^="http://"], link[href^="http://"], img[src^="http://"], iframe[src^="http://"]').each(() => {
        mixedContentCount++;
      });
    }

    let securityScore = 100;
    if (!isHttps) securityScore -= 30;
    if (!hsts && isHttps) securityScore -= 20;
    if (!csp) securityScore -= 20;
    if (!xFrameOptions) securityScore -= 15;
    if (!xContentTypeOptions) securityScore -= 10;
    if (mixedContentCount > 0) securityScore -= 15;
    securityScore = Math.max(10, securityScore);

    const securityGrade = securityScore >= 90 ? 'A+' : securityScore >= 80 ? 'A' : securityScore >= 70 ? 'B' : securityScore >= 55 ? 'C' : 'F';

    // 12. Technology Stack Fingerprinting
    const techStack = this._detectTechnologies($, rawText);

    // 13. Search Intent & Content Depth Matrix
    const searchIntent = this._evaluateSearchIntent(rawText, title, h1s);

    // 14. Live SERP & Social Preview Simulator
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean).map(p => decodeURIComponent(p));
    const breadcrumbDisplay = pathSegments.length > 0 ? pathSegments.join(' › ') : '';
    const serpSimulator = {
      desktop: {
        title: title || 'Untitled Page',
        titleLengthChars: title ? title.length : 0,
        titleLengthPx: Math.round((title?.length || 0) * 9.6),
        isTitleTruncated: (title?.length || 0) > 60,
        metaDescription: metaDescription || 'No description provided.',
        descriptionChars: metaDescription ? metaDescription.length : 0,
        isDescriptionTruncated: (metaDescription?.length || 0) > 155,
        displayUrl: this.url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        breadcrumbs: breadcrumbDisplay,
        faviconUrl: favicon || `${parsedUrl.origin}/favicon.ico`,
        siteName: parsedUrl.hostname.replace(/^www\./, '')
      },
      mobile: {
        title: title || 'Untitled Page',
        metaDescription: metaDescription || 'No description provided.',
        displayUrl: this.url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        breadcrumbs: breadcrumbDisplay,
        faviconUrl: favicon || `${parsedUrl.origin}/favicon.ico`,
        siteName: parsedUrl.hostname.replace(/^www\./, '')
      },
      social: {
        ogTitle: ogTitle || title || 'Untitled Page',
        ogDescription: ogDescription || metaDescription || 'No description provided.',
        ogImage: ogImage || null,
        ogUrl: ogUrl || this.url,
        twitterCard: twitterCard || 'summary_large_image',
        twitterTitle: twitterTitle || title || 'Untitled Page',
        twitterDescription: twitterDescription || metaDescription || 'No description provided.',
        twitterImage: twitterImage || ogImage || null,
        siteName: parsedUrl.hostname.replace(/^www\./, '')
      }
    };

    // 15. Link Equity Distribution
    const linkEquity = {
      internalCount: this.internalLinks.length,
      externalCount: this.externalLinks.length,
      dofollowCount,
      nofollowCount,
      emptyAnchorsCount: emptyAnchors,
      uniqueAnchorTextsCount: anchorMap.size,
      anchorDiversityRatio: anchorList.length > 0 ? Number(((anchorMap.size / anchorList.length) * 100).toFixed(1)) : 100
    };

    return {
      url: this.url,
      statusCode: this.statusCode,
      responseTimeMs: this.responseTimeMs,
      htmlSize: this.htmlSize,
      technical: {
        isHttps,
        canonicalTag,
        robotsMeta,
        viewportMeta,
        htmlLang,
        favicon,
        urlLength,
        hasParams
      },
      onPage: {
        title,
        titleLength: title ? title.length : 0,
        metaDescription,
        metaDescriptionLength: metaDescription ? metaDescription.length : 0,
        h1Count: h1s.length,
        h1s,
        h2Count: h2s.length,
        h2s,
        h3Count: h3s.length
      },
      content: {
        wordCount,
        textToCodeRatio,
        targetKeyword: this.targetKeyword || null,
        keywordCount,
        keywordDensity,
        inTitle,
        inDescription,
        inH1
      },
      images: {
        total: images.length,
        missingAltCount: imagesWithoutAlt,
        missingDimensionsCount: imagesWithoutDimensions,
        modernFormatCount: modernFormatImagesCount,
        modernFormatRatio: images.length > 0 ? Number(((modernFormatImagesCount / images.length) * 100).toFixed(1)) : 0,
        list: images.slice(0, 15)
      },
      links: {
        internalCount: this.internalLinks.length,
        externalCount: this.externalLinks.length,
        emptyAnchorsCount: emptyAnchors,
        anchors: anchorList.slice(0, 50),
        totalAnchors: anchorList.length
      },
      social: {
        ogTitle,
        ogDescription,
        ogImage,
        ogUrl,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage,
        hasOpenGraph: !!(ogTitle || ogDescription || ogImage),
        hasTwitterCard: !!(twitterCard || twitterTitle)
      },
      structuredData: {
        schemas: detectedSchemas,
        hasJsonLd: detectedSchemas.length > 0,
        details: schemaDetails,
        richResultsEligible: detectedSchemas.filter(s =>
          ['Organization', 'LocalBusiness', 'FAQPage', 'BreadcrumbList', 'Product', 'Article', 'WebSite', 'Recipe'].some(target =>
            String(s).toLowerCase().includes(target.toLowerCase())
          )
        ),
        schemaValidationStatus: detectedSchemas.length > 0 ? 'Syntactically Valid JSON-LD' : 'None Detected'
      },
      local: {
        hasPhone,
        hasLocalSchema,
        hasBusinessNameInContent,
        hasLocationInContent
      },
      performance: {
        responseTimeMs: this.responseTimeMs,
        ttfbMs: ttfb,
        ttfbGrade,
        estimatedFcpMs,
        estimatedLcpMs,
        clsRiskScore,
        clsImagesWithoutDimensions: imagesWithoutDimensions,
        heroImagePreloaded,
        htmlSizeBytes: this.htmlSize,
        htmlSizeKb: Number((this.htmlSize / 1024).toFixed(1)),
        contentEncoding,
        isCompressed,
        scriptCount,
        styleCount,
        iframeCount,
        assetBreakdown: {
          htmlKb: Number((this.htmlSize / 1024).toFixed(1)),
          scripts: scriptCount,
          stylesheets: styleCount,
          images: images.length,
          iframes: iframeCount,
          fonts: $('link[href*="font"], link[rel*="font"]').length
        },
        server: serverHeader,
        protocol: this.pageData.protocol || (this.url.startsWith('https:') ? 'https' : 'http')
      },
      security: {
        score: securityScore,
        grade: securityGrade,
        isHttps,
        hsts: !!hsts,
        hstsHeader: hsts,
        csp: !!csp,
        cspHeader: csp ? csp.substring(0, 100) + '...' : null,
        xFrameOptions: !!xFrameOptions,
        xFrameHeader: xFrameOptions,
        xContentTypeOptions: !!xContentTypeOptions,
        referrerPolicy: referrerPolicy || null,
        permissionsPolicy: !!permissionsPolicy,
        mixedContentCount,
        serverHeader
      },
      techStack,
      searchIntent,
      serpSimulator,
      linkEquity
    };
  }

  /**
   * Fingerprint CMS, Frameworks, Servers, Analytics, and CDN
   */
  _detectTechnologies($, rawText) {
    const generator = $('meta[name="generator"]').attr('content')?.toLowerCase() || '';
    const htmlString = this.html.toLowerCase();
    const headers = this.headers || {};
    const xPoweredBy = (headers['x-powered-by'] || '').toLowerCase();
    const serverHeader = (headers['server'] || this.pageData?.server || '').toLowerCase();
    const setCookie = (headers['set-cookie'] ? JSON.stringify(headers['set-cookie']) : '').toLowerCase();

    const scripts = [];
    $('script[src]').each((_, el) => scripts.push($(el).attr('src')?.toLowerCase() || ''));
    const scriptSrcs = scripts.join(' ');

    const detected = {
      cms: [],
      frameworks: [],
      backend: [],
      server: [],
      analytics: [],
      cdn: [],
      primaryStack: {
        summary: 'Custom Web Architecture',
        frontend: 'HTML5 & Modern CSS',
        backend: 'Modern Web Server',
        cms: 'Custom / Headless',
        server: 'Standard Reverse Proxy',
        confidence: 'High',
        explanation: 'Standard web stack with custom component architecture.'
      }
    };

    // 1. Backend Language & Runtime Fingerprinting
    if (xPoweredBy.includes('php') || setCookie.includes('phpsessid') || generator.includes('wordpress') || scriptSrcs.includes('wp-') || htmlString.includes('.php')) {
      detected.backend.push({ name: 'PHP', badge: 'Backend Language', icon: '🐘', confidence: '98%' });
    }
    if (xPoweredBy.includes('express') || htmlString.includes('__next') || htmlString.includes('/_next/') || htmlString.includes('__nuxt') || htmlString.includes('/_nuxt/') || xPoweredBy.includes('node')) {
      detected.backend.push({ name: 'Node.js', badge: 'JavaScript Runtime', icon: '🟢', confidence: '96%' });
    }
    if (setCookie.includes('csrftoken') || setCookie.includes('sessionid') || serverHeader.includes('gunicorn') || serverHeader.includes('uvicorn') || serverHeader.includes('werkzeug')) {
      detected.backend.push({ name: 'Python (Django / FastAPI)', badge: 'Backend Language', icon: '🐍', confidence: '92%' });
    }
    if (xPoweredBy.includes('asp.net') || headers['x-aspnet-version'] || htmlString.includes('__viewstate') || htmlString.includes('.aspx')) {
      detected.backend.push({ name: 'ASP.NET (.NET)', badge: 'Microsoft Framework', icon: '🔷', confidence: '99%' });
    }
    if (setCookie.includes('laravel_session') || setCookie.includes('xsrf-token') || htmlString.includes('livewire')) {
      detected.backend.push({ name: 'Laravel (PHP)', badge: 'PHP Framework', icon: '🔴', confidence: '95%' });
    }
    if (setCookie.includes('jsessionid') || serverHeader.includes('tomcat') || serverHeader.includes('jetty')) {
      detected.backend.push({ name: 'Java (Spring / Tomcat)', badge: 'JVM Backend', icon: '☕', confidence: '94%' });
    }
    if (detected.backend.length === 0) {
      detected.backend.push({ name: 'Universal Web Engine', badge: 'Server Architecture', icon: '⚡', confidence: 'Standard' });
    }

    // 2. CMS Fingerprinting
    if (generator.includes('wordpress') || scriptSrcs.includes('wp-content') || scriptSrcs.includes('wp-includes')) {
      detected.cms.push({ name: 'WordPress', badge: 'CMS', icon: '📝' });
    }
    if (generator.includes('shopify') || scriptSrcs.includes('cdn.shopify.com')) {
      detected.cms.push({ name: 'Shopify', badge: 'E-commerce', icon: '🛍️' });
    }
    if (generator.includes('webflow') || htmlString.includes('w-layout')) {
      detected.cms.push({ name: 'Webflow', badge: 'No-Code CMS', icon: '🎨' });
    }
    if (generator.includes('wix') || scriptSrcs.includes('wix.com')) {
      detected.cms.push({ name: 'Wix', badge: 'Site Builder', icon: '🌐' });
    }
    if (generator.includes('squarespace') || scriptSrcs.includes('squarespace.com')) {
      detected.cms.push({ name: 'Squarespace', badge: 'Site Builder', icon: '🔳' });
    }
    if (generator.includes('drupal')) {
      detected.cms.push({ name: 'Drupal', badge: 'Enterprise CMS', icon: '💧' });
    }
    if (generator.includes('joomla')) {
      detected.cms.push({ name: 'Joomla', badge: 'CMS', icon: '🧩' });
    }
    if (detected.cms.length === 0) {
      detected.cms.push({ name: 'Custom / Headless Web App', badge: 'Architecture', icon: '🚀' });
    }

    // 3. Frameworks & UI Engines
    if (htmlString.includes('__next') || scriptSrcs.includes('/_next/')) {
      detected.frameworks.push({ name: 'Next.js', badge: 'React SSR Framework', icon: '▲' });
    }
    if (htmlString.includes('data-reactroot') || scriptSrcs.includes('react') || htmlString.includes('react-dom')) {
      detected.frameworks.push({ name: 'React', badge: 'UI Library', icon: '⚛️' });
    }
    if (htmlString.includes('__nuxt') || scriptSrcs.includes('/_nuxt/')) {
      detected.frameworks.push({ name: 'Nuxt.js', badge: 'Vue SSR Framework', icon: '💚' });
    }
    if (htmlString.includes('data-v-') || scriptSrcs.includes('vue')) {
      detected.frameworks.push({ name: 'Vue.js', badge: 'UI Framework', icon: '🟢' });
    }
    if (htmlString.includes('ng-version') || htmlString.includes('ng-app') || scriptSrcs.includes('angular')) {
      detected.frameworks.push({ name: 'Angular', badge: 'SPA Framework', icon: '🅰️' });
    }
    if (htmlString.includes('tailwind') || htmlString.includes('class="flex ') || htmlString.includes('font-bold')) {
      detected.frameworks.push({ name: 'Tailwind CSS', badge: 'CSS Engine', icon: '🌊' });
    }
    if (scriptSrcs.includes('bootstrap') || htmlString.includes('bootstrap.min.css')) {
      detected.frameworks.push({ name: 'Bootstrap', badge: 'CSS Framework', icon: '🅱️' });
    }
    if (scriptSrcs.includes('jquery')) {
      detected.frameworks.push({ name: 'jQuery', badge: 'DOM Library', icon: '💲' });
    }

    // 4. Analytics & Tracking
    if (scriptSrcs.includes('gtag/js') || scriptSrcs.includes('google-analytics') || htmlString.includes('gtag(')) {
      detected.analytics.push({ name: 'Google Analytics 4', badge: 'Tracking' });
    }
    if (scriptSrcs.includes('googletagmanager.com/gtm.js') || htmlString.includes('gtm-')) {
      detected.analytics.push({ name: 'Google Tag Manager', badge: 'Tag Management' });
    }
    if (scriptSrcs.includes('connect.facebook.net') || htmlString.includes('fbq(')) {
      detected.analytics.push({ name: 'Meta Pixel', badge: 'Conversion' });
    }
    if (scriptSrcs.includes('clarity.ms')) {
      detected.analytics.push({ name: 'Microsoft Clarity', badge: 'Heatmaps' });
    }

    // 5. Web Server & CDN
    const cfRay = headers['cf-ray'];
    if (cfRay || serverHeader.includes('cloudflare')) {
      detected.cdn.push({ name: 'Cloudflare Edge', badge: 'CDN & WAF', icon: '☁️' });
    }
    if (serverHeader.includes('nginx')) {
      detected.server.push({ name: 'Nginx', badge: 'Web Server', icon: '🛡️' });
    } else if (serverHeader.includes('apache')) {
      detected.server.push({ name: 'Apache HTTPD', badge: 'Web Server', icon: '🪶' });
    } else if (serverHeader.includes('litespeed')) {
      detected.server.push({ name: 'LiteSpeed', badge: 'Web Server', icon: '⚡' });
    } else if (serverHeader.includes('caddy')) {
      detected.server.push({ name: 'Caddy', badge: 'Web Server', icon: '🔒' });
    } else {
      detected.server.push({ name: serverHeader || 'Modern Reverse Proxy', badge: 'Server', icon: '🖥️' });
    }

    // 6. Synthesize Primary Stack Summary (Easy for Users)
    const hasNext = detected.frameworks.some(f => f.name === 'Next.js');
    const hasReact = detected.frameworks.some(f => f.name === 'React');
    const hasVue = detected.frameworks.some(f => f.name.includes('Vue'));
    const hasWP = detected.cms.some(c => c.name === 'WordPress');
    const hasShopify = detected.cms.some(c => c.name === 'Shopify');
    const hasPHP = detected.backend.some(b => b.name.includes('PHP'));
    const hasNode = detected.backend.some(b => b.name.includes('Node'));
    const serverName = detected.server[0]?.name || 'Web Server';

    if (hasWP || (hasPHP && htmlString.includes('wp-'))) {
      detected.primaryStack = {
        summary: 'WordPress (PHP) on ' + serverName,
        frontend: 'WordPress Themes & Vanilla JS',
        backend: 'PHP 8.x / MySQL',
        cms: 'WordPress CMS',
        server: serverName,
        confidence: '99%',
        explanation: 'Built with WordPress and PHP. High-flexibility CMS; use server-side caching (Redis or WP Rocket) to optimize Core Web Vitals TTFB.'
      };
    } else if (hasNext) {
      detected.primaryStack = {
        summary: 'Next.js (React) + Node.js',
        frontend: 'Next.js (React App Router / SSR)',
        backend: 'Node.js Runtime',
        cms: 'Headless / Custom',
        server: serverName,
        confidence: '98%',
        explanation: 'Built with Next.js (React) and Node.js. Server-Side Rendering (SSR) ensures optimal Googlebot indexability and fast initial HTML response.'
      };
    } else if (hasReact) {
      detected.primaryStack = {
        summary: 'React Single Page App (SPA)',
        frontend: 'React UI Engine',
        backend: hasNode ? 'Node.js' : hasPHP ? 'PHP API' : 'REST API Backend',
        cms: 'Custom Web Application',
        server: serverName,
        confidence: '94%',
        explanation: 'Built with React. Ensure critical metadata and initial headings are rendered server-side or pre-rendered for search engines.'
      };
    } else if (hasVue) {
      detected.primaryStack = {
        summary: 'Vue.js / Nuxt Web Platform',
        frontend: 'Vue.js Reactive Framework',
        backend: hasNode ? 'Node.js (Nuxt Engine)' : 'Custom Backend',
        cms: 'Custom Architecture',
        server: serverName,
        confidence: '94%',
        explanation: 'Built with Vue.js. Clean reactive component architecture with high rendering performance.'
      };
    } else if (hasShopify) {
      detected.primaryStack = {
        summary: 'Shopify E-Commerce Cloud',
        frontend: 'Liquid Templating & Modern JS',
        backend: 'Shopify Cloud Infrastructure',
        cms: 'Shopify Store',
        server: 'Cloudflare / Shopify Edge',
        confidence: '99%',
        explanation: 'Hosted on Shopify e-commerce infrastructure. Clean product schema and fast global CDN distribution.'
      };
    } else if (hasPHP) {
      detected.primaryStack = {
        summary: 'PHP Web Application on ' + serverName,
        frontend: detected.frameworks[0]?.name || 'Semantic HTML5',
        backend: 'PHP Backend',
        cms: 'Custom PHP Architecture',
        server: serverName,
        confidence: '92%',
        explanation: 'Dynamic web application powered by PHP. Ensure Gzip/Brotli compression and opcode caching are enabled.'
      };
    } else if (hasNode) {
      detected.primaryStack = {
        summary: 'Node.js Full-Stack Application',
        frontend: detected.frameworks[0]?.name || 'HTML5 & Modern CSS',
        backend: 'Node.js / Express',
        cms: 'Custom Architecture',
        server: serverName,
        confidence: '90%',
        explanation: 'Full-stack JavaScript environment running on Node.js.'
      };
    }

    return detected;
  }

  /**
   * Classify Search Intent & Reading Grade Level
   */
  _evaluateSearchIntent(text, title, h1s) {
    const combined = `${title || ''} ${(h1s || []).join(' ')} ${text.substring(0, 1000)}`.toLowerCase();

    // Intent Vocabulary Patterns
    const commercialKeywords = ['buy', 'price', 'pricing', 'shop', 'store', 'order', 'cart', 'sale', 'discount', 'cheap', 'deals', 'cost', 'pkr', 'usd', 'quote', 'hire', 'service'];
    const informationalKeywords = ['how', 'guide', 'tutorial', 'what', 'why', 'tips', 'learn', 'benefits', 'steps', 'explained', 'review', 'definition', 'overview'];
    const navigationalKeywords = ['login', 'signin', 'portal', 'account', 'dashboard', 'contact', 'support', 'about us', 'careers'];

    let commercialHits = commercialKeywords.filter(k => combined.includes(k)).length;
    let infoHits = informationalKeywords.filter(k => combined.includes(k)).length;
    let navHits = navigationalKeywords.filter(k => combined.includes(k)).length;

    let primaryIntent = 'Informational';
    let intentBadge = 'ℹ️ Informational';
    let intentColor = 'sky';

    if (commercialHits >= infoHits && commercialHits >= navHits && commercialHits > 0) {
      primaryIntent = 'Commercial / Transactional';
      intentBadge = '🛒 Commercial & Transactional';
      intentColor = 'emerald';
    } else if (navHits > infoHits && navHits > commercialHits) {
      primaryIntent = 'Navigational';
      intentBadge = '🧭 Navigational';
      intentColor = 'indigo';
    }

    // Readability Estimate
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 15;

    let readingGrade = 'Standard Public (Easy to read)';
    let readingScore = 80;
    if (avgWordsPerSentence > 22) {
      readingGrade = 'College Level (Complex sentences)';
      readingScore = 55;
    } else if (avgWordsPerSentence > 16) {
      readingGrade = 'High School Level (Moderate)';
      readingScore = 72;
    }

    // Content Depth Classification
    const wordCount = words.length;
    let depthCategory = 'Standard Content';
    if (wordCount < 350) depthCategory = 'Thin Content (Ranking Vulnerability)';
    else if (wordCount > 1800) depthCategory = 'In-Depth Authority Pillar (Exceptional Depth)';
    else if (wordCount > 800) depthCategory = 'Comprehensive Topic Coverage';

    return {
      primaryIntent,
      intentBadge,
      intentColor,
      readingGrade,
      readingScore,
      avgWordsPerSentence: Math.round(avgWordsPerSentence),
      depthCategory,
      wordCount
    };
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = PageAnalyzer;
