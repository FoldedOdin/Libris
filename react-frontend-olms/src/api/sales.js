// Sales management API services
import apiClient from './index';

export const salesAPI = {
  getAll: () => apiClient.get('/sales/'),
  create: (data) => apiClient.post('/sell/', data),
  update: (id, data) => apiClient.put(`/sales/${id}/`, data),
  approve: (id) => apiClient.post(`/sales/approve/${id}/`),
  reject: (id) => apiClient.post(`/sales/reject/${id}/`),
};