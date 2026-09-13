const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

// Ignored folders during project code scanning
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'out',
  '.vscode',
  '.gemini',
  '.idea',
  'vendor',
  'coverage',
  'tmp'
]);

// Relevant web code extensions
const TARGET_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.jsx',
  '.tsx',
  '.vue',
  '.astro',
  '.php',
  '.ejs',
  '.blade.php',
  '.svelte'
]);

class LocalScannerService {
  /**
   * Validate if a path exists and contains a web codebase
   */
  static validatePath(targetPath) {
    if (!targetPath || typeof targetPath !== 'string') {
      return { valid: false, message: 'Please provide a valid directory path.' };
    }

    const resolved = path.resolve(targetPath.trim());
    if (!fs.existsSync(resolved)) {
      return { valid: false, message: `Directory does not exist: ${resolved}` };
    }

    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) {
      return { valid: false, message: `Path is a file, not a directory: ${resolved}` };
    }

    // Detect framework
    let framework = 'Static HTML / Web';
    const pkgPath = path.join(resolved, 'package.json');
    let pkg = null;
    if (fs.existsSync(pkgPath)) {
      try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps.next) framework = 'Next.js';
        else if (deps.nuxt) framework = 'Nuxt.js';
        else if (deps.astro) framework = 'Astro';
        else if (deps['@remix-run/react']) framework = 'Remix';
        else if (deps.react) framework = 'React (Vite/SPA)';
        else if (deps.vue) framework = 'Vue.js';
        else if (deps.svelte) framework = 'Svelte';
      } catch (e) {}
    } else if (fs.existsSync(path.join(resolved, 'wp-config.php')) || fs.existsSync(path.join(resolved, 'wp-content'))) {
      framework = 'WordPress / PHP';
    }

    // Count source files
    const fileList = [];
    LocalScannerService._collectFiles(resolved, resolved, fileList, 150);

    return {
      valid: true,
      resolvedPath: resolved,
      framework,
      projectName: pkg?.name || path.basename(resolved),
      fileCount: fileList.length,
      sampleFiles: fileList.slice(0, 8).map(f => f.relativePath)
    };
  }

  /**
   * Recursively collect supported files up to a limit
   */
  static _collectFiles(rootDir, currentDir, acc, limit = 150) {
    if (acc.length >= limit) return;

    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (acc.length >= limit) break;

        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
            LocalScannerService._collectFiles(rootDir, fullPath, acc, limit);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (TARGET_EXTENSIONS.has(ext)) {
            acc.push({
              fullPath,
              relativePath: path.relative(rootDir, fullPath).replace(/\\/g, '/'),
              ext
            });
          }
        }
      }
    } catch (e) {
      logger.warn(`Directory reading note at ${currentDir}: ${e.message}`);
    }
  }

  /**
   * Scan entire local project codebase
   */
  static async scanProject(targetPath, options = {}) {
    const val = LocalScannerService.validatePath(targetPath);
    if (!val.valid) {
      throw new Error(val.message);
    }

    const { targetKeyword = '', businessName = '', businessLocation = '' } = options;
    const rootDir = val.resolvedPath;
    const fileList = [];
    LocalScannerService._collectFiles(rootDir, rootDir, fileList, 120);

    if (fileList.length === 0) {
      throw new Error('No web source files (.html, .jsx, .tsx, .vue, .astro, .php) found in this folder.');
    }

    logger.info(`Starting local codebase SEO scan of ${val.projectName} (${fileList.length} files)...`);

    const allIssues = [];
    const analyzedFiles = [];

    for (const file of fileList) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf-8');
        const fileIssues = LocalScannerService._analyzeSingleFile(content, file, {
          targetKeyword,
          businessName,
          businessLocation,
          framework: val.framework
        });

        allIssues.push(...fileIssues);
        analyzedFiles.push({
          path: file.relativePath,
          fullPath: file.fullPath,
          size: content.length,
          issuesCount: fileIssues.length
        });
      } catch (err) {
        logger.warn(`Could not analyze file ${file.relativePath}: ${err.message}`);
      }
    }

    // Calculate real score from 0 to 100
    const criticals = allIssues.filter(i => i.severity === 'critical');
    const highs = allIssues.filter(i => i.severity === 'high');
    const mediums = allIssues.filter(i => i.severity === 'medium');
    const lows = allIssues.filter(i => i.severity === 'low');

    // Grounded deduction calculation
    let baseScore = 100;
    baseScore -= criticals.length * 15;
    baseScore -= highs.length * 8;
    baseScore -= mediums.length * 4;
    baseScore -= lows.length * 1.5;

    const overallScore = Math.min(Math.max(Math.round(baseScore), 18), 98);

    // Calculate category breakdowns
    const technicalScore = Math.max(20, Math.min(100, Math.round(overallScore * 1.05)));
    const onPageScore = Math.max(15, Math.min(100, Math.round(overallScore * 0.95)));
    const contentScore = Math.max(25, Math.min(100, Math.round(overallScore * 0.92)));
    const performanceScore = Math.max(40, Math.min(100, Math.round(overallScore * 1.02)));
    const structuredDataScore = allIssues.some(i => i.issue_type === 'missing_schema') ? 45 : 90;
    const socialScore = allIssues.some(i => i.issue_type === 'missing_og') ? 40 : 88;
    const localScore = businessLocation ? (allIssues.some(i => i.issue_type === 'missing_local_geo') ? 50 : 85) : 75;

    return {
      projectName: val.projectName,
      framework: val.framework,
      projectPath: rootDir,
      filesScanned: fileList.length,
      analyzedFiles,
      overallScore,
      technicalScore,
      onPageScore,
      contentScore,
      performanceScore,
      structuredDataScore,
      socialScore,
      localScore,
      issues: allIssues,
      summary: {
        critical: criticals.length,
        high: highs.length,
        medium: mediums.length,
        low: lows.length,
        total: allIssues.length
      }
    };
  }

  /**
   * Parse a single code file and extract line-level SEO issues
   */
  static _analyzeSingleFile(content, fileInfo, context) {
    const issues = [];
    const lines = content.split('\n');
    const relPath = fileInfo.relativePath;
    const isRootOrIndex = /index\.(html|jsx|tsx|astro|php|vue)|layout\.(jsx|tsx|html)|app\.(jsx|tsx)|home\.(jsx|tsx)/i.test(relPath);
    const { targetKeyword = '', businessName = 'Our Enterprise' } = context;

    // 1. Check HTML Lang attribute (in HTML files)
    if (fileInfo.ext === '.html' || fileInfo.ext === '.htm') {
      const htmlTagMatch = content.match(/<html([^>]*)>/i);
      if (htmlTagMatch && !/lang=["']/i.test(htmlTagMatch[1])) {
        const lineIdx = lines.findIndex(l => /<html/i.test(l));
        const lineNum = lineIdx !== -1 ? lineIdx + 1 : 1;
        const currentCode = lines[lineIdx] || '<html>';
        const fixedCode = currentCode.replace(/<html/i, '<html lang="en"');

        issues.push({
          issue_type: 'missing_html_lang',
          category: 'technical',
          severity: 'medium',
          title: 'Missing HTML lang Attribute',
          file_path: relPath,
          line_number: lineNum,
          code_snippet: currentCode.trim(),
          suggested_fix: fixedCode.trim(),
          code_diff: `- ${currentCode.trim()}\n+ ${fixedCode.trim()}`,
          description: `The <html> opening tag in ${relPath} does not specify a primary language.`,
          impact: 'Search engines and screen readers rely on lang to properly index, display, and pronounce content.',
          recommendation: 'Add lang="en" (or appropriate locale) to the root <html> tag.',
          antigravity_command: `/goal In ${relPath} at line ${lineNum}, add lang="en" to the <html> tag.`
        });
      }
    }

    // 2. Check Title Tag in root / template files
    if (isRootOrIndex) {
      const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
      if (!titleMatch) {
        // Missing title
        const headIdx = lines.findIndex(l => /<head/i.test(l) || /return\s*\(/i.test(l));
        const lineNum = headIdx !== -1 ? headIdx + 1 : 1;
        const proposedTitle = targetKeyword 
          ? `<title>${targetKeyword} | ${businessName}</title>`
          : `<title>${businessName} - High Performance Web Architecture</title>`;

        issues.push({
          issue_type: 'missing_title',
          category: 'onpage',
          severity: 'critical',
          title: 'Missing <title> Tag in Document',
          file_path: relPath,
          line_number: lineNum,
          code_snippet: '<!-- No <title> tag defined in file -->',
          suggested_fix: proposedTitle,
          code_diff: `+ ${proposedTitle}`,
          description: `Primary entry file ${relPath} does not define a <title> element.`,
          impact: 'The title tag is the #1 on-page SEO ranking signal and the primary link text shown on Google SERPs.',
          recommendation: 'Add a concise, keyword-rich <title> tag (between 40 and 60 characters).',
          antigravity_command: `/goal In ${relPath} at line ${lineNum}, insert the <title> tag inside <head>.`
        });
      } else {
        const titleText = titleMatch[1].trim();
        const lineIdx = lines.findIndex(l => /<title>/i.test(l));
        const lineNum = lineIdx !== -1 ? lineIdx + 1 : 1;
        const currentCode = lines[lineIdx] || `<title>${titleText}</title>`;

        if (titleText.length < 25) {
          const optimized = targetKeyword
            ? `<title>${titleText} | ${targetKeyword} - ${businessName}</title>`
            : `<title>${titleText} - Official Solutions & Guide</title>`;

          issues.push({
            issue_type: 'title_too_short',
            category: 'onpage',
            severity: 'high',
            title: 'Title Tag is Too Short',
            file_path: relPath,
            line_number: lineNum,
            code_snippet: currentCode.trim(),
            suggested_fix: optimized,
            code_diff: `- ${currentCode.trim()}\n+ ${optimized}`,
            description: `Title tag "${titleText}" is only ${titleText.length} characters (ideal: 40-60 characters).`,
            impact: 'Underutilized title tags miss out on primary search keywords and reduce click-through rates.',
            recommendation: 'Expand the title to 45-60 characters incorporating your target keyword and brand.',
            antigravity_command: `/goal In ${relPath} at line ${lineNum}, expand the <title> tag to include primary keywords.`
          });
        }
      }
    }

    // 3. Check Meta Description in root / template files
    if (isRootOrIndex) {
      const metaDescMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
      if (!metaDescMatch) {
        const headIdx = lines.findIndex(l => /<head/i.test(l) || /<title/i.test(l));
        const lineNum = headIdx !== -1 ? headIdx + 1 : 2;
        const descText = targetKeyword
          ? `Discover premium ${targetKeyword} with ${businessName}. High performance solutions tailored to your growth.`
          : `Explore modern digital solutions and services with ${businessName}. Discover reliable architecture and innovative tools today.`;
        const suggested = `<meta name="description" content="${descText}">`;

        issues.push({
          issue_type: 'missing_meta_description',
          category: 'onpage',
          severity: 'high',
          title: 'Missing Meta Description',
          file_path: relPath,
          line_number: lineNum,
          code_snippet: '<!-- No <meta name="description"> found -->',
          suggested_fix: suggested,
          code_diff: `+ ${suggested}`,
          description: `Primary page ${relPath} is missing a meta description tag.`,
          impact: 'Without a meta description, Google generates automated snippets that may be unappealing or truncated.',
          recommendation: 'Add a high-converting 130-155 character meta description.',
          antigravity_command: `/goal In ${relPath} at line ${lineNum}, add an optimized <meta name="description"> tag.`
        });
      }
    }

    // 4. Check <h1> Tag Presence & Multiples
    const h1Regex = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
    const h1Matches = [...content.matchAll(h1Regex)];

    if (isRootOrIndex && h1Matches.length === 0) {
      const mainIdx = lines.findIndex(l => /<main/i.test(l) || /<body/i.test(l) || /<div\s+className=["'][^"']*hero/i.test(l));
      const lineNum = mainIdx !== -1 ? mainIdx + 1 : 15;
      const h1Text = targetKeyword ? `${targetKeyword} & Services` : `${businessName} Web Architecture`;
      const suggestedH1 = `<h1 className="text-3xl font-extrabold tracking-tight">${h1Text}</h1>`;

      issues.push({
        issue_type: 'missing_h1',
        category: 'onpage',
        severity: 'high',
        title: 'Missing <h1> Top-Level Heading',
        file_path: relPath,
        line_number: lineNum,
        code_snippet: '<!-- No <h1> tag found in page markup -->',
        suggested_fix: suggestedH1,
        code_diff: `+ ${suggestedH1}`,
        description: `No <h1> heading was found in ${relPath}.`,
        impact: 'Search crawlers consider the <h1> tag as the primary topical anchor of your page content.',
        recommendation: 'Add a single, prominent <h1> heading matching the page intent and target keyword.',
        antigravity_command: `/goal In ${relPath} at line ${lineNum}, insert an <h1> heading with high semantic weight.`
      });
    } else if (h1Matches.length > 1) {
      // Multiple H1s detected - recommend changing secondary ones to H2
      for (let i = 1; i < h1Matches.length; i++) {
        const fullH1 = h1Matches[i][0];
        const inner = h1Matches[i][1];
        const lineIdx = lines.findIndex(l => l.includes(fullH1.slice(0, 30)));
        const lineNum = lineIdx !== -1 ? lineIdx + 1 : 20 + i;
        const currentLine = lines[lineIdx] || fullH1;
        const replacement = currentLine.replace(/<h1\b/i, '<h2').replace(/<\/h1>/i, '</h2>');

        issues.push({
          issue_type: 'multiple_h1',
          category: 'onpage',
          severity: 'medium',
          title: `Multiple <h1> Heading Detected (#${i + 1})`,
          file_path: relPath,
          line_number: lineNum,
          code_snippet: currentLine.trim(),
          suggested_fix: replacement.trim(),
          code_diff: `- ${currentLine.trim()}\n+ ${replacement.trim()}`,
          description: `Found ${h1Matches.length} <h1> tags in ${relPath}. Best practice requires exactly one primary <h1> per document.`,
          impact: 'Multiple <h1> tags dilute topical focus and disrupt document outline hierarchy for crawlers.',
          recommendation: 'Downgrade secondary <h1> tags to <h2> to maintain a clean heading hierarchy.',
          antigravity_command: `/goal In ${relPath} at line ${lineNum}, refactor secondary <h1> tag into an <h2>.`
        });
      }
    }

    // 5. Check Image Tags Missing alt Attributes
    lines.forEach((line, idx) => {
      // Find img or Image tags
      const imgMatch = line.match(/<(img|Image)\b([^>]*)>/i);
      if (imgMatch) {
        const attrs = imgMatch[2];
        const hasAlt = /\balt=["']([^"']*)["']/i.test(attrs);
        const altEmpty = /\balt=["']\s*["']/i.test(attrs);

        if (!hasAlt || altEmpty) {
          const lineNum = idx + 1;
          const currentCode = line.trim();
          const cleanTag = imgMatch[1];
          const defaultAlt = `alt="${businessName} graphic illustration"`;
          let fixedCode = '';

          if (altEmpty) {
            fixedCode = currentCode.replace(/\balt=["']\s*["']/i, defaultAlt);
          } else {
            fixedCode = currentCode.replace(new RegExp(`<${cleanTag}\\b`, 'i'), `<${cleanTag} ${defaultAlt}`);
          }

          issues.push({
            issue_type: 'image_missing_alt',
            category: 'technical',
            severity: 'high',
            title: 'Image Missing alt Attribute',
            file_path: relPath,
            line_number: lineNum,
            code_snippet: currentCode,
            suggested_fix: fixedCode,
            code_diff: `- ${currentCode}\n+ ${fixedCode}`,
            description: `Image in ${relPath} at line ${lineNum} lacks descriptive alt text.`,
            impact: 'Search engines use alt attributes for image indexing, and accessibility screen readers require them.',
            recommendation: 'Add a concise, descriptive alt attribute describing the image context.',
            antigravity_command: `/goal In ${relPath} at line ${lineNum}, add a descriptive alt attribute to the <${cleanTag}> element.`
          });
        }
      }
    });

    // 6. Check Insecure HTTP Links
    lines.forEach((line, idx) => {
      if (/href=["']http:\/\//i.test(line) && !/localhost|127\.0\.0\.1/i.test(line)) {
        const lineNum = idx + 1;
        const currentCode = line.trim();
        const fixedCode = currentCode.replace(/href=["']http:\/\//gi, 'href="https://');

        issues.push({
          issue_type: 'insecure_http_link',
          category: 'technical',
          severity: 'medium',
          title: 'Hardcoded Insecure HTTP Link',
          file_path: relPath,
          line_number: lineNum,
          code_snippet: currentCode,
          suggested_fix: fixedCode,
          code_diff: `- ${currentCode}\n+ ${fixedCode}`,
          description: `Found an unencrypted http:// link at line ${lineNum} in ${relPath}.`,
          impact: 'Linking to insecure HTTP URLs can trigger mixed-content browser warnings and leak referrer data.',
          recommendation: 'Update links to use secure HTTPS protocol.',
          antigravity_command: `/goal In ${relPath} at line ${lineNum}, replace http:// with https://.`
        });
      }
    });

    // 7. Check OpenGraph Social Tags (in root/index templates)
    if (isRootOrIndex && !content.includes('og:title') && !content.includes('property="og:')) {
      const headIdx = lines.findIndex(l => /<head/i.test(l) || /<title/i.test(l));
      const lineNum = headIdx !== -1 ? headIdx + 2 : 5;
      const ogSnippet = `<meta property="og:title" content="${businessName}">\n<meta property="og:description" content="Discover modern web solutions with ${businessName}.">\n<meta property="og:type" content="website">`;

      issues.push({
        issue_type: 'missing_og',
        category: 'social',
        severity: 'medium',
        title: 'Missing Open Graph Social Metadata',
        file_path: relPath,
        line_number: lineNum,
        code_snippet: '<!-- No Open Graph tags found in document head -->',
        suggested_fix: ogSnippet,
        code_diff: `+ ${ogSnippet.split('\n').join('\n+ ')}`,
        description: `No Open Graph (og:title, og:description, og:type) tags found in ${relPath}.`,
        impact: 'Social media platforms (LinkedIn, Facebook, Slack, X) will display raw or broken link previews.',
        recommendation: 'Add Open Graph meta tags to control social card previews.',
        antigravity_command: `/goal In ${relPath} at line ${lineNum}, add Open Graph tags (og:title, og:description, og:type).`
      });
    }

    // 8. Check Schema.org JSON-LD Structured Data
    if (isRootOrIndex && !content.includes('application/ld+json')) {
      const headIdx = lines.findIndex(l => /<\/head/i.test(l) || /<\/body/i.test(l));
      const lineNum = headIdx !== -1 ? headIdx + 1 : lines.length;
      const schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': businessName,
        'url': 'https://example.com',
        'description': `Official website of ${businessName}.`
      };
      const schemaSnippet = `<script type="application/ld+json">\n${JSON.stringify(schemaJson, null, 2)}\n</script>`;

      issues.push({
        issue_type: 'missing_schema',
        category: 'structured_data',
        severity: 'medium',
        title: 'Missing Schema.org JSON-LD Structured Data',
        file_path: relPath,
        line_number: lineNum,
        code_snippet: '<!-- No JSON-LD structured data script found in codebase -->',
        suggested_fix: schemaSnippet,
        code_diff: `+ ${schemaSnippet.split('\n').join('\n+ ')}`,
        description: `No Schema.org structured data was found in ${relPath}.`,
        impact: 'Structured data enables rich Google search results (breadcrumbs, site name, knowledge graph cards).',
        recommendation: 'Add a valid JSON-LD script defining Organization or WebSite schema.',
        antigravity_command: `/goal In ${relPath} at line ${lineNum}, embed Schema.org JSON-LD structured data.`
      });
    }

    return issues;
  }
}

module.exports = LocalScannerService;
