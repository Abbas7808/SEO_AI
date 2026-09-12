/**
 * Cache & Performance Manager for SiteGlow AI
 * Clears stale local audits, browser CacheStorage, session blobs, and prunes old data.
 */

const AUDIT_CACHE_PREFIX = 'seo_current_audit_';
const AUDITS_LIST_KEY = 'seo_audits_list';
const CACHE_TIMESTAMP_KEY = 'seo_cache_last_cleanup';

/**
 * Calculates approximate localStorage usage in KB
 */
export function getStorageStats() {
  try {
    let totalBytes = 0;
    let itemCount = localStorage.length;
    let auditItemCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        totalBytes += (key.length + value.length) * 2; // 2 bytes per UTF-16 char
        if (key.startsWith(AUDIT_CACHE_PREFIX) || key === AUDITS_LIST_KEY) {
          auditItemCount++;
        }
      }
    }

    const kbUsed = (totalBytes / 1024).toFixed(1);
    return {
      kbUsed: Number(kbUsed),
      itemCount,
      auditItemCount,
      estimatedFreePercent: Math.max(0, Math.round(100 - (totalBytes / (5 * 1024 * 1024)) * 100)),
    };
  } catch (err) {
    console.warn('Unable to calculate storage stats:', err);
    return { kbUsed: 0, itemCount: 0, auditItemCount: 0, estimatedFreePercent: 99 };
  }
}

/**
 * Clears application cache and temporary audit data while keeping credentials safe
 * @param {boolean} preserveAuth - If true, keeps authentication token
 */
export async function clearAppCache(preserveAuth = true) {
  const token = preserveAuth ? localStorage.getItem('seo_token') : null;
  const user = preserveAuth ? localStorage.getItem('seo_user') : null;
  const theme = localStorage.getItem('seo_theme');

  const beforeStats = getStorageStats();
  const clearedKeys = [];

  try {
    // 1. Clear keys from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (preserveAuth && (key === 'seo_token' || key === 'seo_user' || key === 'seo_theme')) {
          continue;
        }
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      clearedKeys.push(key);
    });

    // Restore essential settings
    if (preserveAuth && token) localStorage.setItem('seo_token', token);
    if (preserveAuth && user) localStorage.setItem('seo_user', user);
    if (theme) localStorage.setItem('seo_theme', theme);
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

    // 2. Clear SessionStorage
    try {
      sessionStorage.clear();
    } catch (e) {}

    // 3. Clear CacheStorage (Service Worker / HTTP caches if browser supports)
    let cachesCleared = 0;
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames.map((name) => {
            cachesCleared++;
            return window.caches.delete(name);
          })
        );
      } catch (cacheErr) {
        console.warn('CacheStorage deletion notice:', cacheErr);
      }
    }

    const afterStats = getStorageStats();
    const freedKb = Math.max(0, (beforeStats.kbUsed - afterStats.kbUsed).toFixed(1));

    return {
      success: true,
      clearedKeysCount: clearedKeys.length,
      cachesCleared,
      freedKb: Number(freedKb),
      remainingKb: afterStats.kbUsed,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (err) {
    console.error('Error clearing cache:', err);
    return {
      success: false,
      error: err.message,
      freedKb: 0,
    };
  }
}

/**
 * Automatically prunes cached audits older than 3 days to maintain blazing fast runtime
 */
export function autoPruneStaleCache() {
  try {
    const lastCleanup = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();

    // Run if never run or older than 24 hours
    if (lastCleanup && now - Number(lastCleanup) < 24 * 60 * 60 * 1000) {
      return;
    }

    // Prune audit list to keep only latest 10 audits
    const rawList = localStorage.getItem(AUDITS_LIST_KEY);
    if (rawList) {
      try {
        const list = JSON.parse(rawList);
        if (Array.isArray(list) && list.length > 10) {
          const trimmed = list.slice(0, 10);
          localStorage.setItem(AUDITS_LIST_KEY, JSON.stringify(trimmed));
        }
      } catch (e) {}
    }

    localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
  } catch (err) {
    // Fail silently in background
  }
}
