// User management API services
import apiClient, { apiRequest } from './index';

// User filtering utilities
export const userFilters = {
  buildSearchParams: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.username) {
      params.append('username', filters.username);
    }
    if (filters.email) {
      params.append('email', filters.email);
    }
    if (filters.first_name) {
      params.append('first_name', filters.first_name);
    }
    if (filters.last_name) {
      params.append('last_name', filters.last_name);
    }
    if (filters.role) {
      params.append('role', filters.role);
    }
    if (filters.is_active !== undefined) {
      params.append('is_active', filters.is_active);
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

// Main users API
export const usersAPI = {
  // Admin user management operations
  getAll: (filters = {}) => {
    const searchParams = userFilters.buildSearchParams(filters);
    const url = searchParams ? `/users/?${searchParams}` : '/users/';
    return apiRequest(() => apiClient.get(url));
  },
  
  getById: (id) => apiRequest(() => apiClient.get(`/users/${id}/`)),
  
  update: (id, data) => apiRequest(() => apiClient.put(`/users/${id}/`, data)),
  
  delete: (id) => apiRequest(() => apiClient.delete(`/users/${id}/`)),
  
  // User search and filtering
  search: (query, filters = {}) => {
    const searchFilters = { ...filters, search: query };
    return usersAPI.getAll(searchFilters);
  },
  
  searchByUsername: (username, filters = {}) => {
    const searchFilters = { ...filters, username };
    return usersAPI.getAll(searchFilters);
  },
  
  searchByEmail: (email, filters = {}) => {
    const searchFilters = { ...filters, email };
    return usersAPI.getAll(searchFilters);
  },
  
  filterByRole: (role, filters = {}) => {
    const searchFilters = { ...filters, role };
    return usersAPI.getAll(searchFilters);
  },
  
  getActiveUsers: (filters = {}) => {
    const searchFilters = { ...filters, is_active: true };
    return usersAPI.getAll(searchFilters);
  },
  
  getInactiveUsers: (filters = {}) => {
    const searchFilters = { ...filters, is_active: false };
    return usersAPI.getAll(searchFilters);
  },
  
  // User status management
  activateUser: (id) => apiRequest(() => 
    apiClient.patch(`/users/${id}/`, { is_active: true })
  ),
  
  deactivateUser: (id) => apiRequest(() => 
    apiClient.patch(`/users/${id}/`, { is_active: false })
  ),
  
  changeUserRole: (id, role) => apiRequest(() => 
    apiClient.patch(`/users/${id}/`, { role })
  ),
  
  // Bulk operations
  bulkUpdate: (userIds, updateData) => apiRequest(() => 
    apiClient.patch('/users/bulk-update/', { 
      user_ids: userIds, 
      update_data: updateData 
    })
  ),
  
  bulkDelete: (userIds) => apiRequest(() => 
    apiClient.delete('/users/bulk-delete/', { 
      data: { user_ids: userIds } 
    })
  ),
  
  // User statistics
  getUserStats: () => apiRequest(() => apiClient.get('/users/stats/')),
  
  getUserActivity: (id, filters = {}) => {
    const searchParams = userFilters.buildSearchParams(filters);
    const url = searchParams ? 
      `/users/${id}/activity/?${searchParams}` : 
      `/users/${id}/activity/`;
    return apiRequest(() => apiClient.get(url));
  },
  
  // Pagination helpers
  getPage: (page, pageSize = 10, filters = {}) => {
    const searchFilters = { ...filters, page, page_size: pageSize };
    return usersAPI.getAll(searchFilters);
  },
  
  // Direct API calls (without wrapper)
  getAllDirect: (filters = {}) => {
    const searchParams = userFilters.buildSearchParams(filters);
    const url = searchParams ? `/users/?${searchParams}` : '/users/';
    return apiClient.get(url);
  },
  
  getByIdDirect: (id) => apiClient.get(`/users/${id}/`),
  updateDirect: (id, data) => apiClient.put(`/users/${id}/`, data),
  deleteDirect: (id) => apiClient.delete(`/users/${id}/`),
};