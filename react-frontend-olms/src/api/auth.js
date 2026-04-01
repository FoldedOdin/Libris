// Authentication API services — JWT-based
import apiClient, { apiRequest, jwtStore } from './index';

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
  isAuthenticated: () => jwtStore.hasTokens() && userManager.getUser() !== null,
};

// Kept for backward-compatibility with AuthContext
export const tokenManager = {
  getToken: () => jwtStore.getAccessToken(),
  setToken: () => {}, // no-op — handled by jwtStore
  removeToken: () => jwtStore.clearTokens(),
  isTokenValid: () => jwtStore.hasTokens(),
};

// Authentication state management helpers
export const authHelpers = {
  login: async (credentials) => {
    try {
      const result = await apiRequest(() =>
        apiClient.post('/login/', credentials)
      );

      if (result.success && result.data.user) {
        // Store JWT tokens returned by backend
        if (result.data.tokens) {
          jwtStore.setTokens(result.data.tokens);
        }
        userManager.setUser(result.data.user);
        return { success: true, data: result.data };
      } else {
        return {
          success: false,
          error: result.error?.message || result.error?.userMessage || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during login',
      };
    }
  },

  register: async (userData) => {
    try {
      const result = await apiRequest(() =>
        apiClient.post('/register/', userData)
      );

      if (result.success && result.data.user) {
        if (result.data.tokens) {
          jwtStore.setTokens(result.data.tokens);
        }
        userManager.setUser(result.data.user);
        return { success: true, data: result.data };
      } else {
        return {
          success: false,
          error: result.error?.message || result.error?.userMessage || 'Registration failed',
          data: result.data,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during registration',
      };
    }
  },

  logout: async () => {
    try {
      const refreshToken = jwtStore.getRefreshToken();
      await apiRequest(() =>
        apiClient.post('/logout/', { refresh: refreshToken })
      );
    } catch {
      // Ignore logout API errors — clear local state regardless
    } finally {
      jwtStore.clearTokens();
      userManager.removeUser();
    }
    return { success: true };
  },

  refreshToken: async () => {
    const refreshToken = jwtStore.getRefreshToken();
    if (!refreshToken) return { success: false };

    try {
      const { data } = await apiClient.post('/token/refresh/', {
        refresh: refreshToken,
      });
      jwtStore.setTokens({ access: data.access, refresh: data.refresh });
      return { success: true };
    } catch {
      jwtStore.clearTokens();
      return { success: false };
    }
  },

  getCurrentUser: async () => {
    try {
      const result = await apiRequest(() => apiClient.get('/user/'));
      if (result.success) {
        userManager.setUser(result.data);
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Failed to get user data' };
    } catch {
      return { success: false, error: 'Failed to get user data' };
    }
  },
};

// Main authentication API (public surface)
export const authAPI = {
  login: (credentials) => authHelpers.login(credentials),
  register: (userData) => authHelpers.register(userData),
  logout: () => authHelpers.logout(),
  refreshToken: () => authHelpers.refreshToken(),
  getCurrentUser: () => authHelpers.getCurrentUser(),
};