import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if AuthContext is available
        if (!user && !isAuthenticated && isAuthenticated !== false) {
          // Still loading auth context
          return;
        }

        if (isAuthenticated && user) {
          // Redirect based on user role
          try {
            if (isAdmin()) {
              navigate('/admin/dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          } catch (navError) {
            console.error('Navigation error:', navError);
            setError({
              type: 'navigation',
              message: 'Unable to redirect to dashboard. You can navigate manually using the links below.',
              isTemporary: true
            });
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (authError) {
        console.error('Authentication check error:', authError);
        setError({
          type: 'authentication',
          message: 'Unable to verify authentication status. Please try refreshing the page or navigate manually.',
          isTemporary: true
        });
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, user, navigate, isAdmin]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Trigger re-check by updating a dependency
    window.location.reload();
  };

  const handleLogin = () => {
    try {
      navigate('/login');
    } catch (navError) {
      console.error('Navigation to login failed:', navError);
      // Fallback to direct navigation
      window.location.href = '/login';
    }
  };

  const handleRegister = () => {
    try {
      navigate('/register');
    } catch (navError) {
      console.error('Navigation to register failed:', navError);
      // Fallback to direct navigation
      window.location.href = '/register';
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  // Error state with fallback navigation
  if (error) {
    return (
      <main className="landing-page error-state" role="main">
        <div className="container">
          <div className="error-content">
            <ErrorMessage
              message={error.message}
              type="error"
              errorType={error.type}
              isTemporary={error.isTemporary}
              onRetry={handleRetry}
              className="landing-error"
            />

            <div className="fallback-navigation">
              <h2 className="fallback-title">Continue to:</h2>
              <div className="fallback-links">
                <a
                  href="/login"
                  className="btn btn-primary btn-lg fallback-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
                  Login Page
                </a>
                <a
                  href="/register"
                  className="btn btn-secondary btn-lg fallback-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRegister();
                  }}
                >
                  Register Page
                </a>
              </div>
              <p className="fallback-description">
                If the buttons don't work, you can click the links directly.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="landing-page" role="main">
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero-content">
            <h1 id="hero-title" className="hero-title">
              Online Library Management System
            </h1>
            <p className="hero-description">
              Your gateway to a world of books and knowledge
            </p>
            <ul className="features-list" aria-label="System features">
              <li className="feature-item">
                <span className="feature-icon">📚</span>
                <span className="feature-text">Browse thousands of books</span>
              </li>
              <li className="feature-item">
                <span className="feature-icon">🔄</span>
                <span className="feature-text">Borrow, donate, and sell books</span>
              </li>
              <li className="feature-item">
                <span className="feature-icon">📖</span>
                <span className="feature-text">Manage your reading journey</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-section" aria-labelledby="cta-title">
        <div className="container">
          <h2 id="cta-title" className="sr-only">Get Started</h2>
          <div className="cta-content">
            <div className="cta-buttons" role="group" aria-label="Authentication options">
              <button
                className="btn btn-primary btn-lg cta-button"
                onClick={handleLogin}
                aria-describedby="login-description"
              >
                <span className="btn-text">Login</span>
              </button>
              <button
                className="btn btn-secondary btn-lg cta-button"
                onClick={handleRegister}
                aria-describedby="register-description"
              >
                <span className="btn-text">Register</span>
              </button>
            </div>
            <div className="cta-descriptions">
              <p id="login-description" className="cta-description">
                Already have an account? Sign in to access your library
              </p>
              <p id="register-description" className="cta-description">
                New to our library? Create an account to get started
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;