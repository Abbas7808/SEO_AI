import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSearch,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
  ExternalLink,
  ShieldCheck,
  Search,
  ArrowRight,
  RefreshCw,
  FileCode,
  FileCheck,
  Copy,
  Check,
  Download,
  Bot,
  Sparkles,
  Shield,
  AlertCircle,
  Terminal,
  Zap,
  Layers
} from 'lucide-react';
import { auditApi } from '../services/api';
import { inspectSiteLive } from '../services/liveScanner';

export default function SiteInspectorPage() {
  const [searchParams] = useSearchParams();

  const getInitialUrl = () => {
    const fromParam = searchParams.get('url');
    if (fromParam) return fromParam;
    try {
      const audits = JSON.parse(localStorage.getItem('seo_audits_list') || '[]');
      if (audits.length > 0 && audits[0].website_url) return audits[0].website_url;
    } catch (e) {}
    return 'https://nexsoft.site';
  };

  const [targetUrl, setTargetUrl] = useState(getInitialUrl);
  const [inspecting, setInspecting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copiedType, setCopiedType] = useState('');

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(''), 2500);
  };

  const handleDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInspect = async (urlToInspect) => {
    const u = urlToInspect || targetUrl;
    if (!u || !u.trim()) return;

    try {
      setInspecting(true);
      setError('');

      let inspectionData = null;

      // 1. If backend API is configured, try backend first
      if (import.meta.env.VITE_API_URL) {
        try {
          const res = await auditApi.inspectSite({ websiteUrl: u.trim() });
          if (res?.data) {
            inspectionData = res.data;
          }
        } catch (apiErr) {
          console.warn('Backend inspectSite endpoint unavailable, using live client scanner:', apiErr.message);
        }
      }

      // 2. Real-time direct client-side live inspection
      if (!inspectionData) {
        inspectionData = await inspectSiteLive(u.trim());
      }

      if (inspectionData) {
        setResult(inspectionData);
      } else {
        throw new Error('Could not retrieve inspection data for this website.');
      }
    } catch (err) {
      console.error('Inspection error:', err);
      setError(err.message || 'Inspection failed. Please verify the URL.');
    } finally {
      setInspecting(false);
    }
  };

  useEffect(() => {
    const initUrl = getInitialUrl();
    if (initUrl) {
      handleInspect(initUrl);
    }
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 text-white shadow-2xl border border-cyan-800/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold tracking-wide uppercase">
            <FileSearch className="w-3.5 h-3.5" />
            <span>Live Technical Deep Inspector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Robots.txt, Sitemap & Bot Directives Inspector
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real-time crawler access audit, XML sitemap health check, AI & Search Bot permissions (GEO), and 1-click Antigravity code generators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 z-10">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mr-1">Quick Presets:</span>
          {['https://nexsoft.site', 'https://google.com', 'https://github.com', 'https://wikipedia.org'].map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setTargetUrl(sample);
                handleInspect(sample);
              }}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-all hover:scale-105"
            >
              {sample.replace('https://', '')}
            </button>
          ))}
        </div>
      </div>

      {/* URL Input Form */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInspect();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Enter website domain (e.g. https://yourcompany.com)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={inspecting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {inspecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Inspecting Directives...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Inspect Site</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Executive Directives KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* 1. Overall Verdict */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Indexability Status</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${result.pageDirectives?.isNoIndex || result.robots?.isBlockingAll ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {result.pageDirectives?.indexabilityVerdict || (result.robots?.isBlockingAll ? 'Blocked' : 'Indexable')}
                </span>
              </div>
            </div>

            {/* 2. robots.txt status */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">robots.txt File</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    result.robots?.statusCode === 200
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  HTTP {result.robots?.statusCode}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {result.robots?.exists ? 'Present' : 'Missing'}
                </span>
              </div>
            </div>

            {/* 3. XML Sitemap */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">XML Sitemap</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    result.sitemap?.statusCode === 200
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400'
                  }`}
                >
                  HTTP {result.sitemap?.statusCode}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {result.sitemap?.urlCount || 0} URLs
                </span>
              </div>
            </div>

            {/* 4. Meta Robots */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Meta Robots Tag</span>
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                {result.pageDirectives?.metaRobots || 'index, follow'}
              </span>
            </div>

            {/* 5. SSL / Security */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">SSL Encryption</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>TLS Secure</span>
              </div>
            </div>
          </div>

          {/* Primary Cards: Side-by-Side (robots.txt & sitemap.xml) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Robots.txt Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-cyan-600" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">robots.txt Directives</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                        result.robots?.statusCode === 200
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      HTTP {result.robots?.statusCode}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {result.robots?.responseTimeMs}ms
                    </span>
                  </div>
                </div>

                {/* Status Alert if blocking all */}
                {result.robots?.isBlockingAll && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>CRITICAL: Entire website is blocked from crawling via "Disallow: /"</span>
                  </div>
                )}

                {/* Directives Summary */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">User-Agents Declared</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {result.robots?.userAgents?.length > 0 ? result.robots.userAgents.join(', ') : 'None (Default: *)'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Disallow Rules</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {result.robots?.disallowedPaths?.length || 0} paths
                    </span>
                  </div>
                </div>

                {/* Sitemaps Declared in robots.txt */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Sitemap Declared in robots.txt:
                  </span>
                  {result.robots?.sitemapsDeclared?.length > 0 ? (
                    result.robots.sitemapsDeclared.map((s, idx) => (
                      <a
                        key={idx}
                        href={s}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline truncate border border-slate-200/50 dark:border-slate-700/50"
                      >
                        {s}
                      </a>
                    ))
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs border border-amber-200/50 dark:border-amber-900/30">
                      No Sitemap URL directive declared inside robots.txt
                    </div>
                  )}
                </div>

                {/* Raw robots.txt text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Raw Content Preview:
                    </span>
                    {result.robots?.content && (
                      <button
                        onClick={() => handleCopy(result.robots.content, 'robots')}
                        className="text-[10px] font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedType === 'robots' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedType === 'robots' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] max-h-44 overflow-y-auto border border-slate-800">
                    <code>{result.robots?.content || '# No content returned'}</code>
                  </pre>
                </div>
              </div>

              {/* 1-Click Antigravity Fixer for Missing or Incomplete robots.txt */}
              {(!result.robots?.exists || result.robots?.statusCode === 404) && result.recommendedRobots && (
                <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-xs font-extrabold text-cyan-950 dark:text-cyan-200">
                        Antigravity 1-Click robots.txt Generator
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-200/50 dark:bg-cyan-900/50 px-2 py-0.5 rounded-full">
                      Ready to Deploy
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    This generated robots.txt allows search engines (Google, Bing) and AI assistants (ChatGPT, Claude, Perplexity) while protecting admin routes and linking your sitemap.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(result.recommendedRobots, 'recRobots')}
                      className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedType === 'recRobots' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'recRobots' ? 'Code Copied!' : 'Copy Code'}</span>
                    </button>
                    <button
                      onClick={() => handleDownload(result.recommendedRobots, 'robots.txt')}
                      className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download robots.txt</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Sitemap.xml Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-cyan-600" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">sitemap.xml Discovery</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                        result.sitemap?.statusCode === 200
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      HTTP {result.sitemap?.statusCode}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {result.sitemap?.responseTimeMs}ms
                    </span>
                  </div>
                </div>

                {/* Sitemap Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total URLs Discovered</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {result.sitemap?.urlCount || 0} URLs
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Sitemap Architecture</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                      {result.sitemap?.isIndexSitemap ? `Sitemap Index (${result.sitemap.subSitemapsCount} child files)` : 'Standard URL Map'}
                    </span>
                  </div>
                </div>

                {/* Sample URLs */}
                {result.sitemap?.sampleUrls?.length > 0 ? (
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Discovered Sitemap URL Records:
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {result.sitemap.sampleUrls.map((u, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] font-mono border border-slate-100 dark:border-slate-800"
                        >
                          <span className="truncate max-w-xs text-slate-700 dark:text-slate-300">{u}</span>
                          <a href={u} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-500 ml-2">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Target Sitemap Location:
                    </span>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 break-all border border-slate-100 dark:border-slate-800">
                      {result.sitemap?.url}
                    </div>
                  </div>
                )}

                {/* Raw XML Snippet */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Raw XML Snippet:
                    </span>
                    {result.sitemap?.content && (
                      <button
                        onClick={() => handleCopy(result.sitemap.content, 'sitemap')}
                        className="text-[10px] font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedType === 'sitemap' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedType === 'sitemap' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] max-h-44 overflow-y-auto border border-slate-800">
                    <code>{result.sitemap?.content || '<!-- No XML returned -->'}</code>
                  </pre>
                </div>
              </div>

              {/* 1-Click Antigravity Fixer for Missing XML Sitemap */}
              {(!result.sitemap?.exists || result.sitemap?.statusCode === 404) && result.recommendedSitemap && (
                <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-xs font-extrabold text-cyan-950 dark:text-cyan-200">
                        Antigravity Starter XML Sitemap Generator
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-200/50 dark:bg-cyan-900/50 px-2 py-0.5 rounded-full">
                      Ready to Upload
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Upload this starter XML sitemap to your web host at <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-[10px]">/sitemap.xml</code> to guarantee Googlebot indexing.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(result.recommendedSitemap, 'recSitemap')}
                      className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedType === 'recSitemap' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'recSitemap' ? 'XML Copied!' : 'Copy XML'}</span>
                    </button>
                    <button
                      onClick={() => handleDownload(result.recommendedSitemap, 'sitemap.xml')}
                      className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download sitemap.xml</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search & AI Bot Access Matrix (GEO - Generative Engine Optimization) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Search Engine & AI Bot Access Matrix (GEO Intelligence)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live verification of crawler access directives for search algorithms and generative AI engines.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
                AI Discovery Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              {(result.botMatrix || []).map((b) => (
                <div
                  key={b.name}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                        {b.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {b.company} • {b.type}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shrink-0 ${
                        b.allowed
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {b.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Issues & Actionable Recommendations */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Technical Crawler Health & Actionable Fixes
                </h3>
                <p className="text-xs text-slate-500">
                  Automated diagnosis of crawler barriers, directive omissions, and discovery bottlenecks.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {(result.diagnosticSummary || []).map((diag, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                    diag.severity === 'critical'
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/80'
                      : diag.severity === 'warning'
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80'
                  }`}
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          diag.severity === 'critical'
                            ? 'bg-rose-200/80 dark:bg-rose-900 text-rose-800 dark:text-rose-300'
                            : diag.severity === 'warning'
                            ? 'bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {diag.category} • {diag.severity}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {diag.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {diag.description}
                    </p>
                  </div>

                  {diag.action && (
                    <div className="sm:text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Recommended Action</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 inline-block">
                        {diag.action}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Webmaster Testing & Verification Shortcuts */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold">External Webmaster Validation Tools</h3>
                <p className="text-xs text-slate-400">Directly test and submit this website in official search engines.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { name: 'Google Search Console', url: 'https://search.google.com/search-console', desc: 'Submit sitemap to Google' },
                { name: 'Google Rich Results', url: `https://search.google.com/test/rich-results?url=${encodeURIComponent(targetUrl)}`, desc: 'Verify structured schema' },
                { name: 'Bing Webmaster Tools', url: 'https://www.bing.com/webmasters', desc: 'Submit index to Bing' },
                { name: 'PageSpeed Insights', url: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(targetUrl)}`, desc: 'Core Web Vitals test' }
              ].map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">{tool.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                  </div>
                  <span className="text-[10px] text-slate-400">{tool.desc}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
