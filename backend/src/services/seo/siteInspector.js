const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const { validateAuditUrl } = require('../../utils/ssrfGuard');
const logger = require('../../utils/logger');

/**
 * Live Site Technical Inspector: Robots.txt & Sitemap.xml
 */
class SiteInspector {
  static async inspect(websiteUrl) {
    const validatedUrl = await validateAuditUrl(websiteUrl);
    const parsed = new URL(validatedUrl);
    const origin = `${parsed.protocol}//${parsed.host}`;

    const robotsUrl = `${origin}/robots.txt`;
    const defaultSitemapUrl = `${origin}/sitemap.xml`;

    const client = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'AI-SEO-Auditor-Bot/1.0 (+https://aiseoauditor.local)',
        'Accept': 'text/plain,application/xml,text/xml,*/*'
      },
      validateStatus: () => true
    });

    // 1. Inspect robots.txt
    let robotsResult = {
      url: robotsUrl,
      exists: false,
      statusCode: 0,
      responseTimeMs: 0,
      content: '',
      userAgents: [],
      disallowedPaths: [],
      allowedPaths: [],
      sitemapsDeclared: [],
      isBlockingAll: false,
      issues: []
    };

    const robotsStart = Date.now();
    try {
      const robotsRes = await client.get(robotsUrl);
      robotsResult.statusCode = robotsRes.status;
      robotsResult.responseTimeMs = Date.now() - robotsStart;

      if (robotsRes.status >= 200 && robotsRes.status < 300 && typeof robotsRes.data === 'string') {
        robotsResult.exists = true;
        robotsResult.content = robotsRes.data.substring(0, 5000); // sample first 5KB

        const lines = robotsRes.data.split('\n');
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('#') || !trimmed) return;

          const [key, ...vals] = trimmed.split(':');
          const value = vals.join(':').trim();
          const cleanKey = key.trim().toLowerCase();

          if (cleanKey === 'user-agent') {
            robotsResult.userAgents.push(value);
          } else if (cleanKey === 'disallow') {
            if (value) robotsResult.disallowedPaths.push(value);
            if (value === '/') robotsResult.isBlockingAll = true;
          } else if (cleanKey === 'allow') {
            if (value) robotsResult.allowedPaths.push(value);
          } else if (cleanKey === 'sitemap') {
            if (value) robotsResult.sitemapsDeclared.push(value);
          }
        });

        if (robotsResult.isBlockingAll) {
          robotsResult.issues.push('CRITICAL: "Disallow: /" blocks search engines from crawling the entire site.');
        }
        if (robotsResult.sitemapsDeclared.length === 0) {
          robotsResult.issues.push('NOTE: No Sitemap declared in robots.txt. Add "Sitemap: [URL]" to speed up crawling.');
        }
      } else {
        robotsResult.issues.push(`robots.txt returned HTTP status ${robotsRes.status}. Search engines assume all paths are allowed.`);
      }
    } catch (err) {
      robotsResult.statusCode = 502;
      robotsResult.issues.push(`Failed to fetch robots.txt: ${err.message}`);
    }

    // 2. Inspect Sitemap.xml
    const targetSitemap = robotsResult.sitemapsDeclared.length > 0
      ? robotsResult.sitemapsDeclared[0]
      : defaultSitemapUrl;

    let sitemapResult = {
      url: targetSitemap,
      exists: false,
      statusCode: 0,
      responseTimeMs: 0,
      urlCount: 0,
      isIndexSitemap: false,
      subSitemapsCount: 0,
      sampleUrls: [],
      content: '',
      issues: []
    };

    const sitemapStart = Date.now();
    try {
      const sitemapRes = await client.get(targetSitemap);
      sitemapResult.statusCode = sitemapRes.status;
      sitemapResult.responseTimeMs = Date.now() - sitemapStart;

      if (sitemapRes.status >= 200 && sitemapRes.status < 300 && typeof sitemapRes.data === 'string') {
        sitemapResult.exists = true;
        sitemapResult.content = sitemapRes.data.substring(0, 3000);

        const $ = cheerio.load(sitemapRes.data, { xmlMode: true });
        const locTags = $('loc');

        if ($('sitemapindex').length > 0) {
          sitemapResult.isIndexSitemap = true;
          sitemapResult.subSitemapsCount = $('sitemap').length;
        }

        sitemapResult.urlCount = locTags.length;

        const sample = [];
        locTags.slice(0, 10).each((_, el) => {
          sample.push($(el).text().trim());
        });
        sitemapResult.sampleUrls = sample;

        if (sitemapResult.urlCount === 0) {
          sitemapResult.issues.push('Sitemap was found but contains 0 <loc> URL records.');
        }
      } else {
        sitemapResult.issues.push(`Sitemap at ${targetSitemap} returned HTTP status ${sitemapRes.status}.`);
      }
    } catch (err) {
      sitemapResult.statusCode = 502;
      sitemapResult.issues.push(`Failed to fetch sitemap: ${err.message}`);
    }

    return {
      domain: parsed.host,
      origin,
      inspectedAt: new Date().toISOString(),
      robots: robotsResult,
      sitemap: sitemapResult
    };
  }
}

module.exports = SiteInspector;
