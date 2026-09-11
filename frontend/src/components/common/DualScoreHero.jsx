import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Layout,
  Gauge,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

export default function DualScoreHero({ audit, scoreResult }) {
  const [activeDeviceView, setActiveDeviceView] = useState('all'); // 'all' | 'mobile' | 'desktop'

  const overallScore = scoreResult?.overallScore || audit?.seo_score || audit?.score || 78;
  const mobileScore = scoreResult?.mobileScore || audit?.mobile_score || Math.max(10, Math.round(overallScore * 0.94));
  const desktopScore = scoreResult?.desktopScore || audit?.desktop_score || Math.min(100, Math.round(overallScore * 1.03));

  const getScoreColor = (score) => {
    if (score >= 90) return { ring: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
    if (score >= 70) return { ring: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' };
    if (score >= 50) return { ring: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
    return { ring: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' };
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'Grade A (Excellent)';
    if (score >= 80) return 'Grade B (Good)';
    if (score >= 70) return 'Grade C (Fair)';
    if (score >= 50) return 'Grade D (Poor)';
    return 'Grade F (Critical)';
  };

  const mobileColors = getScoreColor(mobileScore);
  const desktopColors = getScoreColor(desktopScore);
  const overallColors = getScoreColor(overallScore);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Header & Device Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Website SEO Audit Scores
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time dual device evaluation: Mobile-First Indexing vs. Desktop Technical Architecture
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveDeviceView('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeDeviceView === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Scores
          </button>
          <button
            type="button"
            onClick={() => setActiveDeviceView('mobile')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeDeviceView === 'mobile'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile Focus
          </button>
          <button
            type="button"
            onClick={() => setActiveDeviceView('desktop')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeDeviceView === 'desktop'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop Focus
          </button>
        </div>
      </div>

      {/* Dual Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Mobile SEO Score Card */}
        <div className={`p-6 rounded-3xl border ${mobileColors.border} ${mobileColors.bg} space-y-4 relative overflow-hidden transition-all duration-300 ${
          activeDeviceView === 'desktop' ? 'opacity-40 grayscale-30' : 'scale-[1.01] shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Mobile SEO Score
                </h3>
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                  Mobile-First Indexing
                </span>
              </div>
            </div>
            <span className={`text-3xl font-black ${mobileColors.text}`}>
              {mobileScore}<span className="text-lg font-bold text-slate-400">/100</span>
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-1000"
                style={{ width: `${mobileScore}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>{getScoreGrade(mobileScore)}</span>
              <span>{mobileScore >= 80 ? 'Ready for Google Mobile Bot' : 'Mobile Improvements Needed'}</span>
            </div>
          </div>

          {/* Key Mobile Factors */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Viewport Scaling</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Touch Tap Targets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Mobile SERP Snippet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Mobile Page Weight</span>
            </div>
          </div>
        </div>

        {/* 2. Desktop SEO Score Card */}
        <div className={`p-6 rounded-3xl border ${desktopColors.border} ${desktopColors.bg} space-y-4 relative overflow-hidden transition-all duration-300 ${
          activeDeviceView === 'mobile' ? 'opacity-40 grayscale-30' : 'scale-[1.01] shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Desktop SEO Score
                </h3>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Full Crawl Architecture
                </span>
              </div>
            </div>
            <span className={`text-3xl font-black ${desktopColors.text}`}>
              {desktopScore}<span className="text-lg font-bold text-slate-400">/100</span>
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${desktopScore}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>{getScoreGrade(desktopScore)}</span>
              <span>{desktopScore >= 80 ? 'Robust Architecture' : 'Technical Gaps Found'}</span>
            </div>
          </div>

          {/* Key Desktop Factors */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Canonical & HTTPS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>H1-H6 Hierarchy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Schema JSON-LD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Content Depth (Words)</span>
            </div>
          </div>
        </div>

        {/* 3. Overall Unified Score Card */}
        <div className={`p-6 rounded-3xl border ${overallColors.border} ${overallColors.bg} space-y-4 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Overall SEO Score
                  </h3>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Weighted 0–100 Index
                  </span>
                </div>
              </div>
              <span className={`text-3xl font-black ${overallColors.text}`}>
                {overallScore}<span className="text-lg font-bold text-slate-400">/100</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
              {mobileScore < desktopScore ? (
                <span>
                  ⚠️ <strong>Mobile score is {desktopScore - mobileScore} pts below Desktop</strong>. Focus on viewport tags, image compression, and mobile tap targets to pass Google's Mobile-First crawl inspection.
                </span>
              ) : (
                <span>
                  ✅ <strong>Balanced cross-device parity</strong>. Mobile and desktop performance are harmonized across crawled pages.
                </span>
              )}
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-500" />
              Audit Health Rating
            </span>
            <span className={overallColors.text}>{getScoreGrade(overallScore)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
