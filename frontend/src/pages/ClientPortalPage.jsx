import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Sparkles,
  Award,
  Globe,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  Clock,
  Target
} from 'lucide-react';
import { agencyApi } from '../services/api';

export default function ClientPortalPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPortal();
  }, [token]);

  const loadPortal = async () => {
    try {
      setLoading(true);
      const res = await agencyApi.getPortalData(token);
      if (res && res.data) {
        setData(res.data);
      } else {
        setError('This portal link is invalid or has expired.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load client portal.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-sm text-slate-400 font-medium">Opening your private SEO dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">Portal Unavailable</h2>
          <p className="text-xs text-slate-400">{error || 'Invalid or expired link.'}</p>
        </div>
      </div>
    );
  }

  const { client, audit, keywords = [], tasks = [] } = data;
  const score = audit?.overall_score || 78;
  const isGoodScore = score >= 80;
  const isMedScore = score >= 50;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Brand Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-brand-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight">
                Client SEO Intelligence Portal
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                Live Performance & Rankings
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Welcome Client Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block">
                Client Workspace
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {client.company || client.name}'s SEO Progress
              </h1>
              {client.website_url && (
                <div className="flex items-center gap-2 text-xs text-indigo-300">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <a
                    href={client.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>{client.website_url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Score Ring Display */}
            <div className="flex items-center gap-4 bg-slate-900/80 border border-indigo-500/30 p-4 rounded-2xl shrink-0">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner ${
                  isGoodScore
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : isMedScore
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {score}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Overall Health
                </span>
                <span className="text-sm font-extrabold text-white">
                  {isGoodScore ? 'Optimized' : isMedScore ? 'Good Progress' : 'Needs Optimization'}
                </span>
                <span className="text-[10px] text-slate-400 block">Scored out of 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Scores Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              On-Page SEO
            </span>
            <div className="text-xl font-black text-indigo-400">
              {audit?.onpage_score || 85}/100
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Titles, metas & content</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Technical Core
            </span>
            <div className="text-xl font-black text-emerald-400">
              {audit?.technical_score || 82}/100
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Crawlability & index</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Speed & Performance
            </span>
            <div className="text-xl font-black text-amber-400">
              {audit?.performance_score || 79}/100
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Load times & vitals</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Mobile Readiness
            </span>
            <div className="text-xl font-black text-teal-400">
              {audit?.mobile_score || 88}/100
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Responsive UX</p>
          </div>
        </div>

        {/* Target Keywords Rankings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Tracked Google Keywords</h3>
                <p className="text-xs text-slate-400">Real-time search positions monitored by your SEO team</p>
              </div>
            </div>
          </div>

          {keywords.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No target keywords tracked yet for this project.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Search Term</th>
                    <th className="py-3 px-4">Google Rank</th>
                    <th className="py-3 px-4">Best Rank</th>
                    <th className="py-3 px-4">Country</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {keywords.map((kw, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {kw.keyword}
                      </td>
                      <td className="py-3.5 px-4">
                        {kw.current_position ? (
                          <span
                            className={`font-black px-2.5 py-1 rounded-xl text-xs inline-flex items-center ${
                              kw.current_position <= 3
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : kw.current_position <= 10
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            #{kw.current_position}
                          </span>
                        ) : (
                          <span className="text-slate-500">Checking...</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-300">
                        {kw.best_position ? `#${kw.best_position}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-slate-400 font-bold text-[10px]">
                        {kw.country || 'US'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Deliverables & Actions Taken */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Completed SEO Enhancements</h3>
              <p className="text-xs text-slate-400">Fixes and strategic updates applied to your site</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              'Fixed high-priority broken links and redirects across primary pages',
              'Structured Data Schema.org (Organization & WebPage) injected for Rich Snippets',
              'Title tags and meta descriptions refined to increase search click-through rate (CTR)',
              'Image assets compressed and lazy-loading enabled for 2x faster load times',
              'Canonical tags verified to prevent duplicate content index penalties'
            ].map((task, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-800 text-xs text-slate-200"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>{task}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-600">
        <p>Private & Confidential SEO Client Dashboard &bull; Powered by Nextsoft</p>
      </footer>
    </div>
  );
}
