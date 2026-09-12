/**
 * Enterprise Audit Export Hub
 * 
 * Provides client-side export capabilities for:
 * - CSV (Structured spreadsheet for clients and PMs)
 * - JSON (Machine-readable full audit payload for dev pipelines)
 * - Markdown (Formatted documentation ready for GitHub/Notion)
 */

/**
 * Trigger browser file download
 */
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Clean text for CSV cells
 */
function cleanCsvCell(str) {
  if (str === null || str === undefined) return '""';
  const val = String(str).replace(/"/g, '""').replace(/\r?\n/g, ' ');
  return `"${val}"`;
}

/**
 * Export SEO issues list to CSV
 */
export function exportIssuesToCsv(issues = [], websiteUrl = 'website') {
  let domain = 'website';
  try {
    domain = new URL(websiteUrl).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
  } catch (e) {
    domain = String(websiteUrl).replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  const headers = [
    'Severity',
    'Category',
    'Issue Title',
    'Page URL',
    'Description',
    'Impact',
    'Recommendation',
    'Suggested Fix'
  ];

  const rows = issues.map(iss => [
    cleanCsvCell(iss.severity || 'Medium'),
    cleanCsvCell(iss.category || 'General'),
    cleanCsvCell(iss.title || 'Untitled Issue'),
    cleanCsvCell(iss.page || iss.page_url || websiteUrl),
    cleanCsvCell(iss.description || ''),
    cleanCsvCell(iss.impact || ''),
    cleanCsvCell(iss.recommendation || ''),
    cleanCsvCell(iss.suggestedFix || iss.suggested_fix || '')
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const filename = `seo-audit-issues-${domain}-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export full audit report to formatted JSON
 */
export function exportAuditToJson(auditData, websiteUrl = 'website') {
  let domain = 'website';
  try {
    domain = new URL(websiteUrl).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
  } catch (e) {
    domain = String(websiteUrl).replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    generator: 'siteglow-ai Autonomous SEO Platform',
    version: '2.5.0-enterprise',
    audit: auditData
  };

  const jsonContent = JSON.stringify(exportPayload, null, 2);
  const filename = `seo-audit-${domain}-${new Date().toISOString().slice(0, 10)}.json`;
  downloadBlob(jsonContent, filename, 'application/json;charset=utf-8;');
}

/**
 * Export audit summary to Markdown
 */
export function exportAuditToMarkdown(auditData, issues = []) {
  const url = auditData.website_url || auditData.websiteUrl || 'https://example.com';
  let domain = 'website';
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    domain = url;
  }

  const overall = auditData.seo_score ?? auditData.overallScore ?? auditData.score ?? 0;
  const tech = auditData.technical_score ?? auditData.technicalScore ?? 'N/A';
  const onPage = auditData.onpage_score ?? auditData.onPageScore ?? 'N/A';
  const content = auditData.content_score ?? auditData.contentScore ?? 'N/A';
  const perf = auditData.performance_score ?? auditData.performanceScore ?? 'N/A';
  const schema = auditData.structured_data_score ?? auditData.structuredDataScore ?? 'N/A';
  const mobile = auditData.mobile_score ?? auditData.mobileScore ?? 'N/A';
  const desktop = auditData.desktop_score ?? auditData.desktopScore ?? 'N/A';

  const criticals = issues.filter(i => (i.severity || '').toLowerCase() === 'critical');
  const highs = issues.filter(i => (i.severity || '').toLowerCase() === 'high');
  const mediums = issues.filter(i => (i.severity || '').toLowerCase() === 'medium');

  let md = `# SEO Audit Executive Report: ${domain}\n\n`;
  md += `> **Audit Target:** ${url}\n`;
  md += `> **Generated On:** ${new Date().toUTCString()}\n`;
  md += `> **Platform:** siteglow-ai Autonomous SEO Intelligence\n\n`;
  md += `## 📊 Core Performance Metrics\n\n`;
  md += `| Category | Score | Benchmark Target |\n`;
  md += `| :--- | :---: | :---: |\n`;
  md += `| **Overall SEO Score** | **${overall}/100** | 85+ |\n`;
  md += `| Mobile Performance | ${mobile}/100 | 80+ |\n`;
  md += `| Desktop Performance | ${desktop}/100 | 85+ |\n`;
  md += `| Technical SEO | ${tech}/100 | 90+ |\n`;
  md += `| On-Page SEO | ${onPage}/100 | 85+ |\n`;
  md += `| Content Quality | ${content}/100 | 80+ |\n`;
  md += `| Core Web Vitals & Speed | ${perf}/100 | 75+ |\n`;
  md += `| Structured Data & Schema | ${schema}/100 | 70+ |\n\n`;

  md += `## ⚠️ Issues Overview\n\n`;
  md += `- **Critical Vulnerabilities:** ${criticals.length}\n`;
  md += `- **High Priority Opportunities:** ${highs.length}\n`;
  md += `- **Medium Improvements:** ${mediums.length}\n`;
  md += `- **Total Issues Detected:** ${issues.length}\n\n`;

  if (criticals.length > 0) {
    md += `### 🔴 Critical Action Items\n\n`;
    criticals.forEach((iss, idx) => {
      md += `#### ${idx + 1}. ${iss.title}\n`;
      md += `- **Location:** \`${iss.page || iss.page_url || url}\`\n`;
      md += `- **Diagnosis:** ${iss.description || 'N/A'}\n`;
      md += `- **Impact:** ${iss.impact || 'High crawler penalty'}\n`;
      md += `- **Action:** ${iss.recommendation || 'Remediate immediately'}\n\n`;
      if (iss.suggestedFix || iss.suggested_fix) {
        md += `\`\`\`html\n${iss.suggestedFix || iss.suggested_fix}\n\`\`\`\n\n`;
      }
    });
  }

  if (highs.length > 0) {
    md += `### 🟠 High Priority Actions\n\n`;
    highs.forEach((iss, idx) => {
      md += `#### ${idx + 1}. ${iss.title}\n`;
      md += `- **Location:** \`${iss.page || iss.page_url || url}\`\n`;
      md += `- **Action:** ${iss.recommendation || 'Implement recommended fix'}\n\n`;
    });
  }

  md += `---\n*Report generated by siteglow-ai.*`;

  const filename = `seo-report-${domain.replace(/[^a-zA-Z0-9.-]/g, '_')}-${new Date().toISOString().slice(0, 10)}.md`;
  downloadBlob(md, filename, 'text/markdown;charset=utf-8;');
}
