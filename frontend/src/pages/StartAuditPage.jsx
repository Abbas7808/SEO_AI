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
  FolderGit2,
  Bot,
  FileCheck,
  Layers,
  Code2
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

  // Unified audit inputs
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [projectPath, setProjectPath] = useState('');
  const [maxPages, setMaxPages] = useState(isPro ? 20 : 5);

  // Local folder validation state
  const [validatingPath, setValidatingPath] = useState(false);
  const [pathValidation, setPathValidation] = useState(null);

  // Optional SEO context inputs
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
    const initialPath = searchParams.get('path');
    if (initialPath) {
      setProjectPath(decodeURIComponent(initialPath));
    }
  }, [searchParams]);

  const getAuditSteps = (hasLocalPath) => [
    'Validating live website & checking SSRF safety',
    'Connecting to remote host (SSL handshake & DNS lookup)',
    'Measuring server response latency (TTFB) & status codes',
    'Auditing HTTP security headers (HSTS, CSP, X-Frame-Options)',
    'Inspecting robots.txt & XML sitemap indexability',
    'Crawling internal pages & rendered DOM structure',
    'Checking on-page metadata, title tags & descriptions',
    'Evaluating mobile viewport responsiveness & typography',
    'Scanning images for missing alt attributes',
    'Checking Schema.org JSON-LD structured data',
    ...(hasLocalPath ? [
      'Indexing local project source files (.html, .jsx, .tsx, .vue)',
      'Parsing AST components and mapping issues to exact line numbers',
      'Synthesizing line-level code diffs for Google Antigravity IDE'
    ] : []),
    'Calculating grounded 0-100 SEO health score',
    'Compiling actionable AI recommendations',
    'Audit complete!'
  ];

  const handleValidatePath = async (overridePath) => {
    const pathToValidate = (overridePath || projectPath).trim();
    if (!pathToValidate) return;
    setValidatingPath(true);
    setError('');
    try {
      const res = await auditApi.validateLocalPath({ projectPath: pathToValidate });
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

  const handleUseCurrentWorkspace = () => {
    const defaultWs = 'C:\\Users\\AGP KOHAT\\Desktop\\SEO';
    setProjectPath(defaultWs);
    handleValidatePath(defaultWs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user has exceeded their free trial audits
    if (!canPerformAudit(user?.email)) {
      setLimitReason('trial_exceeded');
      setShowLimitModal(true);
      return;
    }

    if (!websiteUrl.trim()) {
      setError('Please provide a live website URL.');
      return;
    }

    setError('');
    setLoading(true);

    const hasLocalPath = Boolean(projectPath && projectPath.trim());
    const activeSteps = getAuditSteps(hasLocalPath);
    setAuditProgress({ stepIndex: 0, percent: 5, currentStep: activeSteps[0] });

    try {
      // 1. Perform live website crawl & analysis
      let liveScanResult = null;
      try {
        liveScanResult = await scanLiveWebsite(websiteUrl.trim(), {
          targetKeyword: targetKeyword.trim(),
          businessName: businessName.trim(),
          businessLocation: businessLocation.trim(),
        });
      } catch (liveErr) {
        if (!hasLocalPath) {
          throw liveErr;
        }
        console.warn('Live website direct scan warning:', liveErr.message);
      }

      let auditId = liveScanResult?.audit?.id || 1;

      // 2. If local codebase path is provided, also scan source code with AST analyzer
      if (hasLocalPath) {
        const scanResult = await auditApi.scanLocalProject({
          projectPath: projectPath.trim(),
          websiteUrl: websiteUrl.trim(),
          targetKeyword: targetKeyword.trim(),
          businessName: businessName.trim(),
          businessLocation: businessLocation.trim()
        });

        const audit = scanResult.data?.audit;
        if (audit?.id) {
          auditId = audit.id;
        }

        // Store unified live and local data into localStorage
        try {
          const unifiedAudit = {
            ...(liveScanResult?.audit || {}),
            ...(audit || {}),
            website_url: websiteUrl.trim(),
            project_path: projectPath.trim(),
            scan_mode: 'local'
          };
          localStorage.setItem(`seo_current_audit_${auditId}`, JSON.stringify(unifiedAudit));

          const issuesList = (scanResult.data?.scoreResult?.issues && scanResult.data.scoreResult.issues.length > 0)
            ? scanResult.data.scoreResult.issues
            : (liveScanResult?.issues || []);
          localStorage.setItem(`seo_issues_${auditId}`, JSON.stringify(issuesList));

          if (liveScanResult?.siteIntelligence) {
            localStorage.setItem(`seo_site_intel_${auditId}`, JSON.stringify(liveScanResult.siteIntelligence));
          }
          if (liveScanResult?.backlitData) {
            localStorage.setItem(`seo_backlit_${auditId}`, JSON.stringify(liveScanResult.backlitData));
          }
          if (liveScanResult?.primaryPage) {
            localStorage.setItem(`seo_pages_${auditId}`, JSON.stringify([liveScanResult.primaryPage]));
          }

          localStorage.setItem('seo_latest_audit_id', auditId);
        } catch (e) {
          console.warn('LocalStorage synchronization warning:', e);
        }
      }

      // Animate step progress simulation for UI feedback
      for (let i = 0; i < activeSteps.length; i++) {
        await new Promise((r) => setTimeout(r, 320));
        setAuditProgress({
          stepIndex: i,
          percent: Math.round(((i + 1) / activeSteps.length) * 100),
          currentStep: activeSteps[i],
        });
      }

      await new Promise((r) => setTimeout(r, 300));
      navigate(`/dashboard/issues?auditId=${auditId}`);
    } catch (err) {
      setError(err.message || 'Failed to complete audit. Please verify the URL.');
      setAuditProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const hasLocalPath = Boolean(projectPath && projectPath.trim());
  const activeSteps = getAuditSteps(hasLocalPath);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <span>Start Website SEO Audit</span>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Powered</span>
          </span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Crawl your live website, inspect DOM structure, calculate real SEO scores, and optionally connect local source code for Google Antigravity IDE line-level fixes.
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
                  Auditing {websiteUrl}
                </span>
                <span className="text-xs text-slate-500">
                  {hasLocalPath ? `Live Network Crawl + Codebase AST Analysis (${projectPath})` : 'Live Server Crawl & Technical SEO Analysis'}
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
          {/* 1. LIVE WEBSITE URL (Required) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live Website URL <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Dev Server Presets:</span>
                <button
                  type="button"
                  onClick={() => setWebsiteUrl('http://localhost:5173')}
                  className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-all"
                >
                  :5173 (Vite)
                </button>
                <button
                  type="button"
                  onClick={() => setWebsiteUrl('http://localhost:3000')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  :3000
                </button>
                <button
                  type="button"
                  onClick={() => setWebsiteUrl('http://127.0.0.1:8000')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
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
                placeholder="e.g. https://mywebsite.com or http://localhost:5173"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              The website must be live (online or running on a local dev server). We will crawl live HTML, status codes, speed, and metadata.
            </p>
          </div>

          {/* 2. LOCAL PROJECT CODEBASE FOLDER (Optional for Developers) */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Local Project Codebase Folder (Optional)
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Google Antigravity IDE Ready
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentWorkspace}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
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
                    value={projectPath}
                    onChange={(e) => {
                      setProjectPath(e.target.value);
                      setPathValidation(null);
                    }}
                    placeholder="e.g. C:\Users\AGP KOHAT\Desktop\SEO (leave empty for online-only scan)"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleValidatePath()}
                  disabled={validatingPath || !projectPath.trim()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {validatingPath ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4 text-emerald-500" />}
                  <span>Validate Folder</span>
                </button>
              </div>

              <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                If this website's source code is located on this computer, enter the folder path. Our AST engine will map issues to exact code lines and allow 1-click editing in Google Antigravity IDE. Leave empty for remote/client websites.
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
                    Found <strong>{pathValidation.fileCount} source files</strong> ready for line-level AST inspection and Google Antigravity IDE editing.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 3. MAXIMUM PAGES TO CRAWL */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
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

          {/* 4. OPTIONAL CONTEXT INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
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
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              {hasLocalPath ? (
                <>
                  <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Live Crawler + Google Antigravity Code Fixes</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>Live Website Crawler & Technical Engine</span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!isPro && trialUsage.isLimitReached)}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Start Website SEO Audit</span>
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
