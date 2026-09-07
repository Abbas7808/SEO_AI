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
  FileCheck
} from 'lucide-react';
import { auditApi } from '../services/api';

export default function SiteInspectorPage() {
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get('url') || 'https://example.com';

  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [inspecting, setInspecting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInspect = async (urlToInspect) => {
    const u = urlToInspect || targetUrl;
    if (!u.trim()) return;

    try {
      setInspecting(true);
      setError('');
      const res = await auditApi.inspectSite({ websiteUrl: u.trim() });
      if (res?.data) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Inspection failed. Please verify the URL.');
    } finally {
      setInspecting(false);
    }
  };

  useEffect(() => {
    if (initialUrl) {
      handleInspect(initialUrl);
    }
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white shadow-xl border border-cyan-900/40">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold tracking-wide uppercase">
            <FileSearch className="w-3.5 h-3.5" />
            <span>Live Technical Deep Inspector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Robots.txt & Sitemap Deep Inspector
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Verify real crawler access directives, inspect disallowed routes, check XML sitemap health, and ensure
            Googlebot and Bingbot can discover all your indexed URLs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['https://google.com', 'https://github.com', 'https://wikipedia.org'].map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setTargetUrl(sample);
                handleInspect(sample);
              }}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            >
              {sample.replace('https://', '')}
            </button>
          ))}
        </div>
      </div>

      {/* URL Input Form */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={inspecting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
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

      {/* Results Grid */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Robots.txt Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-cyan-600" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">robots.txt Inspection</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      result.robots.statusCode === 200
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    HTTP {result.robots.statusCode}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {result.robots.responseTimeMs}ms
                  </span>
                </div>
              </div>

              {/* Status & Alerts */}
              {result.robots.isBlockingAll && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>CRITICAL: Entire website is blocked from crawling via "Disallow: /"</span>
                </div>
              )}

              {/* Directives Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">User-Agents</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {result.robots.userAgents.length > 0 ? result.robots.userAgents.join(', ') : 'None'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Disallow Rules</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {result.robots.disallowedPaths.length} paths
                  </span>
                </div>
              </div>

              {/* Sitemaps Declared */}
              {result.robots.sitemapsDeclared.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Sitemap Declared in robots.txt:
                  </span>
                  {result.robots.sitemapsDeclared.map((s, idx) => (
                    <a
                      key={idx}
                      href={s}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-brand-600 dark:text-brand-400 hover:underline truncate"
                    >
                      {s}
                    </a>
                  ))}
                </div>
              )}

              {/* Raw robots.txt text */}
              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Raw Content Preview:
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] max-h-48 overflow-y-auto border border-slate-800">
                  <code>{result.robots.content || '# No content returned'}</code>
                </pre>
              </div>
            </div>

            {/* 2. Sitemap.xml Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-cyan-600" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">sitemap.xml Inspection</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      result.sitemap.statusCode === 200
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    HTTP {result.sitemap.statusCode}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {result.sitemap.responseTimeMs}ms
                  </span>
                </div>
              </div>

              {/* Sitemap Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">URLs Found</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {result.sitemap.urlCount} URLs
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Sitemap Type</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {result.sitemap.isIndexSitemap ? `Sitemap Index (${result.sitemap.subSitemapsCount} child maps)` : 'Standard URL Map'}
                  </span>
                </div>
              </div>

              {/* Sample URLs */}
              {result.sitemap.sampleUrls.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Sample URLs Declared in Sitemap:
                  </span>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {result.sitemap.sampleUrls.map((u, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] font-mono"
                      >
                        <span className="truncate max-w-sm text-slate-700 dark:text-slate-300">{u}</span>
                        <a href={u} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-500 ml-2">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw XML Snippet */}
              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Raw XML Snippet:
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] max-h-48 overflow-y-auto border border-slate-800">
                  <code>{result.sitemap.content || '<!-- No XML returned -->'}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
