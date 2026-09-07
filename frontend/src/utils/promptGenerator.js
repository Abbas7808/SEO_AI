/**
 * High-Professional AI Prompt Engineering Generator
 * Generates structured, high-converting prompts for ChatGPT, Claude, Gemini, Antigravity, and Cursor.
 */

export function generateSingleIssuePrompt({
  issue,
  websiteUrl = 'https://example.com',
  framework = 'html'
}) {
  const frameworkLabel = {
    html: 'HTML / Vanilla JavaScript',
    react: 'Next.js 14 / React (App Router & Tailwind CSS)',
    wordpress: 'WordPress PHP (functions.php & header.php)',
    shopify: 'Shopify Liquid (theme.liquid)',
    vue: 'Vue 3 / Nuxt.js'
  }[framework] || 'HTML / Next.js';

  return `### ROLE & OBJECTIVE
You are a Principal Technical SEO Architect and Staff Full-Stack Software Engineer.
I need you to fix a critical technical SEO issue identified during a comprehensive website audit.

### TARGET CONTEXT
- Target Website: ${websiteUrl}
- Issue Identified: ${issue.title}
- Severity Level: ${(issue.severity || 'high').toUpperCase()}
- Issue Category: ${issue.issue_type || 'Technical SEO'}
- Page Affected: ${issue.page_url || websiteUrl}
- Target Architecture: ${frameworkLabel}

### DETAILED DIAGNOSTIC
- Root Cause: ${issue.description || 'Defect in page structure or metadata detected.'}
- Algorithm & Search Impact: ${issue.impact || 'Demotes search visibility and lowers Google SERP click-through rates.'}
- Recommended Solution: ${issue.recommendation || 'Implement semantic markup and compliant headers.'}

### YOUR MANDATORY REQUIREMENTS
1. Write the COMPLETE, drop-in, production-ready code patch to resolve this issue 100%.
2. Do NOT use placeholder comments, ellipses (...), or pseudo-code. Supply full working code.
3. Specify the exact file path and insertion point in a standard ${frameworkLabel} project directory.
4. Verify that the solution strictly complies with Google Search Essentials, Web Vitals, and W3C standards.
5. Provide a 2-step verification check to confirm the fix using browser DevTools or Google Search Console.`;
}

export function generateMasterAllIssuesPrompt({
  audit,
  issues = [],
  framework = 'html',
  websiteUrl = 'https://example.com'
}) {
  const domain = websiteUrl ? new URL(websiteUrl).hostname : 'target-website.com';
  const frameworkLabel = {
    html: 'HTML / Vanilla JavaScript & Nginx/Apache',
    react: 'Next.js 14 / React (App Router, Tailwind CSS, TypeScript)',
    wordpress: 'WordPress PHP (functions.php, template hooks, Yoast/RankMath compatible)',
    shopify: 'Shopify Liquid (theme.liquid & schema snippets)',
    vue: 'Vue 3 / Nuxt.js'
  }[framework] || 'HTML / Next.js 14';

  const nonPassedIssues = issues.filter(i => (i.severity || '').toLowerCase() !== 'passed');
  const criticalCount = nonPassedIssues.filter(i => (i.severity || '').toLowerCase() === 'critical').length;
  const highCount = nonPassedIssues.filter(i => (i.severity || '').toLowerCase() === 'high').length;
  const mediumCount = nonPassedIssues.filter(i => (i.severity || '').toLowerCase() === 'medium').length;

  const formattedIssuesList = nonPassedIssues.map((issue, idx) => {
    return `[ISSUE #${idx + 1}] ${issue.title}
- Severity: ${(issue.severity || 'MEDIUM').toUpperCase()}
- Type: ${issue.issue_type || 'General SEO'}
- Affected URL: ${issue.page_url || websiteUrl}
- Problem Description: ${issue.description || 'Missing or broken implementation.'}
- Search Ranking Impact: ${issue.impact || 'Demotes Google search rankings.'}
- Recommended Remedy: ${issue.recommendation || 'Implement compliant markup and directives.'}
${issue.suggested_fix ? `- Reference Seed:\n${issue.suggested_fix}` : ''}`;
  }).join('\n\n');

  return `# ==============================================================================
# MASTER TECHNICAL SEO AUTO-REPAIR PROMPT (ALL ISSUES COMBINED)
# Target Domain: ${domain} (${websiteUrl})
# Framework Target: ${frameworkLabel}
# Total Issues to Resolve: ${nonPassedIssues.length} (Critical: ${criticalCount}, High: ${highCount}, Medium: ${mediumCount})
# ==============================================================================

### 1. YOUR ROLE & CONTEXT
You are a Staff Technical SEO Engineer and Senior Lead Full-Stack Architect.
I have conducted a comprehensive technical audit of my website (${websiteUrl}).
Below is the complete inventory of all ${nonPassedIssues.length} technical, on-page, structured data, and performance defects detected on the website.

Your mission is to write the COMPLETE, production-ready code patches to solve ALL ${nonPassedIssues.length} issues in one cohesive implementation for ${frameworkLabel}.

---

### 2. COMPLETE INVENTORY OF DETECTED ISSUES TO SOLVE

${formattedIssuesList || 'No outstanding issues found.'}

---

### 3. MANDATORY EXECUTION REQUIREMENTS FOR YOUR RESPONSE

1. **Zero Placeholders**: Output 100% complete, copy-paste-ready code. Do NOT write "// add rest of code here" or "...".
2. **File Hierarchy & Directory Placement**: For every fix, specify the exact filename, directory location, and where to inject the code (e.g. \`app/layout.jsx\`, \`public/robots.txt\`, \`public/sitemap.xml\`, \`theme.liquid\`, or \`functions.php\`).
3. **Framework Precision**: Tailor all solutions specifically to ${frameworkLabel}.
4. **Google Search Guidelines (2026)**:
   - Ensure all title tags and meta descriptions fit desktop (600px / 60 chars) and mobile SERP pixel constraints.
   - Ensure all Schema.org JSON-LD structured data is valid against Google's Rich Results Test.
   - Enforce proper self-referencing canonical URLs with trailing slash consistency.
   - Enforce descriptive alt attributes and Web Vitals lazy loading on images.
5. **Consolidated Implementation Plan**:
   - Provide the code organized file by file so I can easily apply the patches to my repository.
   - Conclude with a 3-step verification checklist to validate in Google Search Console and Lighthouse.

Begin your response directly with the file-by-file solution:`;
}
