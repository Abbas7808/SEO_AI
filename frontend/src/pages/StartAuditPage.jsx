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
  Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { scanLiveWebsite } from '../services/liveScanner';
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

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [maxPages, setMaxPages] = useState(isPro ? 20 : 5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auditProgress, setAuditProgress] = useState(null);

  useEffect(() => {
    const initialUrl = searchParams.get('url');
    if (initialUrl) {
      setWebsiteUrl(decodeURIComponent(initialUrl));
    }
  }, [searchParams]);

  const auditSteps = [
    'Validating website & checking SSRF safety',
    'Connecting to website host',
    'Crawling discovered internal pages',
    'Checking technical SEO, canonicals & robots.txt',
    'Evaluating mobile responsiveness, viewport & touch ergonomics',
    'Evaluating desktop architecture, metadata & headings',
    'Checking image alt attributes & responsive media',
    'Checking internal & external link health',
    'Checking Schema.org JSON-LD structured data',
    'Calculating Mobile SEO Score & Desktop SEO Score',
    'Synthesizing direct website code solutions & repair blueprints',
    'Compiling step-by-step resolution guides & SEO skills roadmap',
    'Generating prioritized action plan for website',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!websiteUrl.trim()) {
      setError('Please provide a website URL');
      return;
    }

    // Check if user has exceeded their 3 free trial audits
    if (!canPerformAudit(user?.email)) {
      setLimitReason('trial_exceeded');
      setShowLimitModal(true);
      return;
    }

    setError('');
    setLoading(true);
    setAuditProgress({ stepIndex: 0, percent: 5, currentStep: auditSteps[0] });

    try {
      // 1. Execute live real-time website scan and DOM extraction
      const scanResult = await scanLiveWebsite(websiteUrl.trim(), {
        targetKeyword: targetKeyword.trim(),
        businessName: businessName.trim(),
        businessLocation: businessLocation.trim(),
      });

      const auditId = scanResult.audit.id;

      // 2. Animate step progress simulation for UI feedback
      for (let i = 0; i < auditSteps.length; i++) {
        await new Promise((r) => setTimeout(r, 400));
        setAuditProgress({
          stepIndex: i,
          percent: Math.round(((i + 1) / auditSteps.length) * 100),
          currentStep: auditSteps[i],
        });
      }

      await new Promise((r) => setTimeout(r, 400));
      navigate(`/dashboard/issues?auditId=${auditId}`);
    } catch (err) {
      setError(err.message || 'Failed to start audit. Please verify the URL.');
      setAuditProgress(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Start Website SEO Audit
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Perform a real technical, on-page, and AI-powered audit on any public website.
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
            <span className="font-bold block">Audit Failed</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Audit Progress Modal / Overlay */}
      {auditProgress && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-500 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
              <span className="font-bold text-slate-900 dark:text-white">
                Analyzing {websiteUrl}...
              </span>
            </div>
            <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400 font-mono">
              {auditProgress.percent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-brand-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${auditProgress.percent}%` }}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            {auditSteps.map((step, idx) => {
              const isDone = idx < auditProgress.stepIndex;
              const isCurrent = idx === auditProgress.stepIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs ${
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

      {/* Main Audit Form */}
      {!auditProgress && (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Website URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Website URL <span className="text-rose-500">*</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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

            {/* Business Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Business Name (Optional)
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Business Location (Optional)
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

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading || (!isPro && trialUsage.isLimitReached)}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Start SEO Audit</span>
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
