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
  Sparkles
} from 'lucide-react';
import { auditApi } from '../services/api';

export default function StartAuditPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [maxPages, setMaxPages] = useState(20);

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
    'Checking technical SEO & robots.txt',
    'Checking metadata, title tags & descriptions',
    'Checking heading structure & hierarchy',
    'Checking image alt attributes & sizes',
    'Checking internal & external link health',
    'Checking Schema.org structured data',
    'Connecting Google Antigravity Autonomous Auto-Fixer (DeepMind Core)',
    'Synthesizing 4-phase SEO roadmap & backlit words',
    'Calculating 0–100 weighted SEO score & generating patches',
    'Generating AI analysis & priority recommendations',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!websiteUrl.trim()) {
      setError('Please provide a website URL');
      return;
    }

    setError('');
    setLoading(true);
    setAuditProgress({ stepIndex: 0, percent: 5, currentStep: auditSteps[0] });

    try {
      // 1. Submit audit to backend
      const res = await auditApi.createAudit({
        websiteUrl: websiteUrl.trim(),
        maxPages: Number(maxPages),
        targetKeyword: targetKeyword.trim() || undefined,
        businessName: businessName.trim() || undefined,
        businessLocation: businessLocation.trim() || undefined,
      });

      const auditId = res.data.audit.id;

      // 2. Animate step progress simulation for UI feedback
      for (let i = 0; i < auditSteps.length; i++) {
        await new Promise((r) => setTimeout(r, 450));
        setAuditProgress({
          stepIndex: i,
          percent: Math.round(((i + 1) / auditSteps.length) * 100),
          currentStep: auditSteps[i],
        });
      }

      await new Promise((r) => setTimeout(r, 500));
      navigate(`/dashboard/issues?auditId=${auditId}&promptReady=true`);
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
                  placeholder="e.g. mobile repair shop"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Max Pages */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Maximum Pages to Crawl
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <select
                  value={maxPages}
                  onChange={(e) => setMaxPages(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value={5}>5 pages (Ultra fast)</option>
                  <option value={10}>10 pages (Fast)</option>
                  <option value={20}>20 pages (Standard default)</option>
                  <option value={50}>50 pages (Deep audit)</option>
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
                  placeholder="e.g. Safdar Mobile Store"
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
                  placeholder="e.g. Hangu, KPK"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Start SEO Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
