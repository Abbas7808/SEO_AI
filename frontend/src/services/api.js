import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Attach JWT token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('seo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response error handler
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Ultra-Fast In-Memory SWR (Stale-While-Revalidate) Cache Store
const fastCache = new Map();
const DEFAULT_TTL = 45000; // 45 seconds fresh

export const getCacheMetrics = () => ({
  size: fastCache.size,
  keys: Array.from(fastCache.keys()),
});

export const clearApiCache = (filterPattern = null) => {
  if (!filterPattern) {
    fastCache.clear();
    return;
  }
  for (const key of fastCache.keys()) {
    if (key.includes(filterPattern)) {
      fastCache.delete(key);
    }
  }
};

/**
 * High-speed cached GET request with Stale-While-Revalidate
 */
const cachedGet = async (url, config = {}, ttl = DEFAULT_TTL) => {
  if (config.bypassCache) {
    const fresh = await api.get(url, config);
    fastCache.set(url, { data: fresh, timestamp: Date.now() });
    return fresh;
  }

  const cacheKey = `${url}:${JSON.stringify(config.params || {})}`;
  const cached = fastCache.get(cacheKey);
  const now = Date.now();

  if (cached) {
    const age = now - cached.timestamp;
    if (age < ttl) {
      // Revalidate in the background if older than 12s
      if (age > 12000) {
        api.get(url, config).then((fresh) => {
          fastCache.set(cacheKey, { data: fresh, timestamp: Date.now() });
        }).catch(() => {});
      }
      return cached.data; // 0ms instant render
    }
  }

  const fresh = await api.get(url, config);
  fastCache.set(cacheKey, { data: fresh, timestamp: Date.now() });
  return fresh;
};

export const authApi = {
  register: (data) => {
    clearApiCache();
    return api.post('/auth/register', data);
  },
  login: (data) => {
    clearApiCache();
    return api.post('/auth/login', data);
  },
  getMe: () => cachedGet('/auth/me', {}, 60000),
};

export const auditApi = {
  createAudit: async (data) => {
    clearApiCache();
    return api.post('/audits', data);
  },
  getAudits: (config) => cachedGet('/audits', config, 30000),
  getAuditById: (id, config) => cachedGet(`/audits/${id}`, config, 60000),
  deleteAudit: async (id) => {
    clearApiCache();
    return api.delete(`/audits/${id}`);
  },
  getPages: (id, config) => cachedGet(`/audits/${id}/pages`, config, 60000),
  getIssues: (id, severity, config) => cachedGet(`/audits/${id}/issues`, { ...config, params: { severity, ...(config?.params || {}) } }, 60000),
  getRoadmap: (id, config) => cachedGet(`/audits/${id}/roadmap`, config, 60000),
  inspectSite: (data) => api.post('/audits/inspect-site', data),
  compareAudits: (data) => api.post('/audits/compare', data),
  analyzeBacklitWords: (data) => api.post('/audits/backlit-words', data),
  validateLocalPath: (data) => api.post('/audits/validate-local-path', data),
  scanLocalProject: async (data) => {
    clearApiCache();
    return api.post('/audits/scan-local', data);
  },
  openInEditor: (data) => api.post('/audits/antigravity/open-editor', data),
  openWorkspace: (data) => api.post('/audits/antigravity/open-workspace', data),
  launchAgent: (data) => api.post('/audits/antigravity/open-editor', { ...data, launchAgent: true }),
  applyLocalFix: async (data) => {
    clearApiCache();
    return api.post('/audits/antigravity/apply-local-fix', data);
  },
  batchApplyLocalFixes: async (data) => {
    clearApiCache();
    return api.post('/audits/antigravity/batch-apply-local-fixes', data);
  },
};

export const aiApi = {
  analyze: (data) => api.post('/ai/analyze', data),
  generateMetaTitle: (data) => api.post('/ai/generate-meta-title', data),
  generateMetaDescription: (data) => api.post('/ai/generate-meta-description', data),
  optimizeContent: (data) => api.post('/ai/optimize-content', data),
  generateFix: (data) => api.post('/ai/generate-fix', data),
  chat: (data) => api.post('/ai/chat', data),
};

export const reportsApi = {
  getPdfDownloadUrl: (auditId) => {
    const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
    return `${base}/api/reports/${auditId}`;
  },
};

export const antigravityApi = {
  getSession: (auditId, config) => cachedGet(`/audits/${auditId}/antigravity/session`, config, 30000),
  getBlueprint: (auditId, framework = 'html', config) =>
    cachedGet(`/audits/${auditId}/antigravity/blueprint`, { ...config, params: { framework, ...(config?.params || {}) } }, 60000),
  repairIssue: async (data) => {
    clearApiCache();
    return api.post('/audits/antigravity/repair-issue', data);
  },
  resolveIssue: async (auditId, data) => {
    clearApiCache();
    return api.post(`/audits/${auditId}/antigravity/resolve-issue`, data);
  },
  getPatchDownloadUrl: (auditId, framework = 'html') => {
    const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
    return `${base}/api/audits/${auditId}/antigravity/download-patch?framework=${framework}`;
  },
};

export const healthApi = {
  check: () => cachedGet('/health', {}, 10000),
};

export default api;
