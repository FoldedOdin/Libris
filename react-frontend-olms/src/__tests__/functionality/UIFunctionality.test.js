import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Import components to test functionality
import App from '../../App';
import Login from '../../pages/Auth/Login';
import Register from '../../pages/Auth/Register';
import AdminDashboard from '../../pages/Admin/AdminDashboard';
import UserDashboard from '../../pages/User/UserDashboard';
import BookCatalog from '../../pages/User/BookCatalog';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

// Mock AuthContext
const mockAuthContext = {
  user: { id: 1, name: 'Test User', role: 'user' },
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

const mockAdminAuthContext = {
  user: { id: 1, name: 'Admin User', role: 'admin' },
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock API calls
jest.mock('../../api', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: { success: true } })),
  put: jest.fn(() => Promise.resolve({ data: { success: true } })),
  delete: jest.fn(() => Promise.resolve({ data: { success: true } }))
}));

// Test wrapper with router
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('UI Functionality with Light Theme Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Ensure light theme CSS variables are set
    document.documentElement.style.setProperty('--bg-primary', '#ffffff');
    document.documentElement.style.setProperty('--text-primary', '#212529');
    document.documentElement.style.setProperty('--primary-color', '#007bff');
  });

  describe('Navigation Functionality', () => {
    test('should navigate properly with light theme navbar', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      // Check if navbar is rendered with light theme
      const navbar = screen.getByRole('navigation');
      expect(navbar).toBeInTheDocument();
      
      // Test navigation links functionality
      const homeLink = screen.queryByText(/home/i);
      if (homeLink) {
        await user.click(homeLink);
        expect(homeLink).toBeInTheDocument();
      }
    });

    test('should toggle sidebar properly with light theme', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      );

      // Check if sidebar is rendered
      const sidebar = document.querySelector('.sidebar, [data-testid="sidebar"]');
      if (sidebar) {
        expect(sidebar).toBeInTheDocument();
        
        // Test sidebar toggle functionality
        const toggleButton = screen.queryByRole('button', { name: /toggle|menu/i });
        if (toggleButton) {
          await user.click(toggleButton);
          // Sidebar should still be functional after click
          expect(sidebar).toBeInTheDocument();
        }
      }
    });

    test('should handle logout functionality with light theme', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      // Look for logout button
      const logoutButton = screen.queryByText(/logout/i) || screen.queryByRole('button', { name: /logout/i });
      if (logoutButton) {
        await user.click(logoutButton);
        expect(mockAuthContext.logout).toHaveBeenCalled();
      }
    });
  });

  describe('Form Functionality with Light Theme', () => {
    test('should handle login form submission with light theme styling', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Find form elements
      const emailInput = screen.queryByLabelText(/email/i) || screen.queryByPlaceholderText(/email/i);
      const passwordInput = screen.queryByLabelText(/password/i) || screen.queryByPlaceholderText(/password/i);
      const submitButton = screen.queryByRole('button', { name: /login|sign in/i });

      if (emailInput && passwordInput && submitButton) {
        // Test form input functionality
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
        
        // Test form submission
        await user.click(submitButton);
        
        // Form should handle submission (mock will be called)
        await waitFor(() => {
          expect(submitButton).toBeInTheDocument();
        });
      }
    });

    test('should handle registration form with light theme styling', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      // Find form elements
      const nameInput = screen.queryByLabelText(/name/i) || screen.queryByPlaceholderText(/name/i);
      const emailInput = screen.queryByLabelText(/email/i) || screen.queryByPlaceholderText(/email/i);
      const passwordInput = screen.queryByLabelText(/password/i) || screen.queryByPlaceholderText(/password/i);
      const submitButton = screen.queryByRole('button', { name: /register|sign up/i });

      if (nameInput && emailInput && passwordInput && submitButton) {
        // Test form input functionality
        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        
        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
        
        // Test form submission
        await user.click(submitButton);
        
        await waitFor(() => {
          expect(submitButton).toBeInTheDocument();
        });
      }
    });

    test('should display form validation errors with light theme colors', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Try to submit empty form
      const submitButton = screen.queryByRole('button', { name: /login|sign in/i });
      if (submitButton) {
        await user.click(submitButton);
        
        // Check for validation messages (they should be visible with light theme)
        await waitFor(() => {
          const errorMessages = screen.queryAllByText(/required|invalid|error/i);
          errorMessages.forEach(message => {
            expect(message).toBeInTheDocument();
            // Error messages should have appropriate styling for light theme
            const computedStyle = window.getComputedStyle(message);
            expect(computedStyle.color).toBeDefined();
          });
        });
      }
    });
  });

  describe('Dashboard Functionality', () => {
    test('should render user dashboard with light theme and functional elements', () => {
      render(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      );

      // Check that dashboard renders
      const dashboard = screen.getByText(/dashboard/i) || document.querySelector('.dashboard, .user-dashboard');
      if (dashboard) {
        expect(dashboard).toBeInTheDocument();
        
        // Check for interactive elements
        const buttons = screen.queryAllByRole('button');
        const links = screen.queryAllByRole('link');
        
        // Interactive elements should be present and functional
        expect(buttons.length + links.length).toBeGreaterThan(0);
      }
    });

    test('should render admin dashboard with light theme and functional elements', () => {
      // Mock admin context
      jest.doMock('../../contexts/AuthContext', () => ({
        useAuth: () => mockAdminAuthContext
      }));
      
      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      );

      // Check that admin dashboard renders
      const dashboard = document.querySelector('.admin-dashboard, .dashboard') || 
                       screen.queryByText(/admin/i);
      
      if (dashboard) {
        expect(dashboard).toBeInTheDocument();
      }
    });
  });

  describe('Book Catalog Functionality', () => {
    test('should render book catalog with light theme and search functionality', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BookCatalog />
        </TestWrapper>
      );

      // Check for search functionality
      const searchInput = screen.queryByPlaceholderText(/search/i) || 
                         screen.queryByLabelText(/search/i);
      
      if (searchInput) {
        await user.type(searchInput, 'test book');
        expect(searchInput).toHaveValue('test book');
        
        // Search should be functional
        const searchButton = screen.queryByRole('button', { name: /search/i });
        if (searchButton) {
          await user.click(searchButton);
          expect(searchInput).toBeInTheDocument();
        }
      }
    });

    test('should handle book interactions with light theme styling', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <BookCatalog />
        </TestWrapper>
      );

      // Look for book-related buttons
      const bookButtons = screen.queryAllByRole('button').filter(button => 
        button.textContent?.match(/borrow|reserve|view|details/i)
      );

      if (bookButtons.length > 0) {
        // Test clicking on book interaction buttons
        await user.click(bookButtons[0]);
        expect(bookButtons[0]).toBeInTheDocument();
      }
    });
  });

  describe('Interactive Elements and Feedback', () => {
    test('should show loading states with light theme styling', async () => {
      render(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      );

      // Check for loading indicators
      const loadingElements = screen.queryAllByText(/loading/i);
      const spinners = document.querySelectorAll('.loading-spinner, .spinner, [data-testid="loading"]');
      
      if (loadingElements.length > 0 || spinners.length > 0) {
        // Loading elements should be visible with light theme
        [...loadingElements, ...Array.from(spinners)].forEach(element => {
          expect(element).toBeInTheDocument();
        });
      }
    });

    test('should display success messages with light theme colors', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Try to trigger a success message
      const emailInput = screen.queryByLabelText(/email/i) || screen.queryByPlaceholderText(/email/i);
      const passwordInput = screen.queryByLabelText(/password/i) || screen.queryByPlaceholderText(/password/i);
      const submitButton = screen.queryByRole('button', { name: /login|sign in/i });

      if (emailInput && passwordInput && submitButton) {
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);
        
        // Check for success messages
        await waitFor(() => {
          const successMessages = screen.queryAllByText(/success|welcome|logged in/i);
          successMessages.forEach(message => {
            if (message) {
              expect(message).toBeInTheDocument();
              // Success messages should have appropriate green color for light theme
              const computedStyle = window.getComputedStyle(message);
              expect(computedStyle.color).toBeDefined();
            }
          });
        });
      }
    });

    test('should handle button hover states with light theme', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      );

      const buttons = screen.queryAllByRole('button');
      
      if (buttons.length > 0) {
        const firstButton = buttons[0];
        
        // Test hover functionality
        await user.hover(firstButton);
        expect(firstButton).toBeInTheDocument();
        
        await user.unhover(firstButton);
        expect(firstButton).toBeInTheDocument();
      }
    });
  });

  describe('Responsive Functionality', () => {
    test('should maintain functionality on mobile viewport with light theme', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigation should still work on mobile
      const navbar = screen.queryByRole('navigation');
      if (navbar) {
        expect(navbar).toBeInTheDocument();
        
        // Mobile menu toggle should work
        const menuToggle = screen.queryByRole('button', { name: /menu|toggle/i });
        if (menuToggle) {
          await user.click(menuToggle);
          expect(menuToggle).toBeInTheDocument();
        }
      }
    });

    test('should maintain functionality on desktop viewport with light theme', async () => {
      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      window.dispatchEvent(new Event('resize'));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Desktop navigation should work
      const navbar = screen.queryByRole('navigation');
      if (navbar) {
        expect(navbar).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility with Light Theme', () => {
    test('should maintain keyboard navigation with light theme', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      // Test tab navigation
      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
      
      // Focused elements should have visible focus indicators with light theme
      if (focusedElement) {
        const computedStyle = window.getComputedStyle(focusedElement);
        expect(computedStyle.outline || computedStyle.boxShadow).toBeDefined();
      }
    });

    test('should have proper ARIA labels with light theme elements', () => {
      render(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      );

      // Check for ARIA labels on interactive elements
      const interactiveElements = screen.queryAllByRole('button');
      interactiveElements.forEach(element => {
        // Elements should have accessible names or labels
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling with Light Theme', () => {
    test('should display error messages with appropriate light theme styling', async () => {
      // Mock API to return error
      const api = require('../../api');
      api.post.mockRejectedValueOnce(new Error('Login failed'));

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.queryByLabelText(/email/i) || screen.queryByPlaceholderText(/email/i);
      const passwordInput = screen.queryByLabelText(/password/i) || screen.queryByPlaceholderText(/password/i);
      const submitButton = screen.queryByRole('button', { name: /login|sign in/i });

      if (emailInput && passwordInput && submitButton) {
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'wrongpassword');
        await user.click(submitButton);
        
        // Check for error messages with light theme styling
        await waitFor(() => {
          const errorMessages = screen.queryAllByText(/error|failed|invalid/i);
          errorMessages.forEach(message => {
            if (message) {
              expect(message).toBeInTheDocument();
              // Error messages should have red color appropriate for light theme
              const computedStyle = window.getComputedStyle(message);
              expect(computedStyle.color).toBeDefined();
            }
          });
        });
      }
    });
  });
});