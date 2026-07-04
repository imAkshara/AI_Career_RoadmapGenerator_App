import api from './client';

export const roadmapApi = {
  getAll: (params = {}) => {
    return api.get('roadmaps/', { params });
  },

  get: (id) => {
    return api.get(`roadmaps/${id}/`);
  },

  create: (data) => {
    return api.post('roadmaps/', data);
  },

  generate: () => {
    return api.post('roadmaps/generate/');
  },

  update: (id, data) => {
    return api.put(`roadmaps/${id}/`, data);
  },

  delete: (id) => {
    return api.delete(`roadmaps/${id}/`);
  },

  getProgress: (id) => {
    return api.get(`roadmaps/${id}/progress/`);
  },
};

export default roadmapApi;