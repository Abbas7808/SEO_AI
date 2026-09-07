const db = require('../config/db');

const auditModel = {
  async create({
    userId = null,
    websiteUrl,
    maxPages = 20,
    targetKeyword = null,
    businessName = null,
    businessLocation = null
  }) {
    const result = await db.query(
      `INSERT INTO audits 
       (user_id, website_url, max_pages, target_keyword, business_name, business_location, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, websiteUrl, maxPages, targetKeyword, businessName, businessLocation]
    );
    return result.insertId;
  },

  async findById(id) {
    const rows = await db.query('SELECT * FROM audits WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async listByUser(userId = null, limit = 50) {
    if (userId) {
      return await db.query(
        'SELECT * FROM audits WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit]
      );
    }
    return await db.query(
      'SELECT * FROM audits ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
  },

  async updateStatus(id, status, errorMessage = null) {
    const completedAt = status === 'completed' || status === 'failed' ? new Date() : null;
    await db.query(
      'UPDATE audits SET status = ?, error_message = ?, completed_at = ? WHERE id = ?',
      [status, errorMessage, completedAt, id]
    );
  },

  async updateScores(id, scores) {
    const {
      seoScore = 0,
      technicalScore = 0,
      onpageScore = 0,
      contentScore = 0,
      performanceScore = 0,
      structuredDataScore = 0,
      socialScore = 0,
      localScore = 0,
      pagesCrawled = 0,
      aiSummary = null
    } = scores;

    await db.query(
      `UPDATE audits SET 
         seo_score = ?, 
         technical_score = ?, 
         onpage_score = ?, 
         content_score = ?, 
         performance_score = ?, 
         structured_data_score = ?, 
         social_score = ?, 
         local_score = ?, 
         pages_crawled = ?, 
         ai_summary = ?,
         completed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        seoScore,
        technicalScore,
        onpageScore,
        contentScore,
        performanceScore,
        structuredDataScore,
        socialScore,
        localScore,
        pagesCrawled,
        aiSummary,
        id
      ]
    );
  },

  async delete(id) {
    await db.query('DELETE FROM audits WHERE id = ?', [id]);
  }
};

module.exports = auditModel;
