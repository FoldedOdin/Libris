// Book management API services
import apiClient, { apiRequest } from './index';

// Book search and filtering utilities
export const bookFilters = {
  buildSearchParams: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.title) {
      params.append('title', filters.title);
    }
    if (filters.author) {
      params.append('author', filters.author);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.isbn) {
      params.append('isbn', filters.isbn);
    }
    if (filters.available !== undefined) {
      params.append('available', filters.available);
    }
    if (filters.ordering) {
      params.append('ordering', filters.ordering);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.page_size) {
      params.append('page_size', filters.page_size);
    }
    
    return params.toString();
  }
};

// Main books API
export const booksAPI = {
  // Basic CRUD operations
  getAll: (filters = {}) => {
    const searchParams = bookFilters.buildSearchParams(filters);
    const url = searchParams ? `/books/?${searchParams}` : '/books/';
    return apiRequest(() => apiClient.get(url));
  },
  
  getById: (id) => apiRequest(() => apiClient.get(`/books/${id}/`)),
  
  create: (data) => apiRequest(() => apiClient.post('/books/', data)),
  
  update: (id, data) => apiRequest(() => apiClient.put(`/books/${id}/`, data)),
  
  delete: (id) => apiRequest(() => apiClient.delete(`/books/${id}/`)),
  
  // Borrowing operations
  borrow: (id, borrowData = {}) => apiRequest(() => 
    apiClient.post(`/books/${id}/borrow/`, borrowData)
  ),
  
  return: (id, returnData = {}) => apiRequest(() => 
    apiClient.post(`/books/${id}/return/`, returnData)
  ),
  
  // Search and filtering operations
  search: (query, filters = {}) => {
    const searchFilters = { ...filters, search: query };
    return booksAPI.getAll(searchFilters);
  },
  
  searchByTitle: (title, filters = {}) => {
    const searchFilters = { ...filters, title };
    return booksAPI.getAll(searchFilters);
  },
  
  searchByAuthor: (author, filters = {}) => {
    const searchFilters = { ...filters, author };
    return booksAPI.getAll(searchFilters);
  },
  
  searchByCategory: (category, filters = {}) => {
    const searchFilters = { ...filters, category };
    return booksAPI.getAll(searchFilters);
  },
  
  getAvailableBooks: (filters = {}) => {
    const searchFilters = { ...filters, available: true };
    return booksAPI.getAll(searchFilters);
  },
  
  getCategories: () => apiRequest(() => apiClient.get('/books/categories/')),
  
  // Advanced filtering
  filterBooks: (filters) => booksAPI.getAll(filters),
  
  // Pagination helpers
  getPage: (page, pageSize = 10, filters = {}) => {
    const searchFilters = { ...filters, page, page_size: pageSize };
    return booksAPI.getAll(searchFilters);
  },
  
  // Direct API calls (without wrapper)
  getAllDirect: (filters = {}) => {
    const searchParams = bookFilters.buildSearchParams(filters);
    const url = searchParams ? `/books/?${searchParams}` : '/books/';
    return apiClient.get(url);
  },
  
  getByIdDirect: (id) => apiClient.get(`/books/${id}/`),
  createDirect: (data) => apiClient.post('/books/', data),
  updateDirect: (id, data) => apiClient.put(`/books/${id}/`, data),
  deleteDirect: (id) => apiClient.delete(`/books/${id}/`),
  borrowDirect: (id, borrowData = {}) => apiClient.post(`/books/${id}/borrow/`, borrowData),
  returnDirect: (id, returnData = {}) => apiClient.post(`/books/${id}/return/`, returnData),
};