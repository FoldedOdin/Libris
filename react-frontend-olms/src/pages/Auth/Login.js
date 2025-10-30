import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFormValidation, validationSchemas, getFieldErrorClass, renderFieldError } from '../../utils/validation';
import { useApiError } from '../../hooks/useApiError';
import ErrorMessage from '../../components/common/ErrorMessage';
import '../../styles/pages.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAdmin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);

  // Get the intended destination or default redirect
  const from = location.state?.from?.pathname || null;

  // Use API error handling hook
  const { 
    error: apiError, 
    errorType, 
    isTemporary,
    handleError: handleApiError, 
    clearError: clearApiError,
    getErrorMessage 
  } = useApiError();

  // Use form validation hook
  const {
    formData,
    errors,
    handleChange: handleFormChange,
    handleBlur,
    validateForm
  } = useFormValidation(validationSchemas.login, {
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    handleFormChange(e);
    
    // Clear API error when user makes changes
    if (apiError) {
      clearApiError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearApiError();

    try {
      const result = await login({
        username: formData.username,
        password: formData.password
      });

      if (result.success) {
        // Redirect based on user role and intended destination
        if (from) {
          navigate(from, { replace: true });
        } else {
          // Check admin status from the fresh user data
          const userData = JSON.parse(localStorage.getItem('user'));
          const isUserAdmin = userData?.role === 'admin' || userData?.is_staff === true;
          const redirectPath = isUserAdmin ? '/admin/dashboard' : '/dashboard';
          navigate(redirectPath, { replace: true });
        }
      } else {
        handleApiError(result.error);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>
        <p className="auth-subtitle">Sign in to your account</p>
        
        {apiError && (
          <ErrorMessage 
            message={getErrorMessage()}
            errorType={errorType}
            isTemporary={isTemporary}
            onClose={clearApiError}
            onRetry={isTemporary ? handleSubmit : null}
          />
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username or Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldErrorClass('username', errors)}
              placeholder="Enter your username or email"
              disabled={isLoading}
            />
            {renderFieldError('username', errors)}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldErrorClass('password', errors)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {renderFieldError('password', errors)}
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="button-spinner-text">Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={() => navigate('/register')}
              className="auth-link"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;