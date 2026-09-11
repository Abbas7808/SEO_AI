import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Code2,
  Terminal,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Smartphone,
  Monitor,
  Zap,
  BookOpen,
  Eye,
  Award,
  HelpCircle,
  FileCode,
  Layers,
  CheckCircle
} from 'lucide-react';
import { auditApi, antigravityApi } from '../services/api';
import { getSeverityBadge } from '../utils/formatters';
import { getIssueSolution } from '../utils/issueSolutions';
import DualScoreHero from '../components/common/DualScoreHero';
import SeoSkillsGuide from '../components/common/SeoSkillsGuide';

export default function IssuesPage() {
  const [searchParams] = useSearchParams();
  const auditId = searchParams.get('auditId');

  const [issues, setIssues] = useState([]);
  const [currentAudit, setCurrentAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [codeFrameworkMap, setCodeFrameworkMap] = useState({}); // { [issueId]: 'html' | 'react' | 'wordpress' }

  // Antigravity Auto-Fixer Modal state
  const [antigravityModalIssue, setAntigravityModalIssue] = useState(null);
  const [antigravityRepair, setAntigravityRepair] = useState(null);
  const [antigravityLoading, setAntigravityLoading] = useState(false);
  const [modalFramework, setModalFramework] = useState('html');
  const [modalCopied, setModalCopied] = useState(false);
  const [resolvedIssueIds, setResolvedIssueIds] = useState(new Set());

  // Demo fallback issues if no backend audit loaded
  const demoIssues = [
    {
      id: 1,
      severity: 'critical',
      issue_type: 'missing_viewport',
      category: 'mobile',
      title: 'Missing Mobile Viewport Meta Tag',
      page_url: 'https://example.com/',
      description: 'The page lacks a <meta name="viewport"> tag in the HTML head. Mobile devices cannot scale the page layout correctly.',
      impact: 'Fails Google Mobile-Friendly test and triggers ranking penalties under Google Mobile-First Indexing.',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to the document <head>.',
      suggested_fix: '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />',
    },
    {
      id: 2,
      severity: 'critical',
      issue_type: 'missing_h1',
      category: 'onpage',
      title: 'Missing H1 Heading Tag',
      page_url: 'https://example.com/',
      description: 'The page does not contain a top-level <h1> heading tag in the document body.',
      impact: 'Search engines rely heavily on the H1 tag to identify the primary subject matter of the page.',
      recommendation: 'Add a single, descriptive <h1> element that encapsulates the primary page keyword.',
      suggested_fix: '<h1>Professional Web Solutions & SEO Optimization Services</h1>',
    },
    {
      id: 3,
      severity: 'high',
      issue_type: 'missing_meta_description',
      category: 'onpage',
      title: 'Missing Meta Description Tag',
      page_url: 'https://example.com/about',
      description: 'The page does not contain a <meta name="description"> tag in the HTML head.',
      impact: 'Search engines generate an arbitrary snippet, often pulling cookie banners or menus, lowering organic CTR.',
      recommendation: 'Add a unique, relevant meta description between 120 and 160 characters.',
      suggested_fix: '<meta name="description" content="Discover our verified digital platform. Learn how our automated auditing tools and solutions drive organic growth.">',
    },
    {
      id: 4,
      severity: 'high',
      issue_type: 'images_missing_alt',
      category: 'content',
      title: 'Images Missing Alt Text Attributes',
      page_url: 'https://example.com/services',
      description: 'Multiple <img> elements lack descriptive alt attributes for accessibility and image search.',
      impact: 'Impedes web accessibility for screen readers and deprives the website of Google Image Search traffic.',
      recommendation: 'Add meaningful alt attributes describing the graphic content or context of each image.',
      suggested_fix: '<img src="/assets/interface-preview.webp" alt="Website analytics dashboard showing mobile and desktop SEO metrics" loading="lazy" />',
    },
    {
      id: 5,
      severity: 'medium',
      issue_type: 'missing_schema',
      category: 'schema',
      title: 'Missing Schema.org JSON-LD Structured Data',
      page_url: 'https://example.com/',
      description: 'No JSON-LD structured data detected on the homepage.',
      impact: 'Restricts Google Knowledge Graph eligibility and rich search snippet enhancements in SERP.',
      recommendation: 'Implement JSON-LD Schema.org markup for Organization or LocalBusiness.',
      suggested_fix: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "My Enterprise",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
}
</script>`,
    },
    {
      id: 6,
      severity: 'low',
      issue_type: 'missing_canonical',
      category: 'technical',
      title: 'Self-referencing Canonical Tag Missing',
      page_url: 'https://example.com/contact',
      description: 'Page does not declare a canonical link rel="canonical".',
      impact: 'May risk duplicate content flags if accessed via parameter URLs or trailing slashes.',
      recommendation: 'Specify the authoritative canonical URL in the HTML <head>.',
      suggested_fix: '<link rel="canonical" href="https://example.com/contact" />',
    },
    {
      id: 7,
      severity: 'passed',
      issue_type: 'secure_https',
      category: 'technical',
      title: 'Valid SSL & HTTPS Active',
      page_url: 'https://example.com/',
      description: 'The site enforces strong HTTPS encryption with valid TLS certificate.',
      impact: 'Ensures data protection and satisfies standard search engine ranking signals.',
      recommendation: 'No action required. Security certificate is in good standing.',
      suggested_fix: null,
    },
  ];

  useEffect(() => {
    async function loadIssues() {
      let loadedAudit = null;
      try {
        const cached = localStorage.getItem('seo_current_audit_' + auditId);
        if (cached) {
          loadedAudit = JSON.parse(cached);
          setCurrentAudit(loadedAudit);
        }
      } catch (e) {}

      if (auditId) {
        try {
          setLoading(true);
          const [issuesRes, auditRes] = await Promise.all([
            auditApi.getIssues(auditId).catch(() => null),
            auditApi.getAuditById(auditId).catch(() => null)
          ]);
          if (auditRes?.data?.audit) {
            loadedAudit = auditRes.data.audit;
            setCurrentAudit(loadedAudit);
          }
          if (issuesRes?.data?.issues && issuesRes.data.issues.length > 0) {
            setIssues(issuesRes.data.issues);
            // Expand first critical or high issue automatically
            const firstImportant = issuesRes.data.issues.find(i => i.severity === 'critical' || i.severity === 'high');
            if (firstImportant) setExpandedIssueId(firstImportant.id);
          } else {
            const targetSite = loadedAudit?.website_url || 'https://example.com';
            const mappedDemo = demoIssues.map(i => ({
              ...i,
              page_url: i.page_url ? i.page_url.replace('https://example.com', targetSite.replace(/\/$/, '')) : targetSite
            }));
            setIssues(mappedDemo);
            setExpandedIssueId(mappedDemo[0].id);
          }
        } catch (err) {
          setIssues(demoIssues);
          setExpandedIssueId(demoIssues[0].id);
        } finally {
          setLoading(false);
        }
      } else {
        setIssues(demoIssues);
        setExpandedIssueId(demoIssues[0].id);
        setLoading(false);
      }
    }
    loadIssues();
  }, [auditId]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAntigravity = async (issue, framework = modalFramework) => {
    setAntigravityModalIssue(issue);
    setAntigravityLoading(true);
    setAntigravityRepair(null);
    try {
      const res = await antigravityApi.repairIssue({
        issue,
        websiteUrl: issue.page_url || currentAudit?.website_url || 'https://example.com',
        framework
      });
      if (res?.data) {
        setAntigravityRepair(res.data);
      }
    } catch (err) {
      console.warn('Antigravity repair fallback:', err);
    } finally {
      setAntigravityLoading(false);
    }
  };

  const handleFrameworkChange = (fw) => {
    setModalFramework(fw);
    if (antigravityModalIssue) {
      handleOpenAntigravity(antigravityModalIssue, fw);
    }
  };

  const handleToggleResolve = (issueId) => {
    setResolvedIssueIds(prev => {
      const next = new Set(prev);
      if (next.has(issueId)) {
        next.delete(issueId);
      } else {
        next.add(issueId);
      }
      return next;
    });
  };

  const setIssueFramework = (issueId, fw) => {
    setCodeFrameworkMap(prev => ({ ...prev, [issueId]: fw }));
  };

  // Filter and search
  const filteredIssues = issues.filter((issue) => {
    const solution = getIssueSolution(issue, currentAudit?.website_url);
    const matchesSeverity = activeSeverityFilter === 'all' || issue.severity === activeSeverityFilter;
    
    let matchesCategory = true;
    if (activeCategoryFilter === 'mobile') {
      matchesCategory = solution.deviceTarget === 'Mobile' || solution.category === 'Mobile SEO';
    } else if (activeCategoryFilter === 'desktop') {
      matchesCategory = solution.deviceTarget === 'Desktop' || solution.category.includes('Desktop') || solution.category === 'Technical SEO';
    } else if (activeCategoryFilter === 'onpage') {
      matchesCategory = solution.category.includes('On-Page');
    } else if (activeCategoryFilter === 'performance') {
      matchesCategory = solution.category.includes('Performance') || solution.category.includes('Speed');
    } else if (activeCategoryFilter === 'resolved') {
      matchesCategory = resolvedIssueIds.has(issue.id);
    }

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (issue.title && issue.title.toLowerCase().includes(query)) ||
      (issue.description && issue.description.toLowerCase().includes(query)) ||
      (issue.page_url && issue.page_url.toLowerCase().includes(query)) ||
      (solution.category && solution.category.toLowerCase().includes(query));

    return matchesSeverity && matchesCategory && matchesSearch;
  });

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const mediumCount = issues.filter(i => i.severity === 'medium').length;
  const passedCount = issues.filter(i => i.severity === 'passed').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. DUAL SCORE HERO DISPLAY (Mobile SEO & Desktop SEO Score) */}
      <DualScoreHero audit={currentAudit} scoreResult={currentAudit} />

      {/* 2. HOW TO IMPROVE YOUR SEO SKILLS SECTION */}
      <SeoSkillsGuide audit={currentAudit} scoreResult={currentAudit} />

      {/* 3. WEBSITE ISSUES & RESOLUTION CENTER */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Website SEO Issues & Direct Code Solutions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete diagnosis, algorithm impact, and step-by-step website code solutions for every detected vulnerability.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              {criticalCount} Critical
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
              {highCount} High
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
              {resolvedIssueIds.size} Resolved
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search issues by title, affected page URL, or optimization category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Category & Device Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider mr-1 hidden sm:inline">
                Category:
              </span>
              {[
                { id: 'all', label: 'All Issues' },
                { id: 'mobile', label: '📱 Mobile SEO' },
                { id: 'desktop', label: '💻 Desktop & Tech' },
                { id: 'onpage', label: '🏷️ On-Page SEO' },
                { id: 'performance', label: '⚡ Speed & Perf' },
                { id: 'resolved', label: `✅ Resolved (${resolvedIssueIds.size})` }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    activeCategoryFilter === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider mr-1 hidden md:inline">
                Severity:
              </span>
              {['all', 'critical', 'high', 'medium', 'low', 'passed'].map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setActiveSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition ${
                    activeSeverityFilter === sev
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issues List */}
        {loading ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading website SEO issues and compiling code solutions...
            </p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching issues found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your website has no issues matching the selected filters. Great work!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const isExpanded = expandedIssueId === issue.id;
              const isResolved = resolvedIssueIds.has(issue.id);
              const solution = getIssueSolution(issue, currentAudit?.website_url);
              const currentFramework = codeFrameworkMap[issue.id] || 'html';
              const codeToDisplay = solution.codeFixes[currentFramework] || solution.codeFixes.html;

              return (
                <div
                  key={issue.id}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                    isResolved
                      ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 opacity-75'
                      : isExpanded
                      ? 'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Issue Card Header Bar */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Checkbox for Mark Resolved */}
                      <button
                        type="button"
                        onClick={() => handleToggleResolve(issue.id)}
                        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                          isResolved
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                        title={isResolved ? 'Mark as Unresolved' : 'Mark as Resolved on Website'}
                      >
                        {isResolved && <Check className="w-4 h-4" />}
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getSeverityBadge(issue.severity)}
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                            {solution.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            solution.deviceTarget === 'Mobile'
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {solution.deviceTarget} Target
                          </span>
                          {isResolved && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                              Resolved
                            </span>
                          )}
                        </div>

                        <h3 className={`text-base font-bold text-slate-900 dark:text-white ${isResolved ? 'line-through text-slate-400' : ''}`}>
                          {issue.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                          <span className="truncate">URL: {issue.page_url || currentAudit?.website_url || 'https://example.com'}</span>
                          {issue.page_url && (
                            <a
                              href={issue.page_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-500 hover:text-indigo-600 shrink-0 inline-flex items-center gap-0.5"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenAntigravity(issue)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interactive Auto-Fixer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      >
                        <span>{isExpanded ? 'Hide Solution' : 'View How to Solve'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Issue Resolution Drawer */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-6">
                      {/* 1. What is the Issue & Impact */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            What is the Issue (Diagnosis)
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {solution.diagnosis}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                            <Zap className="w-4 h-4 text-rose-500" />
                            Why It Matters (Search Engine Impact)
                          </div>
                          <p className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed">
                            {solution.impact}
                          </p>
                        </div>
                      </div>

                      {/* 2. Step-by-Step Instructions: How to Solve */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-indigo-500" />
                          Step-by-Step: How to Solve This Issue on Your Website
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {solution.steps.map((step, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-start gap-2.5"
                            >
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Direct Production Code Fix (Multi-Framework) */}
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Code2 className="w-4 h-4 text-sky-500" />
                            Ready-to-Copy Production Code Fix
                          </h4>

                          {/* Framework Tabs */}
                          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                            {[
                              { id: 'html', label: 'HTML / Vanilla' },
                              { id: 'react', label: 'React / Next.js' },
                              { id: 'wordpress', label: 'WordPress PHP' }
                            ].map((fw) => (
                              <button
                                key={fw.id}
                                type="button"
                                onClick={() => setIssueFramework(issue.id, fw.id)}
                                className={`px-2.5 py-1 rounded-lg transition ${
                                  currentFramework === fw.id
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {fw.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Code Block with One-Click Copy */}
                        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              <span className="font-mono text-[11px] ml-2 text-slate-300">
                                {currentFramework.toUpperCase()} Implementation
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopy(codeToDisplay, `fix-${issue.id}`)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
                            >
                              {copiedId === `fix-${issue.id}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>Copied Code!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Solution Code</span>
                                </>
                              )}
                            </button>
                          </div>

                          <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
                            <code>{codeToDisplay}</code>
                          </pre>
                        </div>
                      </div>

                      {/* 4. Verification Checklist */}
                      <div className="p-4 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          How to Test & Verify This Fix on Your Live Website
                        </h4>
                        <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                          {solution.verification.map((v, vIdx) => (
                            <li key={vIdx} className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold">&bull;</span>
                              <span>{v}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Bottom Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Estimated Score Gain: <strong className="text-emerald-600 dark:text-emerald-400">+{solution.scoreBoost} SEO Points</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleResolve(issue.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              isResolved
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>{isResolved ? 'Mark as Open' : 'Mark as Fixed on Website'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ANTIGRAVITY AUTO-FIXER MODAL */}
      {antigravityModalIssue && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Direct Code Auto-Fixer
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fix for: {antigravityModalIssue.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAntigravityModalIssue(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Framework Selector */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Select Your Tech Stack:
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                {['html', 'react', 'wordpress'].map((fw) => (
                  <button
                    key={fw}
                    type="button"
                    onClick={() => handleFrameworkChange(fw)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition ${
                      modalFramework === fw
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {fw === 'html' ? 'HTML' : fw === 'react' ? 'Next.js / React' : 'WordPress'}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Output */}
            {antigravityLoading ? (
              <div className="py-12 text-center space-y-2">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Generating clean code fix...</p>
              </div>
            ) : antigravityRepair ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed">
                  <strong>Fix Insight:</strong> {antigravityRepair.agentInsight || 'Direct standards-compliant syntax patch ready to paste into your website templates.'}
                </div>

                <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                    <span className="text-xs font-mono text-slate-300">Production Ready Snippet</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(antigravityRepair.activePatch);
                        setModalCopied(true);
                        setTimeout(() => setModalCopied(false), 2000);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      {modalCopied ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
                    <code>{antigravityRepair.activePatch}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">
                Code repair ready. Click Copy Code to paste into your project.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAntigravityModalIssue(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleResolve(antigravityModalIssue.id);
                  setAntigravityModalIssue(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
              >
                Mark as Fixed on Website
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
