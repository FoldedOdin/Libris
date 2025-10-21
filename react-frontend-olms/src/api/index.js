// API configuration and common utilities
import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: data.message || 'Invalid request data',
          details: data.errors || data
        };
      case 401:
        return {
          type: 'authentication',
          message: 'Authentication required. Please log in.',
          details: null
        };
      case 403:
        return {
          type: 'authorization',
          message: 'You do not have permission to perform this action.',
          details: null
        };
      case 404:
        return {
          type: 'not_found',
          message: 'The requested resource was not found.',
          details: null
        };
      case 500:
        return {
          type: 'server',
          message: 'Internal server error. Please try again later.',
          details: null
        };
      default:
        return {
          type: 'unknown',
          message: data.message || 'An unexpected error occurred.',
          details: data
        };
    }
  } else if (error.request) {
    // Network error
    return {
      type: 'network',
      message: 'Network error. Please check your connection and try again.',
      details: null
    };
  } else {
    // Other error
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred.',
      details: null
    };
  }
};

// Success response handler
export const handleApiSuccess = (response) => {
  return {
    data: response.data,
    status: response.status,
    message: response.data.message || 'Operation completed successfully'
  };
};

// API response wrapper
export const apiRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return {
      success: true,
      ...handleApiSuccess(response)
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error)
    };
  }
};

export default apiClient;
export { API_BASE_URL };