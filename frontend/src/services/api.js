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

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const auditApi = {
  createAudit: (data) => api.post('/audits', data),
  getAudits: () => api.get('/audits'),
  getAuditById: (id) => api.get(`/audits/${id}`),
  deleteAudit: (id) => api.delete(`/audits/${id}`),
  getPages: (id) => api.get(`/audits/${id}/pages`),
  getIssues: (id, severity) => api.get(`/audits/${id}/issues`, { params: { severity } }),
  getRoadmap: (id) => api.get(`/audits/${id}/roadmap`),
  getBacklinkAnalysis: (id) => api.get(`/audits/${id}/backlinks`),
  inspectSite: (data) => api.post('/audits/inspect-site', data),
  compareAudits: (data) => api.post('/audits/compare', data),
  analyzeBacklitWords: (data) => api.post('/audits/backlit-words', data),
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
  getSession: (auditId) => api.get(`/audits/${auditId}/antigravity/session`),
  getBlueprint: (auditId, framework = 'html') => api.get(`/audits/${auditId}/antigravity/blueprint`, { params: { framework } }),
  repairIssue: (data) => api.post('/audits/antigravity/repair-issue', data),
  resolveIssue: (auditId, data) => api.post(`/audits/${auditId}/antigravity/resolve-issue`, data),
  getPatchDownloadUrl: (auditId, framework = 'html') => {
    const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
    return `${base}/api/audits/${auditId}/antigravity/download-patch?framework=${framework}`;
  },
};

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
