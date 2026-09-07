import React from 'react';
import { getScoreLabel } from '../../utils/formatters';

export default function ScoreBadge({ score = 0, size = 'md', showLabel = true }) {
  const { label } = getScoreLabel(score);

  // Determine colors based on score
  let colorClasses = {
    ring: 'stroke-rose-500',
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900',
  };

  if (score >= 90) {
    colorClasses = {
      ring: 'stroke-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900',
    };
  } else if (score >= 80) {
    colorClasses = {
      ring: 'stroke-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',
    };
  } else if (score >= 70) {
    colorClasses = {
      ring: 'stroke-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
    };
  } else if (score >= 50) {
    colorClasses = {
      ring: 'stroke-orange-500',
      text: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900',
    };
  }

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className={`relative flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 ${colorClasses.bg} shadow-sm`}>
          <span className={`text-4xl font-extrabold tracking-tight ${colorClasses.text}`}>
            {score}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
            / 100
          </span>
        </div>
        {showLabel && (
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colorClasses.bg} ${colorClasses.text}`}>
              {label}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${colorClasses.bg} ${colorClasses.text}`}>
        <span>{score}</span>
        <span className="text-slate-400 dark:text-slate-500 font-normal">/100</span>
      </span>
    );
  }

  // Medium (Default)
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium ${colorClasses.bg} ${colorClasses.text}`}>
      <span className="text-lg font-bold">{score}</span>
      <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/ 100</span>
      {showLabel && (
        <span className="text-xs font-semibold uppercase tracking-wider ml-1 opacity-90">
          • {label}
        </span>
      )}
    </div>
  );
}
