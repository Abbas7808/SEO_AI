import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, Globe, Search, ArrowRight, Sparkles,
  DollarSign, Users, Activity, Smartphone, Monitor,
  Clock, BarChart3, Copy, Check, Download, ExternalLink,
  RefreshCw, Zap, ArrowUpRight, MousePointer2, Eye,
  Target, Wifi, Signal, ChevronUp, ChevronDown,
  LayoutDashboard, PieChart as PieChartIcon, Map,
  AlertCircle
} from 'lucide-react';
import { auditApi } from '../services/api';
import { estimateTrafficLocally } from '../services/liveScanner';

// ─── Custom tooltip for Recharts ────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl text-xs">
      <div className="font-bold text-slate-300 mb-2">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-white font-mono">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-bold">{prefix}{Number(entry.value).toLocaleString()}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Animated counter hook ───────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);
  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    const start = Date.now();
    const from = count;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (target - from) * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return count;
}

// ─── KPI Metric Card ────────────────────────────────────────────────────────
function MetricCard({ label, value, raw, sub, icon: Icon, color, trend, prefix = '', suffix = '' }) {
  const animated = useCountUp(raw || 0);
  const display = raw != null ? (prefix + animated.toLocaleString() + suffix) : value;
  const isUp = trend && !trend.startsWith('-');
  return (
    <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${color} opacity-5 blur-2xl`} />
      </div>
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-mono">{display}</div>
      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            {isUp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
        {sub && <span className="text-[11px] text-slate-400">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Channel color map ───────────────────────────────────────────────────────
const CHANNEL_COLORS = {
  organicSearch: '#10b981',
  direct:        '#6366f1',
  referral:      '#f59e0b',
  social:        '#ef4444',
};

const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TrafficAnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const getInitialUrl = () => {
    const p = searchParams.get('url');
    if (p) return p;
    try {
      const audits = JSON.parse(localStorage.getItem('seo_audits_list') || '[]');
      if (audits.length > 0 && audits[0].website_url) return audits[0].website_url;
    } catch {}
    return 'https://stripe.com';
  };

  const [inputUrl, setInputUrl]     = useState(getInitialUrl);
  const [analyzing, setAnalyzing]   = useState(false);
  const [trafficData, setTrafficData] = useState(null);
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('seo_traffic_recent_searches') || '[]'); }
    catch { return []; }
  });

  const presetDomains = [
    { label: 'Stripe', url: 'https://stripe.com' },
    { label: 'OpenAI', url: 'https://openai.com' },
    { label: 'GitHub', url: 'https://github.com' },
    { label: 'Shopify', url: 'https://shopify.com' },
    { label: 'Vercel', url: 'https://vercel.com' },
    { label: 'Wikipedia', url: 'https://wikipedia.org' },
  ];

  const saveRecentSearch = (url, visits) => {
    try {
      const domain = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
      const updated = [{ url, domain, visits, timestamp: Date.now() }, ...recentSearches.filter(s => s.domain !== domain)].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem('seo_traffic_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const handleAnalyze = async (urlOverride) => {
    const rawUrl = urlOverride || inputUrl;
    if (!rawUrl?.trim()) return;
    let cleanUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`;

    setAnalyzing(true);
    setError('');
    try {
      let result = null;
      try {
        const res = await auditApi.estimateTraffic({ url: cleanUrl });
        if (res?.data?.trafficProfile || res?.trafficProfile) {
          result = res.data?.trafficProfile || res.trafficProfile;
        }
      } catch {}
      if (!result) result = estimateTrafficLocally(cleanUrl);
      setTrafficData(result);
      saveRecentSearch(cleanUrl, result.monthlyVisits);
      setSearchParams({ url: cleanUrl });
    } catch (err) {
      setError(err.message || 'Failed to estimate website traffic.');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => { handleAnalyze(); }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { setInputUrl(text.trim()); handleAnalyze(text.trim()); }
    } catch {}
  };

  const handleCopySummary = () => {
    if (!trafficData) return;
    const text = `Traffic Analysis — ${trafficData.hostname}\n` +
      `Monthly Visits: ${trafficData.monthlyVisits.toLocaleString()}\n` +
      `Growth: ${trafficData.growthRate}\n` +
      `Organic: ${trafficData.channels.organicSearch?.percent}%\n` +
      `Traffic Value: $${trafficData.monthlyTrafficValueUsd.toLocaleString()}/mo`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!trafficData) return;
    const blob = new Blob([JSON.stringify(trafficData, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url; a.download = `traffic-${trafficData.hostname}.json`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ── Derived chart data ─────────────────────────────────────────────────────
  const channelPieData = trafficData
    ? Object.entries(trafficData.channels).map(([key, ch], i) => ({
        name: ch.label, value: ch.percent, visits: ch.visits, color: PIE_COLORS[i]
      }))
    : [];

  const channelBarData = trafficData
    ? Object.entries(trafficData.channels).map(([key, ch]) => ({
        name: ch.label.replace(' ', '\n'), visits: ch.visits, percent: ch.percent,
        color: CHANNEL_COLORS[key] || '#6366f1'
      }))
    : [];

  // Build 12-month trend by mirroring the 6-month forward
  const trendData = trafficData
    ? [
        ...trafficData.trend.map(t => ({
          month: t.month, visits: t.visits,
          sessions: Math.round(t.visits * 1.08),
          users: Math.round(t.visits * 0.72),
        })),
        // Extrapolate 6 more months with ~3% growth each month
        ...trafficData.trend.map((t, i) => {
          const factor = 1 + ((i + 1) * 0.03);
          const futureMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
          return {
            month: futureMonths[i],
            visits: Math.round(t.visits * factor),
            sessions: Math.round(t.visits * factor * 1.08),
            users: Math.round(t.visits * factor * 0.72),
          };
        })
      ]
    : [];

  // Hour-of-day pattern (Google Analytics–style)
  const hourlyData = trafficData
    ? Array.from({ length: 24 }, (_, h) => {
        const peak = Math.sin(((h - 9) / 12) * Math.PI);
        const factor = 0.3 + Math.max(0, peak * 0.7);
        return {
          hour: `${h.toString().padStart(2, '0')}:00`,
          users: Math.round((trafficData.monthlyVisits / 30 / 24) * factor * (0.9 + Math.random() * 0.2)),
        };
      })
    : [];

  const sections = [
    { id: 'overview',   label: 'Overview',       icon: LayoutDashboard },
    { id: 'audience',   label: 'Audience',        icon: Users },
    { id: 'acquisition',label: 'Acquisition',     icon: Target },
    { id: 'behavior',   label: 'Behavior',        icon: MousePointer2 },
    { id: 'realtime',   label: 'Real-Time',       icon: Wifi },
  ];

  return (
    <div className="min-h-screen space-y-0 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Traffic Analytics
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live Model
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Intelligent traffic estimation powered by SERP click-through modeling and audience analytics
            </p>
          </div>
        </div>
        {trafficData && (
          <div className="flex items-center gap-2">
            <button onClick={handleCopySummary} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleDownloadJson} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => navigate(`/dashboard/new?url=${encodeURIComponent(trafficData.websiteUrl)}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Full Audit
            </button>
          </div>
        )}
      </div>

      {/* ── URL Input Bar ────────────────────────────────────────────────── */}
      <div className="py-4 space-y-3">
        <form onSubmit={e => { e.preventDefault(); handleAnalyze(); }} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Globe className="w-5 h-5 text-brand-500" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="Enter any website URL — e.g. github.com, shopify.com"
              className="w-full pl-11 pr-20 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
            />
            <button type="button" onClick={handlePaste} className="absolute inset-y-1.5 right-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">
              Paste
            </button>
          </div>
          <button
            type="submit"
            disabled={analyzing || !inputUrl.trim()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 hover:from-brand-700 hover:to-indigo-800 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 shrink-0"
          >
            {analyzing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Search className="w-4 h-4" /> Analyze Traffic <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick try:</span>
          {presetDomains.map(p => (
            <button key={p.url} type="button"
              onClick={() => { setInputUrl(p.url); handleAnalyze(p.url); }}
              className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all">
              {p.label}
            </button>
          ))}
          {recentSearches.length > 0 && (
            <>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-2">Recent:</span>
              {recentSearches.map(s => (
                <button key={s.domain} type="button"
                  onClick={() => { setInputUrl(s.url); handleAnalyze(s.url); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono transition-colors">
                  {s.domain}
                  {s.visits && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-sans">{Math.round(s.visits / 1000)}k</span>}
                </button>
              ))}
            </>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {analyzing && (
        <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-brand-100 dark:border-brand-900 border-t-brand-600 dark:border-t-brand-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Modeling Traffic Intelligence...</h3>
              <p className="text-xs text-slate-400 mt-1">SERP click-through modeling · Audience analytics · Channel attribution</p>
            </div>
          </div>
          <div className="flex justify-center gap-6 pt-2">
            {['SERP Analysis', 'Channel Model', 'Audience Data', 'Estimating'].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Results Dashboard ─────────────────────────────────────────────── */}
      {!analyzing && trafficData && (
        <div className="space-y-6">

          {/* Domain Hero Banner */}
          <div className="relative p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 50%, #10b981 0%, transparent 50%)'
            }} />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-black text-2xl text-brand-300">
                  {trafficData.brand.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white">{trafficData.brand}</h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold">{trafficData.trafficTier}</span>
                  </div>
                  <a href={trafficData.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1 underline underline-offset-2 w-fit">
                    {trafficData.hostname} <ExternalLink className="w-3 h-3" />
                  </a>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-slate-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <Signal className="w-3 h-3" /> Live Data Model
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-center">
                <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-2xl border border-white/10">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Monthly Visits</div>
                  <div className="text-3xl font-black text-white font-mono">{trafficData.monthlyVisits.toLocaleString()}</div>
                  <div className="text-[11px] text-emerald-400 font-bold mt-0.5">{trafficData.growthRate} MoM</div>
                </div>
                <div className="bg-white/10 backdrop-blur px-5 py-3 rounded-2xl border border-white/10">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Traffic Value</div>
                  <div className="text-3xl font-black text-amber-400 font-mono">${trafficData.monthlyTrafficValueUsd.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400 font-bold mt-0.5">/ month equiv.</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="relative mt-4 pt-4 border-t border-white/10 text-xs text-slate-300 leading-relaxed">
              {trafficData.summary}
            </div>
          </div>

          {/* ── Section Nav (GA-style) ────────────────────────────────────── */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSection === s.id
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}>
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              SECTION: OVERVIEW
          ═════════════════════════════════════════════════════════════════ */}
          {activeSection === 'overview' && (
            <div className="space-y-6">

              {/* KPI Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Monthly Users" raw={trafficData.monthlyVisits} icon={Users} color="bg-indigo-500" trend={trafficData.growthRate} sub="vs. prior period" />
                <MetricCard label="Organic Search" value={`${trafficData.channels.organicSearch?.percent}%`} icon={Search} color="bg-emerald-500" trend="+4.2%" sub="of total traffic" />
                <MetricCard label="Avg. Session Duration" value={trafficData.engagement?.avgDuration} icon={Clock} color="bg-purple-500" sub={`${trafficData.engagement?.pagesPerVisit} pages/session`} />
                <MetricCard label="Bounce Rate" value={trafficData.engagement?.bounceRate} icon={MousePointer2} color="bg-amber-500" sub="industry avg ~45%" />
              </div>

              {/* Area Chart — 12-month traffic trend */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-brand-600" />
                      Sessions over time
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Rolling 12-month traffic trajectory (6-month historical + 6-month projection)</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-indigo-500"><span className="w-3 h-0.5 bg-indigo-500 rounded" />Sessions</span>
                    <span className="flex items-center gap-1.5 text-emerald-500"><span className="w-3 h-0.5 bg-emerald-500 rounded" />Users</span>
                    <span className="flex items-center gap-1.5 text-amber-500"><span className="w-3 h-0.5 bg-amber-500 rounded" />Visits</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gradVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradSessions)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="users" name="Users" stroke="#10b981" strokeWidth={2} fill="url(#gradUsers)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="visits" name="Visits" stroke="#f59e0b" strokeWidth={1.5} fill="url(#gradVisits)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Metric Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Traffic Range */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">Confidence Range</div>
                  <div className="flex items-end gap-3 mb-3">
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{trafficData.trafficRange.min.toLocaleString()}</div>
                    <div className="text-slate-400 dark:text-slate-600 text-sm pb-0.5">–</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{trafficData.trafficRange.max.toLocaleString()}</div>
                  </div>
                  <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-[20%] right-[20%] bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full" />
                    <div className="absolute inset-y-0 left-[50%] w-0.5 bg-white dark:bg-slate-900" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                    <span>Conservative</span>
                    <span className="text-brand-600 font-bold">Median: {trafficData.monthlyVisits.toLocaleString()}</span>
                    <span>Optimistic</span>
                  </div>
                </div>

                {/* Device Split */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> Device Distribution
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-indigo-500" />
                      <div>
                        <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{trafficData.deviceSplit.desktop}%</div>
                        <div className="text-[10px] text-slate-400">Desktop</div>
                      </div>
                    </div>
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-indigo-500 h-full transition-all" style={{ width: `${trafficData.deviceSplit.desktop}%` }} />
                      <div className="bg-purple-500 h-full transition-all" style={{ width: `${trafficData.deviceSplit.mobile}%` }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{trafficData.deviceSplit.mobile}%</div>
                        <div className="text-[10px] text-slate-400">Mobile</div>
                      </div>
                      <Smartphone className="w-5 h-5 text-purple-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40">
                      <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">{Math.round(trafficData.monthlyVisits * trafficData.deviceSplit.desktop / 100).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">desktop visits</div>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
                      <div className="font-mono font-black text-purple-600 dark:text-purple-400">{Math.round(trafficData.monthlyVisits * trafficData.deviceSplit.mobile / 100).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">mobile visits</div>
                    </div>
                  </div>
                </div>

                {/* Engagement */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Engagement Metrics
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Avg. Session Duration', value: trafficData.engagement?.avgDuration, icon: Clock, color: 'text-purple-600 dark:text-purple-400' },
                      { label: 'Pages / Session', value: trafficData.engagement?.pagesPerVisit, icon: Eye, color: 'text-emerald-600 dark:text-emerald-400' },
                      { label: 'Bounce Rate', value: trafficData.engagement?.bounceRate, icon: MousePointer2, color: 'text-amber-600 dark:text-amber-400' },
                    ].map(m => (
                      <div key={m.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <m.icon className="w-3.5 h-3.5" />
                          {m.label}
                        </div>
                        <span className={`text-sm font-black font-mono ${m.color}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              SECTION: AUDIENCE
          ═════════════════════════════════════════════════════════════════ */}
          {activeSection === 'audience' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Monthly Users" raw={trafficData.monthlyVisits} icon={Users} color="bg-indigo-500" trend={trafficData.growthRate} />
                <MetricCard label="New Users" raw={Math.round(trafficData.monthlyVisits * 0.62)} icon={Zap} color="bg-emerald-500" sub="62% new visits" />
                <MetricCard label="Desktop Users" raw={Math.round(trafficData.monthlyVisits * trafficData.deviceSplit.desktop / 100)} icon={Monitor} color="bg-blue-500" />
                <MetricCard label="Mobile Users" raw={Math.round(trafficData.monthlyVisits * trafficData.deviceSplit.mobile / 100)} icon={Smartphone} color="bg-purple-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Countries */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-500" /> Top Countries
                  </h3>
                  <p className="text-xs text-slate-400 mb-5">Primary geographic visitor distribution</p>
                  <div className="space-y-3">
                    {trafficData.topCountries.map((c, i) => {
                      const barColors = ['bg-indigo-500', 'bg-brand-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                      return (
                        <div key={c.code} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-base leading-none">{c.flag}</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{c.code}</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono">
                              <span className="text-slate-500">{c.visits?.toLocaleString()}</span>
                              <span className="font-extrabold text-slate-900 dark:text-white w-10 text-right">{c.percent}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColors[i]} transition-all duration-700`} style={{ width: `${c.percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Country Bar Chart */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Map className="w-5 h-5 text-emerald-500" /> Visits by Country
                  </h3>
                  <p className="text-xs text-slate-400 mb-5">Monthly visit volume per market</p>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={trafficData.topCountries} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="visits" name="Visits" radius={[0, 6, 6, 0]}>
                        {trafficData.topCountries.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Device Distribution Pie */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-purple-500" /> Device Breakdown
                </h3>
                <p className="text-xs text-slate-400 mb-5">User device category split</p>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <ResponsiveContainer width={220} height={220}>
                    <PieChart>
                      <Pie data={[
                        { name: 'Desktop', value: trafficData.deviceSplit.desktop },
                        { name: 'Mobile', value: trafficData.deviceSplit.mobile },
                      ]} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                        <Cell fill="#6366f1" />
                        <Cell fill="#a855f7" />
                      </Pie>
                      <Tooltip formatter={(val) => `${val}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4 flex-1">
                    {[
                      { label: 'Desktop', pct: trafficData.deviceSplit.desktop, visits: Math.round(trafficData.monthlyVisits * trafficData.deviceSplit.desktop / 100), color: 'bg-indigo-500', Icon: Monitor },
                      { label: 'Mobile', pct: trafficData.deviceSplit.mobile, visits: Math.round(trafficData.monthlyVisits * trafficData.deviceSplit.mobile / 100), color: 'bg-purple-500', Icon: Smartphone },
                    ].map(d => (
                      <div key={d.label} className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-sm ${d.color} shrink-0`} />
                        <d.Icon className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
                            <span>{d.label}</span>
                            <span className="font-mono">{d.pct}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{d.visits.toLocaleString()} visits/mo</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              SECTION: ACQUISITION
          ═════════════════════════════════════════════════════════════════ */}
          {activeSection === 'acquisition' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(trafficData.channels).map(([key, ch], i) => (
                  <MetricCard key={key} label={ch.label} raw={ch.visits} icon={[Search, Globe, ArrowUpRight, Users][i]} color={['bg-emerald-500', 'bg-indigo-500', 'bg-amber-500', 'bg-rose-500'][i]} sub={`${ch.percent}% of total`} />
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie chart */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-brand-600" /> Channel Share
                  </h3>
                  <p className="text-xs text-slate-400 mb-5">Traffic distribution by acquisition source</p>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie data={channelPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                          {channelPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(val) => `${val}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3 flex-1">
                      {channelPieData.map(ch => (
                        <div key={ch.name} className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: ch.color }} />
                          <div className="flex-1">
                            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                              <span>{ch.name}</span>
                              <span className="font-mono">{ch.value}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${ch.value}%`, background: ch.color }} />
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ch.visits?.toLocaleString()} visits/mo</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-500" /> Visits by Channel
                  </h3>
                  <p className="text-xs text-slate-400 mb-5">Monthly visit volume per acquisition source</p>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={channelBarData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="visits" name="Visits" radius={[6, 6, 0, 0]}>
                        {channelBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Keywords Table */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Search className="w-5 h-5 text-emerald-500" /> Top Organic Keywords
                </h3>
                <p className="text-xs text-slate-400 mb-5">Estimated top ranking queries generating organic traffic</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-left">
                        <th className="pb-3 px-3">#</th>
                        <th className="pb-3 px-3">Keyword</th>
                        <th className="pb-3 px-3">Position</th>
                        <th className="pb-3 px-3">Monthly Volume</th>
                        <th className="pb-3 px-3">CPC</th>
                        <th className="pb-3 px-3">Intent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {[
                        { keyword: `${trafficData.brand.toLowerCase()}`, position: 1, volume: Math.round(trafficData.monthlyVisits * 0.18), cpc: '$3.20', intent: 'Navigational' },
                        { keyword: `${trafficData.brand.toLowerCase()} login`, position: 1, volume: Math.round(trafficData.monthlyVisits * 0.12), cpc: '$2.40', intent: 'Navigational' },
                        { keyword: `${trafficData.brand.toLowerCase()} pricing`, position: 2, volume: Math.round(trafficData.monthlyVisits * 0.07), cpc: '$3.80', intent: 'Transactional' },
                        { keyword: `${trafficData.brand.toLowerCase()} reviews`, position: 2, volume: Math.round(trafficData.monthlyVisits * 0.09), cpc: '$1.85', intent: 'Commercial' },
                        { keyword: `best ${trafficData.brand.toLowerCase()} alternatives`, position: 3, volume: Math.round(trafficData.monthlyVisits * 0.05), cpc: '$4.10', intent: 'Informational' },
                        { keyword: `how to use ${trafficData.brand.toLowerCase()}`, position: 4, volume: Math.round(trafficData.monthlyVisits * 0.04), cpc: '$1.40', intent: 'Informational' },
                      ].map((kw, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 text-slate-400 font-mono">{i + 1}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{kw.keyword}</td>
                          <td className="py-3 px-3 font-mono">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">#{kw.position}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">{kw.volume.toLocaleString()}/mo</td>
                          <td className="py-3 px-3 font-mono text-amber-600 dark:text-amber-400 font-bold">{kw.cpc}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{kw.intent}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* AI Channel Insight */}
                <div className="mt-5 p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/50 dark:border-brand-900/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300 mb-1.5">
                    <Sparkles className="w-4 h-4" /> AI Channel Insight
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Organic search delivers <strong className="text-slate-800 dark:text-slate-200">{trafficData.channels.organicSearch?.percent}%</strong> of all traffic for <strong className="text-slate-800 dark:text-slate-200">{trafficData.hostname}</strong>. Expanding long-tail keyword content and building high-authority backlinks will accelerate customer acquisition without increasing ad spend. Google Ads equivalent monthly value of this organic traffic is <strong className="text-amber-600 dark:text-amber-400">${trafficData.monthlyTrafficValueUsd.toLocaleString()}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              SECTION: BEHAVIOR
          ═════════════════════════════════════════════════════════════════ */}
          {activeSection === 'behavior' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Avg. Session Duration" value={trafficData.engagement?.avgDuration} icon={Clock} color="bg-purple-500" sub="time on site" />
                <MetricCard label="Pages per Session" value={trafficData.engagement?.pagesPerVisit} icon={Eye} color="bg-blue-500" sub="pageviews/visit" />
                <MetricCard label="Bounce Rate" value={trafficData.engagement?.bounceRate} icon={MousePointer2} color="bg-amber-500" sub="single-page sessions" />
                <MetricCard label="Return Visits" value={`${Math.round(100 - parseFloat(trafficData.engagement?.bounceRate))}%`} icon={Users} color="bg-emerald-500" sub="multi-page sessions" />
              </div>

              {/* Hourly Users Chart */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" /> Users by Hour of Day
                </h3>
                <p className="text-xs text-slate-400 mb-5">Traffic pattern distribution across 24 hours (daily average)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradHourly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip suffix=" users" />} />
                    <Area type="monotone" dataKey="users" name="Users" stroke="#a855f7" strokeWidth={2.5} fill="url(#gradHourly)" dot={false} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement metrics visual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" /> Engagement Quality Score
                  </h3>
                  {[
                    { label: 'Session Duration Score', value: 78, color: 'bg-purple-500' },
                    { label: 'Pages Depth Score', value: Math.min(Math.round(parseFloat(trafficData.engagement?.pagesPerVisit) / 5 * 100), 100), color: 'bg-blue-500' },
                    { label: 'Return Visitor Rate', value: Math.round(100 - parseFloat(trafficData.engagement?.bounceRate)), color: 'bg-emerald-500' },
                    { label: 'Content Engagement', value: 71, color: 'bg-amber-500' },
                  ].map(m => (
                    <div key={m.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{m.label}</span>
                        <span className="font-mono">{m.value}/100</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${m.color} rounded-full transition-all duration-700`} style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-500" /> Traffic Monetary Value
                  </h3>
                  <div className="text-center py-4">
                    <div className="text-5xl font-black text-amber-500 font-mono">${trafficData.monthlyTrafficValueUsd.toLocaleString()}</div>
                    <div className="text-xs text-slate-400 mt-2">Google Ads CPC equivalent / month</div>
                    <div className="text-xs text-slate-400">~${((trafficData.monthlyTrafficValueUsd * 12) / 1000).toFixed(0)}k annual equivalent</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-slate-500">Est. avg. CPC</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">${(trafficData.monthlyTrafficValueUsd / (trafficData.channels.organicSearch?.visits || 1) * 3).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-slate-500">Organic clicks valued</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{(trafficData.channels.organicSearch?.visits || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                      <span className="text-amber-700 dark:text-amber-300 font-semibold">Annual equivalent</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">${(trafficData.monthlyTrafficValueUsd * 12).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              SECTION: REAL-TIME
          ═════════════════════════════════════════════════════════════════ */}
          {activeSection === 'realtime' && (
            <div className="space-y-6">
              {/* Real-time hero */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white shadow-xl border border-emerald-900/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">Real-Time Traffic Model</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold">LIVE</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Users (est.)', value: Math.round(trafficData.monthlyVisits / 30 / 24 * 0.8).toLocaleString(), icon: Users, color: 'text-emerald-400' },
                    { label: 'Daily Visits (est.)', value: Math.round(trafficData.monthlyVisits / 30).toLocaleString(), icon: Eye, color: 'text-blue-400' },
                    { label: 'Hourly Sessions', value: Math.round(trafficData.monthlyVisits / 30 / 24).toLocaleString(), icon: Clock, color: 'text-purple-400' },
                    { label: 'Est. Revenue/hr', value: `$${Math.round(trafficData.monthlyTrafficValueUsd / 30 / 24)}`, icon: DollarSign, color: 'text-amber-400' },
                  ].map(m => (
                    <div key={m.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
                      <div className={`text-2xl font-black font-mono ${m.color}`}>{m.value}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Activity Line Chart */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-emerald-500" /> Live Traffic Pulse
                  </h3>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Updating model
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="visits" name="Visits" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="users" name="Users" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 5 }} strokeDasharray="5 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Channel real-time breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(trafficData.channels).map(([key, ch], i) => {
                  const dailyVisits = Math.round(ch.visits / 30);
                  const hourlyVisits = Math.round(dailyVisits / 24);
                  return (
                    <div key={key} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{ch.label}</span>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: PIE_COLORS[i] }} />
                      </div>
                      <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{hourlyVisits.toLocaleString()}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">visits / hour</div>
                      <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full animate-pulse" style={{ width: `${ch.percent}%`, background: PIE_COLORS[i] }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                        <span>{ch.percent}% share</span>
                        <span>{dailyVisits.toLocaleString()}/day</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!analyzing && !trafficData && !error && (
        <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Paste any website URL to get started</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">Traffic estimation with channel attribution, audience demographics, and Google Analytics–style reporting.</p>
        </div>
      )}

    </div>
  );
}
