const db = require('../config/db');

const pageModel = {
  async create(pageData) {
    const {
      auditId,
      url,
      statusCode = 200,
      title = null,
      metaDescription = null,
      canonicalUrl = null,
      h1Count = 0,
      wordCount = 0,
      imageCount = 0,
      internalLinkCount = 0,
      externalLinkCount = 0,
      seoScore = 0,
      loadTimeMs = 0,
      pageSizeKb = 0,
      contentDetails = null
    } = pageData;

    const result = await db.query(
      `INSERT INTO pages 
       (audit_id, url, status_code, title, meta_description, canonical_url, 
        h1_count, word_count, image_count, internal_link_count, external_link_count, 
        seo_score, load_time_ms, page_size_kb, content_details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auditId,
        url,
        statusCode,
        title,
        metaDescription,
        canonicalUrl,
        h1Count,
        wordCount,
        imageCount,
        internalLinkCount,
        externalLinkCount,
        seoScore,
        loadTimeMs,
        pageSizeKb,
        contentDetails ? JSON.stringify(contentDetails) : null
      ]
    );
    return result.insertId;
  },

  async findByAudit(auditId) {
    return await db.query('SELECT * FROM pages WHERE audit_id = ? ORDER BY id ASC', [auditId]);
  },

  async findById(id) {
    const rows = await db.query('SELECT * FROM pages WHERE id = ?', [id]);
    return rows[0] || null;
  }
};

module.exports = pageModel;
