import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Globe,
  Search,
  Building2,
  MapPin,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Crown,
  Lock,
  Laptop,
  FolderGit2,
  Bot,
  HardDrive,
  Terminal,
  FileCheck,
  Layers,
  Wrench,
  Check
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { scanLiveWebsite } from '../services/liveScanner';
import { auditApi } from '../services/api';
import { getUserPlan, getTrialUsage, canPerformAudit } from '../utils/planLimits';
import TrialLimitModal from '../components/common/TrialLimitModal';

export default function StartAuditPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userPlan = getUserPlan(user?.email);
  const trialUsage = getTrialUsage(user?.email);
  const isPro = userPlan === 'pro' || userPlan === 'agency';

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitReason, setLimitReason] = useState('trial_exceeded');

  // Scanning mode: 'online' | 'local'
  const [scanMode, setScanMode] = useState('online');

  // Online inputs
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [maxPages, setMaxPages] = useState(isPro ? 20 : 5);

  // Local inputs
  const [projectPath, setProjectPath] = useState('C:\\Users\\AGP KOHAT\\Desktop\\SEO');
  const [validatingPath, setValidatingPath] = useState(false);
  const [pathValidation, setPathValidation] = useState(null);

  // Shared inputs
  const [targetKeyword, setTargetKeyword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auditProgress, setAuditProgress] = useState(null);

  useEffect(() => {
    const initialUrl = searchParams.get('url');
    if (initialUrl) {
      setWebsiteUrl(decodeURIComponent(initialUrl));
    }
    const initialMode = searchParams.get('mode');
    if (initialMode === 'local') {
      setScanMode('local');
      if (!initialUrl) {
        setWebsiteUrl('http://localhost:5173');
      }
    }
    const initialPath = searchParams.get('path');
    if (initialPath) {
      setProjectPath(decodeURIComponent(initialPath));
    }
  }, [searchParams]);

  const onlineAuditSteps = [
    'Validating live website & checking SSRF safety',
    'Connecting to remote website host (SSL & DNS lookup)',
    'Measuring server response latency (TTFB) & status codes',
    'Auditing HTTP security headers (HSTS, CSP, X-Frame-Options)',
    'Inspecting robots.txt & XML sitemap indexability',
    'Crawling discovered internal pages & link structure',
    'Checking on-page metadata, title tags & descriptions',
    'Evaluating mobile viewport responsiveness & typography',
    'Scanning images for missing alt attributes',
    'Checking Schema.org JSON-LD structured data',
    'Calculating grounded 0-100 Technical & On-Page SEO score',
    'Compiling remote technical diagnostics & recommendations',
    'Audit complete!'
  ];

  const localAuditSteps = [
    'Connecting to live website / dev server & testing response latency',
    'Validating local project directory & source permissions',
    'Auditing live rendered DOM, meta tags & mobile viewport',
    'Indexing codebase files (.html, .jsx, .tsx, .vue, .astro, .php)',
    'Parsing document head, title tags & character lengths line-by-line',
    'Auditing meta descriptions & mobile viewport tags in source code',
    'Scanning image tags for missing alt attributes with exact lines',
    'Evaluating H1-H6 heading hierarchy & code semantics',
    'Calculating grounded 0-100 local codebase & live SEO score',
    'Synthesizing line-level code diffs for Google Antigravity',
    'Configuring Google Antigravity autonomous agent session',
    'Dual audit complete! Ready to edit in Google Antigravity.'
  ];

  const handleValidatePath = async () => {
    if (!projectPath.trim()) return;
    setValidatingPath(true);
    setError('');
    try {
      const res = await auditApi.validateLocalPath({ projectPath: projectPath.trim() });
      if (res.data) {
        setPathValidation(res.data);
      }
    } catch (err) {
      setError(err.message || 'Could not validate local directory path.');
      setPathValidation(null);
    } finally {
      setValidatingPath(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user has exceeded their free trial audits
    if (!canPerformAudit(user?.email)) {
      setLimitReason('trial_exceeded');
      setShowLimitModal(true);
      return;
    }

    setError('');

    if (scanMode === 'online') {
      if (!websiteUrl.trim()) {
        setError('Please provide a live website URL.');
        return;
      }

      setLoading(true);
      const activeSteps = onlineAuditSteps;
      setAuditProgress({ stepIndex: 0, percent: 5, currentStep: activeSteps[0] });

      try {
        // Execute real live scan
        const scanResult = await scanLiveWebsite(websiteUrl.trim(), {
          targetKeyword: targetKeyword.trim(),
          businessName: businessName.trim(),
          businessLocation: businessLocation.trim(),
        });

        const auditId = scanResult.audit.id;

        // Animate step progress simulation for UI feedback
        for (let i = 0; i < activeSteps.length; i++) {
          await new Promise((r) => setTimeout(r, 350));
          setAuditProgress({
            stepIndex: i,
            percent: Math.round(((i + 1) / activeSteps.length) * 100),
            currentStep: activeSteps[i],
          });
        }

        await new Promise((r) => setTimeout(r, 300));
        navigate(`/dashboard/issues?auditId=${auditId}`);
      } catch (err) {
        setError(err.message || 'Failed to start online audit. Please verify the URL.');
        setAuditProgress(null);
      } finally {
        setLoading(false);
      }
    } else {
      // Local Mode
      if (!projectPath.trim()) {
        setError('Please enter a local project folder path.');
        return;
      }

      setLoading(true);
      const activeSteps = localAuditSteps;
      setAuditProgress({ stepIndex: 0, percent: 5, currentStep: activeSteps[0] });

      try {
        // Call backend local scanner with both projectPath and live website URL
        const scanResult = await auditApi.scanLocalProject({
          projectPath: projectPath.trim(),
          websiteUrl: websiteUrl.trim() || 'http://localhost:5173',
          targetKeyword: targetKeyword.trim(),
          businessName: businessName.trim(),
          businessLocation: businessLocation.trim()
        });

        const audit = scanResult.data?.audit;
        const auditId = audit?.id || 1;

        // Store into localStorage for consistency
        try {
          localStorage.setItem(`seo_current_audit_${auditId}`, JSON.stringify(audit));
          localStorage.setItem(`seo_issues_${auditId}`, JSON.stringify(scanResult.data?.scoreResult?.issues || []));
          localStorage.setItem('seo_latest_audit_id', auditId);
        } catch (e) {}

        // Animate local scan steps
        for (let i = 0; i < activeSteps.length; i++) {
          await new Promise((r) => setTimeout(r, 350));
          setAuditProgress({
            stepIndex: i,
            percent: Math.round(((i + 1) / activeSteps.length) * 100),
            currentStep: activeSteps[i],
          });
        }

        await new Promise((r) => setTimeout(r, 300));
        navigate(`/dashboard/issues?auditId=${auditId}`);
      } catch (err) {
        setError(err.message || 'Failed to scan local codebase. Please verify the directory path.');
        setAuditProgress(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const activeSteps = scanMode === 'online' ? onlineAuditSteps : localAuditSteps;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <span>Start Website SEO Audit</span>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            {scanMode === 'online' ? '🌐 Live Remote Mode' : '💻 Local Codebase Mode'}
          </span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {scanMode === 'online'
            ? 'Crawl and analyze a live website over the network. Ideal when source code is not on your computer.'
            : 'Scan source code files directly on this laptop with exact line numbers, code diffs, and Google Antigravity integration.'}
        </p>
      </div>

      {/* Trial Status or Limit Banner */}
      {!isPro ? (
        trialUsage.isLimitReached ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                  Free Demo Trial Limit Reached ({trialUsage.auditsCount} of 3 Audits Used)
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  You have completed all 3 free website audit trials. Upgrade to Pro Specialist for unlimited audits and full feature access.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLimitReason('trial_exceeded');
                setShowLimitModal(true);
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/20 shrink-0 flex items-center justify-center gap-1.5 transition-all"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Make Payment & Upgrade</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                <strong>Free Demo Trial:</strong> {trialUsage.auditsCount} of 3 trials used ({trialUsage.auditsRemaining} remaining).
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/billing')}
              className="font-bold text-brand-600 dark:text-brand-400 hover:underline shrink-0 flex items-center gap-1"
            >
              <span>Upgrade to Unlimited Pro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      ) : (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>{userPlan.toUpperCase()} Member:</strong> You have unlimited website scans and deep crawls enabled.
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-sm text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Audit Notice</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Progress Overlay */}
      {auditProgress && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-500 shadow-2xl space-y-6 animate-scale-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {scanMode === 'online' ? `Auditing ${websiteUrl}` : `Scanning Codebase: ${projectPath}`}
                </span>
                <span className="text-xs text-slate-500">
                  {scanMode === 'online' ? 'Live Server & Network Inspection' : 'AST Code Parsing & Google Antigravity Synthesis'}
                </span>
              </div>
            </div>
            <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 font-mono">
              {auditProgress.percent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${auditProgress.percent}%` }}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 max-h-64 overflow-y-auto pr-1">
            {activeSteps.map((step, idx) => {
              const isDone = idx < auditProgress.stepIndex;
              const isCurrent = idx === auditProgress.stepIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs transition-colors ${
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : isCurrent
                      ? 'text-brand-600 dark:text-brand-400 font-bold'
                      : 'text-slate-400 dark:text-slate-600 opacity-60'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                  )}
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Configuration & Audit Form */}
      {!auditProgress && (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* SCAN LOCATION QUESTION SELECTOR */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Where is the website code located? <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Online Website */}
              <button
                type="button"
                onClick={() => setScanMode('online')}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-3 ${
                  scanMode === 'online'
                    ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 shadow-md shadow-brand-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`p-2.5 rounded-xl ${
                    scanMode === 'online' ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  {scanMode === 'online' && (
                    <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                      🌐 Online Website
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      Normal User / Client
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block leading-relaxed">
                    Source code is <strong>not on this computer</strong>. Crawls live remote pages, tests HTTP response, on-page SEO, robots.txt, and sitemap.
                  </span>
                </div>
              </button>

              {/* Option 2: Local Codebase */}
              <button
                type="button"
                onClick={() => {
                  setScanMode('local');
                  if (!websiteUrl) setWebsiteUrl('http://localhost:5173');
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between gap-3 ${
                  scanMode === 'local'
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-md shadow-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`p-2.5 rounded-xl ${
                    scanMode === 'local' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Laptop className="w-5 h-5" />
                  </div>
                  {scanMode === 'local' && (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                      💻 Developer Mode
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                      Codebase + Live Website
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block leading-relaxed">
                    Project is <strong>on your computer & live</strong>. Analyzes the live website properly, maps issues to source code lines, and opens <strong>Google Antigravity IDE</strong> for live coding.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* DYNAMIC INPUTS BASED ON SELECTION */}
          {scanMode === 'online' ? (
            /* ONLINE MODE INPUTS */
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Live Website URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Public domain only. Private IP ranges and localhost are blocked for security.
                </p>
              </div>

              {/* Max Pages */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Maximum Pages to Crawl
                  </label>
                  {!isPro && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Max 5 on Demo
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <select
                    value={maxPages}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isPro && val > 5) {
                        setLimitReason('pro_feature');
                        setShowLimitModal(true);
                        setMaxPages(5);
                        return;
                      }
                      setMaxPages(val);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value={5}>5 pages (Free Demo default)</option>
                    <option value={10}>10 pages {!isPro ? '🔒 (Pro)' : ''}</option>
                    <option value={20}>20 pages {!isPro ? '🔒 (Pro)' : ''}</option>
                    <option value={50}>50 pages {!isPro ? '🔒 (Pro)' : ''}</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* DEVELOPER MODE (LOCAL CODEBASE + LIVE WEBSITE) INPUTS */
            <div className="space-y-5 pt-2 border-t border-slate-200 dark:border-slate-800">
              {/* 1. Live Website / Dev Server URL */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Live Website / Local Dev Server URL <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setWebsiteUrl('http://localhost:5173')}
                      className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800"
                    >
                      :5173 (Vite)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebsiteUrl('http://localhost:3000')}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      :3000
                    </button>
                    <button
                      type="button"
                      onClick={() => setWebsiteUrl('http://127.0.0.1:8000')}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      :8000
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-5 h-5 text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="e.g. http://localhost:5173 or https://my-staging.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Live site is crawled to analyze rendered DOM tags, status codes, and server response time.
                </p>
              </div>

              {/* 2. Local Project Folder Path */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Local Project Folder Path <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectPath('C:\\Users\\AGP KOHAT\\Desktop\\SEO');
                      handleValidatePath();
                    }}
                    className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    <span>Use Current Workspace</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FolderGit2 className="w-5 h-5 text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      required
                      value={projectPath}
                      onChange={(e) => {
                        setProjectPath(e.target.value);
                        setPathValidation(null);
                      }}
                      placeholder="e.g. C:\Users\YourName\Desktop\MyProject"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleValidatePath}
                    disabled={validatingPath || !projectPath.trim()}
                    className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all"
                  >
                    {validatingPath ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4 text-emerald-500" />}
                    <span>Validate Path</span>
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  Maps live SEO issues to exact source files and line numbers so you can edit in Google Antigravity IDE.
                </p>
              </div>

              {/* Path Validation Preview Banner */}
              {pathValidation && (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs flex items-start gap-3 animate-fade-in">
                  <div className="p-2 rounded-lg bg-indigo-500 text-white shrink-0 mt-0.5 shadow-sm">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {pathValidation.projectName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        {pathValidation.framework}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      Found <strong>{pathValidation.fileCount} source files</strong> ready for line-level AST SEO inspection.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OPTIONAL CONTEXT INPUTS (Shared) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Target Keyword */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Keyword (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="e.g. cloud security solutions"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Business / Project Name (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Business Location */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Location (Optional for Local SEO)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              {scanMode === 'online' ? (
                <>
                  <Globe className="w-4 h-4 text-brand-500" />
                  <span>Remote Server & DOM Crawler</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-indigo-500" />
                  <span>Google Antigravity Codebase Engine</span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!isPro && trialUsage.isLimitReached)}
              className={`px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center gap-2 ${
                scanMode === 'online'
                  ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
                  : 'bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 shadow-indigo-500/20'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{scanMode === 'online' ? 'Start Remote SEO Audit' : 'Scan Local Codebase'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Paywall Limit Modal */}
      <TrialLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        triggerReason={limitReason}
      />
    </div>
  );
}
