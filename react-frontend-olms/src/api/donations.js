// Donation management API services
import apiClient from './index';

export const donationsAPI = {
  getAll: () => apiClient.get('/donations/'),
  create: (data) => apiClient.post('/donate/', data),
  update: (id, data) => apiClient.put(`/donations/${id}/`, data),
  approve: (id) => apiClient.post(`/dashboard/donations/approve/${id}/`),
  reject: (id) => apiClient.post(`/dashboard/donations/reject/${id}/`),
};