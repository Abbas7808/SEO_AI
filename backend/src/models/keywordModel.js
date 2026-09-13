const db = require('../config/db');

const keywordModel = {
  async addKeyword({ projectId, userId, keyword, targetUrl, country, device }) {
    const result = await db.query(
      'INSERT INTO tracked_keywords (project_id, user_id, keyword, target_url, country, device) VALUES (?, ?, ?, ?, ?, ?)',
      [projectId || null, userId || null, keyword, targetUrl || null, country || 'pk', device || 'desktop']
    );
    return result.insertId;
  },

  async getByProject(projectId) {
    return db.query('SELECT * FROM tracked_keywords WHERE project_id = ? AND is_active = 1 ORDER BY created_at DESC', [projectId]);
  },

  async getByUser(userId) {
    return db.query('SELECT * FROM tracked_keywords WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC', [userId]);
  },

  async getAll(userId) {
    return db.query(
      `SELECT tk.*, 
        (SELECT kr.position FROM keyword_rankings kr WHERE kr.tracked_keyword_id = tk.id ORDER BY kr.tracked_at DESC LIMIT 1) as latest_position,
        (SELECT kr.previous_position FROM keyword_rankings kr WHERE kr.tracked_keyword_id = tk.id ORDER BY kr.tracked_at DESC LIMIT 1) as prev_position
       FROM tracked_keywords tk 
       WHERE (tk.user_id = ? OR ? IS NULL) AND tk.is_active = 1
       ORDER BY tk.created_at DESC`,
      [userId, userId]
    );
  },

  async findById(id) {
    const rows = await db.query('SELECT * FROM tracked_keywords WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async remove(id) {
    await db.query('UPDATE tracked_keywords SET is_active = 0 WHERE id = ?', [id]);
  },

  async deleteKeyword(id) {
    await db.query('DELETE FROM tracked_keywords WHERE id = ?', [id]);
  },

  // ── Rankings ──

  async addRanking({ trackedKeywordId, position, previousPosition, searchEngine, serpUrl, serpTitle }) {
    const result = await db.query(
      'INSERT INTO keyword_rankings (tracked_keyword_id, position, previous_position, search_engine, serp_url, serp_title) VALUES (?, ?, ?, ?, ?, ?)',
      [trackedKeywordId, position, previousPosition || null, searchEngine || 'google', serpUrl || null, serpTitle || null]
    );
    return result.insertId;
  },

  async getRankingHistory(trackedKeywordId, limit = 30) {
    return db.query(
      'SELECT * FROM keyword_rankings WHERE tracked_keyword_id = ? ORDER BY tracked_at DESC LIMIT ?',
      [trackedKeywordId, limit]
    );
  },

  async getLatestRanking(trackedKeywordId) {
    const rows = await db.query(
      'SELECT * FROM keyword_rankings WHERE tracked_keyword_id = ? ORDER BY tracked_at DESC LIMIT 1',
      [trackedKeywordId]
    );
    return rows[0] || null;
  },

  async getBestRanking(trackedKeywordId) {
    const rows = await db.query(
      'SELECT MIN(position) as best_position FROM keyword_rankings WHERE tracked_keyword_id = ? AND position > 0',
      [trackedKeywordId]
    );
    return rows[0]?.best_position || null;
  }
};

module.exports = keywordModel;
