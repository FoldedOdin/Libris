import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFormValidation, validationSchemas, validationRules, getFieldErrorClass, renderFieldError } from '../../utils/validation';
import { useApiError } from '../../hooks/useApiError';
import ErrorMessage from '../../components/common/ErrorMessage';
import '../../styles/pages.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAdmin } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);

  // Use API error handling hook
  const { 
    error: apiError, 
    errorType, 
    isTemporary,
    handleError: handleApiError, 
    clearError: clearApiError,
    getErrorMessage 
  } = useApiError();

  // Create custom validation schema for registration with password confirmation
  const registerSchema = validationSchemas.register;
  
  // Use form validation hook
  const {
    formData,
    errors,
    handleChange: handleFormChange,
    handleBlur,
    validateForm: validateFormFields,
    setFormData
  } = useFormValidation(registerSchema, {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: ''
  });

  const handleChange = (e) => {
    handleFormChange(e);
    
    // Clear API error when user makes changes
    if (apiError) {
      clearApiError();
    }
  };

  const validateForm = () => {
    // First validate basic fields
    const isBasicValid = validateFormFields();
    
    // Then validate password confirmation separately
    const confirmPasswordError = validationRules.passwordConfirm(
      formData.confirm_password, 
      formData.password
    );
    
    if (confirmPasswordError) {
      setFormData(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          confirm_password: confirmPasswordError
        }
      }));
      return false;
    }
    
    return isBasicValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearApiError();

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password_confirm: formData.confirm_password
      };

      const result = await register(registrationData);

      if (result.success) {
        // Redirect based on user role (new users are typically regular users)
        const redirectPath = isAdmin() ? '/admin/dashboard' : '/dashboard';
        navigate(redirectPath, { replace: true });
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
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up for a new account</p>
        
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldErrorClass('first_name', errors)}
                placeholder="Enter your first name"
                disabled={isLoading}
              />
              {renderFieldError('first_name', errors)}
            </div>

            <div className="form-group">
              <label htmlFor="last_name" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldErrorClass('last_name', errors)}
                placeholder="Enter your last name"
                disabled={isLoading}
              />
              {renderFieldError('last_name', errors)}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldErrorClass('username', errors)}
              placeholder="Choose a username"
              disabled={isLoading}
            />
            {renderFieldError('username', errors)}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldErrorClass('email', errors)}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
            {renderFieldError('email', errors)}
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
              placeholder="Create a password"
              disabled={isLoading}
            />
            {renderFieldError('password', errors)}
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldErrorClass('confirm_password', errors)}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {renderFieldError('confirm_password', errors)}
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="button-spinner-text">Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="auth-link"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;