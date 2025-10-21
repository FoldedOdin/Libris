// Donation management API services
import apiClient, { apiRequest } from './index';

// Donation filtering utilities
export const donationFilters = {
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
    if (filters.condition) {
      params.append('condition', filters.condition);
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.user) {
      params.append('user', filters.user);
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

// Main donations API
export const donationsAPI = {
  // Basic CRUD operations
  getAll: (filters = {}) => {
    const searchParams = donationFilters.buildSearchParams(filters);
    const url = searchParams ? `/donations/?${searchParams}` : '/donations/';
    return apiRequest(() => apiClient.get(url));
  },
  
  getById: (id) => apiRequest(() => apiClient.get(`/donations/${id}/`)),
  
  create: (data) => apiRequest(() => apiClient.post('/donate/', data)),
  
  update: (id, data) => apiRequest(() => apiClient.put(`/donations/${id}/`, data)),
  
  delete: (id) => apiRequest(() => apiClient.delete(`/donations/${id}/`)),
  
  // Admin approval and rejection functions
  approve: (id, approvalData = {}) => apiRequest(() => 
    apiClient.post(`/dashboard/donations/approve/${id}/`, approvalData)
  ),
  
  reject: (id, rejectionData = {}) => apiRequest(() => 
    apiClient.post(`/dashboard/donations/reject/${id}/`, rejectionData)
  ),
  
  // Status-based filtering
  getPendingDonations: (filters = {}) => {
    const searchFilters = { ...filters, status: 'pending' };
    return donationsAPI.getAll(searchFilters);
  },
  
  getApprovedDonations: (filters = {}) => {
    const searchFilters = { ...filters, status: 'approved' };
    return donationsAPI.getAll(searchFilters);
  },
  
  getRejectedDonations: (filters = {}) => {
    const searchFilters = { ...filters, status: 'rejected' };
    return donationsAPI.getAll(searchFilters);
  },
  
  // User-specific donations
  getUserDonations: (userId, filters = {}) => {
    const searchFilters = { ...filters, user: userId };
    return donationsAPI.getAll(searchFilters);
  },
  
  getMyDonations: (filters = {}) => apiRequest(() => {
    const searchParams = donationFilters.buildSearchParams(filters);
    const url = searchParams ? `/my-donations/?${searchParams}` : '/my-donations/';
    return apiClient.get(url);
  }),
  
  // Search and filtering
  search: (query, filters = {}) => {
    const searchFilters = { ...filters, search: query };
    return donationsAPI.getAll(searchFilters);
  },
  
  searchByTitle: (title, filters = {}) => {
    const searchFilters = { ...filters, title };
    return donationsAPI.getAll(searchFilters);
  },
  
  searchByAuthor: (author, filters = {}) => {
    const searchFilters = { ...filters, author };
    return donationsAPI.getAll(searchFilters);
  },
  
  filterByCategory: (category, filters = {}) => {
    const searchFilters = { ...filters, category };
    return donationsAPI.getAll(searchFilters);
  },
  
  filterByCondition: (condition, filters = {}) => {
    const searchFilters = { ...filters, condition };
    return donationsAPI.getAll(searchFilters);
  },
  
  filterByDateRange: (dateFrom, dateTo, filters = {}) => {
    const searchFilters = { ...filters, date_from: dateFrom, date_to: dateTo };
    return donationsAPI.getAll(searchFilters);
  },
  
  // Bulk operations
  bulkApprove: (donationIds, approvalData = {}) => apiRequest(() => 
    apiClient.post('/dashboard/donations/bulk-approve/', { 
      donation_ids: donationIds, 
      approval_data: approvalData 
    })
  ),
  
  bulkReject: (donationIds, rejectionData = {}) => apiRequest(() => 
    apiClient.post('/dashboard/donations/bulk-reject/', { 
      donation_ids: donationIds, 
      rejection_data: rejectionData 
    })
  ),
  
  // Statistics
  getDonationStats: () => apiRequest(() => apiClient.get('/dashboard/donations/stats/')),
  
  // Pagination helpers
  getPage: (page, pageSize = 10, filters = {}) => {
    const searchFilters = { ...filters, page, page_size: pageSize };
    return donationsAPI.getAll(searchFilters);
  },
  
  // Direct API calls (without wrapper)
  getAllDirect: (filters = {}) => {
    const searchParams = donationFilters.buildSearchParams(filters);
    const url = searchParams ? `/donations/?${searchParams}` : '/donations/';
    return apiClient.get(url);
  },
  
  getByIdDirect: (id) => apiClient.get(`/donations/${id}/`),
  createDirect: (data) => apiClient.post('/donate/', data),
  updateDirect: (id, data) => apiClient.put(`/donations/${id}/`, data),
  deleteDirect: (id) => apiClient.delete(`/donations/${id}/`),
  approveDirect: (id, approvalData = {}) => apiClient.post(`/dashboard/donations/approve/${id}/`, approvalData),
  rejectDirect: (id, rejectionData = {}) => apiClient.post(`/dashboard/donations/reject/${id}/`, rejectionData),
};