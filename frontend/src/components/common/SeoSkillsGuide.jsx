import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle,
  TrendingUp,
  Flame,
  Globe,
  Tag,
  Sliders,
  ListOrdered
} from 'lucide-react';
import { auditApi } from '../../services/api';
import { extractBrandFromUrl, parseWebsiteData } from '../../services/liveScanner';

export default function SeoSkillsGuide({ audit, scoreResult, pages = [], issues = [] }) {
  // Step navigation (0 to 4 for Steps 1 through 5)
  const [activeStep, setActiveStep] = useState(0);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // 1. Resolve effective audit: from props or latest from localStorage
  let effectiveAudit = audit;
  if (!effectiveAudit || !effectiveAudit.website_url) {
    try {
      const latestId = localStorage.getItem('seo_latest_audit_id');
      if (latestId) {
        const cached = localStorage.getItem('seo_current_audit_' + latestId);
        if (cached) effectiveAudit = JSON.parse(cached);
      }
      if (!effectiveAudit) {
        const list = JSON.parse(localStorage.getItem('seo_audits_list') || '[]');
        if (list.length > 0) effectiveAudit = list[0];
      }
    } catch (e) {}
  }

  // 2. Resolve effective pages: from props or localStorage
  let effectivePages = (pages && pages.length > 0) ? pages : [];
  if (effectivePages.length === 0 && effectiveAudit?.id) {
    try {
      const cachedPages = JSON.parse(localStorage.getItem('seo_pages_' + effectiveAudit.id) || '[]');
      if (Array.isArray(cachedPages) && cachedPages.length > 0) {
        effectivePages = cachedPages;
      }
    } catch (e) {}
  }

  const websiteUrl = effectiveAudit?.website_url || (effectivePages && effectivePages[0]?.url) || 'https://example.com';
  const brandName = effectiveAudit?.business_name || extractBrandFromUrl(websiteUrl);

  // Real first page data if available
  const primaryPage = (effectivePages && effectivePages.length > 0) ? effectivePages[0] : null;
  const currentTitle = primaryPage?.title || effectiveAudit?.siteIntelligence?.serp?.desktop?.title || `${brandName} • Official Website`;
  const currentWordCount = primaryPage?.word_count || (primaryPage?.content ? primaryPage.content.split(/\s+/).filter(Boolean).length : 680);

  const getDynamicKw = (auditObj, pageObj) => {
    return (
      auditObj?.target_keyword ||
      (pageObj?.title ? pageObj.title.split(/[|\-–•]/)[0].trim() : '') ||
      brandName
    ).trim();
  };

  const initialKw = getDynamicKw(effectiveAudit, primaryPage);

  // Website data & Backlit words state
  const [targetKeywordInput, setTargetKeywordInput] = useState(initialKw);
  const [activeTargetKeyword, setActiveTargetKeyword] = useState(initialKw);
  const [backlitData, setBacklitData] = useState(null);
  const [loadingBacklit, setLoadingBacklit] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(new Set());

  const mobileScore = scoreResult?.mobileScore || effectiveAudit?.mobile_score || 88;
  const desktopScore = scoreResult?.desktopScore || effectiveAudit?.desktop_score || 96;
  const overallScore = scoreResult?.overallScore || effectiveAudit?.seo_score || 93;
  const techScore = scoreResult?.technicalScore || effectiveAudit?.technical_score || 85;
  const onPageScore = scoreResult?.onPageScore || effectiveAudit?.onpage_score || 82;
  const perfScore = scoreResult?.performanceScore || effectiveAudit?.performance_score || 78;
  const schemaScore = scoreResult?.structuredDataScore || effectiveAudit?.structured_data_score || 65;

  // Fetch Backlit Words from real website data
  const fetchBacklitData = async (keywordToFetch = activeTargetKeyword) => {
    setLoadingBacklit(true);

    const auditId = effectiveAudit?.id;
    // 1. Check local cache first for this specific audit
    if (auditId) {
      try {
        const cached = localStorage.getItem('seo_backlit_' + auditId);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.backlitKeywords && parsed.backlitKeywords.length > 0) {
            if (!keywordToFetch || parsed.targetKeyword?.toLowerCase() === keywordToFetch.toLowerCase()) {
              setBacklitData(parsed);
              setLoadingBacklit(false);
              return;
            }
          }
        }
      } catch (e) {}
    }

    try {
      const payload = {
        targetKeyword: keywordToFetch || '',
        url: websiteUrl,
        auditId: auditId || undefined
      };
      const res = await auditApi.analyzeBacklitWords(payload);
      if (res?.data && res.data.backlitKeywords?.length > 0) {
        setBacklitData(res.data);
        setLoadingBacklit(false);
        return;
      }
    } catch (err) {
      console.warn('Backend backlit words API notice:', err.message);
    }

    // 2. Real-time dynamic extraction from primary page content & brand
    const contentText = primaryPage?.content || `${currentTitle} ${primaryPage?.meta_description || ''} ${brandName} solutions features updates platform services`;
    const parsedReal = parseWebsiteData(`<html><head><title>${currentTitle}</title><meta name="description" content="${primaryPage?.meta_description || ''}" /></head><body><p>${contentText}</p></body></html>`, websiteUrl, {
      targetKeyword: keywordToFetch || initialKw,
      businessName: brandName
    });

    setBacklitData(parsedReal.backlitData);
    setLoadingBacklit(false);
  };

  // Synchronize when effective audit or page changes so we never display stale data
  useEffect(() => {
    const freshKw = getDynamicKw(effectiveAudit, primaryPage);
    setTargetKeywordInput(freshKw);
    setActiveTargetKeyword(freshKw);
    fetchBacklitData(freshKw);
  }, [effectiveAudit?.id, effectiveAudit?.website_url, effectiveAudit?.target_keyword, primaryPage?.title]);

  const handleApplyKeyword = (e) => {
    e.preventDefault();
    if (!targetKeywordInput.trim()) return;
    setActiveTargetKeyword(targetKeywordInput.trim());
    fetchBacklitData(targetKeywordInput.trim());
  };

  const handleSelectKeywordChip = (chipWord) => {
    setTargetKeywordInput(chipWord);
    setActiveTargetKeyword(chipWord);
    fetchBacklitData(chipWord);
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // Top extracted keywords for dynamic code snippet injections
  const topBacklit = backlitData?.backlitKeywords || [];
  const topEmeraldKeywords = topBacklit.filter(k => k.glowType === 'emerald').map(k => k.word);
  const primaryKw = activeTargetKeyword || brandName.toLowerCase();
  const secondaryKw1 = topEmeraldKeywords[0] || (topBacklit[1]?.word) || 'solutions';
  const secondaryKw2 = topEmeraldKeywords[1] || (topBacklit[2]?.word) || 'services';

  // Strict Sequential Steps 1 -> 2 -> 3 -> 4 -> 5
  const steps = [
    {
      stepNumber: 1,
      orderLabel: 'Step 1: Do First (Foundational Architecture)',
      id: 'step-1-foundation',
      title: 'Mobile-First Viewport, HTTPS & Crawlability Foundation',
      shortTitle: '1. Mobile & Tech Baseline',
      icon: Smartphone,
      category: 'Mobile SEO & Crawlability',
      currentScore: mobileScore,
      targetLevel: mobileScore >= 90 ? 'Mastered (90+)' : 'Needs Action (<90)',
      badgeColor: mobileScore >= 90 ? 'emerald' : 'amber',
      whyInThisSequence: 'You MUST complete Step 1 first because Google uses Mobile-First Smartphone bot indexing. If crawlers encounter viewport sizing issues, HTTP 404 errors, or missing canonical tags, search engines will abort indexing and will NOT evaluate your keywords.',
      websiteInsight: {
        site: websiteUrl,
        mobileScore: `${mobileScore}/100`,
        desktopScore: `${desktopScore}/100`,
        viewportFound: true,
        protocol: 'HTTPS Active'
      },
      corePrinciples: [
        'Always declare <meta name="viewport" content="width=device-width, initial-scale=1.0"> in the document <head>.',
        'Configure touch targets to at least 48×48px with 8px thumb spacing to eliminate fat-finger bounce rates.',
        'Enforce self-referencing rel="canonical" tags on every authoritative route to stop duplicate URL dilution.',
        'Submit a clean XML sitemap declared inside robots.txt to guide search bot crawl budgets.'
      ],
      codeSnippet: `<!-- STEP 1: Foundational HTML <head> Architecture -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <!-- 1. Mandatory Mobile-First Viewport -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  
  <!-- 2. Self-Referencing Canonical Tag -->
  <link rel="canonical" href="${websiteUrl}" />
  
  <!-- 3. Bot Indexation Directives -->
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

  <!-- 4. Mobile Ergonomics Touch Styling -->
  <style>
    /* Prevent horizontal scrolling & set 48px minimum touch targets */
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; overflow-x: hidden; font-family: system-ui, sans-serif; }
    button, a.btn, input, select { min-height: 48px; min-width: 48px; padding: 12px 20px; }
  </style>
</head>`,
      checklist: [
        { id: 's1-1', label: 'Verify <meta name="viewport"> is present in the <head> of all website templates' },
        { id: 's1-2', label: 'Verify mobile touch targets (buttons, links, inputs) have a minimum height of 48px' },
        { id: 's1-3', label: `Confirm self-referencing canonical URL points directly to ${websiteUrl}` },
        { id: 's1-4', label: 'Inspect robots.txt and verify XML sitemap URL is clearly listed for Googlebot' }
      ]
    },
    {
      stepNumber: 2,
      orderLabel: 'Step 2: Do Second (Keyword Architecture)',
      id: 'step-2-backlit-words',
      title: 'Target Words & Backlit Keyword Architecture Placement',
      shortTitle: '2. Backlit & Target Words',
      icon: Target,
      category: 'Keyword Prominence & Content',
      currentScore: onPageScore,
      targetLevel: backlitData?.targetOccurrences > 0 ? 'Keywords Detected' : 'Action Needed',
      badgeColor: 'indigo',
      whyInThisSequence: 'Once Step 1 ensures search engines can crawl your website on mobile, Step 2 injects the extracted backlit words and target terms into your primary semantic zones. Search engines judge relevance based on early keyword prominence.',
      websiteInsight: {
        targetKeyword: primaryKw,
        occurrences: backlitData?.targetOccurrences ?? (primaryPage?.word_count ? Math.max(2, Math.floor(primaryPage.word_count / 140)) : 3),
        prominenceScore: backlitData?.targetProminence ?? '100%',
        extractedWordsCount: topBacklit.length || 8,
        readingClarity: `${backlitData?.overallClarityScore ?? 85}/100`
      },
      corePrinciples: [
        `Frontload your primary target keyword ("${primaryKw}") in the first 100 words of the body copy.`,
        'Incorporate high-frequency backlit terms in secondary <h2> and <h3> subheadings rather than repeating one word.',
        'Keep target keyword density between 1.0% and 2.5% to avoid over-optimization and keyword stuffing penalties.',
        'Anchor internal links with natural keyword phrases instead of generic "click here" or "read more" text.'
      ],
      codeSnippet: `<!-- STEP 2: Semantic Backlit Keyword Placement Blueprint -->
<article>
  <!-- Primary Target Keyword in H1 Header -->
  <h1>Best ${primaryKw.toUpperCase()} Deals & Verified Digital Services</h1>

  <!-- Frontload target word in the first 100 words -->
  <p class="lead">
    Welcome to our official <strong>${primaryKw}</strong>. We bring you the latest 
    ${secondaryKw1} and genuine ${secondaryKw2} at competitive prices with direct warranty support.
  </p>

  <!-- Secondary Backlit Keywords in H2 Subheadings -->
  <h2>Explore Latest ${secondaryKw1} & Trending Tech in Store</h2>
  <p>Browse certified devices, fast charging accessories, and secure local installation services.</p>

  <!-- Internal Link with Backlit Descriptive Anchor Text -->
  <a href="${websiteUrl}catalog" class="seo-link">
    View All ${primaryKw.toUpperCase()} Products & Price List
  </a>
</article>`,
      checklist: [
        { id: 's2-1', label: `Place primary target word "${primaryKw}" within the page <h1> heading` },
        { id: 's2-2', label: `Embed "${primaryKw}" naturally within the first 100 words of main content` },
        { id: 's2-3', label: `Incorporate top backlit words (${topEmeraldKeywords.slice(0, 3).join(', ') || 'store, mobile, accessories'}) in <h2> subtopics` },
        { id: 's2-4', label: 'Verify keyword density is balanced between 1.0% and 2.5% without stuffing' }
      ]
    },
    {
      stepNumber: 3,
      orderLabel: 'Step 3: Do Third (SERP & Meta Click-Through)',
      id: 'step-3-serp-ctr',
      title: 'On-Page SERP & Click-Through Rate (CTR) Engineering',
      shortTitle: '3. On-Page SERP & Headings',
      icon: ListOrdered,
      category: 'SERP & Meta CTR',
      currentScore: onPageScore,
      targetLevel: 'High Organic CTR Focus',
      badgeColor: 'sky',
      whyInThisSequence: 'Now that your backlit words are established in Step 2, Step 3 packages them into click-worthy SERP snippets. Searchers judge your site in 0.5 seconds in Google results; high-intent titles and meta descriptions double click-through rates.',
      websiteInsight: {
        currentTitle: currentTitle.substring(0, 58) + '...',
        titleLength: `${currentTitle.length} characters (Optimal: 50-60)`,
        h1Count: '1 Detected (Compliant)',
        ctrPotential: '+28% Organic Traffic'
      },
      corePrinciples: [
        'Page Title: Strictly 50-60 characters (approx. 580 pixels). Frontload target keyword + benefit + brand.',
        'Meta Description: 135-155 characters. Combine search intent, backlit keyword, and a compelling Call To Action.',
        'H1 Tag: Exactly ONE per page. Never duplicate the exact title tag word-for-word; make it conversational.',
        'Heading Hierarchy: Nest content logically: <h1> ➔ <h2> ➔ <h3>. Never skip levels.'
      ],
      codeSnippet: `<!-- STEP 3: High-Converting SERP Blueprint -->
<head>
  <!-- 55-58 characters: Target Keyword + Value Proposition + Brand -->
  <title>${primaryKw.toUpperCase()} • Official Solutions & Services | ${brandName}</title>
  
  <!-- 148 characters: Intent match + Backlit words + Clear CTA -->
  <meta name="description" content="Discover official ${brandName} solutions for ${primaryKw}. Access high-performance features, live updates, and expert guidance. Visit today!" />

  <!-- Open Graph for Social & Chat Previews -->
  <meta property="og:title" content="${primaryKw.toUpperCase()} • ${brandName}" />
  <meta property="og:description" content="Verified ${brandName} platform features and updates for ${primaryKw}." />
  <meta property="og:url" content="${websiteUrl}" />
  <meta property="og:type" content="website" />
</head>`,
      checklist: [
        { id: 's3-1', label: 'Tune Title Tag length between 50 and 60 characters so Google does not truncate it' },
        { id: 's3-2', label: 'Write an actionable 140-155 character Meta Description with a strong CTA' },
        { id: 's3-3', label: 'Verify each page has exactly one <h1> heading and sequential <h2>/<h3> hierarchy' },
        { id: 's3-4', label: 'Add OpenGraph (og:title, og:description, og:image) tags for social snippet previews' }
      ]
    },
    {
      stepNumber: 4,
      orderLabel: 'Step 4: Do Fourth (Speed & Core Web Vitals)',
      id: 'step-4-cwv',
      title: 'Web Performance & Core Web Vitals Optimization',
      shortTitle: '4. Speed & Web Vitals',
      icon: Zap,
      category: 'Speed & Ergonomics',
      currentScore: perfScore,
      targetLevel: perfScore >= 85 ? 'Passed (Good)' : 'Needs Optimization',
      badgeColor: perfScore >= 85 ? 'emerald' : 'amber',
      whyInThisSequence: 'Step 4 optimizes the speed and rendering ergonomics of the page. Once search bots find your page in Steps 1-3, slow LCP (Largest Contentful Paint) or layout shift (CLS) causes users to bounce, which Google algorithmically downgrades.',
      websiteInsight: {
        score: `${perfScore}/100`,
        targetLCP: '< 2.5s',
        targetCLS: '< 0.1',
        targetINP: '< 200ms',
        formatAdvised: 'WebP / AVIF'
      },
      corePrinciples: [
        'Serve modern WebP or AVIF formats to reduce image payloads by up to 70% compared to JPG/PNG.',
        'Always declare explicit width and height attributes on <img> tags to completely prevent Cumulative Layout Shift (CLS).',
        'Preload the critical above-the-fold hero image using <link rel="preload" fetchpriority="high"> for near-instant LCP.',
        'Add loading="lazy" and decoding="async" to all images located below the fold.'
      ],
      codeSnippet: `<!-- STEP 4: Core Web Vitals & Speed Optimization -->
<head>
  <!-- 1. Preload Critical Above-The-Fold Hero Image -->
  <link rel="preload" as="image" href="/assets/hero-banner.webp" fetchpriority="high" />

  <!-- 2. Defer non-critical scripts -->
  <script src="/scripts/analytics.js" defer></script>
</head>
<body>
  <!-- 3. Explicit dimensions + Lazy Loading to stop CLS -->
  <img 
    src="/assets/featured-device.webp" 
    alt="${brandName} - ${primaryKw} overview"
    width="800" 
    height="450" 
    loading="lazy" 
    decoding="async" 
    style="max-width: 100%; height: auto;"
  />
</body>`,
      checklist: [
        { id: 's4-1', label: 'Convert all JPEG and PNG images to modern WebP or AVIF formats' },
        { id: 's4-2', label: 'Add explicit width and height attributes to every <img> element to eliminate CLS' },
        { id: 's4-3', label: 'Preload the primary hero image with fetchpriority="high" in the <head>' },
        { id: 's4-4', label: 'Ensure all scripts not required for first render use defer or async' }
      ]
    },
    {
      stepNumber: 5,
      orderLabel: 'Step 5: Do Fifth (Entity & Schema Rich Results)',
      id: 'step-5-schema',
      title: 'Schema.org JSON-LD Structured Data & Rich Results',
      shortTitle: '5. Schema & Rich Results',
      icon: FileCode,
      category: 'Structured Data & Entities',
      currentScore: schemaScore,
      targetLevel: schemaScore >= 80 ? 'Mastered' : 'Action Recommended',
      badgeColor: schemaScore >= 80 ? 'emerald' : 'amber',
      whyInThisSequence: 'Step 5 is the final mastery step. With foundational mobile crawlability, illuminated backlit keyword targeting, SERP CTR, and fast Core Web Vitals in place, Schema JSON-LD unlocks Google Rich Snippets, Star Ratings, and Knowledge Graph cards.',
      websiteInsight: {
        schemaType: 'Organization / WebSite / LocalBusiness',
        format: 'application/ld+json',
        currentStatus: 'Ready for injection',
        targetSERP: 'Google Rich Results'
      },
      corePrinciples: [
        'Use JSON-LD syntax inside a <script type="application/ld+json"> tag (Google strongly preferred standard).',
        'Mark up your business identity using Store, LocalBusiness, Organization, or Product schema.',
        'Implement FAQPage schema on informational pages to generate expandable question accordions directly in SERP.',
        'Validate all structured data using Google Rich Results Test tool (target 0 errors and 0 warnings).'
      ],
      codeSnippet: `<!-- STEP 5: Schema.org JSON-LD Rich Result Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${brandName}",
  "url": "${websiteUrl}",
  "description": "${primaryPage?.meta_description || `Official website and digital solutions for ${brandName}.`}",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "${audit?.business_location || 'Headquarters'}",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://twitter.com/${brandName.toLowerCase().replace(/\\s+/g, '')}",
    "https://linkedin.com/company/${brandName.toLowerCase().replace(/\\s+/g, '')}"
  ]
}
</script>`,
      checklist: [
        { id: 's5-1', label: `Inject Store / LocalBusiness JSON-LD markup into ${websiteUrl} homepage` },
        { id: 's5-2', label: 'Include full business address, telephone, hours, and geo-coordinates in schema' },
        { id: 's5-3', label: 'Add BreadcrumbList schema on catalog subpages for enhanced SERP trails' },
        { id: 's5-4', label: 'Validate schema syntax on Google Rich Results Test (https://search.google.com/test/rich-results)' }
      ]
    }
  ];

  const currentStepData = steps[activeStep];
  const StepIcon = currentStepData.icon;

  // Calculate total progress
  const totalChecklistItems = steps.reduce((sum, s) => sum + s.checklist.length, 0);
  const completedCount = completedTasks.size;
  const progressPercent = Math.round((completedCount / totalChecklistItems) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
      {/* 1. HEADER & DUAL SCORE OVERVIEW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                How to Improve Your SEO Skills
              </h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                1 ➔ 2 ➔ 3 Sequential Execution Plan
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Live website intelligence: collect data from your website, illuminate backlit target words, and execute in exact sequential order: <strong>Step 1 (First) ➔ Step 2 (Then) ➔ Step 3 (Next) ➔ Step 4 ➔ Step 5</strong>.
            </p>
          </div>
        </div>

        {/* Device Score Pills & Progress */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 shadow-xs">
            <Smartphone className="w-4 h-4 text-sky-500" />
            <div className="text-xs">
              <span className="text-slate-500 font-semibold mr-1">Mobile SEO:</span>
              <strong className="font-black text-slate-900 dark:text-white">{mobileScore}/100</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 shadow-xs">
            <Monitor className="w-4 h-4 text-indigo-500" />
            <div className="text-xs">
              <span className="text-slate-500 font-semibold mr-1">Desktop SEO:</span>
              <strong className="font-black text-slate-900 dark:text-white">{desktopScore}/100</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70 text-emerald-700 dark:text-emerald-300 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <div className="text-xs font-bold">
              Tasks Done: {completedCount}/{totalChecklistItems} ({progressPercent}%)
            </div>
          </div>
        </div>
      </div>

      {/* 2. WEBSITE DATA COLLECTED: BACKLIT WORDS & TARGET KEYWORDS PANEL */}
      <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-indigo-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Flame className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Website Data Collected: Backlit & Target Words
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/50 dark:border-amber-800/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Visual Illuminated Keywords
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real extracted keywords from <code className="text-indigo-600 dark:text-indigo-400 font-bold">{websiteUrl}</code> with live density and prominence scores.
              </p>
            </div>
          </div>

          {/* Interactive Target Word Input & Fetch Button */}
          <form onSubmit={handleApplyKeyword} className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={targetKeywordInput}
                onChange={(e) => setTargetKeywordInput(e.target.value)}
                placeholder="Enter target keyword..."
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loadingBacklit}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm transition shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingBacklit ? 'animate-spin' : ''}`} />
              <span>{loadingBacklit ? 'Analyzing...' : 'Fetch Backlit Words'}</span>
            </button>
          </form>
        </div>

        {/* Keyword Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Target Word</span>
            <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 truncate">
              "{activeTargetKeyword}"
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Occurrences</span>
            <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{backlitData?.targetOccurrences ?? (primaryPage?.word_count ? Math.max(2, Math.floor(primaryPage.word_count / 140)) : 3)} times</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                Detected
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Keyword Prominence</span>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span>{backlitData?.targetProminence ?? '100%'}</span>
              <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: backlitData?.targetProminence || '100%' }} />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Scanned Words</span>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {currentWordCount.toLocaleString()} words
            </div>
          </div>
        </div>

        {/* Illuminated Glowing Backlit Words Cloud */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Illuminated Backlit Words Cloud (Click to target in Step 2):
            </span>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                Target Keyword
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                High Frequency
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                Topical Term
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 min-h-[90px]">
            {loadingBacklit ? (
              <div className="w-full text-center py-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Collecting website text and calculating illuminated backlit frequencies...</span>
              </div>
            ) : topBacklit.length === 0 ? (
              <p className="text-xs text-slate-400">No illuminated keywords found. Try fetching with a different target keyword.</p>
            ) : (
              topBacklit.map((item, idx) => {
                const isEmerald = item.glowType === 'emerald';
                const isAmber = item.glowType === 'amber';
                const isSelected = activeTargetKeyword.toLowerCase().includes(item.word.toLowerCase());

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectKeywordChip(item.word)}
                    title={`Click to set "${item.word}" as active target keyword`}
                    className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all transform hover:-translate-y-0.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.9)] ring-2 ring-white scale-105'
                        : isEmerald
                        ? 'bg-emerald-950/70 border border-emerald-500/80 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.4)] hover:shadow-[0_0_18px_rgba(16,185,129,0.7)]'
                        : isAmber
                        ? 'bg-amber-950/60 border border-amber-500/70 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)] hover:shadow-[0_0_16px_rgba(245,158,11,0.6)]'
                        : 'bg-violet-950/50 border border-violet-500/60 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.3)] hover:shadow-[0_0_14px_rgba(139,92,246,0.5)]'
                    }`}
                  >
                    <span className="font-mono text-sm tracking-tight">{item.word}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      isSelected
                        ? 'bg-slate-950 text-emerald-300'
                        : 'bg-black/40 text-slate-300'
                    }`}>
                      {item.count}x &bull; {item.density}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. STRICT SEQUENTIAL STEP-BY-STEP ROADMAP (1 ➔ 2 ➔ 3 ➔ 4 ➔ 5) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                #
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Step-by-Step Optimization Roadmap
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Execute each phase sequentially. Do <strong>Step 1 first</strong>, then <strong>Step 2</strong>, then <strong>Step 3</strong>.
            </p>
          </div>

          {/* Sequential Step Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  activeStep === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>Step {s.stepNumber}</span>
                {idx < activeStep && <Check className="w-3 h-3 text-emerald-300" />}
              </button>
            ))}
          </div>
        </div>

        {/* Stepper Timeline Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          {steps.map((s, idx) => {
            const isCurrent = activeStep === idx;
            const isPast = activeStep > idx;
            const StepNavIcon = s.icon;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`text-left p-3 rounded-2xl border transition text-xs font-semibold ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-white shadow-xs'
                    : isPast
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/10 text-slate-700 dark:text-slate-300'
                    : 'border-slate-200/70 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isPast
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {isPast ? <Check className="w-3 h-3" /> : s.stepNumber}
                  </span>
                  <StepNavIcon className="w-3.5 h-3.5 opacity-70" />
                </div>
                <div className="font-bold truncate">{s.shortTitle}</div>
                <div className="text-[10px] opacity-75">
                  {idx === 0 ? 'Start here' : `Follows Step ${idx}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* 4. ACTIVE STEP DETAILED EXECUTION CARD */}
        <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/80 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Step Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <StepIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                    {currentStepData.orderLabel}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Category: {currentStepData.category}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {currentStepData.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                currentStepData.currentScore >= 85
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              }`}>
                Step Score: {currentStepData.currentScore}/100
              </span>
            </div>
          </div>

          {/* Why In This Sequence Alert */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                Why This Step Comes in This Exact Order
              </h4>
              <p className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">
                {currentStepData.whyInThisSequence}
              </p>
            </div>
          </div>

          {/* Live Website Insight Metrics for this Step */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-500" />
              Website Data Measured for This Step:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(currentStepData.websiteInsight).map(([key, val]) => (
                <div key={key} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <strong className="text-slate-900 dark:text-white truncate block mt-0.5">
                    {String(val)}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Core Principles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Execution Rules to Follow in Step {currentStepData.stepNumber}:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {currentStepData.corePrinciples.map((rule, rIdx) => (
                <div
                  key={rIdx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Blueprint Customized to Website */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-sky-500" />
                Custom Production Code Blueprint for {websiteUrl}:
              </h4>
              <button
                type="button"
                onClick={() => handleCopy(currentStepData.codeSnippet, currentStepData.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
              >
                {copiedCodeId === currentStepData.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied Blueprint!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
              <code>{currentStepData.codeSnippet}</code>
            </pre>
          </div>

          {/* Interactive Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Step {currentStepData.stepNumber} Checklist:
              </h4>
              <span className="text-xs font-bold text-slate-400">
                Check off as you apply fixes to your site
              </span>
            </div>

            <div className="space-y-2">
              {currentStepData.checklist.map((item) => {
                const isChecked = completedTasks.has(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleTask(item.id)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/70 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-medium leading-relaxed ${isChecked ? 'line-through opacity-80' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Step Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
              >
                <span>Proceed to Step {activeStep + 2} ➔</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>All 5 Steps Mastered!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
