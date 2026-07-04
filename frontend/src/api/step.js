import api from './client';

export const stepApi = {
  // Get all steps
  getAll: (params = {}) => {
    return api.get('steps/', { params });
  },

  // Get single step
  get: (id) => {
    return api.get(`steps/${id}/`);
  },

  // Toggle step completion
  toggleComplete: (id) => {
    return api.post(`steps/${id}/toggle_complete/`);
  },

  // Update step
  update: (id, data) => {
    return api.put(`steps/${id}/`, data);
  },
};

export default stepApi;