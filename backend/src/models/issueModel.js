const db = require('../config/db');

const issueModel = {
  async createMany(issues) {
    if (!issues || issues.length === 0) return [];
    
    // Batch insert issues
    const values = [];
    const placeholders = [];

    for (const issue of issues) {
      placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      values.push(
        issue.auditId,
        issue.pageId || null,
        issue.issueType,
        issue.category || 'technical',
        issue.severity,
        issue.title,
        issue.description,
        issue.impact,
        issue.recommendation,
        issue.suggestedFix || issue.suggested_fix || null,
        issue.solutionSteps ? (typeof issue.solutionSteps === 'string' ? issue.solutionSteps : JSON.stringify(issue.solutionSteps)) : null,
        issue.pageUrl || null,
        issue.status || 'open'
      );
    }

    const sql = `INSERT INTO seo_issues 
      (audit_id, page_id, issue_type, category, severity, title, description, impact, recommendation, suggested_fix, solution_steps, page_url, status) 
      VALUES ${placeholders.join(', ')}`;

    const result = await db.query(sql, values);
    return result;
  },

  async findByAudit(auditId, severity = null) {
    if (severity) {
      return await db.query(
        'SELECT * FROM seo_issues WHERE audit_id = ? AND severity = ? ORDER BY id ASC',
        [auditId, severity]
      );
    }
    return await db.query(
      'SELECT * FROM seo_issues WHERE audit_id = ? ORDER BY FIELD(severity, "critical", "high", "medium", "low", "passed"), id ASC',
      [auditId]
    );
  },

  async getCountsBySeverity(auditId) {
    const rows = await db.query(
      `SELECT severity, COUNT(*) as count 
       FROM seo_issues 
       WHERE audit_id = ? 
       GROUP BY severity`,
      [auditId]
    );
    const counts = { critical: 0, high: 0, medium: 0, low: 0, passed: 0, total: 0 };
    for (const row of rows) {
      counts[row.severity] = parseInt(row.count, 10);
      counts.total += parseInt(row.count, 10);
    }
    return counts;
  },

  async findById(id) {
    const rows = await db.query('SELECT * FROM seo_issues WHERE id = ?', [id]);
    return rows && rows.length > 0 ? rows[0] : null;
  },

  async updateStatus(id, status = 'resolved') {
    const result = await db.query(
      'UPDATE seo_issues SET status = ? WHERE id = ?',
      [status, id]
    );
    return result;
  }
};

module.exports = issueModel;
