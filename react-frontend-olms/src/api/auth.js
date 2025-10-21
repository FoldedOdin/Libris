// Authentication API services
import apiClient from './index';

export const authAPI = {
  login: (credentials) => apiClient.post('/login/', credentials),
  register: (userData) => apiClient.post('/register/', userData),
  logout: () => apiClient.post('/logout/'),
};