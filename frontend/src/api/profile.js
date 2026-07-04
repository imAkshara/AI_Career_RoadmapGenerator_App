import api from './client';

export const profileApi = {
  // Get user profile
  get: () => {
    return api.get('profiles/');
  },

  // Create or update profile
  createOrUpdate: (data) => {
    return api.post('profiles/create_or_update/', data);
  },

  // Update profile by ID
  update: (id, data) => {
    return api.put(`profiles/${id}/`, data);
  },

  // Partial update
  patch: (id, data) => {
    return api.patch(`profiles/${id}/`, data);
  },
};

export default profileApi;