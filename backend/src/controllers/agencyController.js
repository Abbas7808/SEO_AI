const clientModel = require('../models/clientModel');
const keywordModel = require('../models/keywordModel');
const { proposalModel, invoiceModel, portalModel, scheduledAuditModel } = require('../models/agencyModels');
const auditModel = require('../models/auditModel');
const issueModel = require('../models/issueModel');
const crypto = require('crypto');
const logger = require('../utils/logger');
const axios = require('axios');
const cheerio = require('cheerio');

const agencyController = {

  // ═══════════════════════════════════════════
  //  MODULE 1: CLIENT CRM
  // ═══════════════════════════════════════════

  async createClient(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const { name, email, phone, company, websiteUrl, notes, avatarColor, status, monthlyFee, currency } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Client name is required.' });
      const id = await clientModel.create({ userId, name, email, phone, company, websiteUrl, notes, avatarColor, status, monthlyFee, currency });
      const client = await clientModel.findById(id);
      res.status(201).json({ success: true, data: { client } });
    } catch (error) { next(error); }
  },

  async getClients(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const clients = await clientModel.listByUser(userId);
      const stats = await clientModel.getStats(userId);
      res.json({ success: true, data: { clients, stats } });
    } catch (error) { next(error); }
  },

  async getClientById(req, res, next) {
    try {
      const client = await clientModel.findById(req.params.id);
      if (!client) return res.status(404).json({ success: false, message: 'Client not found.' });
      const projects = await clientModel.getProjectsByClient(client.id);
      const audits = await clientModel.getAuditsByClient(client.id);
      res.json({ success: true, data: { client, projects, audits } });
    } catch (error) { next(error); }
  },

  async updateClient(req, res, next) {
    try {
      await clientModel.update(req.params.id, req.body);
      const client = await clientModel.findById(req.params.id);
      res.json({ success: true, data: { client } });
    } catch (error) { next(error); }
  },

  async deleteClient(req, res, next) {
    try {
      await clientModel.delete(req.params.id);
      res.json({ success: true, message: 'Client deleted.' });
    } catch (error) { next(error); }
  },

  // Projects
  async createProject(req, res, next) {
    try {
      const { name, websiteUrl, targetKeywords, notes } = req.body;
      const clientId = req.params.id;
      if (!name || !websiteUrl) return res.status(400).json({ success: false, message: 'Project name and website URL are required.' });
      const id = await clientModel.createProject({ clientId, name, websiteUrl, targetKeywords, notes });
      const project = await clientModel.getProjectById(id);
      res.status(201).json({ success: true, data: { project } });
    } catch (error) { next(error); }
  },

  async getProjects(req, res, next) {
    try {
      const projects = await clientModel.getProjectsByClient(req.params.id);
      res.json({ success: true, data: { projects } });
    } catch (error) { next(error); }
  },

  // ═══════════════════════════════════════════
  //  MODULE 3: KEYWORD RANK TRACKER
  // ═══════════════════════════════════════════

  async addKeyword(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const { projectId, keyword, targetUrl, country, device } = req.body;
      if (!keyword) return res.status(400).json({ success: false, message: 'Keyword is required.' });
      const id = await keywordModel.addKeyword({ projectId, userId, keyword, targetUrl, country, device });
      // Do an immediate first check
      const position = await agencyController._checkKeywordRank(keyword, targetUrl, country);
      if (position !== null) {
        await keywordModel.addRanking({ trackedKeywordId: id, position, searchEngine: 'google' });
      }
      const kw = await keywordModel.findById(id);
      res.status(201).json({ success: true, data: { keyword: kw, initialPosition: position } });
    } catch (error) { next(error); }
  },

  async getKeywords(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const keywords = await keywordModel.getAll(userId);
      res.json({ success: true, data: { keywords } });
    } catch (error) { next(error); }
  },

  async getKeywordHistory(req, res, next) {
    try {
      const history = await keywordModel.getRankingHistory(req.params.id, parseInt(req.query.limit) || 30);
      const best = await keywordModel.getBestRanking(req.params.id);
      res.json({ success: true, data: { history, bestPosition: best } });
    } catch (error) { next(error); }
  },

  async removeKeyword(req, res, next) {
    try {
      await keywordModel.remove(req.params.id);
      res.json({ success: true, message: 'Keyword removed.' });
    } catch (error) { next(error); }
  },

  async trackAllKeywords(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const keywords = await keywordModel.getAll(userId);
      const results = [];
      for (const kw of keywords) {
        try {
          const position = await agencyController._checkKeywordRank(kw.keyword, kw.target_url, kw.country);
          if (position !== null) {
            const prev = kw.latest_position || null;
            await keywordModel.addRanking({ trackedKeywordId: kw.id, position, previousPosition: prev, searchEngine: 'google' });
            results.push({ id: kw.id, keyword: kw.keyword, position, change: prev ? prev - position : null });
          }
        } catch (e) {
          results.push({ id: kw.id, keyword: kw.keyword, error: e.message });
        }
      }
      res.json({ success: true, data: { results, tracked: results.length } });
    } catch (error) { next(error); }
  },

  // Internal: check keyword rank via Google search scraping
  async _checkKeywordRank(keyword, targetUrl, country = 'pk') {
    try {
      const query = encodeURIComponent(keyword);
      const gl = (country || 'pk').toLowerCase();
      const searchUrl = `https://www.google.com/search?q=${query}&gl=${gl}&num=100&hl=en`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml'
        },
        timeout: 12000,
        validateStatus: () => true
      });

      if (typeof response.data !== 'string') return null;
      const $ = cheerio.load(response.data);
      const results = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.startsWith('/url?q=')) {
          const url = decodeURIComponent(href.replace('/url?q=', '').split('&')[0]);
          if (url.startsWith('http')) results.push(url);
        }
      });

      if (!targetUrl || results.length === 0) {
        return results.length > 0 ? 100 : null;
      }

      const targetDomain = new URL(targetUrl).hostname.replace(/^www\./, '');
      for (let i = 0; i < results.length; i++) {
        try {
          const resDomain = new URL(results[i]).hostname.replace(/^www\./, '');
          if (resDomain === targetDomain) return i + 1;
        } catch {}
      }
      return 100; // Not found in top 100
    } catch (err) {
      logger.warn(`Rank check error for "${keyword}": ${err.message}`);
      return null;
    }
  },

  // ═══════════════════════════════════════════
  //  MODULE 4: SCHEDULED AUDITS
  // ═══════════════════════════════════════════

  async createSchedule(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const { projectId, clientId, websiteUrl, frequency, maxPages, targetKeyword } = req.body;
      if (!websiteUrl) return res.status(400).json({ success: false, message: 'Website URL is required.' });
      const id = await scheduledAuditModel.create({ projectId, clientId, userId, websiteUrl, frequency, maxPages, targetKeyword });
      const schedule = await scheduledAuditModel.findById(id);
      res.status(201).json({ success: true, data: { schedule } });
    } catch (error) { next(error); }
  },

  async getSchedules(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const schedules = await scheduledAuditModel.listByUser(userId);
      res.json({ success: true, data: { schedules } });
    } catch (error) { next(error); }
  },

  async toggleSchedule(req, res, next) {
    try {
      const { isActive } = req.body;
      await scheduledAuditModel.toggle(req.params.id, isActive);
      res.json({ success: true, message: isActive ? 'Schedule activated.' : 'Schedule paused.' });
    } catch (error) { next(error); }
  },

  async deleteSchedule(req, res, next) {
    try {
      await scheduledAuditModel.delete(req.params.id);
      res.json({ success: true, message: 'Schedule deleted.' });
    } catch (error) { next(error); }
  },

  // ═══════════════════════════════════════════
  //  MODULE 5: SCORE HISTORY & TRENDS
  // ═══════════════════════════════════════════

  async getScoreHistory(req, res, next) {
    try {
      const { websiteUrl, clientId, projectId } = req.query;
      let whereClause = "status = 'completed'";
      const params = [];
      if (clientId) { whereClause += ' AND client_id = ?'; params.push(clientId); }
      else if (projectId) { whereClause += ' AND project_id = ?'; params.push(projectId); }
      else if (websiteUrl) { whereClause += ' AND website_url LIKE ?'; params.push(`%${websiteUrl}%`); }

      params.push(30); // limit
      const rows = await require('../config/db').query(
        `SELECT id, website_url, seo_score, technical_score, onpage_score, content_score, 
                performance_score, structured_data_score, social_score, local_score,
                mobile_score, desktop_score, pages_crawled, created_at
         FROM audits WHERE ${whereClause} ORDER BY created_at ASC LIMIT ?`,
        params
      );
      res.json({ success: true, data: { history: rows } });
    } catch (error) { next(error); }
  },

  async getIssuesTrend(req, res, next) {
    try {
      const { websiteUrl, clientId } = req.query;
      let whereClause = "a.status = 'completed'";
      const params = [];
      if (clientId) { whereClause += ' AND a.client_id = ?'; params.push(clientId); }
      else if (websiteUrl) { whereClause += ' AND a.website_url LIKE ?'; params.push(`%${websiteUrl}%`); }

      params.push(20);
      const rows = await require('../config/db').query(
        `SELECT a.id as audit_id, a.created_at,
                SUM(CASE WHEN i.severity = 'critical' THEN 1 ELSE 0 END) as critical_count,
                SUM(CASE WHEN i.severity = 'high' THEN 1 ELSE 0 END) as high_count,
                SUM(CASE WHEN i.severity = 'medium' THEN 1 ELSE 0 END) as medium_count,
                SUM(CASE WHEN i.severity = 'low' THEN 1 ELSE 0 END) as low_count,
                COUNT(i.id) as total_issues
         FROM audits a LEFT JOIN seo_issues i ON a.id = i.audit_id
         WHERE ${whereClause}
         GROUP BY a.id ORDER BY a.created_at ASC LIMIT ?`,
        params
      );
      res.json({ success: true, data: { trend: rows } });
    } catch (error) { next(error); }
  },

  // ═══════════════════════════════════════════
  //  MODULE 6: PROPOSALS & INVOICES
  // ═══════════════════════════════════════════

  async createProposal(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const id = await proposalModel.create({ ...req.body, userId });
      const proposal = await proposalModel.findById(id);
      res.status(201).json({ success: true, data: { proposal } });
    } catch (error) { next(error); }
  },

  async getProposals(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const proposals = await proposalModel.listByUser(userId);
      const stats = await proposalModel.getStats(userId);
      res.json({ success: true, data: { proposals, stats } });
    } catch (error) { next(error); }
  },

  async updateProposal(req, res, next) {
    try {
      await proposalModel.update(req.params.id, req.body);
      const proposal = await proposalModel.findById(req.params.id);
      res.json({ success: true, data: { proposal } });
    } catch (error) { next(error); }
  },

  async deleteProposal(req, res, next) {
    try {
      await proposalModel.delete(req.params.id);
      res.json({ success: true, message: 'Proposal deleted.' });
    } catch (error) { next(error); }
  },

  async createInvoice(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const id = await invoiceModel.create({ ...req.body, userId });
      const invoice = await invoiceModel.findById(id);
      res.status(201).json({ success: true, data: { invoice } });
    } catch (error) { next(error); }
  },

  async getInvoices(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const invoices = await invoiceModel.listByUser(userId);
      const stats = await invoiceModel.getStats(userId);
      res.json({ success: true, data: { invoices, stats } });
    } catch (error) { next(error); }
  },

  async updateInvoice(req, res, next) {
    try {
      if (req.body.status === 'paid') {
        await invoiceModel.markPaid(req.params.id);
      } else {
        await invoiceModel.update(req.params.id, req.body);
      }
      const invoice = await invoiceModel.findById(req.params.id);
      res.json({ success: true, data: { invoice } });
    } catch (error) { next(error); }
  },

  async deleteInvoice(req, res, next) {
    try {
      await invoiceModel.delete(req.params.id);
      res.json({ success: true, message: 'Invoice deleted.' });
    } catch (error) { next(error); }
  },

  // ═══════════════════════════════════════════
  //  MODULE 7: CLIENT PORTAL
  // ═══════════════════════════════════════════

  async generatePortalLink(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const { auditId, clientId, projectId, title, expiresInDays } = req.body;
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400000) : null;
      const id = await portalModel.create({ auditId, clientId, projectId, userId, token, title, expiresAt });
      const base = `${req.protocol}://${req.get('host')}`;
      res.status(201).json({
        success: true,
        data: {
          token,
          portalUrl: `${base}/portal/${token}`,
          expiresAt
        }
      });
    } catch (error) { next(error); }
  },

  async getPortalData(req, res, next) {
    try {
      const { token } = req.params;
      const link = await portalModel.findByToken(token);
      if (!link) return res.status(404).json({ success: false, message: 'Portal link not found or expired.' });
      await portalModel.incrementViews(link.id);

      let auditData = null;
      if (link.audit_id) {
        const audit = await auditModel.findById(link.audit_id);
        const issues = await issueModel.findByAudit(link.audit_id);
        const issueCounts = await issueModel.getCountsBySeverity(link.audit_id);
        auditData = { audit, issues, issueCounts };
      }

      res.json({
        success: true,
        data: {
          title: link.title,
          viewCount: link.view_count + 1,
          auditData
        }
      });
    } catch (error) { next(error); }
  },

  async getPortalLinks(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const links = await portalModel.listByUser(userId);
      res.json({ success: true, data: { links } });
    } catch (error) { next(error); }
  },

  // ═══════════════════════════════════════════
  //  MODULE 8: SCHEMA GENERATOR & SITEMAP
  // ═══════════════════════════════════════════

  async generateSchema(req, res, next) {
    try {
      const { type, data } = req.body;
      if (!type) return res.status(400).json({ success: false, message: 'Schema type is required.' });
      const schema = agencyController._buildSchema(type, data || {});
      res.json({ success: true, data: { schema, schemaString: JSON.stringify(schema, null, 2) } });
    } catch (error) { next(error); }
  },

  _buildSchema(type, d) {
    const schemas = {
      Organization: {
        '@context': 'https://schema.org', '@type': 'Organization',
        name: d.name || 'Company Name', url: d.url || 'https://example.com',
        logo: d.logo || '', description: d.description || '',
        contactPoint: { '@type': 'ContactPoint', telephone: d.phone || '', contactType: 'customer service' },
        sameAs: d.socialLinks || []
      },
      LocalBusiness: {
        '@context': 'https://schema.org', '@type': 'LocalBusiness',
        name: d.name || '', image: d.image || '', '@id': d.url || '',
        url: d.url || '', telephone: d.phone || '',
        address: { '@type': 'PostalAddress', streetAddress: d.street || '', addressLocality: d.city || '', addressRegion: d.region || '', postalCode: d.postalCode || '', addressCountry: d.country || 'PK' },
        geo: { '@type': 'GeoCoordinates', latitude: d.lat || 0, longitude: d.lng || 0 },
        openingHoursSpecification: d.hours || [],
        priceRange: d.priceRange || '$$'
      },
      Article: {
        '@context': 'https://schema.org', '@type': 'Article',
        mainEntityOfPage: { '@type': 'WebPage', '@id': d.url || '' },
        headline: d.headline || '', description: d.description || '',
        image: d.image || '', author: { '@type': 'Person', name: d.author || '' },
        publisher: { '@type': 'Organization', name: d.publisherName || '', logo: { '@type': 'ImageObject', url: d.publisherLogo || '' } },
        datePublished: d.datePublished || new Date().toISOString().split('T')[0],
        dateModified: d.dateModified || new Date().toISOString().split('T')[0]
      },
      Product: {
        '@context': 'https://schema.org', '@type': 'Product',
        name: d.name || '', image: d.image || '', description: d.description || '',
        brand: { '@type': 'Brand', name: d.brand || '' },
        offers: { '@type': 'Offer', url: d.url || '', priceCurrency: d.currency || 'PKR', price: d.price || 0, availability: 'https://schema.org/InStock' },
        aggregateRating: d.rating ? { '@type': 'AggregateRating', ratingValue: d.rating, reviewCount: d.reviewCount || 1 } : undefined
      },
      FAQ: {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: (d.questions || []).map(q => ({
          '@type': 'Question', name: q.question || '',
          acceptedAnswer: { '@type': 'Answer', text: q.answer || '' }
        }))
      },
      BreadcrumbList: {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: (d.items || []).map((item, i) => ({
          '@type': 'ListItem', position: i + 1, name: item.name || '', item: item.url || ''
        }))
      },
      WebSite: {
        '@context': 'https://schema.org', '@type': 'WebSite',
        name: d.name || '', url: d.url || '',
        potentialAction: { '@type': 'SearchAction', target: `${d.url || ''}/?s={search_term_string}`, 'query-input': 'required name=search_term_string' }
      }
    };
    return schemas[type] || schemas.Organization;
  },

  async validateSitemap(req, res, next) {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ success: false, message: 'URL is required.' });

      // Try common sitemap locations
      const baseUrl = new URL(url).origin;
      const sitemapUrls = [`${baseUrl}/sitemap.xml`, `${baseUrl}/sitemap_index.xml`, `${baseUrl}/wp-sitemap.xml`];
      let sitemapContent = null;
      let sitemapFoundUrl = null;

      for (const sUrl of sitemapUrls) {
        try {
          const resp = await axios.get(sUrl, { timeout: 10000, headers: { 'User-Agent': 'SEO-Auditor-Bot/2.0' }, validateStatus: s => s < 400 });
          if (typeof resp.data === 'string' && resp.data.includes('<url')) {
            sitemapContent = resp.data;
            sitemapFoundUrl = sUrl;
            break;
          }
        } catch {}
      }

      if (!sitemapContent) {
        return res.json({ success: true, data: { found: false, message: 'No sitemap.xml found. Consider creating one for better SEO.', sitemapUrls } });
      }

      const $ = cheerio.load(sitemapContent, { xmlMode: true });
      const urls = [];
      const issues = [];
      let hasLastmod = 0;
      let hasPriority = 0;

      $('url').each((_, el) => {
        const loc = $(el).find('loc').text();
        const lastmod = $(el).find('lastmod').text();
        const priority = $(el).find('priority').text();
        const changefreq = $(el).find('changefreq').text();
        urls.push({ loc, lastmod, priority, changefreq });
        if (lastmod) hasLastmod++;
        if (priority) hasPriority++;
      });

      if (urls.length === 0) issues.push({ severity: 'high', message: 'Sitemap contains no URLs.' });
      if (hasLastmod < urls.length * 0.5) issues.push({ severity: 'medium', message: `Only ${hasLastmod}/${urls.length} URLs have lastmod dates.` });
      if (hasPriority < urls.length * 0.3) issues.push({ severity: 'low', message: 'Most URLs are missing priority values.' });
      if (urls.length > 50000) issues.push({ severity: 'high', message: 'Sitemap exceeds 50,000 URL limit. Split into multiple sitemaps.' });

      res.json({
        success: true,
        data: {
          found: true,
          sitemapUrl: sitemapFoundUrl,
          totalUrls: urls.length,
          withLastmod: hasLastmod,
          withPriority: hasPriority,
          issues,
          urls: urls.slice(0, 100), // Return first 100 only
          score: Math.max(0, 100 - issues.length * 15)
        }
      });
    } catch (error) { next(error); }
  }
};

module.exports = agencyController;
