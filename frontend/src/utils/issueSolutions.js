/**
 * Website Issue Resolution & Fix Engine
 * 
 * Provides comprehensive, production-ready explanations and direct code solutions
 * for every technical and on-page SEO issue detected on the website.
 * No external prompts required — delivers direct, actionable fixes.
 */

export function getIssueSolution(issue, websiteUrl = 'https://example.com') {
  let hostname = 'your-website.com';
  try {
    hostname = new URL(websiteUrl).hostname;
  } catch (e) {}

  const brandName = hostname.replace(/^www\./, '').split('.')[0];
  const capitalizedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1);
  const targetUrl = issue.page_url || issue.pageUrl || websiteUrl;

  const type = (issue.issue_type || issue.issueType || issue.type || '').toLowerCase();
  const title = (issue.title || '').toLowerCase();

  // 1. Missing Viewport (Mobile Critical)
  if (type.includes('viewport') || title.includes('viewport')) {
    return {
      category: 'Mobile SEO',
      deviceTarget: 'Mobile',
      diagnosis: 'The page lacks a <meta name="viewport"> tag in the HTML head. Without this declaration, mobile browsers render the page at a default desktop width (typically 980px), forcing users to pinch, zoom, and horizontally scroll.',
      impact: 'Fails Google Mobile-Friendly test immediately. Since Google operates on Mobile-First Indexing, your website will suffer severe ranking penalties across both mobile and desktop search results.',
      steps: [
        'Open your global HTML layout or header template (e.g. index.html, _document.js, or header.php).',
        'Locate the <head> tag near the top of the file.',
        'Insert the standard responsive viewport meta tag inside the <head> block.',
        'Ensure no CSS styles set fixed widths like width: 1200px on the body or wrapper elements.'
      ],
      codeFixes: {
        html: `<!-- Add inside <head> -->\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />`,
        react: `// In Next.js 14 App Router (layout.jsx or page.jsx)\nexport const viewport = {\n  width: 'device-width',\n  initialScale: 1,\n  maximumScale: 5,\n};\n\n// Or in standard React Helmet / HTML head:\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
        wordpress: `// In functions.php (or directly in header.php inside <head>):\nfunction add_mobile_viewport() {\n  echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">' . "\\n";\n}\nadd_action('wp_head', 'add_mobile_viewport', 1);`
      },
      verification: [
        'Open Chrome DevTools (F12) and toggle Device Toolbar (Ctrl+Shift+M).',
        'Select iPhone 14 or Pixel 7 to confirm the page layout dynamically scales to screen width without horizontal scrollbars.'
      ],
      scoreBoost: 15
    };
  }

  // 2. Insecure HTTP (Protocol)
  if (type.includes('http') || title.includes('insecure') || title.includes('https')) {
    return {
      category: 'Technical SEO',
      deviceTarget: 'Both',
      diagnosis: 'The website is served over unencrypted HTTP or allows unencrypted HTTP connections without automatically redirecting to HTTPS.',
      impact: 'Google Chrome and modern browsers display a prominent "Not Secure" warning in the address bar. HTTPS is an official Google Page Experience ranking signal.',
      steps: [
        'Ensure an SSL/TLS certificate (e.g. Free Let\'s Encrypt or Cloudflare) is active on your domain.',
        'Configure your web server (Nginx, Apache, or Cloudflare) to permanently redirect (301) all HTTP traffic to HTTPS.',
        'Update all internal links and asset references (images, CSS, JS) from http:// to https:// to prevent mixed-content warnings.'
      ],
      codeFixes: {
        html: `<!-- Nginx Server Configuration (/etc/nginx/sites-available/default) -->\nserver {\n    listen 80;\n    server_name ${hostname} www.${hostname};\n    return 301 https://$host$request_uri;\n}`,
        react: `// In Next.js (next.config.js) or Node.js server middleware:\n// Redirect HTTP to HTTPS in Express:\napp.use((req, res, next) => {\n  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {\n    res.redirect(301, \`https://\${req.header('host')}\${req.url}\`);\n  } else {\n    next();\n  }\n});`,
        wordpress: `// In .htaccess (Apache) before WordPress rewrite rules:\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`
      },
      verification: [
        `Run: curl -I http://${hostname}`,
        'Verify the server returns HTTP/1.1 301 Moved Permanently with a Location: https:// header.'
      ],
      scoreBoost: 12
    };
  }

  // 3. Missing H1 (On-Page Critical)
  if (type.includes('h1') || title.includes('h1')) {
    return {
      category: 'On-Page SEO',
      deviceTarget: 'Both',
      diagnosis: 'The webpage has no top-level <h1> heading tag in the document body, or contains multiple conflicting H1 tags.',
      impact: 'Google RankBrain and crawler algorithms use the primary H1 as the core semantic anchor for topical relevance. Without an H1, the algorithm has to guess the main topic of your page.',
      steps: [
        'Identify the primary focus keyword and central value proposition of this page.',
        'Ensure there is exactly ONE <h1> element located in the above-the-fold hero or title area.',
        'Use <h2> for main subheadings and <h3> for nested subtopics to maintain strict heading hierarchy.'
      ],
      codeFixes: {
        html: `<header class="hero-section">\n  <h1>${capitalizedBrand} &mdash; Official Web Platform & Solutions</h1>\n  <p class="hero-subtitle">Empowering digital operations with verified performance and modern architecture.</p>\n</header>`,
        react: `// In your Hero or Page Component\nexport default function HeroSection() {\n  return (\n    <header className="py-12 px-6">\n      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">\n        ${capitalizedBrand} &mdash; Official Web Platform & Solutions\n      </h1>\n      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">\n        Empowering digital operations with verified performance and modern architecture.\n      </p>\n    </header>\n  );\n}`,
        wordpress: `<!-- In single.php or page.php template -->\n<header class="entry-header">\n  <h1 class="entry-title"><?php the_title(); ?> &mdash; <?php bloginfo('name'); ?></h1>\n</header>`
      },
      verification: [
        'Open DevTools Console on the live page and run: document.querySelectorAll("h1").length',
        'Verify the result returns exactly 1.'
      ],
      scoreBoost: 10
    };
  }

  // 4. Missing or Suboptimal Meta Description
  if (type.includes('meta_description') || title.includes('meta description') || title.includes('description')) {
    return {
      category: 'On-Page & SERP',
      deviceTarget: 'Both',
      diagnosis: 'The page is missing a <meta name="description"> tag or the current description is outside the recommended 120-160 character range.',
      impact: 'Search engines will automatically extract arbitrary text snippets from page content, often showing navigation menus or cookie disclaimers. This significantly reduces Organic Click-Through Rate (CTR).',
      steps: [
        'Draft an action-oriented summary between 135 and 155 characters.',
        'Incorporate your primary keyword and a clear Call To Action (e.g. "Explore our solutions today.").',
        'Insert the meta tag inside the <head> tag of the document.'
      ],
      codeFixes: {
        html: `<meta name="description" content="Explore ${capitalizedBrand}'s cutting-edge digital platform. Discover verified solutions, automated tools, and expert services designed for measurable growth." />`,
        react: `// In Next.js 14 App Router (layout.jsx or page.jsx)\nexport const metadata = {\n  title: '${capitalizedBrand} | Official Platform',\n  description: 'Explore ${capitalizedBrand}\\'s cutting-edge digital platform. Discover verified solutions, automated tools, and expert services designed for measurable growth.',\n};`,
        wordpress: `// In functions.php (if not using an SEO plugin):\nfunction custom_seo_meta_desc() {\n  if (is_front_page()) {\n    echo '<meta name="description" content="Explore ' . esc_attr(get_bloginfo('name')) . ' digital solutions, automated auditing, and expert services designed for growth." />' . "\\n";\n  }\n}\nadd_action('wp_head', 'custom_seo_meta_desc', 1);`
      },
      verification: [
        'Inspect the live page source: View Source > search for <meta name="description".',
        'Check character count: ensure it is between 120 and 160 characters to prevent SERP truncation.'
      ],
      scoreBoost: 8
    };
  }

  // 5. Title Tag Issues
  if (type.includes('title') || title.includes('title tag')) {
    return {
      category: 'On-Page & SERP',
      deviceTarget: 'Both',
      diagnosis: 'The page is missing a <title> tag, or the title is too short (<30 chars) or exceeds the Google pixel display boundary (>60 chars).',
      impact: 'Title tags are the #1 direct on-page ranking and clickability factor. Titles that are cut off with ellipses (...) reduce user trust and organic CTR.',
      steps: [
        'Formulate a title between 50 and 60 characters with your main keyword placed near the front.',
        'Follow standard high-CTR format: Primary Keyword - Secondary Keyword | Brand Name.',
        'Place the <title> tag within the <head> section of every unique page.'
      ],
      codeFixes: {
        html: `<title>${capitalizedBrand} &bull; Premier Web Optimization & Digital Solutions</title>`,
        react: `// In Next.js 14 App Router:\nexport const metadata = {\n  title: {\n    default: '${capitalizedBrand} • Premier Web Solutions',\n    template: '%s | ${capitalizedBrand}'\n  }\n};`,
        wordpress: `// In functions.php ensure theme supports title tag:\nadd_theme_support('title-tag');\n// Or customize with wp_title filter.`
      },
      verification: [
        'Check the browser tab text to ensure your title appears correctly.',
        'Verify document.title.length in the DevTools console is between 50 and 60.'
      ],
      scoreBoost: 12
    };
  }

  // 6. Missing Alt Text on Images
  if (type.includes('alt') || title.includes('alt text') || title.includes('image')) {
    return {
      category: 'Content & Accessibility',
      deviceTarget: 'Both',
      diagnosis: 'One or more <img> elements lack descriptive alt attributes or have empty alt="" on informative imagery.',
      impact: 'Deprives your website of Google Image Search traffic and fails WCAG 2.1 accessibility standards, alienating visually impaired users using screen readers.',
      steps: [
        'Audit all images rendered across the page.',
        'Add concise, contextually accurate alt text describing the content or function of each image.',
        'Add loading="lazy" and decoding="async" to images below the fold to improve Core Web Vitals speed.'
      ],
      codeFixes: {
        html: `<!-- Standard HTML with Alt & Lazy Loading -->\n<img src="/assets/hero-banner.webp" \n     alt="${capitalizedBrand} enterprise platform interface displaying real-time metrics" \n     width="1200" height="630" \n     loading="lazy" decoding="async" />`,
        react: `// In Next.js Image component\nimport Image from 'next/image';\n\n<Image\n  src="/assets/hero-banner.webp"\n  alt="${capitalizedBrand} enterprise platform interface displaying real-time metrics"\n  width={1200}\n  height={630}\n  loading="lazy"\n/>`,
        wordpress: `// In WordPress, always supply Alt text when uploading via Media Library.\n// Or in PHP template:\nthe_post_thumbnail('large', array(\n  'alt' => the_title_attribute(array('echo' => false)) . ' - ' . get_bloginfo('name'),\n  'loading' => 'lazy'\n));`
      },
      verification: [
        'Run in DevTools Console: document.querySelectorAll("img:not([alt])").length',
        'Ensure the result is 0.'
      ],
      scoreBoost: 8
    };
  }

  // 7. Missing Schema.org Structured Data
  if (type.includes('schema') || title.includes('schema') || title.includes('structured data') || title.includes('json-ld')) {
    const schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': capitalizedBrand,
      'url': targetUrl,
      'logo': `${targetUrl}/logo.png`,
      'description': `${capitalizedBrand} provides enterprise-grade digital systems and verified web solutions.`,
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'customer support',
        'telephone': '+1-800-555-0199'
      }
    };

    return {
      category: 'Structured Data',
      deviceTarget: 'Both',
      diagnosis: 'No Schema.org JSON-LD structured data detected. Search engines cannot unambiguously understand your entity type, brand name, or services.',
      impact: 'Ineligible for Google Rich Results, Knowledge Graph panels, sitelinks search boxes, and FAQ rich snippets in SERP.',
      steps: [
        'Construct a valid JSON-LD schema describing your Organization or WebSite entity.',
        'Place the script inside the <head> or at the bottom of the <body>.',
        'Validate the output with Google\'s Rich Results Test tool.'
      ],
      codeFixes: {
        html: `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>`,
        react: `// In Next.js 14 App Router layout.jsx:\nexport default function RootLayout({ children }) {\n  const jsonLd = ${JSON.stringify(schemaObj, null, 2)};\n  return (\n    <html lang="en">\n      <head>\n        <script\n          type="application/ld+json"\n          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}\n        />\n      </head>\n      <body>{children}</body>\n    </html>\n  );\n}`,
        wordpress: `// In functions.php:\nfunction inject_organization_schema() {\n  $schema = ${JSON.stringify(schemaObj, null, 2)};\n  echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>' . "\\n";\n}\nadd_action('wp_head', 'inject_organization_schema');`
      },
      verification: [
        'Test your URL in the Google Rich Results Test (https://search.google.com/test/rich-results).',
        'Confirm valid Organization markup with 0 errors.'
      ],
      scoreBoost: 10
    };
  }

  // 8. Missing Canonical Tag
  if (type.includes('canonical') || title.includes('canonical')) {
    return {
      category: 'Technical SEO',
      deviceTarget: 'Desktop & Mobile',
      diagnosis: 'The page does not declare a rel="canonical" link tag pointing to its authoritative URL.',
      impact: 'Leaves your site vulnerable to duplicate content penalties when URL parameters, tracking queries (?utm_source), or HTTP/HTTPS variants exist.',
      steps: [
        'Identify the canonical URL for each page (including https:// and clean trailing slash).',
        'Add a <link rel="canonical" href="..."> tag to the <head> section.',
        'Ensure self-referencing canonicals are consistent across all page templates.'
      ],
      codeFixes: {
        html: `<link rel="canonical" href="${targetUrl}" />`,
        react: `// In Next.js 14 App Router metadata:\nexport const metadata = {\n  alternates: {\n    canonical: '${targetUrl}',\n  },\n};`,
        wordpress: `// In header.php inside <head>:\n<link rel="canonical" href="<?php echo esc_url(get_permalink()); ?>" />`
      },
      verification: [
        'View page source and verify <link rel="canonical" exists and points to the exact intended URL with HTTPS.'
      ],
      scoreBoost: 7
    };
  }

  // 9. Slow Performance / Response Time
  if (type.includes('perf') || type.includes('speed') || type.includes('response_time') || title.includes('slow') || title.includes('response time')) {
    return {
      category: 'Performance & Speed',
      deviceTarget: 'Both',
      diagnosis: 'Server response time or document download latency exceeds optimal Core Web Vitals thresholds (>1200ms).',
      impact: 'High bounce rates, poor mobile user experience, and demoted Google Page Experience rankings.',
      steps: [
        'Enable Gzip or Brotli compression on your web server.',
        'Implement server-side page caching or Redis object caching.',
        'Put your website behind a Global Content Delivery Network (CDN) like Cloudflare.'
      ],
      codeFixes: {
        html: `# Nginx Gzip Compression Config (/etc/nginx/conf.d/gzip.conf)\ngzip on;\ngzip_vary on;\ngzip_min_length 1024;\ngzip_proxied any;\ngzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;`,
        react: `// In next.config.js enable compression & image optimization:\nmodule.exports = {\n  compress: true,\n  images: {\n    formats: ['image/avif', 'image/webp'],\n    minimumCacheTTL: 60,\n  },\n};`,
        wordpress: `// In .htaccess enable browser caching headers:\n<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresByType image/webp "access plus 1 year"\n  ExpiresByType text/css "access plus 1 month"\n  ExpiresByType application/javascript "access plus 1 month"\n</IfModule>`
      },
      verification: [
        'Test response time using curl: curl -o /dev/null -s -w "Total Time: %{time_total}s\\n" ' + targetUrl,
        'Confirm response time is under 1.0s.'
      ],
      scoreBoost: 14
    };
  }

  // Default fallback for any other issue
  return {
    category: 'Technical Optimization',
    deviceTarget: 'Both',
    diagnosis: issue.description || 'Defect detected in webpage structure, headers, or technical configuration.',
    impact: issue.impact || 'Search engine crawlers and users experience suboptimal indexing or navigation.',
    steps: [
      'Locate the affected template or server configuration file.',
      'Apply the recommended standards-compliant fix described below.',
      'Clear website and CDN caches, then re-test with browser DevTools.'
    ],
    codeFixes: {
      html: `<!-- Apply recommended fix in your HTML template -->\n<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`,
      react: `// In your component or page metadata export:\nexport const metadata = {\n  robots: {\n    index: true,\n    follow: true,\n  },\n};`,
      wordpress: `// In functions.php:\nadd_action('wp_head', function() {\n  echo '<meta name="robots" content="index, follow" />' . "\\n";\n});`
    },
    verification: [
      'Inspect the live rendered DOM in DevTools Elements tab.',
      'Verify the tag or element is present and free of syntax errors.'
    ],
    scoreBoost: 6
  };
}
