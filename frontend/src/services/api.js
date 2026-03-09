import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Config APIs
export const configAPI = {
  getTopics: () => api.get('/config/topics'),
  create: (data) => api.post('/config/create', data),
  getById: (configId) => api.get(`/config/${configId}`),
};

// Interview APIs
export const interviewAPI = {
  start: (configId) => api.post('/interview/start', { configId }),
  submitAnswer: (sessionId, answerText, responseTimeSeconds) =>
    api.post(`/interview/${sessionId}/answer`, { answerText, responseTimeSeconds }),
  end: (sessionId, reason) => api.post(`/interview/${sessionId}/end`, { reason }),
  getStatus: (sessionId) => api.get(`/interview/${sessionId}/status`),
};

// Report APIs
export const reportAPI = {
  getBySession: (sessionId) => api.get(`/report/${sessionId}`),
  downloadPDF: (sessionId) => `${API_URL}/api/report/${sessionId}/pdf`,
  getDashboard: () => api.get('/report/dashboard'),
  generate: (sessionId) => api.post(`/report/${sessionId}/generate`),
};

// Monitoring APIs
export const monitoringAPI = {
  createAlert: (data) => api.post('/monitoring/alert', data),
  getAlerts: (sessionId) => api.get(`/monitoring/${sessionId}/alerts`),
};

// Resume APIs
export const resumeAPI = {
  process: (formData) => api.post('/resumes/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
