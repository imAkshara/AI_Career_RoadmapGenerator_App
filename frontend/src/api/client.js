import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (data) => api.post('auth/register/', data),
  login: (data) => api.post('auth/login/', data),
  logout: () => api.post('auth/logout/'),
  getUser: () => api.get('auth/user/'),
};

// Profile endpoints
export const profileApi = {
  get: () => api.get('profiles/'),
  create: (data) => api.post('profiles/create_or_update/', data),
  update: (id, data) => api.put(`profiles/${id}/`, data),
};

// Roadmap endpoints
export const roadmapApi = {
  getAll: () => api.get('roadmaps/'),
  get: (id) => api.get(`roadmaps/${id}/`),
  create: (data) => api.post('roadmaps/', data),
  generate: () => api.post('roadmaps/generate/'),
  delete: (id) => api.delete(`roadmaps/${id}/`),
  getProgress: (id) => api.get(`roadmaps/${id}/progress/`),
};

// Step endpoints
export const stepApi = {
  toggleComplete: (id) => api.post(`steps/${id}/toggle_complete/`),
};

// Progress endpoints
export const progressApi = {
  getAll: () => api.get('progress/'),
  toggleComplete: (id) => api.post(`progress/${id}/toggle_complete/`),
};

export default api;