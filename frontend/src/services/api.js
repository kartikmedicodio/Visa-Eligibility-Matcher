import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const petitionsAPI = {
  getAll: () => api.get('/petitions'),
  getById: (id) => api.get(`/petitions/${id}`),
  create: (data) => api.post('/petitions', data),
  update: (id, data) => api.put(`/petitions/${id}`, data),
  delete: (id) => api.delete(`/petitions/${id}`),
};

export const profilesAPI = {
  getAll: () => api.get('/profiles'),
  getById: (id) => api.get(`/profiles/${id}`),
  create: (data) => api.post('/profiles', data),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
};

export const eligibilityAPI = {
  check: (profileId, petitionId = null) => 
    api.post('/eligibility/check', { profileId, petitionId }),
  checkSpecific: (profileId, petitionId) =>
    api.post(`/eligibility/check/${profileId}/${petitionId}`),
};

export default api;

