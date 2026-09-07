const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const { validateAuditUrl } = require('../../utils/ssrfGuard');
const logger = require('../../utils/logger');

/**
 * Queue-Based Website Crawler with SSRF Protection & Link Discovery
 */
class CrawlerService {
  constructor(options = {}) {
    this.maxPages = Math.min(Math.max(parseInt(options.maxPages, 10) || 20, 1), 100);
    this.timeout = options.timeout || 12000;
    this.userAgent = options.userAgent || 'AI-SEO-Auditor-Bot/1.0 (+https://aiseoauditor.local)';
    this.maxRedirects = 5;
    this.maxContentSizeBytes = 5 * 1024 * 1024; // 5 MB max per page
  }

  /**
   * Normalize URLs for deduplication and crawling
   */
  normalizeUrl(rawUrl, baseUrl) {
    try {
      const parsed = new URL(rawUrl, baseUrl);
      // Only http and https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }
      // Strip fragments / hash anchors
      parsed.hash = '';
      // Lowercase hostname
      parsed.hostname = parsed.hostname.toLowerCase();
      // Remove common tracking query params
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      trackingParams.forEach(param => parsed.searchParams.delete(param));
      
      // Remove trailing slash from pathname unless it's just root '/'
      if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }
      return parsed.toString();
    } catch (e) {
      return null;
    }
  }

  /**
   * Check if a URL belongs to the same domain / subpath
   */
  isSameDomain(urlA, urlB) {
    try {
      const hostA = new URL(urlA).hostname.replace(/^www\./, '');
      const hostB = new URL(urlB).hostname.replace(/^www\./, '');
      return hostA === hostB;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if URL points to binary / asset files that should not be parsed as HTML
   */
  isIgnoredResource(urlStr) {
    try {
      const pathname = new URL(urlStr).pathname.toLowerCase();
      const ignoredExtensions = [
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico',
        '.pdf', '.zip', '.tar', '.gz', '.mp3', '.mp4', '.avi', '.mov',
        '.css', '.js', '.json', '.xml', '.woff', '.woff2', '.ttf', '.eot'
      ];
      return ignoredExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  }

  /**
   * Execute full queue-based crawl starting from startUrl
   */
  async crawl(startUrl, progressCallback = null) {
    const startObj = new URL(startUrl);
    const originDomain = startObj.hostname;
    
    const queue = [startUrl];
    const visited = new Set();
    const pages = [];
    const discoveredLinks = new Set([startUrl]);

    logger.info(`Starting crawl for ${startUrl} (Max pages: ${this.maxPages})`);

    while (queue.length > 0 && pages.length < this.maxPages) {
      const currentUrl = queue.shift();
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      if (progressCallback) {
        progressCallback({
          stage: 'crawling',
          currentUrl,
          crawledCount: pages.length + 1,
          maxPages: this.maxPages,
          message: `Crawling page ${pages.length + 1}/${this.maxPages}: ${currentUrl}`
        });
      }

      // Re-validate against SSRF on each URL before fetching
      try {
        await validateAuditUrl(currentUrl);
      } catch (err) {
        logger.warn(`SSRF Guard blocked URL: ${currentUrl} (${err.message})`);
        continue;
      }

      const startTime = Date.now();
      let pageResult = {
        url: currentUrl,
        statusCode: 0,
        responseTimeMs: 0,
        htmlSize: 0,
        headers: {},
        html: '',
        internalLinks: [],
        externalLinks: [],
        brokenLinks: [],
        error: null
      };

      try {
        const response = await axios.get(currentUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          timeout: this.timeout,
          maxRedirects: this.maxRedirects,
          maxContentLength: this.maxContentSizeBytes,
          validateStatus: () => true // Allow handling 4xx/5xx safely
        });

        const elapsed = Date.now() - startTime;
        pageResult.statusCode = response.status;
        pageResult.responseTimeMs = elapsed;
        pageResult.headers = response.headers || {};
        
        const contentType = response.headers['content-type'] || '';
        if (typeof response.data === 'string' && contentType.includes('text/html')) {
          pageResult.html = response.data;
          pageResult.htmlSize = Buffer.byteLength(response.data, 'utf8');

          // Parse links with Cheerio
          const $ = cheerio.load(response.data);
          const pageInternal = new Set();
          const pageExternal = new Set();
          const linksDetail = [];

          $('a[href]').each((_, el) => {
            const rawHref = $(el).attr('href');
            if (!rawHref) return;
            const normalized = this.normalizeUrl(rawHref, currentUrl);
            if (!normalized) return;

            const text = $(el).text().trim();
            const rel = $(el).attr('rel') || '';
            const isNofollow = rel.toLowerCase().includes('nofollow');
            const hasImg = $(el).find('img').length > 0;
            const isInternal = this.isSameDomain(normalized, currentUrl);

            linksDetail.push({
              href: normalized,
              text: text || (hasImg ? '[Image Link]' : ''),
              isInternal,
              isNofollow,
              isEmpty: !text && !hasImg
            });

            if (isInternal) {
              pageInternal.add(normalized);
              if (!visited.has(normalized) && !this.isIgnoredResource(normalized) && !discoveredLinks.has(normalized)) {
                discoveredLinks.add(normalized);
                if (queue.length + pages.length < this.maxPages * 2) {
                  queue.push(normalized);
                }
              }
            } else {
              pageExternal.add(normalized);
            }
          });

          pageResult.internalLinks = Array.from(pageInternal);
          pageResult.externalLinks = Array.from(pageExternal);
          pageResult.linksDetail = linksDetail;
        } else {
          pageResult.htmlSize = typeof response.data === 'string' ? Buffer.byteLength(response.data, 'utf8') : 0;
        }

      } catch (reqErr) {
        pageResult.responseTimeMs = Date.now() - startTime;
        pageResult.error = reqErr.message;
        if (reqErr.response) {
          pageResult.statusCode = reqErr.response.status;
        } else if (reqErr.code === 'ECONNABORTED') {
          pageResult.statusCode = 408; // Request Timeout
        } else {
          pageResult.statusCode = 502; // Bad Gateway / Unreachable
        }
        logger.warn(`Error crawling ${currentUrl}: ${reqErr.message}`);
      }

      pages.push(pageResult);
    }

    logger.info(`Crawl complete for ${startUrl}. Crawled ${pages.length} pages.`);

    return {
      domain: originDomain,
      startUrl,
      totalCrawled: pages.length,
      pages
    };
  }
}

module.exports = CrawlerService;
