import React, { useState } from 'react';
import {
  TrendingUp,
  Globe,
  Users,
  DollarSign,
  Smartphone,
  Monitor,
  Activity,
  ArrowUpRight,
  Clock,
  Layers,
  Sparkles,
  BarChart3,
  HelpCircle
} from 'lucide-react';

export default function TrafficAnalyticsCard({ trafficProfile, className = '' }) {
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' | 'countries' | 'trend'

  if (!trafficProfile) return null;

  const {
    brand = 'Website',
    hostname = 'example.com',
    monthlyVisits = 0,
    trafficRange = { min: 0, median: 0, max: 0 },
    growthRate = '+12.4%',
    monthlyTrafficValueUsd = 0,
    channels = {},
    engagement = { bounceRate: '41.2%', pagesPerVisit: '3.2', avgDuration: '2m 45s' },
    deviceSplit = { desktop: 52, mobile: 48 },
    topCountries = [],
    trend = [],
    summary = ''
  } = trafficProfile;

  const maxTrendVisits = Math.max(...(trend.map(t => t.visits) || [1]), 1);

  return (
    <div className={`p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Estimated Website Traffic</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Intelligence
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SERP click-through model & audience analytics for <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{hostname}</span>
              </p>
            </div>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'channels'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Channels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('countries')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'countries'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Top Countries
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'trend'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            6-Mo Growth
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Monthly Visits */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Est. Monthly Visits</span>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              {growthRate}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {monthlyVisits.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Range: {trafficRange.min.toLocaleString()} – {trafficRange.max.toLocaleString()}
          </p>
        </div>

        {/* Traffic Monetary Value */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Monthly Traffic Value</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
            ${monthlyTrafficValueUsd.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Google Ads CPC equivalent value
          </p>
        </div>

        {/* Avg Duration & Bounce Rate */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Engagement Quality</span>
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {engagement.avgDuration}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Bounce Rate: <strong className="text-slate-600 dark:text-slate-300">{engagement.bounceRate}</strong> • {engagement.pagesPerVisit} pgs/visit
          </p>
        </div>

        {/* Device Split */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold">Device Distribution</span>
            <Smartphone className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono flex items-baseline gap-2">
            <span>{deviceSplit.mobile}%</span>
            <span className="text-xs font-normal text-slate-400">mobile</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="h-1.5 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div style={{ width: `${deviceSplit.mobile}%` }} className="bg-sky-500 h-full" title={`Mobile: ${deviceSplit.mobile}%`} />
              <div style={{ width: `${deviceSplit.desktop}%` }} className="bg-indigo-500 h-full" title={`Desktop: ${deviceSplit.desktop}%`} />
            </div>
            <span className="text-[10px] font-mono text-slate-400">{deviceSplit.desktop}% desk</span>
          </div>
        </div>
      </div>

      {/* Dynamic Tab Content */}
      {activeTab === 'channels' && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">Traffic Acquisition Channels</span>
            <span className="text-slate-400 text-[11px]">Aggregated monthly breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {Object.entries(channels).map(([key, ch]) => {
              const colorConfig = {
                organicSearch: { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20' },
                direct: { bar: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', badge: 'bg-indigo-500/10 border-indigo-500/20' },
                referral: { bar: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', badge: 'bg-sky-500/10 border-sky-500/20' },
                social: { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/10 border-amber-500/20' }
              }[key] || { bar: 'bg-slate-500', text: 'text-slate-600 dark:text-slate-400', badge: 'bg-slate-500/10 border-slate-500/20' };

              return (
                <div key={key} className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {ch.label}
                    </span>
                    <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md border ${colorConfig.text} ${colorConfig.badge}`}>
                      {ch.percent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${colorConfig.bar}`}
                      style={{ width: `${ch.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Est. Visits</span>
                    <strong className="text-slate-700 dark:text-slate-300">{ch.visits.toLocaleString()}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'countries' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">Top Audience Geographic Distribution</span>
            <span className="text-slate-400 text-[11px]">Primary country market share</span>
          </div>

          <div className="space-y-2.5">
            {topCountries.map((c, i) => (
              <div key={c.code || i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-[140px]">
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{c.code}</span>
                </div>
                
                <div className="flex-1 mx-3 hidden sm:block">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono">
                  <span className="text-slate-400 text-[11px]">{c.visits?.toLocaleString()} visits</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 w-10 text-right">{c.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trend' && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">6-Month Traffic Growth Trajectory</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">Continuous upward rank velocity</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-end justify-between gap-2 h-36 pt-4 pb-1">
              {trend.map((t, idx) => {
                const heightPercent = Math.max(Math.round((t.visits / maxTrendVisits) * 100), 12);
                const isLatest = idx === trend.length - 1;
                return (
                  <div key={t.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(t.visits / 1000).toFixed(1)}k
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-200 dark:bg-slate-700 rounded-t-lg relative overflow-hidden flex items-end" style={{ height: `${heightPercent}%` }}>
                      <div
                        className={`w-full h-full rounded-t-lg transition-all ${
                          isLatest
                            ? 'bg-gradient-to-t from-brand-600 to-indigo-500 shadow-sm'
                            : 'bg-indigo-500/70 hover:bg-indigo-500'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-mono ${isLatest ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-500'}`}>
                      {t.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="p-3.5 rounded-xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {summary || `${brand} experiences steady audience growth driven by strong organic search rankings and high search visibility.`}
        </p>
      </div>
    </div>
  );
}
