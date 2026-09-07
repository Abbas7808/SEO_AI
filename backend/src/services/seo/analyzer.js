const cheerio = require('cheerio');
const { URL } = require('url');

/**
 * Robust SEO Page Analyzer
 * Analyzes HTML content, metadata, headers, structured data, and performance indicators.
 */
class PageAnalyzer {
  constructor(pageData, context = {}) {
    this.url = pageData.url;
    this.statusCode = pageData.statusCode || 200;
    this.responseTimeMs = pageData.responseTimeMs || 0;
    this.htmlSize = pageData.htmlSize || 0;
    this.headers = pageData.headers || {};
    this.html = pageData.html || '';
    this.internalLinks = pageData.internalLinks || [];
    this.externalLinks = pageData.externalLinks || [];

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
    // Remove scripts, styles, noscript, svg, comments
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

    // 5. Images
    const images = [];
    let imagesWithoutAlt = 0;
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      const alt = $(el).attr('alt');
      const hasAlt = typeof alt === 'string' && alt.trim().length > 0;
      if (!hasAlt) {
        imagesWithoutAlt++;
      }
      images.push({
        src: src.substring(0, 200),
        alt: alt || null,
        hasAlt
      });
    });

    // 6. Links & Anchor text
    let emptyAnchors = 0;
    const anchorList = [];
    const internalHost = parsedUrl.hostname.replace(/^www\./, '');

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const text = $(el).text().trim();
      const imgInLink = $(el).find('img').length > 0;
      const rel = $(el).attr('rel') || '';
      const isNofollow = rel.toLowerCase().includes('nofollow');

      let isInternal = true;
      try {
        const targetUrl = new URL(href, this.url);
        isInternal = targetUrl.hostname.replace(/^www\./, '') === internalHost;
      } catch (e) {
        isInternal = !href.startsWith('http://') && !href.startsWith('https://');
      }

      const isEmpty = !text && !imgInLink;
      if (isEmpty) {
        emptyAnchors++;
      }

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
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const rawJson = $(el).html();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item['@type']) detectedSchemas.push(item['@type']);
            });
          } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
            parsed['@graph'].forEach(item => {
              if (item['@type']) detectedSchemas.push(item['@type']);
            });
          } else if (parsed['@type']) {
            detectedSchemas.push(parsed['@type']);
          }
        }
      } catch (e) {
        // Invalid JSON-LD
      }
    });

    // 9. Local SEO signals
    const telLinks = $('a[href^="tel:"]').length;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const textHasPhone = phoneRegex.test(rawText);
    const hasPhone = telLinks > 0 || textHasPhone;

    let hasBusinessNameInContent = false;
    if (this.businessName) {
      hasBusinessNameInContent = rawText.toLowerCase().includes(this.businessName);
    }
    let hasLocationInContent = false;
    if (this.businessLocation) {
      hasLocationInContent = rawText.toLowerCase().includes(this.businessLocation);
    }

    const hasLocalSchema = detectedSchemas.some(type => {
      const t = String(type).toLowerCase();
      return t.includes('localbusiness') || t.includes('store') || t.includes('restaurant') || t.includes('organization');
    });

    // 10. Performance Indicators
    const scriptCount = $('script[src]').length;
    const styleCount = $('link[rel="stylesheet"]').length;

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
        list: images.slice(0, 15) // sample up to 15
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
        hasJsonLd: detectedSchemas.length > 0
      },
      local: {
        hasPhone,
        hasLocalSchema,
        hasBusinessNameInContent,
        hasLocationInContent
      },
      performance: {
        responseTimeMs: this.responseTimeMs,
        htmlSizeBytes: this.htmlSize,
        scriptCount,
        styleCount
      }
    };
  }

  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = PageAnalyzer;
