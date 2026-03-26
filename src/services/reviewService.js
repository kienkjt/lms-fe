import api from './api';

export const reviewService = {
  create: (data) => api.post('/api/v1/reviews', data),
  getByCourse: (courseId, params) => api.get(`/api/v1/reviews/course/${courseId}`, { params }),
  delete: (id) => api.delete(`/api/v1/reviews/${id}`),
};
