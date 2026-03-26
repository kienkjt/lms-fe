import api from './api';

export const userService = {
  getProfile: (id) => api.get(`/api/v1/users/profile/${id}`),
  updateProfile: (id, data) => api.put(`/api/v1/users/profile/${id}`, data),
  changePassword: (id, data) => api.post(`/api/v1/users/change-password/${id}`, data),
};
