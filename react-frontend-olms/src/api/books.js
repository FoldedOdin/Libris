// Book management API services
import apiClient from './index';

export const booksAPI = {
  getAll: () => apiClient.get('/books/'),
  getById: (id) => apiClient.get(`/books/${id}/`),
  create: (data) => apiClient.post('/books/', data),
  update: (id, data) => apiClient.put(`/books/${id}/`, data),
  delete: (id) => apiClient.delete(`/books/${id}/`),
  borrow: (id) => apiClient.post(`/books/${id}/borrow/`),
  return: (id) => apiClient.post(`/books/${id}/return/`),
};