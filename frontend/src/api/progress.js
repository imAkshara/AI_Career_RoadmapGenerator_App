import api from './client';

export const progressApi = {
  getAll: (params = {}) => {
    return api.get('progress/', { params });
  },

  get: (id) => {
    return api.get(`progress/${id}/`);
  },

  toggleComplete: (id) => {
    return api.post(`progress/${id}/toggle_complete/`);
  },

  update: (id, data) => {
    return api.put(`progress/${id}/`, data);
  },
};

export default progressApi;