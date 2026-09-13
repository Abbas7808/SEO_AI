const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const { validateAuditUrl } = require('../../utils/ssrfGuard');
const logger = require('../../utils/logger');

/* ─────────────────────────────────────────────
   In-Memory LRU Cache (domain → crawl result, 5-min TTL)
───────────────────────────────────────────── */
const CACHE_TTL_MS = 5 * 60 * 1000;
const _cache = new Map();

function getCached(startUrl) {
  const entry = _cache.get(startUrl);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  _cache.delete(startUrl);
  return null;
}

function setCache(startUrl, data) {
  _cache.set(startUrl, { data, ts: Date.now() });
  if (_cache.size > 50) {
    const firstKey = _cache.keys().next().value;
    _cache.delete(firstKey);
  }
}

/* ─────────────────────────────────────────────
   Zero-dependency concurrency limiter
   Runs async task fns with at most `concurrency` in flight.
───────────────────────────────────────────── */
async function pMap(tasks, concurrency = 5) {
  const results = new Array(tasks.length);
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

/* ─────────────────────────────────────────────
   Fetch with exponential back-off (up to 2 retries)
───────────────────────────────────────────── */
async function fetchWithRetry(url, options, maxRetries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await axios.get(url, options);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 300 * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

/**
 * High-Performance Parallel Website Crawler
 * – Concurrent page fetching (up to CONCURRENCY pages at once)
 * – Exponential-backoff retries per page (up to 2 retries)
 * – robots.txt awareness (best-effort, non-blocking)
 * – In-memory LRU cache (5-min TTL)
 * – Real-time progress via progressCallback
 */
class CrawlerService {
  constructor(options = {}) {
    this.maxPages            = Math.min(Math.max(parseInt(options.maxPages, 10) || 20, 1), 100);
    this.timeout             = options.timeout || 10000;
    this.concurrency         = Math.min(options.concurrency || 5, 8);
    this.userAgent           = options.userAgent || 'AI-SEO-Auditor-Bot/2.0 (+https://aiseoauditor.local)';
    this.maxRedirects        = 5;
    this.maxContentSizeBytes = 5 * 1024 * 1024;
    this.bypassCache         = options.bypassCache || false;
  }

  /* ── URL helpers ── */

  normalizeUrl(rawUrl, baseUrl) {
    try {
      const parsed = new URL(rawUrl, baseUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) return null;
      parsed.hash = '';
      parsed.hostname = parsed.hostname.toLowerCase();
      ['utm_source','utm_medium','utm_campaign','utm_term','utm_content',
       'fbclid','gclid','ref','source','mc_cid','mc_eid']
        .forEach(p => parsed.searchParams.delete(p));
      if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }
      return parsed.toString();
    } catch { return null; }
  }

  isSameDomain(urlA, urlB) {
    try {
      return new URL(urlA).hostname.replace(/^www\./, '') ===
             new URL(urlB).hostname.replace(/^www\./, '');
    } catch { return false; }
  }

  isIgnoredResource(urlStr) {
    try {
      const p = new URL(urlStr).pathname.toLowerCase();
      return /\.(jpg|jpeg|png|gif|webp|svg|ico|pdf|zip|tar|gz|mp3|mp4|avi|mov|css|js|json|xml|woff2?|ttf|eot|otf)$/.test(p);
    } catch { return false; }
  }

  /* ── robots.txt (best-effort) ── */

  async fetchRobotsTxt(baseUrl) {
    try {
      const resp = await axios.get(new URL('/robots.txt', baseUrl).toString(), {
        timeout: 4000,
        headers: { 'User-Agent': this.userAgent },
        validateStatus: s => s < 500
      });
      return typeof resp.data === 'string' ? resp.data : '';
    } catch { return ''; }
  }

  parseDisallowed(robotsTxt) {
    const disallowed = new Set();
    let inUserAgent = false;
    for (const rawLine of robotsTxt.split('\n')) {
      const line = rawLine.trim();
      if (line.toLowerCase().startsWith('user-agent:')) {
        const agent = line.slice('user-agent:'.length).trim();
        inUserAgent = agent === '*' || agent.toLowerCase().includes('bot');
      } else if (inUserAgent && line.toLowerCase().startsWith('disallow:')) {
        const p = line.slice('disallow:'.length).trim();
        if (p) disallowed.add(p);
      }
    }
    return disallowed;
  }

  isDisallowed(urlStr, disallowedPaths) {
    try {
      const pathname = new URL(urlStr).pathname;
      for (const p of disallowedPaths) {
        if (pathname.startsWith(p)) return true;
      }
    } catch {}
    return false;
  }

  /* ── Single-page fetch ── */

  async fetchPage(currentUrl) {
    const startTime = Date.now();
    const result = {
      url: currentUrl, statusCode: 0, responseTimeMs: 0,
      htmlSize: 0, headers: {}, html: '',
      internalLinks: [], externalLinks: [], linksDetail: [],
      resourceCounts: { scripts:0, inlineScripts:0, stylesheets:0, images:0, iframes:0, fonts:0 },
      error: null
    };

    try {
      const response = await fetchWithRetry(currentUrl, {
        headers: {
          'User-Agent':      this.userAgent,
          'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br'
        },
        timeout: this.timeout, maxRedirects: this.maxRedirects,
        maxContentLength: this.maxContentSizeBytes, validateStatus: () => true
      });

      const elapsed = Date.now() - startTime;
      Object.assign(result, {
        statusCode:      response.status,
        responseTimeMs:  elapsed,
        ttfbMs:          elapsed,
        headers:         response.headers || {},
        protocol:        currentUrl.startsWith('https:') ? 'https' : 'http',
        server:          response.headers['server'] || null,
        contentEncoding: response.headers['content-encoding'] || null
      });

      const contentType = response.headers['content-type'] || '';
      if (typeof response.data === 'string' && contentType.includes('text/html')) {
        result.html     = response.data;
        result.htmlSize = Buffer.byteLength(response.data, 'utf8');

        const $ = cheerio.load(response.data);
        result.resourceCounts = {
          scripts:       $('script[src]').length,
          inlineScripts: $('script:not([src])').length,
          stylesheets:   $('link[rel="stylesheet"]').length,
          images:        $('img').length,
          iframes:       $('iframe').length,
          fonts:         $('link[rel*="font"], link[href*="fonts."]').length
        };

        const pageInternal = new Set();
        const pageExternal = new Set();
        const linksDetail  = [];

        $('a[href]').each((_, el) => {
          const rawHref = $(el).attr('href');
          if (!rawHref) return;
          const normalized = this.normalizeUrl(rawHref, currentUrl);
          if (!normalized) return;
          const text       = $(el).text().trim();
          const rel        = $(el).attr('rel') || '';
          const isNofollow = rel.toLowerCase().includes('nofollow');
          const hasImg     = $(el).find('img').length > 0;
          const isInternal = this.isSameDomain(normalized, currentUrl);
          linksDetail.push({ href: normalized, text: text || (hasImg ? '[Image Link]' : ''), isInternal, isNofollow, isEmpty: !text && !hasImg });
          if (isInternal) pageInternal.add(normalized);
          else            pageExternal.add(normalized);
        });

        result.internalLinks = Array.from(pageInternal);
        result.externalLinks = Array.from(pageExternal);
        result.linksDetail   = linksDetail;
      } else {
        result.htmlSize = typeof response.data === 'string' ? Buffer.byteLength(response.data, 'utf8') : 0;
      }
    } catch (err) {
      result.responseTimeMs = Date.now() - startTime;
      result.error          = err.message;
      result.statusCode     = err.response?.status || (err.code === 'ECONNABORTED' ? 408 : 502);
      logger.warn(`[Crawler] Fetch error ${currentUrl}: ${err.message}`);
    }
    return result;
  }

  /* ── Main crawl: BFS + parallel batches ── */

  async crawl(startUrl, progressCallback = null, options = {}) {
    // Cache check
    if (!this.bypassCache && !options.bypassCache) {
      const cached = getCached(startUrl);
      if (cached) {
        logger.info(`[Crawler] Cache hit for ${startUrl}`);
        if (progressCallback) progressCallback({ stage: 'cached', message: '⚡ Returning cached result' });
        return cached;
      }
    }

    const originDomain    = new URL(startUrl).hostname;
    const visited         = new Set();
    const discoveredLinks = new Set([startUrl]);
    const pages           = [];
    const queue           = [startUrl];
    let batchNum          = 0;

    logger.info(`[Crawler] Starting parallel crawl: ${startUrl} (max=${this.maxPages}, concurrency=${this.concurrency})`);

    // Fetch robots.txt concurrently with the first crawl batch
    let disallowedPaths = new Set();
    const robotsPromise = this.fetchRobotsTxt(startUrl).then(txt => {
      disallowedPaths = this.parseDisallowed(txt);
    }).catch(() => {});

    // Seed the first batch; wait for robots.txt before processing
    await robotsPromise;

    while (queue.length > 0 && pages.length < this.maxPages) {
      // Dequeue up to `concurrency` un-visited URLs
      const batch = [];
      while (batch.length < this.concurrency && queue.length > 0 && pages.length + batch.length < this.maxPages) {
        const url = queue.shift();
        if (!url || visited.has(url) || this.isDisallowed(url, disallowedPaths)) continue;
        visited.add(url);
        batch.push(url);
      }
      if (batch.length === 0) continue;
      batchNum++;

      if (progressCallback) {
        progressCallback({
          stage: 'crawling', batchNum, batchSize: batch.length,
          crawledCount: pages.length, maxPages: this.maxPages,
          currentUrls: batch,
          message: `🕷️ Batch ${batchNum}: fetching ${batch.length} page(s) in parallel (${pages.length}/${this.maxPages} done)`
        });
      }

      // SSRF-validate + fetch all pages in parallel
      const tasks = batch.map(url => async () => {
        try { await validateAuditUrl(url); } catch { logger.warn(`[Crawler] SSRF blocked: ${url}`); return null; }
        return this.fetchPage(url);
      });

      const batchResults = await pMap(tasks, this.concurrency);

      // Aggregate results & discover new links
      for (const pageResult of batchResults) {
        if (!pageResult) continue;
        pages.push(pageResult);
        for (const link of pageResult.internalLinks) {
          if (!visited.has(link) && !discoveredLinks.has(link) && !this.isIgnoredResource(link)) {
            discoveredLinks.add(link);
            if (pages.length + queue.length < this.maxPages * 3) queue.push(link);
          }
        }
      }

      if (progressCallback) {
        progressCallback({
          stage: 'batch_complete', crawledCount: pages.length, maxPages: this.maxPages, queueLength: queue.length,
          message: `✅ Batch ${batchNum} done — ${pages.length} pages crawled, ${queue.length} queued`
        });
      }
    }

    logger.info(`[Crawler] Done: ${pages.length} pages crawled in ${batchNum} batches.`);

    const result = { domain: originDomain, startUrl, totalCrawled: pages.length, batchCount: batchNum, pages };
    setCache(startUrl, result);
    return result;
  }
}

module.exports = CrawlerService;
