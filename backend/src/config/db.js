const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('./env');
const logger = require('../utils/logger');

let pool = null;

async function initDatabase() {
  try {
    logger.info(`Connecting to MySQL host ${config.db.host}:${config.db.port}...`);
    
    // Step 1: Connect to server without specifying DB to ensure DB exists
    const rootConnection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      multipleStatements: true
    });

    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await rootConnection.end();
    logger.info(`Database "${config.db.database}" verified/created successfully.`);

    // Step 2: Create connection pool targeted at the application database
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: config.db.waitForConnections,
      connectionLimit: config.db.connectionLimit,
      queueLimit: config.db.queueLimit,
      multipleStatements: true
    });

    // Step 3: Run schema.sql migrations
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await pool.query(schemaSql);
      logger.info('Database schema verified/executed successfully.');
    } else {
      logger.warn(`Schema file not found at ${schemaPath}`);
    }

    // Step 4: Safe column migrations for dual scan mode and local codebase issues
    try {
      const [auditCols] = await pool.query("SHOW COLUMNS FROM audits LIKE 'scan_mode'");
      if (auditCols.length === 0) {
        await pool.query("ALTER TABLE audits ADD COLUMN scan_mode ENUM('online', 'local') NOT NULL DEFAULT 'online' AFTER max_pages");
        await pool.query("ALTER TABLE audits ADD COLUMN project_path VARCHAR(1024) NULL AFTER scan_mode");
        logger.info('Audits table migrated with scan_mode and project_path columns.');
      }
    } catch (e) {
      logger.warn(`Audits column check note: ${e.message}`);
    }

    try {
      const [issueCols] = await pool.query("SHOW COLUMNS FROM seo_issues LIKE 'file_path'");
      if (issueCols.length === 0) {
        await pool.query("ALTER TABLE seo_issues ADD COLUMN file_path VARCHAR(1024) NULL AFTER page_url");
        await pool.query("ALTER TABLE seo_issues ADD COLUMN line_number INT NULL AFTER file_path");
        await pool.query("ALTER TABLE seo_issues ADD COLUMN code_snippet TEXT NULL AFTER line_number");
        await pool.query("ALTER TABLE seo_issues ADD COLUMN code_diff TEXT NULL AFTER code_snippet");
        logger.info('SEO issues table migrated with local file and diff columns.');
      }
    } catch (e) {
      logger.warn(`SEO issues column check note: ${e.message}`);
    }

    // Step 5: Agency platform migrations (client_id, project_id, user agency branding)
    try {
      const [clientCol] = await pool.query("SHOW COLUMNS FROM audits LIKE 'client_id'");
      if (clientCol.length === 0) {
        await pool.query("ALTER TABLE audits ADD COLUMN client_id INT NULL AFTER user_id");
        await pool.query("ALTER TABLE audits ADD COLUMN project_id INT NULL AFTER client_id");
        logger.info('Audits table migrated with client_id and project_id columns.');
      }
    } catch (e) { logger.warn(`Agency audit migration: ${e.message}`); }

    try {
      const [agencyCol] = await pool.query("SHOW COLUMNS FROM users LIKE 'agency_name'");
      if (agencyCol.length === 0) {
        await pool.query("ALTER TABLE users ADD COLUMN agency_name VARCHAR(255) NULL DEFAULT 'SEO Pro Agency' AFTER password");
        await pool.query("ALTER TABLE users ADD COLUMN agency_logo_url VARCHAR(2048) NULL AFTER agency_name");
        await pool.query("ALTER TABLE users ADD COLUMN agency_email VARCHAR(255) NULL AFTER agency_logo_url");
        await pool.query("ALTER TABLE users ADD COLUMN agency_phone VARCHAR(50) NULL AFTER agency_email");
        await pool.query("ALTER TABLE users ADD COLUMN agency_color VARCHAR(20) NULL DEFAULT '#6366f1' AFTER agency_phone");
        await pool.query("ALTER TABLE users ADD COLUMN agency_tagline VARCHAR(255) NULL AFTER agency_color");
        await pool.query("ALTER TABLE users ADD COLUMN default_currency VARCHAR(10) NULL DEFAULT 'PKR' AFTER agency_tagline");
        logger.info('Users table migrated with agency branding columns.');
      }
    } catch (e) { logger.warn(`Agency user migration: ${e.message}`); }

    return pool;
  } catch (error) {
    logger.error('Failed to initialize database:', error.message);
    throw error;
  }
}

const memoryStore = {
  audits: [],
  pages: [],
  seo_issues: [],
  users: [],
  clients: [],
  keywords: [],
  counters: { audits: 1, pages: 1, seo_issues: 1, users: 1, clients: 1, keywords: 1 }
};

function getPool() {
  return pool;
}

function executeMemoryQuery(sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const lowerSql = cleanSql.toLowerCase();

  // INSERT INTO audits
  if (lowerSql.startsWith('insert into audits')) {
    const id = memoryStore.counters.audits++;
    const [userId, websiteUrl, maxPages, scanMode, projectPath, targetKeyword, businessName, businessLocation] = params;
    const record = {
      id,
      user_id: userId || null,
      website_url: websiteUrl,
      max_pages: maxPages || 20,
      scan_mode: scanMode || 'online',
      project_path: projectPath || null,
      target_keyword: targetKeyword || null,
      business_name: businessName || null,
      business_location: businessLocation || null,
      status: 'pending',
      score: 0,
      seo_score: 0,
      mobile_score: 0,
      desktop_score: 0,
      technical_score: 0,
      onpage_score: 0,
      content_score: 0,
      performance_score: 0,
      structured_data_score: 0,
      social_score: 0,
      local_score: 0,
      pages_crawled: 0,
      created_at: new Date().toISOString()
    };
    memoryStore.audits.unshift(record);
    return { insertId: id, affectedRows: 1 };
  }

  // INSERT INTO pages
  if (lowerSql.startsWith('insert into pages')) {
    const id = memoryStore.counters.pages++;
    const [auditId, url, statusCode, title, metaDescription, canonicalUrl, h1Count, wordCount, imageCount, internalLinkCount, externalLinkCount, seoScore, loadTimeMs, pageSizeKb, contentDetails] = params;
    const record = {
      id,
      audit_id: auditId,
      url,
      status_code: statusCode || 200,
      title: title || '',
      meta_description: metaDescription || '',
      canonical_url: canonicalUrl || '',
      h1_count: h1Count || 0,
      word_count: wordCount || 0,
      image_count: imageCount || 0,
      internal_link_count: internalLinkCount || 0,
      external_link_count: externalLinkCount || 0,
      seo_score: seoScore || 80,
      load_time_ms: loadTimeMs || 300,
      page_size_kb: pageSizeKb || 0,
      content_details: typeof contentDetails === 'object' ? JSON.stringify(contentDetails) : (contentDetails || '{}')
    };
    memoryStore.pages.push(record);
    return { insertId: id, affectedRows: 1 };
  }

  // INSERT INTO seo_issues (Handles single-row and multi-row batch inserts)
  if (lowerSql.startsWith('insert into seo_issues')) {
    const ROW_SIZE = 17;
    let firstInsertId = memoryStore.counters.seo_issues;
    let insertedCount = 0;

    for (let i = 0; i < params.length; i += ROW_SIZE) {
      const chunk = params.slice(i, i + ROW_SIZE);
      const [
        auditId, pageId, issueType, category, severity,
        title, description, impact, recommendation, suggestedFix,
        solutionSteps, pageUrl, filePath, lineNumber, codeSnippet,
        codeDiff, status
      ] = chunk;

      const id = memoryStore.counters.seo_issues++;
      const record = {
        id,
        audit_id: auditId,
        page_id: pageId || null,
        issue_type: issueType,
        category: category || 'technical',
        severity: severity || 'medium',
        title: title || '',
        description: description || '',
        impact: impact || '',
        recommendation: recommendation || '',
        suggested_fix: suggestedFix || null,
        solution_steps: solutionSteps || null,
        page_url: pageUrl || null,
        file_path: filePath || null,
        line_number: lineNumber || null,
        code_snippet: codeSnippet || null,
        code_diff: codeDiff || null,
        status: status || 'open'
      };
      memoryStore.seo_issues.push(record);
      insertedCount++;
    }

    return { insertId: firstInsertId, affectedRows: insertedCount };
  }

  // INSERT INTO users
  if (lowerSql.startsWith('insert into users')) {
    const id = memoryStore.counters.users++;
    const [name, email, password] = params;
    const user = {
      id,
      name,
      email,
      password,
      agency_name: 'SEO Pro Agency',
      default_currency: 'PKR',
      created_at: new Date().toISOString()
    };
    memoryStore.users.push(user);
    return { insertId: id, affectedRows: 1 };
  }

  // SELECT FROM users WHERE email = ?
  if (lowerSql.includes('from users where email = ?')) {
    const email = String(params[0] || '').toLowerCase().trim();
    const found = memoryStore.users.find(u => (u.email || '').toLowerCase().trim() === email);
    return found ? [found] : [];
  }

  // SELECT FROM users WHERE id = ?
  if (lowerSql.includes('from users where id = ?')) {
    const id = Number(params[0]);
    const found = memoryStore.users.find(u => u.id === id);
    return found ? [found] : [];
  }

  // SELECT FROM audits WHERE id = ?
  if (lowerSql.includes('from audits where id = ?') || lowerSql.includes('from audits where id=')) {
    const id = Number(params[0]);
    const found = memoryStore.audits.find(a => a.id === id);
    return found ? [found] : [];
  }

  // SELECT FROM audits ORDER BY created_at DESC
  if (lowerSql.includes('from audits') && lowerSql.includes('order by created_at desc')) {
    const limit = Number(params[params.length - 1]) || 50;
    return memoryStore.audits.slice(0, limit);
  }

  // UPDATE audits SET status = ?
  if (lowerSql.startsWith('update audits set status')) {
    const [status, errorMessage, completedAt, id] = params;
    const audit = memoryStore.audits.find(a => a.id === Number(id));
    if (audit) {
      audit.status = status;
      audit.error_message = errorMessage;
      audit.completed_at = completedAt || new Date().toISOString();
    }
    return { affectedRows: audit ? 1 : 0 };
  }

  // UPDATE audits SET seo_score
  if (lowerSql.startsWith('update audits set seo_score')) {
    const [seoScore, mobileScore, desktopScore, technicalScore, onpageScore, contentScore, performanceScore, structuredDataScore, socialScore, localScore, pagesCrawled, aiSummary, id] = params;
    const audit = memoryStore.audits.find(a => a.id === Number(id));
    if (audit) {
      Object.assign(audit, {
        seo_score: seoScore, score: seoScore, mobile_score: mobileScore,
        desktop_score: desktopScore, technical_score: technicalScore,
        onpage_score: onpageScore, content_score: contentScore,
        performance_score: performanceScore, structured_data_score: structuredDataScore,
        social_score: socialScore, local_score: localScore,
        pages_crawled: pagesCrawled, ai_summary: aiSummary
      });
    }
    return { affectedRows: audit ? 1 : 0 };
  }

  // SELECT FROM pages WHERE audit_id = ?
  if (lowerSql.includes('from pages where audit_id = ?')) {
    const auditId = Number(params[0]);
    return memoryStore.pages.filter(p => p.audit_id === auditId);
  }

  // SELECT severity, COUNT(*) as count FROM seo_issues WHERE audit_id = ? GROUP BY severity
  if (lowerSql.includes('from seo_issues') && lowerSql.includes('group by severity')) {
    const auditId = Number(params[0]);
    const auditIssues = memoryStore.seo_issues.filter(i => i.audit_id === auditId);
    const countMap = {};
    for (const issue of auditIssues) {
      const sev = issue.severity || 'medium';
      countMap[sev] = (countMap[sev] || 0) + 1;
    }
    return Object.keys(countMap).map(severity => ({
      severity,
      count: countMap[severity]
    }));
  }

  // SELECT FROM seo_issues WHERE audit_id = ? AND severity = ?
  if (lowerSql.includes('from seo_issues where audit_id = ? and severity = ?')) {
    const auditId = Number(params[0]);
    const severity = String(params[1]);
    return memoryStore.seo_issues.filter(i => i.audit_id === auditId && i.severity === severity);
  }

  // SELECT FROM seo_issues WHERE audit_id = ?
  if (lowerSql.includes('from seo_issues where audit_id = ?')) {
    const auditId = Number(params[0]);
    return memoryStore.seo_issues.filter(i => i.audit_id === auditId);
  }

  // DELETE FROM audits WHERE id = ?
  if (lowerSql.startsWith('delete from audits where id = ?')) {
    const id = Number(params[0]);
    memoryStore.audits = memoryStore.audits.filter(a => a.id !== id);
    memoryStore.pages = memoryStore.pages.filter(p => p.audit_id !== id);
    memoryStore.seo_issues = memoryStore.seo_issues.filter(i => i.audit_id !== id);
    return { affectedRows: 1 };
  }

  // Generic fallback
  return [];
}

async function query(sql, params = []) {
  if (pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (dbErr) {
      logger.warn(`MySQL pool query failed (${dbErr.message}), falling back to memory store.`);
    }
  }
  return executeMemoryQuery(sql, params);
}

module.exports = {
  initDatabase,
  getPool,
  query,
  memoryStore
};
