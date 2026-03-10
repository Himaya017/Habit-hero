import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Habits API
export const habitsAPI = {
  create: (habitData) => api.post('/api/habits', habitData),
  getAll: (activeOnly = false) => api.get('/api/habits', { params: { active_only: activeOnly } }),
  getById: (id) => api.get(`/api/habits/${id}`),
  update: (id, habitData) => api.put(`/api/habits/${id}`, habitData),
  delete: (id) => api.delete(`/api/habits/${id}`),
};

// Check-ins API
export const checkInsAPI = {
  create: (habitId, checkInData) => api.post(`/api/habits/${habitId}/check-ins`, checkInData),
  getByHabitId: (habitId, days = 30) => api.get(`/api/habits/${habitId}/check-ins`, { params: { days } }),
  update: (id, checkInData) => api.put(`/api/check-ins/${id}`, checkInData),
  delete: (id) => api.delete(`/api/check-ins/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getByHabitId: (habitId) => api.get(`/api/habits/${habitId}/analytics`),
  refresh: (habitId) => api.post(`/api/habits/${habitId}/analytics/refresh`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard'),
};

// Reports API
export const reportsAPI = {
  generateProgressReport: (habitIds = null) => {
    let url = '/api/reports/progress';
    if (habitIds && habitIds.length > 0) {
      url += `?habit_ids=${habitIds.join(',')}`;
    }
    return api.get(url, { responseType: 'blob' });
  },
};

export default api;
