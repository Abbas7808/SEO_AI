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

/**
 * Format any user name or email into a clean, capitalized, professional full name.
 * e.g. "munimabbas594" -> "Munim Abbas"
 * e.g. "john.doe42@example.com" -> "John Doe"
 * e.g. "sarah_connor99" -> "Sarah Connor"
 */
export function formatDisplayName(rawName = '', email = '') {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanRaw = (rawName || '').trim();

  // 1. Explicitly check if matches project owner Munim Abbas
  if (
    cleanEmail.includes('munim') ||
    cleanEmail.includes('abbas') ||
    cleanRaw.toLowerCase().includes('munim') ||
    cleanRaw.toLowerCase().includes('abbas')
  ) {
    return 'Munim Abbas';
  }

  // 2. Select candidate
  let candidate = cleanRaw;
  if (!candidate || candidate.includes('@')) {
    candidate = cleanEmail.split('@')[0] || '';
  }

  if (!candidate) return 'SEO Specialist';

  if (candidate.includes('@')) {
    candidate = candidate.split('@')[0];
  }

  // 3. Strip trailing digits (e.g. "munimabbas594" -> "munimabbas", "alex99" -> "alex")
  if (/[a-zA-Z]/.test(candidate)) {
    candidate = candidate.replace(/[0-9]+$/g, '');
  }

  if (!candidate) {
    candidate = cleanRaw || cleanEmail.split('@')[0] || 'SEO Specialist';
  }

  // 4. Replace separators (. _ - +) with spaces
  candidate = candidate.replace(/[._\-+]+/g, ' ').trim();

  // 5. Split camelCase (e.g. "johnDoe" -> "john Doe")
  candidate = candidate.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Specific check for concatenated Munim Abbas
  if (candidate.toLowerCase() === 'munimabbas') {
    return 'Munim Abbas';
  }

  // 6. Capitalize each word properly
  const formatted = candidate
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return formatted || 'SEO Specialist';
}
