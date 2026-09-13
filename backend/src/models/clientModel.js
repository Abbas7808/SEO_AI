const db = require('../config/db');

const clientModel = {
  async create({ userId, name, email, phone, company, websiteUrl, notes, avatarColor, status, monthlyFee, currency }) {
    const result = await db.query(
      `INSERT INTO clients (user_id, name, email, phone, company, website_url, notes, avatar_color, status, monthly_fee, currency) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email || null, phone || null, company || null, websiteUrl || null, notes || null, avatarColor || '#6366f1', status || 'active', monthlyFee || 0, currency || 'PKR']
    );
    return result.insertId;
  },

  async findById(id) {
    const rows = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async listByUser(userId, limit = 100) {
    if (userId) {
      return db.query('SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]);
    }
    return db.query('SELECT * FROM clients ORDER BY created_at DESC LIMIT ?', [limit]);
  },

  async update(id, fields) {
    const allowed = ['name','email','phone','company','website_url','notes','avatar_color','status','monthly_fee','currency'];
    const sets = [];
    const vals = [];
    for (const [key, val] of Object.entries(fields)) {
      const col = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // camelCase → snake_case
      if (allowed.includes(col)) {
        sets.push(`${col} = ?`);
        vals.push(val);
      }
    }
    if (sets.length === 0) return;
    vals.push(id);
    await db.query(`UPDATE clients SET ${sets.join(', ')} WHERE id = ?`, vals);
  },

  async delete(id) {
    await db.query('DELETE FROM clients WHERE id = ?', [id]);
  },

  async getStats(userId) {
    const rows = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN status = 'lead' THEN 1 ELSE 0 END) as lead_count,
        SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) as churned_count,
        SUM(CASE WHEN status = 'active' THEN monthly_fee ELSE 0 END) as monthly_revenue
       FROM clients WHERE user_id = ? OR ? IS NULL`,
      [userId, userId]
    );
    return rows[0] || { total: 0, active_count: 0, lead_count: 0, churned_count: 0, monthly_revenue: 0 };
  },

  // ── Projects ──

  async createProject({ clientId, name, websiteUrl, targetKeywords, notes }) {
    const result = await db.query(
      'INSERT INTO projects (client_id, name, website_url, target_keywords, notes) VALUES (?, ?, ?, ?, ?)',
      [clientId, name, websiteUrl, targetKeywords ? JSON.stringify(targetKeywords) : null, notes || null]
    );
    return result.insertId;
  },

  async getProjectsByClient(clientId) {
    return db.query('SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC', [clientId]);
  },

  async getProjectById(id) {
    const rows = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async updateProject(id, fields) {
    const allowed = ['name','website_url','target_keywords','status','notes'];
    const sets = [];
    const vals = [];
    for (const [key, val] of Object.entries(fields)) {
      const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowed.includes(col)) {
        sets.push(`${col} = ?`);
        vals.push(typeof val === 'object' ? JSON.stringify(val) : val);
      }
    }
    if (sets.length === 0) return;
    vals.push(id);
    await db.query(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`, vals);
  },

  async deleteProject(id) {
    await db.query('DELETE FROM projects WHERE id = ?', [id]);
  },

  async getAuditsByClient(clientId, limit = 20) {
    return db.query('SELECT * FROM audits WHERE client_id = ? ORDER BY created_at DESC LIMIT ?', [clientId, limit]);
  }
};

module.exports = clientModel;
