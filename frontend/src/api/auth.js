import api from './client';

export const authApi = {
  register: (userData) => {
    return api.post('auth/register/', userData);
  },

  login: (credentials) => {
    return api.post('auth/login/', credentials);
  },

  logout: () => {
    return api.post('auth/logout/');
  },

  getUser: () => {
    return api.get('auth/user/');
  },
};

export default authApi;