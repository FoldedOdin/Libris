// User management API services
import apiClient from './index';

export const usersAPI = {
  getAll: () => apiClient.get('/dashboard/users/'),
  getById: (id) => apiClient.get(`/dashboard/users/${id}/`),
  update: (id, data) => apiClient.put(`/dashboard/users/${id}/`, data),
  delete: (id) => apiClient.delete(`/dashboard/users/${id}/`),
};