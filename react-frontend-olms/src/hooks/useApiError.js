import { useState, useCallback } from 'react';
import { handleApiError } from '../api/index';

// Custom hook for handling API errors in components
export const useApiError = () => {
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);

  // Handle API error and set appropriate state
  const handleError = useCallback((apiError) => {
    if (!apiError) {
      clearError();
      return;
    }

    const errorInfo = typeof apiError === 'object' && apiError.type 
      ? apiError 
      : handleApiError(apiError);

    setError(errorInfo.userMessage || errorInfo.message || 'An error occurred');
    setErrorType(errorInfo.type || 'unknown');
    setErrorDetails(errorInfo.details);

    // Log error for debugging
    console.error('API Error handled:', errorInfo);
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError('');
    setErrorType('');
    setErrorDetails(null);
  }, []);

  // Check if error is of specific type
  const isErrorType = useCallback((type) => {
    return errorType === type;
  }, [errorType]);

  // Get user-friendly error message based on error type
  const getErrorMessage = useCallback(() => {
    if (!error) return '';

    switch (errorType) {
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case 'authentication':
        return 'Your session has expired. Please log in again.';
      case 'authorization':
        return 'You don\'t have permission to perform this action.';
      case 'validation':
        return error; // Use the specific validation message
      case 'not_found':
        return 'The requested item could not be found.';
      case 'server':
        return 'Something went wrong on our end. Please try again in a few minutes.';
      case 'rate_limit':
        return 'You\'re making requests too quickly. Please wait a moment and try again.';
      case 'timeout':
        return 'The request took too long to complete. Please try again.';
      default:
        return error || 'Something unexpected happened. Please try again.';
    }
  }, [error, errorType]);

  // Check if error should trigger a retry
  const shouldRetry = useCallback(() => {
    return ['network', 'timeout', 'server', 'server_unavailable'].includes(errorType);
  }, [errorType]);

  // Check if error is temporary
  const isTemporary = useCallback(() => {
    return ['network', 'timeout', 'server', 'server_unavailable', 'rate_limit'].includes(errorType);
  }, [errorType]);

  return {
    error,
    errorType,
    errorDetails,
    hasError: !!error,
    handleError,
    clearError,
    isErrorType,
    getErrorMessage,
    shouldRetry,
    isTemporary
  };
};

// Hook for handling API loading states with error handling
export const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const apiError = useApiError();

  // Execute API call with loading and error handling
  const executeApiCall = useCallback(async (apiCall, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      successMessage = '',
      clearPreviousError = true,
      clearPreviousSuccess = true 
    } = options;

    if (clearPreviousError) {
      apiError.clearError();
    }
    if (clearPreviousSuccess) {
      setSuccess('');
    }

    setLoading(true);

    try {
      const result = await apiCall();
      
      if (result.success) {
        if (successMessage) {
          setSuccess(successMessage);
        }
        if (onSuccess) {
          onSuccess(result.data);
        }
        return result;
      } else {
        apiError.handleError(result.error);
        if (onError) {
          onError(result.error);
        }
        return result;
      }
    } catch (error) {
      apiError.handleError(error);
      if (onError) {
        onError(error);
      }
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [apiError]);

  // Clear success message
  const clearSuccess = useCallback(() => {
    setSuccess('');
  }, []);

  // Reset all states
  const reset = useCallback(() => {
    setLoading(false);
    setSuccess('');
    apiError.clearError();
  }, [apiError]);

  return {
    loading,
    success,
    ...apiError,
    executeApiCall,
    clearSuccess,
    reset
  };
};

// Hook for handling form submissions with API calls
export const useFormSubmission = () => {
  const apiState = useApiState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = useCallback(async (formData, apiCall, options = {}) => {
    const { 
      validate, 
      onSuccess, 
      onError,
      successMessage = 'Form submitted successfully!',
      resetForm
    } = options;

    // Validate form if validation function provided
    if (validate && !validate()) {
      return { success: false, error: 'Please fix the validation errors.' };
    }

    setIsSubmitting(true);

    const result = await apiState.executeApiCall(
      () => apiCall(formData),
      {
        successMessage,
        onSuccess: (data) => {
          if (resetForm) {
            resetForm();
          }
          if (onSuccess) {
            onSuccess(data);
          }
        },
        onError
      }
    );

    setIsSubmitting(false);
    return result;
  }, [apiState]);

  return {
    ...apiState,
    isSubmitting,
    submitForm
  };
};

export default useApiError;