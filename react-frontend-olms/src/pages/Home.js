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
    window.location.reload();
  };

  const handleLogin = () => {
    try {
      navigate('/login');
    } catch (navError) {
      console.error('Navigation to login failed:', navError);
      window.location.href = '/login';
    }
  };

  const handleRegister = () => {
    try {
      navigate('/register');
    } catch (navError) {
      console.error('Navigation to register failed:', navError);
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
    <div className="landing-page">
      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="container">
          <div className="nav-content">
            <div className="nav-brand">
              <span className="brand-icon">📚</span>
              <span className="brand-text">OLMS</span>
            </div>
            <div className="nav-actions">
              <button 
                className="btn btn-outline-primary nav-btn"
                onClick={handleLogin}
              >
                Login
              </button>
              <button 
                className="btn btn-primary nav-btn"
                onClick={handleRegister}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-text">Modern Library Management</span>
            </div>
            <h1 className="hero-title">
              Your Digital Library
              <span className="hero-highlight"> Reimagined</span>
            </h1>
            <p className="hero-description">
              Experience the future of library management with our comprehensive platform. 
              Discover, borrow, donate, and manage your reading journey all in one place.
            </p>
            <div className="hero-actions">
              <button 
                className="btn btn-primary btn-lg hero-btn primary"
                onClick={handleRegister}
              >
                <span>Start Your Journey</span>
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className="btn btn-outline-primary btn-lg hero-btn secondary"
                onClick={handleLogin}
              >
                <span>Sign In</span>
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Books Available</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-description">
              Powerful features designed to enhance your library experience
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Browse & Discover</h3>
              <p className="feature-description">
                Explore our vast collection of books across all genres. Advanced search and filtering make finding your next read effortless.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="feature-title">Smart Borrowing</h3>
              <p className="feature-description">
                Seamless borrowing system with automatic reminders, renewal options, and digital tracking of your reading history.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Donate & Share</h3>
              <p className="feature-description">
                Share knowledge by donating books to our community. Help others discover new worlds while decluttering your space.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Sell Books</h3>
              <p className="feature-description">
                Turn your unused books into value. Our marketplace connects you with readers looking for their next favorite book.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 7l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Admin Dashboard</h3>
              <p className="feature-description">
                Comprehensive management tools for librarians. Track inventory, manage users, and generate insightful reports.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Secure & Reliable</h3>
              <p className="feature-description">
                Your data is protected with enterprise-grade security. Enjoy peace of mind with our reliable, always-available platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Reading Experience?</h2>
            <p className="cta-description">
              Join thousands of readers who have already discovered the future of library management.
            </p>
            <div className="cta-actions">
              <button 
                className="btn btn-primary btn-lg cta-btn"
                onClick={handleRegister}
              >
                Create Free Account
              </button>
              <button 
                className="btn btn-outline-light btn-lg cta-btn"
                onClick={handleLogin}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-icon">📚</span>
              <span className="brand-text">Online Library Management System</span>
            </div>
            <div className="footer-text">
              <p>&copy; 2024 OLMS. Empowering readers, one book at a time.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;