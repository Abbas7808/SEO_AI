import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Milestone,
  Link2,
  Cpu,
  Zap,
  Terminal,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Bot,
  FileText,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { auditApi, antigravityApi } from '../services/api';
import { getSeverityBadge } from '../utils/formatters';
import { generateSingleIssuePrompt, generateMasterAllIssuesPrompt } from '../utils/promptGenerator';

export default function IssuesPage() {
  const [searchParams] = useSearchParams();
  const auditId = searchParams.get('auditId');
  const promptReady = searchParams.get('promptReady') === 'true';

  const [issues, setIssues] = useState([]);
  const [currentAudit, setCurrentAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedIssue, setExpandedIssue] = useState(null);

  // High-Professional AI Prompt Studio states
  const [promptFramework, setPromptFramework] = useState('react');
  const [masterPromptExpanded, setMasterPromptExpanded] = useState(true);
  const [masterPromptCopied, setMasterPromptCopied] = useState(false);
  const [copiedPromptIssueId, setCopiedPromptIssueId] = useState(null);
  const [expandedPromptIssueId, setExpandedPromptIssueId] = useState(null);

  // Antigravity Auto-Fixer Modal state
  const [antigravityModalIssue, setAntigravityModalIssue] = useState(null);
  const [antigravityRepair, setAntigravityRepair] = useState(null);
  const [antigravityLoading, setAntigravityLoading] = useState(false);
  const [modalFramework, setModalFramework] = useState('html');
  const [modalCopied, setModalCopied] = useState(false);
  const [resolvedIssueIds, setResolvedIssueIds] = useState(new Set());

  // Mock initial demo issues if newly loaded without specific backend audit items
  const demoIssues = [
    {
      id: 1,
      severity: 'critical',
      issue_type: 'missing_h1',
      title: 'Missing H1 Heading Tag',
      page_url: 'https://example.com/',
      description: 'The page does not contain a top-level <h1> heading tag.',
      impact: 'Search engines rely heavily on the H1 tag to identify the primary subject matter of the page.',
      recommendation: 'Add a single, descriptive <h1> element that encapsulates the primary page keyword.',
      suggested_fix: '<h1>Professional SEO Audit & Optimization Services</h1>',
    },
    {
      id: 2,
      severity: 'high',
      issue_type: 'missing_meta_description',
      title: 'Missing Meta Description',
      page_url: 'https://example.com/about',
      description: 'The page does not contain a <meta name="description"> tag.',
      impact: 'Search engines may generate an arbitrary and unsuitable search snippet, lowering click-through rates (CTR).',
      recommendation: 'Add a unique, relevant meta description between 120 and 160 characters.',
      suggested_fix: '<meta name="description" content="Discover how our SEO intelligence engine audits web performance, tracks indexing issues, and delivers automated AI-powered fixes.">',
    },
    {
      id: 3,
      severity: 'high',
      issue_type: 'images_missing_alt',
      title: '12 Images Missing Alt Text',
      page_url: 'https://example.com/services',
      description: 'Multiple <img> elements lack descriptive alt attributes.',
      impact: 'Impedes web accessibility for screen readers and deprives the website of Google Image Search traffic.',
      recommendation: 'Add meaningful alt attributes describing the graphic content or context of each image.',
      suggested_fix: '<img src="/assets/cctv-camera.jpg" alt="High-definition 4K indoor security CCTV camera" />',
    },
    {
      id: 4,
      severity: 'medium',
      issue_type: 'missing_schema',
      title: 'Missing Organization / LocalBusiness Schema',
      page_url: 'https://example.com/',
      description: 'No JSON-LD structured data detected on the homepage.',
      impact: 'Restricts Google Knowledge Graph eligibility and rich search snippet enhancements.',
      recommendation: 'Implement JSON-LD Schema.org markup for Organization or LocalBusiness.',
      suggested_fix: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Safdar Mobile Store",
  "telephone": "+92-300-1234567",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Hangu",
    "addressRegion": "KPK"
  }
}
</script>`,
    },
    {
      id: 5,
      severity: 'low',
      issue_type: 'no_canonical',
      title: 'Self-referencing Canonical Missing',
      page_url: 'https://example.com/contact',
      description: 'Page does not declare a canonical link rel="canonical".',
      impact: 'May risk duplicate content flags if accessed via parameter URLs or trailing slashes.',
      recommendation: 'Specify the authoritative canonical URL in the HTML <head>.',
      suggested_fix: '<link rel="canonical" href="https://example.com/contact" />',
    },
    {
      id: 6,
      severity: 'passed',
      issue_type: 'https_active',
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
          } else {
            const targetSite = loadedAudit?.website_url || 'https://siteglow-ai.com';
            setIssues(demoIssues.map(i => ({ ...i, page_url: i.page_url ? i.page_url.replace('https://example.com', targetSite.replace(/\/$/, '')) : targetSite })));
          }
        } catch (err) {
          setIssues(demoIssues);
        } finally {
          setLoading(false);
        }
      } else {
        setIssues(demoIssues);
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

  const handleCopyMasterPrompt = () => {
    const text = generateMasterAllIssuesPrompt({
      audit: currentAudit,
      issues,
      framework: promptFramework,
      websiteUrl: currentAudit?.website_url || (issues[0]?.page_url) || 'https://example.com'
    });
    navigator.clipboard.writeText(text);
    setMasterPromptCopied(true);
    setTimeout(() => setMasterPromptCopied(false), 2500);
  };

  const handleCopySinglePrompt = (issue) => {
    const text = generateSingleIssuePrompt({
      issue,
      websiteUrl: issue.page_url || currentAudit?.website_url || 'https://example.com',
      framework: promptFramework
    });
    navigator.clipboard.writeText(text);
    setCopiedPromptIssueId(issue.id);
    setTimeout(() => setCopiedPromptIssueId(null), 2500);
  };

  const handleDownloadMasterPrompt = () => {
    const text = generateMasterAllIssuesPrompt({
      audit: currentAudit,
      issues,
      framework: promptFramework,
      websiteUrl: currentAudit?.website_url || (issues[0]?.page_url) || 'https://example.com'
    });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master-seo-ai-fix-prompt-${promptFramework}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenAntigravity = async (issue, framework = modalFramework) => {
    setAntigravityModalIssue(issue);
    setAntigravityLoading(true);
    setAntigravityRepair(null);
    try {
      const res = await antigravityApi.repairIssue({
        issue,
        websiteUrl: issue.page_url || 'https://example.com',
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

  const handleApplyAndResolve = async (issueId, scoreBoost = 10) => {
    if (auditId && !issueId.toString().startsWith('demo')) {
      try {
        await antigravityApi.resolveIssue(auditId, { issueId, scoreBoost });
      } catch (err) {
        console.error('Error resolving issue:', err);
      }
    }
    setResolvedIssueIds(prev => new Set([...prev, issueId]));
    setAntigravityModalIssue(null);
  };

  // Filter and search
  const filteredIssues = issues.filter((issue) => {
    const matchesFilter = activeFilter === 'all' || issue.severity === activeFilter;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.page_url && issue.page_url.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (issue.issue_type && issue.issue_type.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: issues.length,
    critical: issues.filter((i) => i.severity === 'critical').length,
    high: issues.filter((i) => i.severity === 'high').length,
    medium: issues.filter((i) => i.severity === 'medium').length,
    low: issues.filter((i) => i.severity === 'low').length,
    passed: issues.filter((i) => i.severity === 'passed').length,
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Audit Completion Prompt-Ready Banner */}
      {promptReady && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border-2 border-emerald-500/60 text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                  Audit Analysis Complete &bull; AI Prompts Synthesized
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Master AI Solution Prompt Ready for All {issues.length} Detected Issues
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Paste the unified prompt into ChatGPT, Claude, or Gemini to resolve all vulnerabilities in a single prompt.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyMasterPrompt}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            {masterPromptCopied ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Prompt Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span>📋 Copy Master AI Prompt</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            SEO Issues & Fixes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detailed diagnostic findings detected during the audit with actionable code and content remedies.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMasterPrompt}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition-all"
          >
            {masterPromptCopied ? <Check className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            <span>{masterPromptCopied ? 'Master Prompt Copied!' : '📋 Copy Master AI Prompt'}</span>
          </button>

          <button
            onClick={() => navigate(`/dashboard/roadmap${auditId ? `?auditId=${auditId}` : ''}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all"
          >
            <Milestone className="w-3.5 h-3.5" />
            <span>View Full Roadmap</span>
          </button>

          <button
            onClick={() => navigate(`/dashboard/backlit-words${auditId ? `?auditId=${auditId}` : ''}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Backlit Words & Links</span>
          </button>
        </div>
      </div>

      {/* High-Professional Master AI Solution Prompt Studio */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white border border-indigo-500/40 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop decorative */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shrink-0 shadow-lg shadow-indigo-500/30 text-white">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Master AI Solution Prompt
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Solves All {issues.length} Detected Issues in One Shot
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  High-Professional AI Prompt Studio
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  Engineered prompt compiling all audit vulnerabilities. Paste this directly into <span className="text-indigo-300 font-semibold">ChatGPT-4o</span>, <span className="text-purple-300 font-semibold">Claude 3.5 Sonnet</span>, <span className="text-sky-300 font-semibold">Gemini 1.5 Pro</span>, or <span className="text-amber-300 font-semibold">Google Antigravity</span> to generate 100% production-ready, zero-placeholder code fixes.
                </p>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                onClick={handleCopyMasterPrompt}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {masterPromptCopied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-100" />
                    <span>📋 Copy Master AI Prompt</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadMasterPrompt}
                title="Download prompt as text file"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span>.txt</span>
              </button>

              <button
                onClick={() => setMasterPromptExpanded(!masterPromptExpanded)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-200 transition-colors"
              >
                {masterPromptExpanded ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Framework Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Your Tech Stack:
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'react', label: 'Next.js / React' },
                { id: 'html', label: 'HTML5 / CSS / Vanilla JS' },
                { id: 'wordpress', label: 'WordPress (PHP)' },
                { id: 'shopify', label: 'Shopify (Liquid)' },
                { id: 'vue', label: 'Vue.js / Nuxt' },
              ].map((fw) => (
                <button
                  key={fw.id}
                  onClick={() => setPromptFramework(fw.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    promptFramework === fw.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {fw.label}
                </button>
              ))}
            </div>
          </div>

          {/* Expanded Prompt Preview Window */}
          {masterPromptExpanded && (
            <div className="space-y-2 mt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="font-mono flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  Auto-formatted for LLM Reasoning Engines &bull; Target: <span className="text-white font-bold">{promptFramework.toUpperCase()}</span>
                </span>
                <span>Click &quot;Copy Master AI Prompt&quot; to transfer into any LLM</span>
              </div>
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300 text-xs font-mono max-h-72 overflow-y-auto leading-relaxed selection:bg-indigo-600 selection:text-white">
                  <code>
                    {generateMasterAllIssuesPrompt({
                      audit: currentAudit,
                      issues,
                      framework: promptFramework,
                      websiteUrl: currentAudit?.website_url || (issues[0]?.page_url) || 'https://example.com'
                    })}
                  </code>
                </pre>
                <button
                  onClick={handleCopyMasterPrompt}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Copy Prompt"
                >
                  {masterPromptCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Severity Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'all', label: 'All Issues', count: counts.all, color: 'slate' },
          { key: 'critical', label: 'Critical', count: counts.critical, color: 'rose' },
          { key: 'high', label: 'High Priority', count: counts.high, color: 'orange' },
          { key: 'medium', label: 'Medium', count: counts.medium, color: 'amber' },
          { key: 'low', label: 'Low / Minor', count: counts.low, color: 'blue' },
          { key: 'passed', label: 'Passed Checks', count: counts.passed, color: 'emerald' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveFilter(item.key)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeFilter === item.key
                ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-950/40'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {item.label}
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues by title, URL, or type..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Issues Found</h3>
            <p className="text-xs text-slate-500">All checks in this category are in good standing.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const badge = getSeverityBadge(issue.severity);
            const isExpanded = expandedIssue === issue.id;

            return (
              <div
                key={issue.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider border ${badge.bg}`}>
                      {badge.text}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {issue.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Copy AI Prompt for this single issue */}
                    <button
                      onClick={() => handleCopySinglePrompt(issue)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-500/20 active:scale-95 transition-all"
                      title="Generate and copy engineered AI fix prompt for this issue"
                    >
                      {copiedPromptIssueId === issue.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Prompt Copied!</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-emerald-200" />
                          <span>🤖 Copy AI Fix Prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedPromptIssueId(expandedPromptIssueId === issue.id ? null : issue.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        expandedPromptIssueId === issue.id
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title="Inspect AI prompt for this issue"
                    >
                      {expandedPromptIssueId === issue.id ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Prompt</span>
                        </>
                      )}
                    </button>

                    {issue.severity !== 'passed' && !resolvedIssueIds.has(issue.id) && (
                      <button
                        onClick={() => handleOpenAntigravity(issue)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
                      >
                        <Cpu className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Antigravity Fix</span>
                      </button>
                    )}

                    {resolvedIssueIds.has(issue.id) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Resolved
                      </span>
                    )}

                    {issue.page_url && (
                      <a
                        href={issue.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 font-mono truncate max-w-xs"
                      >
                        <span className="truncate">{issue.page_url}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {issue.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Why It Matters (Impact):</span>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{issue.impact}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Recommended Action:</span>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{issue.recommendation}</p>
                  </div>
                </div>

                {/* Inline Single Issue AI Fix Prompt Inspector */}
                {expandedPromptIssueId === issue.id && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">
                          Engineered AI Solution Prompt for &quot;{issue.title}&quot;
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-mono font-bold">
                          {promptFramework.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopySinglePrompt(issue)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      >
                        {copiedPromptIssueId === issue.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-56 border border-slate-800 leading-relaxed">
                      <code>{generateSingleIssuePrompt(issue, promptFramework)}</code>
                    </pre>
                    <p className="text-[11px] text-slate-400">
                      💡 Paste this prompt into ChatGPT, Claude, Gemini, or Antigravity to get an instant zero-placeholder fix.
                    </p>
                  </div>
                )}

                {/* Suggested Fix Section */}
                {issue.suggested_fix && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Suggested Implementation / Fix
                      </span>
                      <button
                        onClick={() => handleCopy(issue.suggested_fix, issue.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors"
                      >
                        {copiedId === issue.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Fix</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800">
                      <code>{issue.suggested_fix}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Antigravity Quick-Fix Interactive Modal */}
      {antigravityModalIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-indigo-500/30 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-gray-950 via-indigo-950 to-purple-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600/40 rounded-lg border border-indigo-400/30 text-indigo-300">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      Google Antigravity Agent v2.4
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">
                    {antigravityModalIssue.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setAntigravityModalIssue(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-slate-100">
              {antigravityLoading ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Google Antigravity is synthesizing an autonomous code fix...
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    Decompiling AST &bull; Checking Google Search Quality Guidelines
                  </p>
                </div>
              ) : antigravityRepair ? (
                <>
                  {/* Antigravity Insight & Boost */}
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-indigo-950 dark:text-indigo-200 font-bold">Antigravity Diagnostic:</strong>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                          +{antigravityRepair.scoreBoost} SEO Pts
                        </span>
                        <span className="text-slate-500 font-medium text-[10px]">
                          {antigravityRepair.confidence}% Confidence
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {antigravityRepair.agentInsight}
                      </p>
                    </div>
                  </div>

                  {/* Framework Syntax Switcher */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Patch Target Framework:
                    </span>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'html', label: 'HTML / Head' },
                        { id: 'react', label: 'Next.js / React' },
                        { id: 'wordpress', label: 'WordPress PHP' }
                      ].map(fw => (
                        <button
                          key={fw.id}
                          onClick={() => handleFrameworkChange(fw.id)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                            modalFramework === fw.id
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {fw.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Side-by-Side Diff */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 overflow-hidden">
                      <div className="px-3 py-1.5 bg-red-100/60 dark:bg-red-900/40 border-b border-red-200 dark:border-red-900/40 text-[10px] font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
                        Original Failing State
                      </div>
                      <pre className="p-3 text-xs font-mono text-red-900 dark:text-red-300 overflow-x-auto whitespace-pre-wrap">
                        {antigravityRepair.originalCode}
                      </pre>
                    </div>

                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 overflow-hidden">
                      <div className="px-3 py-1.5 bg-emerald-100/60 dark:bg-emerald-900/40 border-b border-emerald-200 dark:border-emerald-900/40 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                        Antigravity Patched Code [{modalFramework.toUpperCase()}]
                      </div>
                      <pre className="p-3 text-xs font-mono text-emerald-950 dark:text-emerald-200 overflow-x-auto whitespace-pre-wrap">
                        {antigravityRepair.patches?.[modalFramework] || antigravityRepair.activePatch}
                      </pre>
                    </div>
                  </div>

                  {/* Agent Steps Mini-Terminal */}
                  <div className="rounded-xl bg-slate-950 p-3.5 font-mono text-[11px] text-slate-300 space-y-1">
                    <div className="text-slate-500 pb-1 border-b border-slate-800 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Antigravity Agent Execution Sequence</span>
                    </div>
                    {antigravityRepair.agentExecutionSteps?.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-slate-600 select-none">&gt;</span>
                        <span className={step.action === 'PATCH_READY' ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                          [{step.action}] {step.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            {antigravityRepair && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const code = antigravityRepair.patches?.[modalFramework] || antigravityRepair.activePatch;
                    navigator.clipboard.writeText(code);
                    setModalCopied(true);
                    setTimeout(() => setModalCopied(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {modalCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{modalCopied ? 'Copied to Clipboard!' : 'Copy Code Patch'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAntigravityModalIssue(null)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleApplyAndResolve(antigravityModalIssue.id, antigravityRepair.scoreBoost)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply &amp; Resolve (+{antigravityRepair.scoreBoost} pts)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
