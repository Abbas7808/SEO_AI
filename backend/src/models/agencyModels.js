const db = require('../config/db');

const proposalModel = {
  async create({ clientId, userId, title, scopeDescription, deliverables, price, currency, validUntil }) {
    const result = await db.query(
      'INSERT INTO proposals (client_id, user_id, title, scope_description, deliverables, price, currency, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [clientId || null, userId || null, title, scopeDescription || null, deliverables ? JSON.stringify(deliverables) : null, price || 0, currency || 'PKR', validUntil || null]
    );
    return result.insertId;
  },

  async findById(id) {
    const rows = await db.query('SELECT p.*, c.name as client_name, c.company as client_company FROM proposals p LEFT JOIN clients c ON p.client_id = c.id WHERE p.id = ?', [id]);
    return rows[0] || null;
  },

  async listByUser(userId, limit = 50) {
    return db.query(
      'SELECT p.*, c.name as client_name, c.company as client_company FROM proposals p LEFT JOIN clients c ON p.client_id = c.id WHERE p.user_id = ? OR ? IS NULL ORDER BY p.created_at DESC LIMIT ?',
      [userId, userId, limit]
    );
  },

  async update(id, fields) {
    const allowed = ['title','scope_description','deliverables','price','currency','status','valid_until'];
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
    await db.query(`UPDATE proposals SET ${sets.join(', ')} WHERE id = ?`, vals);
  },

  async delete(id) {
    await db.query('DELETE FROM proposals WHERE id = ?', [id]);
  },

  async getStats(userId) {
    const rows = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'accepted' THEN price ELSE 0 END) as total_accepted,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_count
       FROM proposals WHERE user_id = ? OR ? IS NULL`,
      [userId, userId]
    );
    return rows[0] || {};
  }
};

const invoiceModel = {
  async create({ clientId, userId, proposalId, invoiceNumber, title, items, amount, currency, dueDate, notes }) {
    const num = invoiceNumber || `INV-${Date.now().toString(36).toUpperCase()}`;
    const result = await db.query(
      'INSERT INTO invoices (client_id, user_id, proposal_id, invoice_number, title, items, amount, currency, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [clientId || null, userId || null, proposalId || null, num, title || 'SEO Services', items ? JSON.stringify(items) : null, amount || 0, currency || 'PKR', dueDate || null, notes || null]
    );
    return result.insertId;
  },

  async findById(id) {
    const rows = await db.query(
      'SELECT i.*, c.name as client_name, c.company as client_company, c.email as client_email FROM invoices i LEFT JOIN clients c ON i.client_id = c.id WHERE i.id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async listByUser(userId, limit = 50) {
    return db.query(
      'SELECT i.*, c.name as client_name, c.company as client_company FROM invoices i LEFT JOIN clients c ON i.client_id = c.id WHERE i.user_id = ? OR ? IS NULL ORDER BY i.created_at DESC LIMIT ?',
      [userId, userId, limit]
    );
  },

  async update(id, fields) {
    const allowed = ['title','items','amount','currency','status','due_date','paid_at','notes'];
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
    await db.query(`UPDATE invoices SET ${sets.join(', ')} WHERE id = ?`, vals);
  },

  async markPaid(id) {
    await db.query('UPDATE invoices SET status = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?', ['paid', id]);
  },

  async delete(id) {
    await db.query('DELETE FROM invoices WHERE id = ?', [id]);
  },

  async getStats(userId) {
    const rows = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'sent' THEN amount ELSE 0 END) as total_pending,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as total_overdue,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'sent' OR status = 'overdue' THEN 1 ELSE 0 END) as outstanding_count
       FROM invoices WHERE user_id = ? OR ? IS NULL`,
      [userId, userId]
    );
    return rows[0] || {};
  }
};

const portalModel = {
  async create({ auditId, clientId, projectId, userId, token, title, expiresAt }) {
    const result = await db.query(
      'INSERT INTO portal_links (audit_id, client_id, project_id, user_id, token, title, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [auditId || null, clientId || null, projectId || null, userId || null, token, title || null, expiresAt || null]
    );
    return result.insertId;
  },

  async findByToken(token) {
    const rows = await db.query('SELECT * FROM portal_links WHERE token = ? AND is_active = 1', [token]);
    const link = rows[0] || null;
    if (link && link.expires_at && new Date(link.expires_at) < new Date()) {
      return null; // expired
    }
    return link;
  },

  async incrementViews(id) {
    await db.query('UPDATE portal_links SET view_count = view_count + 1 WHERE id = ?', [id]);
  },

  async listByUser(userId, limit = 50) {
    return db.query('SELECT * FROM portal_links WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]);
  },

  async deactivate(id) {
    await db.query('UPDATE portal_links SET is_active = 0 WHERE id = ?', [id]);
  }
};

const scheduledAuditModel = {
  async create({ projectId, clientId, userId, websiteUrl, frequency, maxPages, targetKeyword }) {
    const nextRun = new Date();
    const freqMap = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 };
    nextRun.setDate(nextRun.getDate() + (freqMap[frequency] || 7));
    const result = await db.query(
      'INSERT INTO scheduled_audits (project_id, client_id, user_id, website_url, frequency, max_pages, target_keyword, next_run_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [projectId || null, clientId || null, userId || null, websiteUrl, frequency || 'weekly', maxPages || 20, targetKeyword || null, nextRun]
    );
    return result.insertId;
  },

  async findById(id) {
    const rows = await db.query('SELECT * FROM scheduled_audits WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async listByUser(userId, limit = 50) {
    return db.query(
      'SELECT sa.*, c.name as client_name FROM scheduled_audits sa LEFT JOIN clients c ON sa.client_id = c.id WHERE sa.user_id = ? OR ? IS NULL ORDER BY sa.next_run_at ASC LIMIT ?',
      [userId, userId, limit]
    );
  },

  async getDueSchedules() {
    return db.query('SELECT * FROM scheduled_audits WHERE is_active = 1 AND next_run_at <= NOW()');
  },

  async markRun(id, auditId) {
    const schedule = await this.findById(id);
    if (!schedule) return;
    const freqMap = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 };
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + (freqMap[schedule.frequency] || 7));
    await db.query(
      'UPDATE scheduled_audits SET last_run_at = NOW(), last_audit_id = ?, next_run_at = ? WHERE id = ?',
      [auditId, nextRun, id]
    );
  },

  async toggle(id, isActive) {
    await db.query('UPDATE scheduled_audits SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  },

  async delete(id) {
    await db.query('DELETE FROM scheduled_audits WHERE id = ?', [id]);
  }
};

module.exports = { proposalModel, invoiceModel, portalModel, scheduledAuditModel };
