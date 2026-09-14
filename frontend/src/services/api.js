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

  /**
   * SSE-based real-time audit stream.
   * @param {object} params  { url, maxPages, targetKeyword, businessName, businessLocation }
   * @param {object} cbs     { onProgress, onComplete, onError }
   * @returns {EventSource}  Call .close() to cancel early.
   */
  streamAudit(params, { onProgress, onComplete, onError } = {}) {
    const base = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
      : '';
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    ).toString();
    const sseUrl = `${base}/api/audits/stream?${qs}`;

    // Attach JWT in URL param as SSE headers are not directly settable
    const token = localStorage.getItem('seo_token');
    const finalUrl = token ? `${sseUrl}&token=${encodeURIComponent(token)}` : sseUrl;

    let hasReceivedEvent = false;
    let isTerminated = false;

    const terminate = (err) => {
      if (isTerminated) return;
      isTerminated = true;
      if (connectTimer) clearTimeout(connectTimer);
      try { es.close(); } catch {}
      onError && onError(err || { message: 'Stream connection error' });
    };

    const es = new EventSource(finalUrl);

    // Timeout: if no event received within 15 seconds, gracefully trigger error fallback
    const connectTimer = setTimeout(() => {
      if (!hasReceivedEvent) {
        terminate({ message: 'SSE connection timed out, switching to direct scan...' });
      }
    }, 15000);

    es.addEventListener('progress', (e) => {
      hasReceivedEvent = true;
      if (connectTimer) clearTimeout(connectTimer);
      try { onProgress && onProgress(JSON.parse(e.data)); } catch { }
    });

    es.addEventListener('complete', (e) => {
      hasReceivedEvent = true;
      if (connectTimer) clearTimeout(connectTimer);
      try {
        const data = JSON.parse(e.data);
        onComplete && onComplete(data);
        clearApiCache(); // invalidate cache so fresh result shows
      } catch { }
      try { es.close(); } catch {}
    });

    es.addEventListener('error', (e) => {
      let errPayload = { message: 'Stream connection error' };
      try {
        if (e.data) {
          errPayload = JSON.parse(e.data);
        }
      } catch {}
      terminate(errPayload);
    });

    es.onerror = (e) => {
      // If error occurs before any event received, or after stream breaks, terminate immediately
      if (!hasReceivedEvent || es.readyState !== EventSource.OPEN) {
        terminate({ message: 'SSE connection dropped or unreachable' });
      }
    };

    return es;
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

export const agencyApi = {
  // Clients CRM
  getClients: (config) => cachedGet('/agency/clients', config, 15000),
  getClientById: (id) => cachedGet(`/agency/clients/${id}`, {}, 15000),
  createClient: async (data) => {
    clearApiCache('/agency/clients');
    return api.post('/agency/clients', data);
  },
  updateClient: async (id, data) => {
    clearApiCache('/agency/clients');
    return api.put(`/agency/clients/${id}`, data);
  },
  deleteClient: async (id) => {
    clearApiCache('/agency/clients');
    return api.delete(`/agency/clients/${id}`);
  },
  getProjects: (clientId) => cachedGet(`/agency/clients/${clientId}/projects`, {}, 15000),
  createProject: async (clientId, data) => {
    clearApiCache('/agency/clients');
    return api.post(`/agency/clients/${clientId}/projects`, data);
  },

  // Keywords
  getKeywords: (params) => cachedGet('/agency/keywords', { params }, 15000),
  addKeyword: async (data) => {
    clearApiCache('/agency/keywords');
    return api.post('/agency/keywords', data);
  },
  getKeywordHistory: (id) => cachedGet(`/agency/keywords/${id}/history`, {}, 15000),
  removeKeyword: async (id) => {
    clearApiCache('/agency/keywords');
    return api.delete(`/agency/keywords/${id}`);
  },
  trackAllKeywords: async () => {
    clearApiCache('/agency/keywords');
    return api.post('/agency/keywords/track-all');
  },

  // Schedules
  getSchedules: () => cachedGet('/agency/schedules', {}, 15000),
  createSchedule: async (data) => {
    clearApiCache('/agency/schedules');
    return api.post('/agency/schedules', data);
  },
  toggleSchedule: async (id, isActive) => {
    clearApiCache('/agency/schedules');
    return api.put(`/agency/schedules/${id}/toggle`, { isActive });
  },
  deleteSchedule: async (id) => {
    clearApiCache('/agency/schedules');
    return api.delete(`/agency/schedules/${id}`);
  },

  // Trends
  getScoreHistory: (params) => cachedGet('/agency/trends/scores', { params }, 15000),
  getIssuesTrend: (params) => cachedGet('/agency/trends/issues', { params }, 15000),

  // Proposals
  getProposals: (params) => cachedGet('/agency/proposals', { params }, 15000),
  createProposal: async (data) => {
    clearApiCache('/agency/proposals');
    return api.post('/agency/proposals', data);
  },
  updateProposal: async (id, data) => {
    clearApiCache('/agency/proposals');
    return api.put(`/agency/proposals/${id}`, data);
  },
  deleteProposal: async (id) => {
    clearApiCache('/agency/proposals');
    return api.delete(`/agency/proposals/${id}`);
  },

  // Invoices
  getInvoices: (params) => cachedGet('/agency/invoices', { params }, 15000),
  createInvoice: async (data) => {
    clearApiCache('/agency/invoices');
    return api.post('/agency/invoices', data);
  },
  updateInvoice: async (id, data) => {
    clearApiCache('/agency/invoices');
    return api.put(`/agency/invoices/${id}`, data);
  },
  deleteInvoice: async (id) => {
    clearApiCache('/agency/invoices');
    return api.delete(`/agency/invoices/${id}`);
  },

  // Portal
  generatePortalLink: async (data) => api.post('/agency/portal/generate', data),
  getPortalLinks: () => cachedGet('/agency/portal/links', {}, 15000),
  getPortalData: (token) => api.get(`/agency/portal/${token}`),

  // Tools
  generateSchema: (data) => api.post('/agency/tools/schema', data),
  validateSitemap: (data) => api.post('/agency/tools/sitemap-validate', data),
};

export const healthApi = {
  check: () => cachedGet('/health', {}, 10000),
};

export default api;

