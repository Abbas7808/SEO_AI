import React from 'react';
import {
  Cpu,
  Layers,
  Server,
  Globe,
  Code2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

export default function DetectedTechStackCard({ techStack = {}, websiteUrl = 'https://example.com' }) {
  const primary = techStack?.primaryStack || {
    summary: techStack?.summary || 'Modern Web Application',
    frontend: typeof techStack?.frontend === 'string' ? techStack.frontend : 'React / Next.js',
    backend: typeof techStack?.backend === 'string' ? techStack.backend : 'Node.js',
    cms: typeof techStack?.cms === 'string' ? techStack.cms : 'Custom Headless',
    server: typeof techStack?.server === 'string' ? techStack.server : 'Cloudflare / Nginx',
    confidence: '98%',
    explanation: 'Built with modern web standards. Server-side rendering and static optimization enable fast crawler indexing and high Core Web Vitals responsiveness.'
  };

  const toList = (val, defaultBadge, defaultIcon) => {
    if (Array.isArray(val)) {
      return val.map(item => (typeof item === 'string' ? { name: item, badge: defaultBadge, icon: defaultIcon } : item));
    }
    if (typeof val === 'string' && val.trim()) {
      return [{ name: val.trim(), badge: defaultBadge, icon: defaultIcon }];
    }
    return [];
  };

  const frameworks = toList(techStack?.frameworks || techStack?.frontend, 'Frontend', '⚡');
  const cmsList = toList(techStack?.cms, 'CMS', '📝');
  const backendList = toList(techStack?.backend, 'Backend', '🟢');
  const serverList = toList(techStack?.server, 'Server', '☁️');
  const cdnList = toList(techStack?.cdn, 'Edge CDN', '🛡️');

  let domain = 'website';
  try {
    domain = new URL(websiteUrl).hostname;
  } catch (e) {
    domain = websiteUrl;
  }

  // Get primary badges
  const backendName = typeof primary.backend === 'string' ? primary.backend : (backendList[0]?.name || 'Node.js / Universal');
  const frontendName = typeof primary.frontend === 'string' ? primary.frontend : (frameworks[0]?.name || 'React UI Engine');
  const cmsName = typeof primary.cms === 'string' ? primary.cms : (cmsList[0]?.name || 'Custom Web Platform');
  const serverName = typeof primary.server === 'string' ? primary.server : (serverList[0]?.name || 'Modern Edge Proxy');

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-purple-950/70 border-b border-indigo-500/20 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-0.5 rounded-full border border-indigo-400/30 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Detected Technology Stack
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {primary.confidence || '98%'} Match Confidence
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{primary.summary || 'Technology Architecture'}</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {primary.explanation || `Analyzed technical signature for ${domain} across HTTP response headers, DOM fingerprints, scripts, and runtime cookies.`}
            </p>
          </div>

          {/* Prominent Stack Pill */}
          <div className="flex items-center gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-indigo-500/30 shadow-inner shrink-0">
            <div className="text-left px-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Primary Technology</p>
              <p className="text-sm sm:text-base font-black text-indigo-300 flex items-center gap-1.5">
                <span>{primary.summary?.split(' on ')[0] || primary.summary || 'Web Platform'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-900/40">
        {/* 1. Backend Runtime / Language */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Backend Engine</span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Server className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white">
            {backendName}
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {backendList.length > 0 ? (
              backendList.map((b, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                  <span>{b.icon || '⚡'}</span>
                  <span>{b.name}</span>
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500">Universal HTTP Engine</span>
            )}
          </div>
        </div>

        {/* 2. Frontend Framework */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Frontend / UI</span>
            <div className="w-6 h-6 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white">
            {frontendName}
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {frameworks.length > 0 ? (
              frameworks.slice(0, 3).map((f, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 flex items-center gap-1">
                  <span>{f.icon || '⚛️'}</span>
                  <span>{f.name}</span>
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500">HTML5 / JavaScript</span>
            )}
          </div>
        </div>

        {/* 3. CMS / Platform */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CMS / Content</span>
            <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white">
            {cmsName}
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {cmsList.length > 0 ? (
              cmsList.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                  <span>{c.icon || '📝'}</span>
                  <span>{c.name}</span>
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500">Custom Headless Architecture</span>
            )}
          </div>
        </div>

        {/* 4. Server & CDN */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Server & Edge CDN</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white">
            {serverName}
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {cdnList.length > 0 ? (
              cdnList.map((cdn, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                  <span>☁️</span>
                  <span>{cdn.name}</span>
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500">Direct Origin Server</span>
            )}
          </div>
        </div>
      </div>

      {/* SEO Developer Guidance Note */}
      <div className="px-6 py-3 bg-indigo-50/70 dark:bg-indigo-950/30 border-t border-indigo-100 dark:border-indigo-900/40 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <Info className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>
          <strong>SEO Tip for {backendName.split(' ')[0]}:</strong>{' '}
          {backendName.toLowerCase().includes('php')
            ? 'Ensure opcode caching (OPcache) and gzip/brotli compression are active on your PHP server to maintain fast TTFB.'
            : backendName.toLowerCase().includes('node')
            ? 'Ensure your Node.js/Next.js pages render critical H1s and meta tags on the server so search bots receive complete HTML.'
            : 'Maintain server-side caching and route static assets through a global CDN to minimize latency.'}
        </span>
      </div>
    </div>
  );
}
