import React, { useState } from 'react';
import {
  Copy,
  Check,
  Code2,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  Split,
  FileCode
} from 'lucide-react';

export default function CodeDiffViewer({
  codeFixes = {},
  originalCode = '',
  scoreBoost = 8,
  title = 'Direct Website Code Solution'
}) {
  const [activeTab, setActiveTab] = useState('html'); // 'html' | 'react' | 'vue' | 'wordpress'
  const [viewMode, setViewMode] = useState('diff'); // 'diff' | 'clean'
  const [copied, setCopied] = useState(false);

  // Available framework tabs
  const frameworks = [
    { id: 'html', label: 'HTML5', available: !!codeFixes.html },
    { id: 'react', label: 'Next.js / React', available: !!codeFixes.react },
    { id: 'vue', label: 'Vue 3 / Nuxt', available: !!codeFixes.vue },
    { id: 'wordpress', label: 'WordPress / PHP', available: !!codeFixes.wordpress }
  ].filter(f => f.available);

  // Active solution code
  const activeCode = codeFixes[activeTab] || codeFixes.html || Object.values(codeFixes)[0] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Build unified diff
  const originalLines = (originalCode || '').trim().split('\n').filter(Boolean);
  const patchLines = activeCode.trim().split('\n').filter(Boolean);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-2xl transition-all">
      {/* Top Header */}
      <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                +{scoreBoost} SEO Pts
              </span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          {originalLines.length > 0 && (
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px] font-medium">
              <button
                onClick={() => setViewMode('diff')}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewMode === 'diff' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Split className="w-3 h-3" />
                <span>Diff</span>
              </button>
              <button
                onClick={() => setViewMode('clean')}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewMode === 'clean' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3 h-3" />
                <span>Patch Only</span>
              </button>
            </div>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Framework Selector Tabs */}
      {frameworks.length > 1 && (
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">
            Framework:
          </span>
          {frameworks.map(fw => (
            <button
              key={fw.id}
              onClick={() => setActiveTab(fw.id)}
              className={`px-2.5 py-1 rounded-md transition-all text-xs font-medium ${
                activeTab === fw.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {fw.label}
            </button>
          ))}
        </div>
      )}

      {/* Code / Diff Body */}
      <div className="p-4 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed select-text">
        {viewMode === 'diff' && originalLines.length > 0 ? (
          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-500 pb-1 font-sans flex items-center gap-3">
              <span className="text-rose-400 font-semibold">- Lines Removed / Missing</span>
              <span className="text-emerald-400 font-semibold">+ Lines Added / Fixed</span>
            </div>
            {originalLines.map((line, i) => (
              <div key={`rem-${i}`} className="bg-rose-950/30 text-rose-300 px-2 py-0.5 rounded border-l-2 border-rose-500 flex gap-2">
                <span className="text-rose-500 select-none">-</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
            {patchLines.map((line, i) => (
              <div key={`add-${i}`} className="bg-emerald-950/30 text-emerald-300 px-2 py-0.5 rounded border-l-2 border-emerald-500 flex gap-2">
                <span className="text-emerald-500 select-none">+</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
        ) : (
          <pre className="text-emerald-300 whitespace-pre">
            <code>{activeCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
