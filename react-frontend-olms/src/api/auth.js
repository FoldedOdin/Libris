// Authentication API services
import apiClient, { apiRequest } from './index';

// Token management utilities
export const tokenManager = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken'),
  isTokenValid: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      // Basic token validation - check if it's not expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// User data management utilities
export const userManager = {
  getUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('user'),
  isAdmin: () => {
    const user = userManager.getUser();
    return user?.role === 'admin' || user?.is_staff === true;
  },
  isAuthenticated: () => {
    return tokenManager.isTokenValid() && userManager.getUser() !== null;
  }
};

// Authentication state management helpers
export const authHelpers = {
  login: async (credentials) => {
    const result = await apiRequest(() => apiClient.post('/login/', credentials));
    
    if (result.success && result.data.token) {
      tokenManager.setToken(result.data.token);
      if (result.data.user) {
        userManager.setUser(result.data.user);
      }
    }
    
    return result;
  },
  
  register: async (userData) => {
    const result = await apiRequest(() => apiClient.post('/register/', userData));
    
    if (result.success && result.data.token) {
      tokenManager.setToken(result.data.token);
      if (result.data.user) {
        userManager.setUser(result.data.user);
      }
    }
    
    return result;
  },
  
  logout: async () => {
    const result = await apiRequest(() => apiClient.post('/logout/'));
    
    // Clear local storage regardless of API response
    tokenManager.removeToken();
    userManager.removeUser();
    
    return result;
  },
  
  refreshToken: async () => {
    const result = await apiRequest(() => apiClient.post('/refresh-token/'));
    
    if (result.success && result.data.token) {
      tokenManager.setToken(result.data.token);
    }
    
    return result;
  },
  
  getCurrentUser: async () => {
    return await apiRequest(() => apiClient.get('/user/profile/'));
  }
};

// Main authentication API
export const authAPI = {
  login: (credentials) => authHelpers.login(credentials),
  register: (userData) => authHelpers.register(userData),
  logout: () => authHelpers.logout(),
  refreshToken: () => authHelpers.refreshToken(),
  getCurrentUser: () => authHelpers.getCurrentUser(),
  
  // Direct API calls (without state management)
  loginDirect: (credentials) => apiClient.post('/login/', credentials),
  registerDirect: (userData) => apiClient.post('/register/', userData),
  logoutDirect: () => apiClient.post('/logout/'),
};