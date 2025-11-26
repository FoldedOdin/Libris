// Authentication API services
import apiClient, { apiRequest } from './index';

// Token management utilities (adapted for Django sessions)
export const tokenManager = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken'),
  isTokenValid: () => {
    const token = localStorage.getItem('authToken');
    // For Django session-based auth, just check if token exists
    return token === 'django-session';
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

// Get CSRF token from Django
const getCSRFToken = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/csrf/', {
      credentials: 'include'
    });
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return null;
  }
};

// Authentication state management helpers
export const authHelpers = {
  login: async (credentials) => {
    try {
      console.log('Starting login process...', credentials.username);
      console.log('Credentials keys:', Object.keys(credentials));
      console.log('Password present:', !!credentials.password, 'Length:', credentials.password?.length);
      
      // Get CSRF token first
      const csrfToken = await getCSRFToken();
      console.log('CSRF token obtained:', csrfToken ? 'Yes' : 'No');
      
      console.log('Sending login request with data:', { username: credentials.username, password: '***' });
      const result = await apiRequest(() => apiClient.post('/login/', credentials));
      console.log('API request result:', result);
      
      if (result.success && result.data.user) {
        userManager.setUser(result.data.user);
        tokenManager.setToken('django-session');
        console.log('Login successful, user saved:', result.data.user.username);
        return { success: true, data: result.data };
      } else {
        console.log('Login failed:', result.error);
        return { 
          success: false, 
          error: result.error?.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during login' 
      };
    }
  },

  register: async (userData) => {
    try {
      // Get CSRF token first
      await getCSRFToken();
      
      const result = await apiRequest(() => apiClient.post('/register/', userData));
      
      if (result.success && result.data.user) {
        userManager.setUser(result.data.user);
        tokenManager.setToken('django-session');
        return { success: true, data: result.data };
      } else {
        return { 
          success: false, 
          error: result.error?.message || 'Registration failed',
          data: result.data // Include validation errors
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during registration' 
      };
    }
  },

  logout: async () => {
    try {
      await apiRequest(() => apiClient.post('/logout/'));
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state
      tokenManager.removeToken();
      userManager.removeUser();
    }

    return { success: true };
  },

  refreshToken: async () => {
    // For Django session-based auth, no token refresh needed
    return { success: true };
  },

  getCurrentUser: async () => {
    try {
      const result = await apiRequest(() => apiClient.get('/user/'));
      if (result.success) {
        userManager.setUser(result.data);
        return { success: true, data: result.data };
      }
      return { success: false, error: 'Failed to get user data' };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: 'Failed to get user data' };
    }
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