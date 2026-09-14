import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Globe,
  Search,
  ArrowRight,
  Sparkles,
  DollarSign,
  Users,
  Activity,
  Smartphone,
  Monitor,
  Clock,
  Layers,
  BarChart3,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Zap,
  ArrowUpRight,
  PieChart
} from 'lucide-react';
import { auditApi } from '../services/api';
import { estimateTrafficLocally, extractBrandFromUrl } from '../services/liveScanner';

export default function TrafficAnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Pick initial URL from URL query or last audit in local storage or default
  const getInitialUrl = () => {
    const fromParam = searchParams.get('url');
    if (fromParam) return fromParam;
    try {
      const audits = JSON.parse(localStorage.getItem('seo_audits_list') || '[]');
      if (audits.length > 0 && audits[0].website_url) return audits[0].website_url;
    } catch (e) {}
    return 'https://stripe.com';
  };

  const [inputUrl, setInputUrl] = useState(getInitialUrl);
  const [analyzing, setAnalyzing] = useState(false);
  const [trafficData, setTrafficData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' | 'audience' | 'trend' | 'keywords'
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('seo_traffic_recent_searches') || '[]');
    } catch {
      return [];
    }
  });

  const presetDomains = [
    { label: 'Stripe', url: 'https://stripe.com' },
    { label: 'OpenAI', url: 'https://openai.com' },
    { label: 'GitHub', url: 'https://github.com' },
    { label: 'Shopify', url: 'https://shopify.com' },
    { label: 'Vercel', url: 'https://vercel.com' },
    { label: 'Wikipedia', url: 'https://wikipedia.org' },
    { label: 'Apple', url: 'https://apple.com' }
  ];

  // Save to recent searches
  const saveRecentSearch = (url, visits) => {
    try {
      const domain = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
      const updated = [
        { url, domain, visits, timestamp: Date.now() },
        ...recentSearches.filter(s => s.domain !== domain)
      ].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem('seo_traffic_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAnalyze = async (urlOverride) => {
    const rawUrl = urlOverride || inputUrl;
    if (!rawUrl || !rawUrl.trim()) return;

    let cleanUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      setAnalyzing(true);
      setError('');

      let result = null;

      // 1. Try backend API first
      try {
        const res = await auditApi.estimateTraffic({ url: cleanUrl });
        if (res && (res.data?.trafficProfile || res.trafficProfile)) {
          result = res.data?.trafficProfile || res.trafficProfile;
        }
      } catch (backendErr) {
        // Backend offline or route unreachable, fallback to client-side estimator
      }

      // 2. Client-side fallback estimator if backend returned empty
      if (!result) {
        result = estimateTrafficLocally(cleanUrl);
      }

      setTrafficData(result);
      saveRecentSearch(cleanUrl, result.monthlyVisits);
      setSearchParams({ url: cleanUrl });
    } catch (err) {
      setError(err.message || 'Failed to estimate website traffic. Please verify the URL.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Initial load
  useEffect(() => {
    handleAnalyze();
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text.trim());
        handleAnalyze(text.trim());
      }
    } catch (e) {}
  };

  const handleCopySummary = () => {
    if (!trafficData) return;
    const text = `📊 Website Traffic Analysis for ${trafficData.hostname}:\n` +
      `• Estimated Monthly Visits: ${trafficData.monthlyVisits.toLocaleString()} (${trafficData.growthRate} MoM)\n` +
      `• Range: ${trafficData.trafficRange.min.toLocaleString()} - ${trafficData.trafficRange.max.toLocaleString()}\n` +
      `• Organic Search Share: ${trafficData.channels.organicSearch.percent}% (${trafficData.channels.organicSearch.visits.toLocaleString()} visits)\n` +
      `• Google Ads Value: $${trafficData.monthlyTrafficValueUsd.toLocaleString()} /mo\n` +
      `• Bounce Rate: ${trafficData.engagement.bounceRate} | Pages/Visit: ${trafficData.engagement.pagesPerVisit}\n` +
      `• Device Split: Desktop ${trafficData.deviceSplit.desktop}% / Mobile ${trafficData.deviceSplit.mobile}%\n` +
      `Analyzed via SiteGlow AI SEO Engine`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!trafficData) return;
    const blob = new Blob([JSON.stringify(trafficData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-report-${trafficData.hostname}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const maxTrendVisits = trafficData ? Math.max(...trafficData.trend.map(t => t.visits), 1) : 1;

  return (
    <div className="space-y-7 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>Website Traffic Analytics</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Traffic Model
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Paste any domain or URL to inspect monthly traffic volume, visitor channels, PPC advertising valuation, and geographic audience.
              </p>
            </div>
          </div>
        </div>

        {trafficData && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => navigate(`/dashboard/new?url=${encodeURIComponent(trafficData.websiteUrl)}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Full Audit</span>
            </button>
          </div>
        )}
      </div>

      {/* URL Paste & Search Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-5 h-5 text-brand-500" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste any website URL (e.g. github.com, stripe.com, yoursite.com)..."
              className="w-full pl-11 pr-20 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute inset-y-1.5 right-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              Paste
            </button>
          </div>

          <button
            type="submit"
            disabled={analyzing || !inputUrl.trim()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 hover:from-brand-700 hover:to-indigo-800 disabled:opacity-50 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 shrink-0"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Estimating Traffic...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Check Traffic</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Test Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick Try:
          </span>
          {presetDomains.map((p) => (
            <button
              key={p.url}
              type="button"
              onClick={() => {
                setInputUrl(p.url);
                handleAnalyze(p.url);
              }}
              className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recent:
            </span>
            {recentSearches.map((s) => (
              <button
                key={s.domain}
                type="button"
                onClick={() => {
                  setInputUrl(s.url);
                  handleAnalyze(s.url);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-mono transition-colors"
              >
                <span>{s.domain}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-sans">
                  {s.visits ? `${Math.round(s.visits / 1000)}k/mo` : ''}
                </span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {analyzing && (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 mx-auto flex items-center justify-center animate-bounce">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Querying Traffic Intelligence Network...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregating SERP click models, search volume distributions, and audience clickstreams.
            </p>
          </div>
        </div>
      )}

      {/* Active Traffic Results */}
      {!analyzing && trafficData && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Domain Overview Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-black text-xl text-brand-300">
                  {trafficData.brand.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black tracking-tight text-white">
                      {trafficData.brand}
                    </h2>
                    <a
                      href={trafficData.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1 underline underline-offset-2"
                    >
                      {trafficData.hostname}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-brand-500/30 border border-brand-400/40 text-brand-200 font-bold">
                      {trafficData.trafficTier || 'High Authority'}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">
                      {trafficData.growthRate} MoM Growth
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div className="bg-white/10 backdrop-blur px-4 py-2.5 rounded-2xl border border-white/10">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300">
                    Est. Monthly Visits
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {trafficData.monthlyVisits.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/10">
              {trafficData.summary}
            </p>
          </div>

          {/* 4 Core Traffic Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Monthly Visits & Confidence Range */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
                <span className="uppercase tracking-wider">Estimated Visits</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {trafficData.monthlyVisits.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Confidence Range:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {trafficData.trafficRange.min.toLocaleString()} – {trafficData.trafficRange.max.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Card 2: Organic Search Share */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
                <span className="uppercase tracking-wider">Organic Search</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                {trafficData.channels.organicSearch?.percent || 55}%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Monthly Search Clicks:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {(trafficData.channels.organicSearch?.visits || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Card 3: Google Ads / PPC Monetary Equivalent */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
                <span className="uppercase tracking-wider">Ad Traffic Value</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
                ${trafficData.monthlyTrafficValueUsd.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>PPC Cost Equivalent:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  ~${((trafficData.monthlyTrafficValueUsd * 12) / 1000).toFixed(0)}k /year
                </span>
              </div>
            </div>

            {/* Card 4: Bounce Rate & Engagement */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
                <span className="uppercase tracking-wider">Bounce Rate</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight font-mono">
                {trafficData.engagement?.bounceRate || '38.5%'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Avg Visit Duration:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {trafficData.engagement?.avgDuration || '2m 30s'} ({trafficData.engagement?.pagesPerVisit} pgs)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Deep-Dive Explorer Tabs */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-600" />
                  <span>Traffic Breakdown & Audience Metrics</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detailed channel distribution, geographic visitor origins, device ratios, and search queries.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                {[
                  { id: 'channels', label: 'Acquisition Channels' },
                  { id: 'audience', label: 'Audience & Devices' },
                  { id: 'trend', label: '6-Month Trend' },
                  { id: 'keywords', label: 'Ranking Keywords' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab 1: Acquisition Channels */}
            {activeTab === 'channels' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(trafficData.channels).map(([key, ch]) => {
                    const colorClasses = {
                      organicSearch: 'bg-emerald-500 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                      direct: 'bg-indigo-500 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                      referral: 'bg-amber-500 text-amber-600 dark:text-amber-400 border-amber-500/20',
                      social: 'bg-rose-500 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }[key] || 'bg-brand-500 text-brand-600 border-brand-500/20';

                    return (
                      <div
                        key={key}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {ch.label}
                          </span>
                          <span className="font-mono font-black text-slate-900 dark:text-white">
                            {ch.percent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colorClasses.split(' ')[0]}`}
                            style={{ width: `${ch.percent}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          ~{ch.visits.toLocaleString()} visits/mo
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/40 text-xs text-brand-800 dark:text-brand-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    Channel Strategy Recommendation:
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Organic search delivers {trafficData.channels.organicSearch?.percent}% of all traffic for {trafficData.hostname}. Expanding long-tail keyword content and building high-tier backlinks will accelerate customer acquisition without rising ad spend.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Audience & Devices */}
            {activeTab === 'audience' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Geographic Visitor Origins */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    Top Visitor Countries
                  </h4>
                  <div className="space-y-2.5">
                    {trafficData.topCountries.map((c) => (
                      <div
                        key={c.code}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl leading-none">{c.flag}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {c.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                            {c.percent}%
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {c.visits.toLocaleString()} visits
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Split (Desktop vs Mobile) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-500" />
                    Device Distribution
                  </h4>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <Monitor className="w-4 h-4" />
                        <span>Desktop ({trafficData.deviceSplit.desktop}%)</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Smartphone className="w-4 h-4" />
                        <span>Mobile ({trafficData.deviceSplit.mobile}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 flex overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all"
                        style={{ width: `${trafficData.deviceSplit.desktop}%` }}
                      />
                      <div
                        className="bg-purple-500 h-full transition-all"
                        style={{ width: `${trafficData.deviceSplit.mobile}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-slate-400 text-[10px] font-bold uppercase">Desktop Traffic</div>
                        <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                          {Math.round(trafficData.monthlyVisits * (trafficData.deviceSplit.desktop / 100)).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-slate-400 text-[10px] font-bold uppercase">Mobile Traffic</div>
                        <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                          {Math.round(trafficData.monthlyVisits * (trafficData.deviceSplit.mobile / 100)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: 6-Month Traffic Trend */}
            {activeTab === 'trend' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    6-Month Historical Trajectory
                  </h4>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {trafficData.growthRate} Overall Velocity
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 pt-6 pb-2 px-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  {trafficData.trend.map((point) => {
                    const heightPercent = Math.max(Math.round((point.visits / maxTrendVisits) * 100), 12);
                    return (
                      <div key={point.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {Math.round(point.visits / 1000)}k
                        </div>
                        <div
                          className="w-full max-w-[42px] bg-gradient-to-t from-brand-600 to-indigo-500 rounded-t-xl transition-all group-hover:scale-y-105 group-hover:brightness-110 shadow-xs"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {point.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Ranking Keywords */}
            {activeTab === 'keywords' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Top Organic Search Ranking Queries (Estimated)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="pb-3 px-3">Keyword Query</th>
                        <th className="pb-3 px-3">Ranking Position</th>
                        <th className="pb-3 px-3">Monthly Volume</th>
                        <th className="pb-3 px-3">CPC Ad Value</th>
                        <th className="pb-3 px-3">Search Intent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {(trafficData.topKeywords || [
                        { keyword: `${trafficData.brand.toLowerCase()} login`, position: 1, volume: Math.round(trafficData.monthlyVisits * 0.16), cpc: '$2.40', intent: 'Navigational' },
                        { keyword: `${trafficData.brand.toLowerCase()} reviews`, position: 1, volume: Math.round(trafficData.monthlyVisits * 0.11), cpc: '$1.85', intent: 'Commercial' },
                        { keyword: `best ${trafficData.brand.toLowerCase()} alternatives`, position: 3, volume: Math.round(trafficData.monthlyVisits * 0.07), cpc: '$3.10', intent: 'Informational' },
                        { keyword: `${trafficData.brand.toLowerCase()} pricing plans`, position: 2, volume: Math.round(trafficData.monthlyVisits * 0.05), cpc: '$2.90', intent: 'Transactional' },
                      ]).map((kw, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                            {kw.keyword}
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                              #{kw.position}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                            {kw.volume.toLocaleString()} /mo
                          </td>
                          <td className="py-3 px-3 font-mono text-amber-600 dark:text-amber-400 font-bold">
                            {kw.cpc}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {kw.intent}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
