import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Layers,
  FileCode,
  Target,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function SeoSkillsGuide({ audit, scoreResult }) {
  const [expandedSkill, setExpandedSkill] = useState(0);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const mobileScore = scoreResult?.mobileScore || audit?.mobile_score || 75;
  const desktopScore = scoreResult?.desktopScore || audit?.desktop_score || 82;
  const techScore = scoreResult?.technicalScore || audit?.technical_score || 80;
  const onPageScore = scoreResult?.onPageScore || audit?.onpage_score || 78;
  const perfScore = scoreResult?.performanceScore || audit?.performance_score || 70;
  const schemaScore = scoreResult?.structuredDataScore || audit?.structured_data_score || 60;

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const skills = [
    {
      id: 'mobile-seo',
      title: 'Mobile-First SEO & Responsiveness Mastery',
      icon: Smartphone,
      category: 'Mobile SEO',
      currentScore: mobileScore,
      targetLevel: mobileScore >= 90 ? 'Mastered' : mobileScore >= 75 ? 'Proficient (Action Needed)' : 'Needs Rapid Improvement',
      badgeColor: mobileScore >= 90 ? 'emerald' : mobileScore >= 75 ? 'amber' : 'rose',
      summary: 'Mastering mobile responsive architecture, viewport scaling, touch target mechanics, and Google Mobile-First Indexing requirements.',
      whyItMatters: 'Google crawls and evaluates websites using smartphone bot user-agents. If your website fails mobile ergonomics or viewport standards, your desktop rankings drop as well.',
      corePrinciples: [
        'Always declare <meta name="viewport" content="width=device-width, initial-scale=1.0"> in the HTML head.',
        'Touch targets (buttons, navigation links, icons) must have at least 48×48px tappable area with 8px spacing to prevent fat-finger miss-clicks.',
        'Use fluid typography via CSS clamp(1rem, 2.5vw, 1.5rem) instead of fixed pixel sizes.',
        'Eliminate horizontal scrollbars: ensure max-width: 100% on images, tables, and code containers.'
      ],
      codeSnippet: `/* Mobile Ergonomics CSS Masterclass */
:root {
  /* Fluid typography scaling */
  --font-h1: clamp(2rem, 5vw + 1rem, 3.5rem);
  --font-body: clamp(1rem, 1.5vw, 1.125rem);
}

/* Ensure all images and embeds are responsive */
img, video, iframe {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Minimum 48px touch targets for mobile accessibility */
.btn, .nav-link, a.action-link {
  min-height: 48px;
  min-width: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.25rem;
}`,
      checklist: [
        'Verify viewport meta tag is declared on every page',
        'Test site on iPhone, Android, and iPad viewport widths (320px - 768px)',
        'Check that all interactive buttons are easily tappable with a thumb',
        'Ensure fonts are legible without manual zooming (min 16px base font)'
      ]
    },
    {
      id: 'desktop-tech',
      title: 'Desktop & Technical Crawlability Architecture',
      icon: Monitor,
      category: 'Desktop & Tech',
      currentScore: desktopScore,
      targetLevel: desktopScore >= 90 ? 'Mastered' : desktopScore >= 75 ? 'Proficient' : 'Needs Action',
      badgeColor: desktopScore >= 90 ? 'emerald' : desktopScore >= 75 ? 'amber' : 'rose',
      summary: 'Mastering canonical URLs, robots.txt crawl budget allocation, XML sitemaps, and HTTP status code governance.',
      whyItMatters: 'Search bots have limited crawl budgets. Technical defects like duplicate URLs, broken redirects, or missing canonicals waste crawler resources and dilute page authority.',
      corePrinciples: [
        'Always specify self-referencing rel="canonical" tags on every authoritative page.',
        'Provide a clean, updated sitemap.xml referenced explicitly in robots.txt.',
        'Use permanent 301 redirects (never temporary 302s) when relocating URLs or enforcing HTTPS/non-www.',
        'Ensure HTTP status 200 OK across all navigational routes with zero internal 404 broken links.'
      ],
      codeSnippet: `<!-- Complete Technical <head> Architecture -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="canonical" href="https://yourwebsite.com/current-page" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
  
  <!-- Server Redirect Best Practice in .htaccess / Nginx -->
  <!-- Always enforce HTTPS and canonical trailing slash -->
</head>`,
      checklist: [
        'Audit all internal links to eliminate 404 errors and 301 redirect chains',
        'Check robots.txt syntax at yourdomain.com/robots.txt',
        'Confirm XML sitemap is submitted in Google Search Console',
        'Verify self-referencing canonical tags match browser address bar URLs'
      ]
    },
    {
      id: 'onpage-serp',
      title: 'On-Page SERP & Click-Through Rate (CTR) Mastery',
      icon: Target,
      category: 'On-Page SEO',
      currentScore: onPageScore,
      targetLevel: onPageScore >= 90 ? 'Mastered' : onPageScore >= 75 ? 'Proficient' : 'Needs Action',
      badgeColor: onPageScore >= 90 ? 'emerald' : onPageScore >= 75 ? 'amber' : 'rose',
      summary: 'Mastering high-intent title crafting, CTR-optimized meta descriptions, and semantic H1-H6 heading hierarchy.',
      whyItMatters: 'Even #1 ranking pages fail if nobody clicks on them. Optimized titles and descriptions command attention in search results, doubling organic traffic without requiring new backlinks.',
      corePrinciples: [
        'Titles: 50-60 characters (approx. 580 pixels). Frontload your primary keyword, followed by a value proposition and brand name.',
        'Descriptions: 135-155 characters. Include search intent match, primary keyword, and a compelling Call To Action.',
        'H1 Tag: Exactly ONE per page. It must clearly reflect the page’s core promise and topical identity.',
        'Headings: Use <h2> for subtopics and <h3> for supporting details. Never skip heading levels.'
      ],
      codeSnippet: `<!-- High-Converting On-Page SERP Blueprint -->
<head>
  <!-- 56 characters: Primary Keyword + Benefit + Brand -->
  <title>SEO Auditor & Fixer • Boost Search Rankings | SitePilot</title>
  
  <!-- 148 characters: Intent + Action + CTA -->
  <meta name="description" content="Discover hidden website SEO issues, unlock instant production code fixes, and boost mobile rankings. Audit your website for free with SitePilot today." />
</head>
<body>
  <header>
    <h1>AI-Powered SEO Audits with Instant Code Solutions</h1>
  </header>
</body>`,
      checklist: [
        'Audit all pages to ensure title tags are between 50 and 60 characters',
        'Verify every public page has a unique, engaging meta description',
        'Confirm each page has exactly one descriptive <h1> tag',
        'Structure content with descriptive, keyword-rich <h2> and <h3> tags'
      ]
    },
    {
      id: 'performance-cwv',
      title: 'Web Performance & Core Web Vitals Optimization',
      icon: Zap,
      category: 'Performance',
      currentScore: perfScore,
      targetLevel: perfScore >= 90 ? 'Mastered' : perfScore >= 75 ? 'Proficient' : 'Needs Action',
      badgeColor: perfScore >= 90 ? 'emerald' : perfScore >= 75 ? 'amber' : 'rose',
      summary: 'Mastering asset compression, modern WebP/AVIF formats, LCP resource preloading, and render-blocking script elimination.',
      whyItMatters: 'Page speed is an official Google ranking factor. 53% of mobile visits are abandoned if pages take longer than 3 seconds to load.',
      corePrinciples: [
        'Serve next-gen image formats (WebP/AVIF) with explicit width and height attributes to prevent Cumulative Layout Shift (CLS).',
        'Add loading="lazy" and decoding="async" to all images located below the fold.',
        'Preload the critical hero image or font using <link rel="preload" fetchpriority="high"> for instantaneous LCP.',
        'Enable Gzip or Brotli compression on your web server.'
      ],
      codeSnippet: `<!-- Core Web Vitals Performance Cheat Code -->
<!-- 1. Preload critical LCP Hero asset -->
<link rel="preload" as="image" href="/assets/hero.webp" fetchpriority="high" />

<!-- 2. Defer non-critical JavaScript -->
<script src="/scripts/analytics.js" defer></script>

<!-- 3. Zero-CLS responsive image with native lazy loading -->
<img src="/assets/product.webp" 
     alt="Comprehensive SEO audit dashboard on mobile" 
     width="800" height="450" 
     loading="lazy" decoding="async" />`,
      checklist: [
        'Convert JPG/PNG images to modern WebP or AVIF formats',
        'Ensure all <img> tags have explicit width and height attributes to prevent CLS',
        'Preload the above-the-fold hero image with fetchpriority="high"',
        'Verify server response time (TTFB) is under 800ms'
      ]
    },
    {
      id: 'schema-structured-data',
      title: 'Semantic Structured Data & Schema.org Skills',
      icon: FileCode,
      category: 'Schema & Rich Results',
      currentScore: schemaScore,
      targetLevel: schemaScore >= 90 ? 'Mastered' : schemaScore >= 75 ? 'Proficient' : 'Needs Action',
      badgeColor: schemaScore >= 90 ? 'emerald' : schemaScore >= 75 ? 'amber' : 'rose',
      summary: 'Mastering JSON-LD syntax, Knowledge Graph entity markup, FAQPage rich snippets, and Google Rich Result qualification.',
      whyItMatters: 'Schema markup allows Google to present rich snippets (star ratings, FAQ accordions, author cards, sitelinks search) directly in search results, drastically improving CTR.',
      corePrinciples: [
        'Use JSON-LD format inside a <script type="application/ld+json"> tag (Google\'s strongly preferred standard).',
        'Mark up your core entity: Organization, LocalBusiness, WebSite, or SoftwareApplication.',
        'Use FAQPage schema on informational pages to display expandable questions directly in Google search results.',
        'Validate all schemas using Google\'s Rich Results Test tool.'
      ],
      codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Brand Name",
  "url": "https://yourwebsite.com",
  "logo": "https://yourwebsite.com/logo.png",
  "sameAs": [
    "https://twitter.com/yourbrand",
    "https://linkedin.com/company/yourbrand"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-800-555-0199",
    "contactType": "Customer Support"
  }
}
</script>`,
      checklist: [
        'Add Organization or LocalBusiness JSON-LD markup to the homepage',
        'Add BreadcrumbList schema to subpages for breadcrumb navigation in SERP',
        'Implement FAQPage schema for pages containing FAQ sections',
        'Verify with Google Rich Results Test (0 errors, 0 warnings)'
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                How to Improve Your SEO Skills
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                Action Blueprint
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Master the exact technical and on-page optimization skills required to achieve a 95+ SEO score.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700/80 shadow-xs border border-slate-100 dark:border-slate-600">
            <Smartphone className="w-4 h-4 text-sky-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Mobile:</span>
            <span className={`text-xs font-black ${mobileScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {mobileScore}/100
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700/80 shadow-xs border border-slate-100 dark:border-slate-600">
            <Monitor className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Desktop:</span>
            <span className={`text-xs font-black ${desktopScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {desktopScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Skills Accordion */}
      <div className="space-y-4">
        {skills.map((skill, index) => {
          const Icon = skill.icon;
          const isExpanded = expandedSkill === index;

          return (
            <div
              key={skill.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-sm'
                  : 'border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Header Toggle */}
              <button
                type="button"
                onClick={() => setExpandedSkill(isExpanded ? -1 : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isExpanded
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {skill.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        skill.currentScore >= 85
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : skill.currentScore >= 70
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}>
                        Score: {skill.currentScore}/100 &bull; {skill.targetLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {skill.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hidden sm:inline">
                    {isExpanded ? 'Hide Details' : 'Learn & Improve'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Skill Body */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-6">
                  {/* Why it Matters Callout */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Why Google & Search Algorithms Care
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {skill.whyItMatters}
                      </p>
                    </div>
                  </div>

                  {/* Core Technical Principles */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      Core Principles to Master
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {skill.corePrinciples.map((principle, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-start gap-2.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{principle}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code Blueprint */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-sky-500" />
                        Practical Code Blueprint & Implementation
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleCopy(skill.codeSnippet, skill.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      >
                        {copiedCodeId === skill.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                      <code>{skill.codeSnippet}</code>
                    </pre>
                  </div>

                  {/* Action Checklist */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Step-by-Step Action Checklist to Level Up
                    </h4>
                    <div className="space-y-2">
                      {skill.checklist.map((item, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/40 text-xs font-medium text-emerald-900 dark:text-emerald-300"
                        >
                          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {cIdx + 1}
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
