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
  withCredentials: true, // Include cookies for CSRF
});

// Request interceptor to add CSRF token for Django
apiClient.interceptors.request.use(
  async (config) => {
    // Get CSRF token from cookies
    const cookies = document.cookie.split(';');
    let csrfToken = null;
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        csrfToken = value;
        break;
      }
    }
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
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
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized access or Django login redirects
    if ((error.response?.status === 401 || error.response?.status === 302) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear auth data and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Handle network errors with retry logic
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
  console.error('API Error:', error);

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        // Handle Django REST Framework error format
        let userMessage = getUserFriendlyMessage(data);
        
        // Check for non_field_errors (common in DRF)
        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          userMessage = data.non_field_errors[0];
        }
        
        return {
          type: 'validation',
          message: data.message || data.error || 'Invalid request data. Please check your input.',
          details: data.errors || data,
          userMessage: userMessage || 'Please check your input and try again.'
        };
      case 401:
        return {
          type: 'authentication',
          message: 'Authentication required. Please log in.',
          details: null,
          userMessage: 'Your session has expired. Please log in again.'
        };
      case 403:
        return {
          type: 'authorization',
          message: 'You do not have permission to perform this action.',
          details: null,
          userMessage: 'You don\'t have permission to perform this action.'
        };
      case 404:
        return {
          type: 'not_found',
          message: 'The requested resource was not found.',
          details: null,
          userMessage: 'The requested item could not be found.'
        };
      case 409:
        return {
          type: 'conflict',
          message: data.message || 'A conflict occurred with the current state.',
          details: data,
          userMessage: data.message || 'This action conflicts with existing data.'
        };
      case 422:
        return {
          type: 'validation',
          message: data.message || 'Validation failed.',
          details: data.errors || data,
          userMessage: getUserFriendlyMessage(data) || 'Please check your input and try again.'
        };
      case 429:
        return {
          type: 'rate_limit',
          message: 'Too many requests. Please try again later.',
          details: null,
          userMessage: 'You\'re making requests too quickly. Please wait a moment and try again.'
        };
      case 500:
        return {
          type: 'server',
          message: 'Internal server error. Please try again later.',
          details: null,
          userMessage: 'Something went wrong on our end. Please try again in a few minutes.'
        };
      case 502:
      case 503:
      case 504:
        return {
          type: 'server_unavailable',
          message: 'Service temporarily unavailable. Please try again later.',
          details: null,
          userMessage: 'The service is temporarily unavailable. Please try again in a few minutes.'
        };
      default:
        return {
          type: 'unknown',
          message: data.message || data.error || 'An unexpected error occurred.',
          details: data,
          userMessage: 'Something unexpected happened. Please try again.'
        };
    }
  } else if (error.request) {
    // Network error
    return {
      type: 'network',
      message: 'Network error. Please check your connection and try again.',
      details: null,
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.'
    };
  } else if (error.code === 'ECONNABORTED') {
    // Timeout error
    return {
      type: 'timeout',
      message: 'Request timeout. Please try again.',
      details: null,
      userMessage: 'The request took too long to complete. Please try again.'
    };
  } else {
    // Other error
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred.',
      details: null,
      userMessage: 'Something unexpected happened. Please try again.'
    };
  }
};

// Helper function to extract user-friendly messages from API responses
const getUserFriendlyMessage = (data) => {
  if (typeof data === 'string') {
    return data;
  }
  
  if (data && data.message) {
    return data.message;
  }
  
  if (data && data.error) {
    return data.error;
  }
  
  // Handle validation errors
  if (data && data.errors) {
    if (Array.isArray(data.errors)) {
      return data.errors.join(', ');
    }
    
    if (typeof data.errors === 'object') {
      const errorMessages = [];
      Object.keys(data.errors).forEach(field => {
        const fieldErrors = data.errors[field];
        if (Array.isArray(fieldErrors)) {
          errorMessages.push(...fieldErrors);
        } else {
          errorMessages.push(fieldErrors);
        }
      });
      return errorMessages.join(', ');
    }
  }
  
  return null;
};

// Success response handler
export const handleApiSuccess = (response) => {
  return {
    data: response.data,
    status: response.status,
    message: response.data.message || 'Operation completed successfully'
  };
};

// API response wrapper with retry logic
export const apiRequest = async (requestFn, retryOptions = {}) => {
  const { maxRetries = 2, retryDelay = 1000, retryCondition = null } = retryOptions;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await requestFn();
      return {
        success: true,
        ...handleApiSuccess(response)
      };
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      if (error.response?.status === 401 || 
          error.response?.status === 403 || 
          error.response?.status === 404 ||
          error.response?.status === 422) {
        break;
      }
      
      // Check custom retry condition
      if (retryCondition && !retryCondition(error)) {
        break;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
  
  return {
    success: false,
    error: handleApiError(lastError)
  };
};

// Specialized API request for critical operations
export const criticalApiRequest = async (requestFn) => {
  return apiRequest(requestFn, {
    maxRetries: 3,
    retryDelay: 2000,
    retryCondition: (error) => {
      // Retry on network errors and server errors (5xx)
      return !error.response || error.response.status >= 500;
    }
  });
};

// API request with timeout
export const timedApiRequest = async (requestFn, timeout = 30000) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });
  
  try {
    const response = await Promise.race([requestFn(), timeoutPromise]);
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