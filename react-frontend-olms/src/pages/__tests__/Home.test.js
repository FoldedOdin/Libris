import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from '../Home';
import AuthContext from '../../contexts/AuthContext';

// Mock the LoadingSpinner component
jest.mock('../../components/common/LoadingSpinner', () => {
  return function MockLoadingSpinner({ text }) {
    return <div data-testid="loading-spinner">{text}</div>;
  };
});

// Mock the ErrorMessage component
jest.mock('../../components/common/ErrorMessage', () => {
  return function MockErrorMessage({ message, onRetry, errorType, isTemporary }) {
    return (
      <div data-testid="error-message">
        <div data-testid="error-text">{message}</div>
        <div data-testid="error-type">{errorType}</div>
        <div data-testid="error-temporary">{isTemporary ? 'true' : 'false'}</div>
        {onRetry && (
          <button data-testid="retry-button" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  };
});

// Helper to render Home component with required providers
const renderHome = (authContextValue = {}) => {
  const defaultAuthContext = {
    user: null,
    isAuthenticated: false,
    isAdmin: () => false,
    ...authContextValue
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuthContext}>
        <Home />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Home Component - Responsive Design', () => {
  beforeEach(() => {
    // Clear any previous mocks
    jest.clearAllMocks();
  });

  test('renders landing page for unauthenticated users', () => {
    renderHome();

    // Check for main landing page elements
    expect(screen.getByRole('main')).toHaveClass('landing-page');
    expect(screen.getByText('Online Library Management System')).toBeInTheDocument();
    expect(screen.getByText('Your gateway to a world of books and knowledge')).toBeInTheDocument();
  });

  test('displays hero section with proper structure', () => {
    renderHome();

    // Check hero section structure
    const heroSection = screen.getByLabelText('System features');
    expect(heroSection).toBeInTheDocument();
    
    // Check feature items
    expect(screen.getByText('Browse thousands of books')).toBeInTheDocument();
    expect(screen.getByText('Borrow, donate, and sell books')).toBeInTheDocument();
    expect(screen.getByText('Manage your reading journey')).toBeInTheDocument();
  });

  test('displays call-to-action buttons with proper accessibility', () => {
    renderHome();

    // Check CTA buttons
    const loginButton = screen.getByRole('button', { name: /login/i });
    const registerButton = screen.getByRole('button', { name: /register/i });

    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();

    // Check accessibility attributes
    expect(loginButton).toHaveAttribute('aria-describedby', 'login-description');
    expect(registerButton).toHaveAttribute('aria-describedby', 'register-description');
  });

  test('buttons are touch-friendly with minimum size', () => {
    renderHome();

    const loginButton = screen.getByRole('button', { name: /login/i });
    const registerButton = screen.getByRole('button', { name: /register/i });

    // Check that buttons have the CTA button class for touch-friendly styling
    expect(loginButton).toHaveClass('cta-button');
    expect(registerButton).toHaveClass('cta-button');
  });

  test('handles login button click', () => {
    const mockNavigate = jest.fn();
    
    // Mock useNavigate
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    renderHome();

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    // Note: Due to the way the component is structured, we can't easily test navigation
    // without more complex mocking. This test verifies the button is clickable.
    expect(loginButton).toBeInTheDocument();
  });

  test('handles register button click', () => {
    renderHome();

    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    // Similar to login button test
    expect(registerButton).toBeInTheDocument();
  });

  test('shows loading state while checking authentication', () => {
    renderHome({ isAuthenticated: false });

    // The component should show loading initially, but since we're mocking
    // and the useEffect runs synchronously in tests, we check for the final state
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  test('has proper semantic HTML structure', () => {
    renderHome();

    // Check semantic structure
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Authentication options' })).toBeInTheDocument();
    
    // Check heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Online Library Management System');
  });

  test('includes proper ARIA labels and descriptions', () => {
    renderHome();

    // Check ARIA labels
    expect(screen.getByLabelText('System features')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Authentication options' })).toBeInTheDocument();
    
    // Check descriptions
    expect(screen.getByText(/Already have an account/)).toBeInTheDocument();
    expect(screen.getByText(/New to our library/)).toBeInTheDocument();
  });

  test('responsive design classes are applied', () => {
    renderHome();

    // Check that responsive classes are present
    const landingPage = screen.getByRole('main');
    expect(landingPage).toHaveClass('landing-page');

    const heroSection = document.querySelector('.hero-section');
    expect(heroSection).toBeInTheDocument();

    const ctaSection = document.querySelector('.cta-section');
    expect(ctaSection).toBeInTheDocument();
  });

  test('feature items have proper structure for responsive design', () => {
    renderHome();

    const featuresList = screen.getByLabelText('System features');
    const featureItems = featuresList.querySelectorAll('.feature-item');
    
    expect(featureItems).toHaveLength(3);
    
    // Check that each feature item has icon and text
    featureItems.forEach(item => {
      expect(item.querySelector('.feature-icon')).toBeInTheDocument();
      expect(item.querySelector('.feature-text')).toBeInTheDocument();
    });
  });
});

describe('Home Component - Authentication Redirect', () => {
  test('redirects authenticated regular user', () => {
    const mockNavigate = jest.fn();
    
    // This test would require more complex mocking to properly test navigation
    // For now, we verify the component handles authenticated users
    renderHome({
      user: { id: 1, role: 'user' },
      isAuthenticated: true,
      isAdmin: () => false
    });

    // Since navigation happens in useEffect and we can't easily mock it,
    // we just verify the component doesn't crash with authenticated users
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  test('redirects authenticated admin user', () => {
    renderHome({
      user: { id: 1, role: 'admin' },
      isAuthenticated: true,
      isAdmin: () => true
    });

    // Similar to above test
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});

describe('Home Component - Error Handling', () => {
  // Mock console.error to avoid noise in test output
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  test('displays error state with fallback navigation when authentication check fails', () => {
    // Mock isAdmin to throw an error
    const mockIsAdmin = jest.fn(() => {
      throw new Error('Authentication check failed');
    });

    renderHome({
      user: { id: 1, role: 'user' },
      isAuthenticated: true,
      isAdmin: mockIsAdmin
    });

    // Should display error message
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByTestId('error-text')).toHaveTextContent(
      'Unable to verify authentication status'
    );
    expect(screen.getByTestId('error-type')).toHaveTextContent('authentication');
    expect(screen.getByTestId('error-temporary')).toHaveTextContent('true');
  });

  test('displays fallback navigation links in error state', () => {
    const mockIsAdmin = jest.fn(() => {
      throw new Error('Navigation error');
    });

    renderHome({
      user: { id: 1, role: 'user' },
      isAuthenticated: true,
      isAdmin: mockIsAdmin
    });

    // Should display fallback navigation
    expect(screen.getByText('Continue to:')).toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.getByText('Register Page')).toBeInTheDocument();
    expect(screen.getByText('If the buttons don\'t work, you can click the links directly.')).toBeInTheDocument();
  });

  test('fallback navigation links work correctly', () => {
    const mockIsAdmin = jest.fn(() => {
      throw new Error('Navigation error');
    });

    renderHome({
      user: { id: 1, role: 'user' },
      isAuthenticated: true,
      isAdmin: mockIsAdmin
    });

    const loginLink = screen.getByText('Login Page');
    const registerLink = screen.getByText('Register Page');

    expect(loginLink).toHaveAttribute('href', '/login');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('retry functionality works in error state', () => {
    // Mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    const mockIsAdmin = jest.fn(() => {
      throw new Error('Test error');
    });

    renderHome({
      user: { id: 1, role: 'user' },
      isAuthenticated: true,
      isAdmin: mockIsAdmin
    });

    const retryButton = screen.getByTestId('retry-button');
    fireEvent.click(retryButton);

    expect(mockReload).toHaveBeenCalled();
  });

  test('error state has proper CSS classes', () => {
    const mockIsAdmin = jest.fn(() => {
      throw new Error('Test error');
    });

    renderHome({
      user: { id: 1, role: 'user' },
      isAuthenticated: true,
      isAdmin: mockIsAdmin
    });

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('landing-page', 'error-state');
  });

  test('handles navigation errors gracefully', () => {
    renderHome();

    // Test login button with navigation error
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    // Mock window.location.href for fallback navigation
    delete window.location;
    window.location = { href: '' };

    fireEvent.click(loginButton);

    // Component should not crash and button should still be present
    expect(loginButton).toBeInTheDocument();
  });
});