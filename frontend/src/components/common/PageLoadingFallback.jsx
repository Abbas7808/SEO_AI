import React from 'react';
import { Sparkles } from 'lucide-react';

export default function PageLoadingFallback() {
  return (
    <div className="min-h-[55vh] w-full flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Glowing pulse ring */}
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 dark:bg-brand-500/30 animate-ping absolute" />
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 relative z-10 animate-pulse">
          <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Loading module...
        </p>
        <p className="text-xs text-slate-400">
          Optimizing runtime assets
        </p>
      </div>
    </div>
  );
}
