export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getScoreLabel(score) {
  if (score >= 90) return { label: 'Excellent', color: 'emerald' };
  if (score >= 80) return { label: 'Good', color: 'blue' };
  if (score >= 70) return { label: 'Needs Improvement', color: 'amber' };
  if (score >= 50) return { label: 'Poor', color: 'orange' };
  return { label: 'Critical', color: 'rose' };
}

export function getSeverityBadge(severity) {
  const map = {
    critical: {
      bg: 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900',
      text: 'Critical',
    },
    high: {
      bg: 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900',
      text: 'High',
    },
    medium: {
      bg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900',
      text: 'Medium',
    },
    low: {
      bg: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
      text: 'Low',
    },
    passed: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
      text: 'Passed',
    },
  };
  return map[severity] || map.low;
}
