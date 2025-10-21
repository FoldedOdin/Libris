// Sales management API services
import apiClient, { apiRequest } from './index';

// Sales filtering utilities
export const salesFilters = {
  buildSearchParams: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.book_title) {
      params.append('book_title', filters.book_title);
    }
    if (filters.book_author) {
      params.append('book_author', filters.book_author);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.condition) {
      params.append('condition', filters.condition);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.user) {
      params.append('user', filters.user);
    }
    if (filters.price_min) {
      params.append('price_min', filters.price_min);
    }
    if (filters.price_max) {
      params.append('price_max', filters.price_max);
    }
    if (filters.date_from) {
      params.append('date_from', filters.date_from);
    }
    if (filters.date_to) {
      params.append('date_to', filters.date_to);
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

// Main sales API
export const salesAPI = {
  // Basic CRUD operations
  getAll: (filters = {}) => {
    const searchParams = salesFilters.buildSearchParams(filters);
    const url = searchParams ? `/sales/?${searchParams}` : '/sales/';
    return apiRequest(() => apiClient.get(url));
  },
  
  getById: (id) => apiRequest(() => apiClient.get(`/sales/${id}/`)),
  
  create: (data) => apiRequest(() => apiClient.post('/sell/', data)),
  
  update: (id, data) => apiRequest(() => apiClient.put(`/sales/${id}/`, data)),
  
  delete: (id) => apiRequest(() => apiClient.delete(`/sales/${id}/`)),
  
  // Admin approval and rejection operations
  approve: (id, approvalData = {}) => apiRequest(() => 
    apiClient.post(`/sales/approve/${id}/`, approvalData)
  ),
  
  reject: (id, rejectionData = {}) => apiRequest(() => 
    apiClient.post(`/sales/reject/${id}/`, rejectionData)
  ),
  
  // Status-based filtering
  getPendingSales: (filters = {}) => {
    const searchFilters = { ...filters, status: 'pending' };
    return salesAPI.getAll(searchFilters);
  },
  
  getApprovedSales: (filters = {}) => {
    const searchFilters = { ...filters, status: 'approved' };
    return salesAPI.getAll(searchFilters);
  },
  
  getRejectedSales: (filters = {}) => {
    const searchFilters = { ...filters, status: 'rejected' };
    return salesAPI.getAll(searchFilters);
  },
  
  getSoldItems: (filters = {}) => {
    const searchFilters = { ...filters, status: 'sold' };
    return salesAPI.getAll(searchFilters);
  },
  
  // User-specific sales
  getUserSales: (userId, filters = {}) => {
    const searchFilters = { ...filters, user: userId };
    return salesAPI.getAll(searchFilters);
  },
  
  getMySales: (filters = {}) => apiRequest(() => {
    const searchParams = salesFilters.buildSearchParams(filters);
    const url = searchParams ? `/my-sales/?${searchParams}` : '/my-sales/';
    return apiClient.get(url);
  }),
  
  // Search and filtering
  search: (query, filters = {}) => {
    const searchFilters = { ...filters, search: query };
    return salesAPI.getAll(searchFilters);
  },
  
  searchByBookTitle: (title, filters = {}) => {
    const searchFilters = { ...filters, book_title: title };
    return salesAPI.getAll(searchFilters);
  },
  
  searchByBookAuthor: (author, filters = {}) => {
    const searchFilters = { ...filters, book_author: author };
    return salesAPI.getAll(searchFilters);
  },
  
  filterByCategory: (category, filters = {}) => {
    const searchFilters = { ...filters, category };
    return salesAPI.getAll(searchFilters);
  },
  
  filterByCondition: (condition, filters = {}) => {
    const searchFilters = { ...filters, condition };
    return salesAPI.getAll(searchFilters);
  },
  
  filterByPriceRange: (minPrice, maxPrice, filters = {}) => {
    const searchFilters = { ...filters, price_min: minPrice, price_max: maxPrice };
    return salesAPI.getAll(searchFilters);
  },
  
  filterByDateRange: (dateFrom, dateTo, filters = {}) => {
    const searchFilters = { ...filters, date_from: dateFrom, date_to: dateTo };
    return salesAPI.getAll(searchFilters);
  },
  
  // Sales status management
  markAsSold: (id, saleData = {}) => apiRequest(() => 
    apiClient.patch(`/sales/${id}/`, { ...saleData, status: 'sold' })
  ),
  
  updatePrice: (id, newPrice) => apiRequest(() => 
    apiClient.patch(`/sales/${id}/`, { price: newPrice })
  ),
  
  // Bulk operations
  bulkApprove: (saleIds, approvalData = {}) => apiRequest(() => 
    apiClient.post('/sales/bulk-approve/', { 
      sale_ids: saleIds, 
      approval_data: approvalData 
    })
  ),
  
  bulkReject: (saleIds, rejectionData = {}) => apiRequest(() => 
    apiClient.post('/sales/bulk-reject/', { 
      sale_ids: saleIds, 
      rejection_data: rejectionData 
    })
  ),
  
  // Statistics
  getSalesStats: () => apiRequest(() => apiClient.get('/dashboard/sales/stats/')),
  
  // Pagination helpers
  getPage: (page, pageSize = 10, filters = {}) => {
    const searchFilters = { ...filters, page, page_size: pageSize };
    return salesAPI.getAll(searchFilters);
  },
  
  // Direct API calls (without wrapper)
  getAllDirect: (filters = {}) => {
    const searchParams = salesFilters.buildSearchParams(filters);
    const url = searchParams ? `/sales/?${searchParams}` : '/sales/';
    return apiClient.get(url);
  },
  
  getByIdDirect: (id) => apiClient.get(`/sales/${id}/`),
  createDirect: (data) => apiClient.post('/sell/', data),
  updateDirect: (id, data) => apiClient.put(`/sales/${id}/`, data),
  deleteDirect: (id) => apiClient.delete(`/sales/${id}/`),
  approveDirect: (id, approvalData = {}) => apiClient.post(`/sales/approve/${id}/`, approvalData),
  rejectDirect: (id, rejectionData = {}) => apiClient.post(`/sales/reject/${id}/`, rejectionData),
};