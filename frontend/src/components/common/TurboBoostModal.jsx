import React, { useState, useEffect } from 'react';
import { Zap, Trash2, CheckCircle2, RefreshCw, X, Shield, Sparkles, Cpu, HardDrive } from 'lucide-react';
import { getStorageStats, clearAppCache } from '../../utils/cacheManager';

export default function TurboBoostModal({ isOpen, onClose }) {
  const [stats, setStats] = useState(getStorageStats());
  const [isCleaning, setIsCleaning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStats(getStorageStats());
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClean = async () => {
    setIsCleaning(true);
    setResult(null);

    // Provide smooth visual feedback
    await new Promise((r) => setTimeout(r, 600));

    const res = await clearAppCache(true);
    setResult(res);
    setStats(getStorageStats());
    setIsCleaning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-6">
        {/* Glow backdrop accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/15 dark:bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-brand-500/15 dark:bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Turbo Boost & Cache
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optimize client memory & flush stale cache
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Metrics Cards */}
        <div className="grid grid-cols-2 gap-3 relative">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-brand-500" />
              <span>Cache Storage</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {stats.kbUsed} <span className="text-xs font-normal text-slate-400">KB</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {stats.itemCount} items stored
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              <span>Storage Health</span>
            </div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.estimatedFreePercent}% <span className="text-xs font-normal text-slate-400">Free</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              {stats.auditItemCount} cached audit files
            </div>
          </div>
        </div>

        {/* Status Message / Result */}
        {result ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Optimization Complete!</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Freed <span className="font-bold text-emerald-600 dark:text-emerald-400">{result.freedKb} KB</span>.
              Temporary audit blobs purged, HTTP cache cleared, and memory freed.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
            <span>
              Safe cleanup: Keeps your active login and dark/light settings untouched while clearing old audit data and browser memory.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-center"
          >
            Close
          </button>
          <button
            onClick={handleClean}
            disabled={isCleaning}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-105 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCleaning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Boost & Clear</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
