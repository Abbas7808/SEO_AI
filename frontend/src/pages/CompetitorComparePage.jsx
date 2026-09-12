import React, { useState } from 'react';
import {
  GitCompare,
  Trophy,
  ArrowRight,
  TrendingUp,
  Globe,
  AlertCircle,
  CheckCircle2,
  Zap,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { auditApi } from '../services/api';
import { compareAuditsLive } from '../services/liveScanner';
import ScoreBadge from '../components/common/ScoreBadge';

export default function CompetitorComparePage() {
  const [urlA, setUrlA] = useState('https://example.com');
  const [urlB, setUrlB] = useState('https://mysite.com');
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [error, setError] = useState('');

  // Default demo comparison for immediate interactive preview
  const defaultDemo = {
    siteA: {
      website_url: 'https://example.com',
      seo_score: 84,
      technical_score: 88,
      onpage_score: 85,
      content_score: 80,
      performance_score: 92,
      structured_data_score: 75,
      social_score: 80,
      pages_crawled: 18
    },
    siteB: {
      website_url: 'https://mysite.com',
      seo_score: 72,
      technical_score: 70,
      onpage_score: 75,
      content_score: 68,
      performance_score: 80,
      structured_data_score: 50,
      social_score: 60,
      pages_crawled: 12
    },
    summary: {
      winner: 'Site A',
      winsA: 7,
      winsB: 0,
      scoreDifference: 12
    },
    metrics: [
      { name: 'Overall SEO Score', valA: 84, valB: 72, unit: '/100', winner: 'A' },
      { name: 'Technical SEO', valA: 88, valB: 70, unit: '/100', winner: 'A' },
      { name: 'On-Page SEO', valA: 85, valB: 75, unit: '/100', winner: 'A' },
      { name: 'Content Depth', valA: 80, valB: 68, unit: '/100', winner: 'A' },
      { name: 'Performance & Speed', valA: 92, valB: 80, unit: '/100', winner: 'A' },
      { name: 'Structured Data (Schema)', valA: 75, valB: 50, unit: '/100', winner: 'A' },
      { name: 'Social SEO (OG/Twitter)', valA: 80, valB: 60, unit: '/100', winner: 'A' },
      { name: 'Crawled Pages Breadth', valA: 18, valB: 12, unit: ' pages', winner: 'A' }
    ]
  };

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    if (!urlA.trim() || !urlB.trim()) {
      setError('Please provide both URLs to compare.');
      return;
    }

    try {
      setComparing(true);
      setError('');

      let resultData = null;

      // 1. If backend API is configured, try backend first
      if (import.meta.env.VITE_API_URL) {
        try {
          const res = await auditApi.compareAudits({ urlA: urlA.trim(), urlB: urlB.trim() });
          if (res?.data) {
            resultData = res.data;
          }
        } catch (apiErr) {
          console.warn('Backend compareAudits unavailable, using client live comparator:', apiErr.message);
        }
      }

      // 2. Real-time client-side live dual scan
      if (!resultData) {
        resultData = await compareAuditsLive(urlA.trim(), urlB.trim());
      }

      if (resultData) {
        setCompareResult(resultData);
      } else {
        throw new Error('Comparison could not be completed for these URLs.');
      }
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message || 'Comparison failed. Please verify URLs.');
    } finally {
      setComparing(false);
    }
  };

  const data = compareResult || defaultDemo;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white shadow-xl border border-amber-900/40">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Competitive Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Competitor SEO Head-to-Head
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Benchmark your website directly against competitors. Uncover critical ranking gaps across technical
            health, content depth, speed, and structured metadata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-semibold text-amber-200">
            Side-by-Side Diagnostic Engine
          </div>
        </div>
      </div>

      {/* URL Input Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleCompare} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Site A (Your Website) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={urlA}
                  onChange={(e) => setUrlA(e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Site B (Competitor Website) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={urlB}
                  onChange={(e) => setUrlB(e.target.value)}
                  placeholder="https://competitor.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={comparing}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              {comparing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Crawling & Comparing...</span>
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4" />
                  <span>Run Head-to-Head Comparison</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {data && (
        <div className="space-y-6">
          {/* Winner Verdict Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                  Head-to-Head Verdict
                </span>
                <h3 className="text-xl font-extrabold tracking-tight">
                  {data.summary.winner === 'Site A' ? data.siteA.website_url : data.siteB.website_url} leads by +{data.summary.scoreDifference} points!
                </h3>
                <p className="text-xs text-amber-100">
                  Site A won {data.summary.winsA} categories vs Site B won {data.summary.winsB} categories.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-xl">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-amber-100 block">Site A Score</span>
                <span className="text-2xl font-black">{data.siteA.seo_score}</span>
              </div>
              <span className="text-lg font-bold text-amber-200">vs</span>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-amber-100 block">Site B Score</span>
                <span className="text-2xl font-black">{data.siteB.seo_score}</span>
              </div>
            </div>
          </div>

          {/* Metric By Metric Comparison Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category & Performance Breakdown
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Metric</th>
                    <th className="px-4 py-3">Site A ({data.siteA.website_url})</th>
                    <th className="px-4 py-3">Site B ({data.siteB.website_url})</th>
                    <th className="px-4 py-3 text-right">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.metrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {m.name}
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <span className={`font-bold ${m.winner === 'A' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {m.valA}{m.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        <span className={`font-bold ${m.winner === 'B' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {m.valB}{m.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {m.winner === 'tie' ? (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Tie
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1 ${
                              m.winner === 'A'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            <Trophy className="w-3 h-3" />
                            <span>{m.winner === 'A' ? 'Site A Leads' : 'Site B Leads'}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
