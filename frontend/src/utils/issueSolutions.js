/**
 * Website Issue Resolution & Fix Engine
 * 
 * Provides comprehensive, production-ready explanations, before/after diffs,
 * and multi-framework code solutions (HTML5, Next.js/React, Vue 3, WordPress/PHP)
 * for every technical and on-page SEO issue detected on the website.
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
      originalCode: `<!-- Existing <head> lacking responsive viewport declaration -->\n<head>\n  <meta charset="utf-8" />\n  <title>${capitalizedBrand}</title>\n</head>`,
      steps: [
        'Open your global HTML layout or header template (e.g. index.html, _document.js, or header.php).',
        'Locate the <head> tag near the top of the file.',
        'Insert the standard responsive viewport meta tag inside the <head> block.',
        'Ensure no CSS styles set fixed widths like width: 1200px on the body or wrapper elements.'
      ],
      codeFixes: {
        html: `<!-- Add inside <head> -->\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />`,
        react: `// In Next.js 14 App Router (layout.jsx or page.jsx)\nexport const viewport = {\n  width: 'device-width',\n  initialScale: 1,\n  maximumScale: 5,\n};\n\n// Or in standard React Helmet:\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
        vue: `<!-- In Nuxt 3 (nuxt.config.ts) or Vue 3 useHead -->\nuseHead({\n  meta: [\n    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0' }\n  ]\n});`,
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
      originalCode: `# Insecure HTTP server configuration\nserver {\n    listen 80;\n    server_name ${hostname};\n    # Missing automatic 301 redirect to HTTPS\n}`,
      steps: [
        'Ensure an SSL/TLS certificate (e.g. Free Let\'s Encrypt or Cloudflare) is active on your domain.',
        'Configure your web server (Nginx, Apache, or Cloudflare) to permanently redirect (301) all HTTP traffic to HTTPS.',
        'Update all internal links and asset references (images, CSS, JS) from http:// to https:// to prevent mixed-content warnings.'
      ],
      codeFixes: {
        html: `<!-- Nginx Server Configuration (/etc/nginx/sites-available/default) -->\nserver {\n    listen 80;\n    server_name ${hostname} www.${hostname};\n    return 301 https://$host$request_uri;\n}`,
        react: `// In Express / Node.js backend middleware:\napp.use((req, res, next) => {\n  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {\n    res.redirect(301, \`https://\${req.header('host')}\${req.url}\`);\n  } else {\n    next();\n  }\n});`,
        vue: `// In Nuxt 3 server middleware (server/middleware/https.ts):\nexport default defineEventHandler((event) => {\n  const req = event.node.req;\n  const proto = req.headers['x-forwarded-proto'];\n  if (proto && proto !== 'https' && process.env.NODE_ENV === 'production') {\n    return sendRedirect(event, \`https://\${req.headers.host}\${req.url}\`, 301);\n  }\n});`,
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
      originalCode: `<!-- Current DOM: No <h1> found in <body> -->\n<header class="hero-section">\n  <p class="site-headline">Welcome to ${capitalizedBrand}</p>\n</header>`,
      steps: [
        'Identify the primary focus keyword and central value proposition of this page.',
        'Ensure there is exactly ONE <h1> element located in the above-the-fold hero or title area.',
        'Use <h2> for main subheadings and <h3> for nested subtopics to maintain strict heading hierarchy.'
      ],
      codeFixes: {
        html: `<header class="hero-section">\n  <h1>${capitalizedBrand} &mdash; Official Web Platform & Solutions</h1>\n  <p class="hero-subtitle">Empowering digital operations with verified performance and modern architecture.</p>\n</header>`,
        react: `// In your Hero or Page Component\nexport default function HeroSection() {\n  return (\n    <header className="py-12 px-6">\n      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">\n        ${capitalizedBrand} &mdash; Official Web Platform & Solutions\n      </h1>\n      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">\n        Empowering digital operations with verified performance and modern architecture.\n      </p>\n    </header>\n  );\n}`,
        vue: `<!-- In Vue 3 Single File Component (Hero.vue) -->\n<template>\n  <header class="py-12 px-6">\n    <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white">\n      ${capitalizedBrand} &mdash; Official Web Platform & Solutions\n    </h1>\n    <p class="mt-4 text-lg text-slate-600">Empowering digital operations with verified performance.</p>\n  </header>\n</template>`,
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
      originalCode: `<!-- Missing <meta name="description"> in document <head> -->\n<head>\n  <title>${capitalizedBrand} - Official Site</title>\n</head>`,
      steps: [
        'Draft an action-oriented summary between 135 and 155 characters.',
        'Incorporate your primary keyword and a clear Call To Action (e.g. "Explore our solutions today.").',
        'Insert the meta tag inside the <head> tag of the document.'
      ],
      codeFixes: {
        html: `<meta name="description" content="Explore ${capitalizedBrand}'s cutting-edge digital platform. Discover verified solutions, automated tools, and expert services designed for measurable growth." />`,
        react: `// In Next.js 14 App Router (layout.jsx or page.jsx)\nexport const metadata = {\n  title: '${capitalizedBrand} | Official Platform',\n  description: 'Explore ${capitalizedBrand}\\'s cutting-edge digital platform. Discover verified solutions, automated tools, and expert services designed for measurable growth.',\n};`,
        vue: `// In Nuxt 3 useSeoMeta\nuseSeoMeta({\n  description: "Explore ${capitalizedBrand}'s cutting-edge digital platform. Discover verified solutions and expert services.",\n  ogDescription: "Explore ${capitalizedBrand}'s cutting-edge digital platform."\n});`,
        wordpress: `// In functions.php:\nfunction custom_seo_meta_desc() {\n  if (is_front_page()) {\n    echo '<meta name="description" content="Explore ' . esc_attr(get_bloginfo('name')) . ' digital solutions, automated auditing, and expert services designed for growth." />' . "\\n";\n  }\n}\nadd_action('wp_head', 'custom_seo_meta_desc', 1);`
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
      originalCode: `<!-- Missing or non-descriptive title tag -->\n<title>Home</title>`,
      steps: [
        'Formulate a title between 50 and 60 characters with your main keyword placed near the front.',
        'Follow standard high-CTR format: Primary Keyword - Secondary Keyword | Brand Name.',
        'Place the <title> tag within the <head> section of every unique page.'
      ],
      codeFixes: {
        html: `<title>${capitalizedBrand} &bull; Premier Web Optimization & Digital Solutions</title>`,
        react: `// In Next.js 14 App Router:\nexport const metadata = {\n  title: {\n    default: '${capitalizedBrand} • Premier Web Solutions',\n    template: '%s | ${capitalizedBrand}'\n  }\n};`,
        vue: `// In Nuxt 3 useHead\nuseHead({\n  title: '${capitalizedBrand} • Premier Web Optimization & Digital Solutions'\n});`,
        wordpress: `// In functions.php ensure theme supports title tag:\nadd_theme_support('title-tag');`
      },
      verification: [
        'Hover over the browser tab to confirm the full title displays cleanly.',
        'Run document.title.length in console: ensure length is between 50 and 60 characters.'
      ],
      scoreBoost: 12
    };
  }

  // 6. Image Missing Alt Attributes
  if (type.includes('alt') || title.includes('alt attribute') || title.includes('missing alt')) {
    return {
      category: 'Content & Accessibility',
      deviceTarget: 'Both',
      diagnosis: 'One or more <img> elements on this page lack descriptive alt attributes or have empty alt="" tags on non-decorative images.',
      impact: 'Damages web accessibility (WCAG 2.1 compliance) for vision-impaired users and prevents your images from ranking in Google Image Search.',
      originalCode: `<!-- Images without alt or dimensions -->\n<img src="/assets/hero-banner.jpg" />\n<img src="/assets/feature.png" />`,
      steps: [
        'Locate each <img> element identified in the audit report.',
        'Write a clear, concise description (5-12 words) explaining what the image shows.',
        'Include width and height attributes to prevent Cumulative Layout Shift (CLS).'
      ],
      codeFixes: {
        html: `<!-- Optimized responsive image with contextual alt & CLS dimensions -->\n<img \n  src="/assets/hero-banner.webp" \n  alt="${capitalizedBrand} enterprise cloud analytics dashboard displaying real-time SEO metrics" \n  width="1200" \n  height="630" \n  loading="lazy" \n  decoding="async" \n/>`,
        react: `// In Next.js with next/image:\nimport Image from 'next/image';\n\n<Image \n  src="/assets/hero-banner.webp"\n  alt="${capitalizedBrand} enterprise cloud analytics dashboard"\n  width={1200}\n  height={630}\n  loading="lazy"\n/>`,
        vue: `<!-- In Vue 3 template -->\n<img \n  src="/assets/hero-banner.webp"\n  :alt="'${capitalizedBrand} enterprise platform showcase'"\n  width="1200"\n  height="630"\n  loading="lazy"\n/>`,
        wordpress: `// In WordPress PHP templates:\nthe_post_thumbnail('large', array(\n  'alt' => the_title_attribute(array('echo' => false)) . ' - ${capitalizedBrand}',\n  'loading' => 'lazy'\n));`
      },
      verification: [
        'Open DevTools Console and run: document.querySelectorAll("img:not([alt])").length',
        'Verify the result returns 0.'
      ],
      scoreBoost: 8
    };
  }

  // 7. Missing Structured Data (Schema.org JSON-LD)
  if (type.includes('schema') || title.includes('structured data') || title.includes('json-ld')) {
    const schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': capitalizedBrand,
      'url': targetUrl,
      'description': `Premier digital optimization and technical solutions platform for ${capitalizedBrand}.`,
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+1-800-555-0199',
        'contactType': 'customer support'
      }
    };

    return {
      category: 'Structured Data',
      deviceTarget: 'Both',
      diagnosis: 'The page does not contain Schema.org JSON-LD structured data markup. Search engines only see unstructured HTML text.',
      impact: 'Forfeits Google Rich Snippets (star ratings, brand logos, breadcrumb trails, FAQ accordions), resulting in smaller, less eye-catching search listings.',
      originalCode: `<!-- Document lacks structured data script -->\n<body>\n  <header>...</header>\n</body>`,
      steps: [
        'Select the appropriate schema type (Organization, LocalBusiness, WebSite, or Article).',
        'Generate valid JSON-LD code describing your brand, logo, and contact points.',
        'Embed the script tag inside the <head> or at the bottom of the <body> section.'
      ],
      codeFixes: {
        html: `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>`,
        react: `// In Next.js 14 App Router layout.jsx:\nexport default function RootLayout({ children }) {\n  const jsonLd = ${JSON.stringify(schemaObj, null, 2)};\n  return (\n    <html lang="en">\n      <head>\n        <script\n          type="application/ld+json"\n          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}\n        />\n      </head>\n      <body>{children}</body>\n    </html>\n  );\n}`,
        vue: `// In Nuxt 3 useHead script injection\nuseHead({\n  script: [\n    {\n      type: 'application/ld+json',\n      children: JSON.stringify(${JSON.stringify(schemaObj)})\n    }\n  ]\n});`,
        wordpress: `// In functions.php:\nfunction inject_organization_schema() {\n  $schema = ${JSON.stringify(schemaObj, null, 2)};\n  echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>' . "\\n";\n}\nadd_action('wp_head', 'inject_organization_schema');`
      },
      verification: [
        'Test your URL in Google Rich Results Test (https://search.google.com/test/rich-results).',
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
      originalCode: `<!-- Missing canonical link declaration -->\n<head>\n  <title>${capitalizedBrand}</title>\n</head>`,
      steps: [
        'Identify the canonical URL for each page (including https:// and clean trailing slash).',
        'Add a <link rel="canonical" href="..."> tag to the <head> section.',
        'Ensure self-referencing canonicals are consistent across all page templates.'
      ],
      codeFixes: {
        html: `<link rel="canonical" href="${targetUrl}" />`,
        react: `// In Next.js 14 App Router metadata:\nexport const metadata = {\n  alternates: {\n    canonical: '${targetUrl}',\n  },\n};`,
        vue: `// In Nuxt 3 useHead link array\nuseHead({\n  link: [\n    { rel: 'canonical', href: '${targetUrl}' }\n  ]\n});`,
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
      originalCode: `# Uncompressed server output\ngzip off;\n# No asset caching headers configured`,
      steps: [
        'Enable Gzip or Brotli compression on your web server.',
        'Implement server-side page caching or Redis object caching.',
        'Put your website behind a Global Content Delivery Network (CDN) like Cloudflare.'
      ],
      codeFixes: {
        html: `# Nginx Gzip Compression Config (/etc/nginx/conf.d/gzip.conf)\ngzip on;\ngzip_vary on;\ngzip_min_length 1024;\ngzip_proxied any;\ngzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;`,
        react: `// In next.config.js enable compression & image optimization:\nmodule.exports = {\n  compress: true,\n  images: {\n    formats: ['image/avif', 'image/webp'],\n    minimumCacheTTL: 60,\n  },\n};`,
        vue: `// In nuxt.config.ts\nexport default defineNuxtConfig({\n  nitro: {\n    compressPublicAssets: true,\n  },\n});`,
        wordpress: `// In .htaccess enable browser caching headers:\n<IfModule mod_expires.c>\n  ExpiresActive On\n  ExpiresByType image/webp "access plus 1 year"\n  ExpiresByType text/css "access plus 1 month"\n  ExpiresByType application/javascript "access plus 1 month"\n</IfModule>`
      },
      verification: [
        `Test response time using curl: curl -o /dev/null -s -w "Total Time: %{time_total}s\\n" ${targetUrl}`,
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
    originalCode: `<!-- Current code requires standard SEO hardening -->`,
    steps: [
      'Locate the affected template or server configuration file.',
      'Apply the recommended standards-compliant fix described below.',
      'Clear website and CDN caches, then re-test with browser DevTools.'
    ],
    codeFixes: {
      html: `<!-- Apply recommended fix in your HTML template -->\n<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`,
      react: `// In your component or page metadata export:\nexport const metadata = {\n  robots: {\n    index: true,\n    follow: true,\n  },\n};`,
      vue: `// In Vue 3 / Nuxt 3 useHead\nuseHead({\n  meta: [{ name: 'robots', content: 'index, follow' }]\n});`,
      wordpress: `// In functions.php:\nadd_action('wp_head', function() {\n  echo '<meta name="robots" content="index, follow" />' . "\\n";\n});`
    },
    verification: [
      'Inspect the live rendered DOM in DevTools Elements tab.',
      'Verify the tag or element is present and free of syntax errors.'
    ],
    scoreBoost: 6
  };
}
