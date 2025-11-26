import { useState, useEffect } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);

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
    validateForm,
    resetForm
  } = useFormValidation(validationSchemas.login, {
    username: '',
    password: ''
  });

  // Clear form when component mounts or location changes
  useEffect(() => {
    resetForm({ username: '', password: '' });
    // Also clear the actual input fields to override browser autofill
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
  }, [location.pathname, resetForm]);

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
      console.log('Login form validation failed:', errors);
      return;
    }

    setIsLoading(true);
    clearApiError();

    try {
      const loginData = {
        username: formData.username,
        password: formData.password
      };
      console.log('Attempting login with username:', loginData.username);
      console.log('Password present:', !!loginData.password, 'Length:', loginData.password?.length);
      console.log('Login data keys:', Object.keys(loginData));
      console.log('DEBUG - Password value:', loginData.password); // TEMPORARY DEBUG - REMOVE LATER
      
      const result = await login(loginData);

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
              autoComplete="username"
              key={`username-${location.pathname}`}
            />
            {renderFieldError('username', errors)}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldErrorClass('password', errors)}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
                key={location.pathname}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  color: '#666',
                  fontSize: '18px'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
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