import api from './api';

export const orderService = {
  create: (data) => api.post('/api/v1/orders', data),
  getById: (id) => api.get(`/api/v1/orders/${id}`),
  getMyOrders: () => api.get('/api/v1/orders'),
};
