import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
  getPdfDownloadUrl: (auditId) => `/api/reports/${auditId}`,
};

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
