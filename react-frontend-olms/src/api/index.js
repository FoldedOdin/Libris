// API configuration and common utilities
import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = 'http://localhost:8000/api'; // Direct calls to Django API

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Include cookies for CSRF fallback
});

// JWT Token storage utilities
const TOKEN_KEY = 'libris_access_token';
const REFRESH_KEY = 'libris_refresh_token';

export const jwtStore = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  setTokens: ({ access, refresh }) => {
    if (access) localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  hasTokens: () => !!localStorage.getItem(TOKEN_KEY),
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

// Request interceptor: attach JWT Bearer token + CSRF fallback
apiClient.interceptors.request.use(
  (config) => {
    // Attach JWT access token if available
    const accessToken = jwtStore.getAccessToken();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Also attach CSRF token for session-based auth fallback
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        config.headers['X-CSRFToken'] = value;
        break;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 + automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // On 401: attempt to refresh the JWT access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = jwtStore.getRefreshToken();
      if (!refreshToken) {
        // No refresh token exists — force logout
        jwtStore.clearTokens();
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Another request is already refreshing — queue this one
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        jwtStore.setTokens({ access: data.access, refresh: data.refresh });
        isRefreshing = false;
        onRefreshed(data.access);

        originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        jwtStore.clearTokens();
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors with single retry
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        return await apiClient(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

// Enhanced error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    // Handle new standardised error format from backend
    if (data?.error?.code) {
      return {
        type: 'api_error',
        code: data.error.code,
        message: data.error.message,
        details: data.error.details || null,
        userMessage: data.error.message,
      };
    }

    switch (status) {
      case 400: {
        let userMessage = getUserFriendlyMessage(data);
        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          userMessage = data.non_field_errors[0];
        }
        return {
          type: 'validation',
          message: data.message || data.error || 'Invalid request data.',
          details: data.errors || data,
          userMessage: userMessage || 'Please check your input and try again.',
        };
      }
      case 401:
        return {
          type: 'authentication',
          message: 'Authentication required. Please log in.',
          details: null,
          userMessage: 'Your session has expired. Please log in again.',
        };
      case 403:
        return {
          type: 'authorization',
          message: 'You do not have permission to perform this action.',
          details: null,
          userMessage: "You don't have permission to perform this action.",
        };
      case 404:
        return {
          type: 'not_found',
          message: 'The requested resource was not found.',
          details: null,
          userMessage: 'The requested item could not be found.',
        };
      case 409:
        return {
          type: 'conflict',
          message: data.message || 'A conflict occurred.',
          details: data,
          userMessage: data.message || 'This action conflicts with existing data.',
        };
      case 429:
        return {
          type: 'rate_limit',
          message: 'Too many requests. Please try again later.',
          details: null,
          userMessage: "You're making requests too quickly. Please wait a moment.",
        };
      case 500:
        return {
          type: 'server',
          message: 'Internal server error.',
          details: null,
          userMessage: 'Something went wrong on our end. Please try again later.',
        };
      default:
        return {
          type: 'unknown',
          message: data.message || data.error || 'An unexpected error occurred.',
          details: data,
          userMessage: 'Something unexpected happened. Please try again.',
        };
    }
  } else if (error.request) {
    return {
      type: 'network',
      message: 'Network error.',
      details: null,
      userMessage: 'Unable to connect to the server. Please check your connection.',
    };
  } else if (error.code === 'ECONNABORTED') {
    return {
      type: 'timeout',
      message: 'Request timeout.',
      details: null,
      userMessage: 'The request took too long. Please try again.',
    };
  } else {
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred.',
      details: null,
      userMessage: 'Something unexpected happened. Please try again.',
    };
  }
};

// Helper to extract user-friendly messages from API responses
const getUserFriendlyMessage = (data) => {
  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (data?.error && typeof data.error === 'string') return data.error;

  if (data?.errors) {
    if (Array.isArray(data.errors)) return data.errors.join(', ');
    if (typeof data.errors === 'object') {
      const msgs = [];
      Object.values(data.errors).forEach((v) => {
        if (Array.isArray(v)) msgs.push(...v);
        else msgs.push(v);
      });
      return msgs.join(', ');
    }
  }
  return null;
};

// Success response handler
export const handleApiSuccess = (response) => ({
  data: response.data,
  status: response.status,
  message: response.data.message || 'Operation completed successfully',
});

// API response wrapper with retry logic
export const apiRequest = async (requestFn, retryOptions = {}) => {
  const { maxRetries = 2, retryDelay = 1000, retryCondition = null } = retryOptions;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await requestFn();
      return { success: true, ...handleApiSuccess(response) };
    } catch (error) {
      lastError = error;

      // Don't retry on client-side errors
      const s = error.response?.status;
      if (s === 401 || s === 403 || s === 404 || s === 422) break;
      if (retryCondition && !retryCondition(error)) break;
      if (attempt === maxRetries) break;

      await new Promise((r) => setTimeout(r, retryDelay * (attempt + 1)));
    }
  }

  return { success: false, error: handleApiError(lastError) };
};

// Critical API request (more retries, server errors only)
export const criticalApiRequest = async (requestFn) =>
  apiRequest(requestFn, {
    maxRetries: 3,
    retryDelay: 2000,
    retryCondition: (error) => !error.response || error.response.status >= 500,
  });

// API request with custom timeout
export const timedApiRequest = async (requestFn, timeout = 30000) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeout)
  );

  try {
    const response = await Promise.race([requestFn(), timeoutPromise]);
    return { success: true, ...handleApiSuccess(response) };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export default apiClient;
export { API_BASE_URL };