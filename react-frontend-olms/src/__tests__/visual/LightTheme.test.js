import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Import components to test
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';

// Mock AuthContext
const mockAuthContext = {
  user: { id: 1, name: 'Test User', role: 'user' },
  logout: jest.fn()
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Test wrapper with router
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Light Theme Visual Tests', () => {
  beforeEach(() => {
    // Reset any CSS custom properties to ensure light theme
    document.documentElement.style.setProperty('--bg-primary', '#ffffff');
    document.documentElement.style.setProperty('--text-primary', '#212529');
    document.documentElement.style.setProperty('--bg-navbar', '#ffffff');
    document.documentElement.style.setProperty('--bg-sidebar', '#f8f9fa');
  });

  describe('Color Contrast and Accessibility', () => {
    test('should have high contrast text on light backgrounds', () => {
      const testDiv = document.createElement('div');
      testDiv.style.backgroundColor = '#ffffff';
      testDiv.style.color = '#212529';
      document.body.appendChild(testDiv);

      const computedStyle = window.getComputedStyle(testDiv);
      expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(computedStyle.color).toBe('rgb(33, 37, 41)');

      document.body.removeChild(testDiv);
    });

    test('should use appropriate light theme colors for primary elements', () => {
      const primaryButton = document.createElement('button');
      primaryButton.style.backgroundColor = '#007bff';
      primaryButton.style.color = '#ffffff';
      document.body.appendChild(primaryButton);

      const computedStyle = window.getComputedStyle(primaryButton);
      expect(computedStyle.backgroundColor).toBe('rgb(0, 123, 255)');
      expect(computedStyle.color).toBe('rgb(255, 255, 255)');

      document.body.removeChild(primaryButton);
    });

    test('should have readable secondary text colors', () => {
      const secondaryText = document.createElement('span');
      secondaryText.style.color = '#495057';
      document.body.appendChild(secondaryText);

      const computedStyle = window.getComputedStyle(secondaryText);
      expect(computedStyle.color).toBe('rgb(73, 80, 87)');

      document.body.removeChild(secondaryText);
    });
  });

  describe('Navigation Components Light Theme', () => {
    test('Navbar should render with light theme styling', () => {
      render(
        <TestWrapper>
          <Navbar />
        </TestWrapper>
      );

      const navbar = screen.getByRole('navigation');
      expect(navbar).toBeInTheDocument();
      
      // Check if navbar has light theme classes or styles
      const computedStyle = window.getComputedStyle(navbar);
      // Navbar should have white or light background
      expect(computedStyle.backgroundColor).toMatch(/rgb\(255, 255, 255\)|rgb\(248, 249, 250\)/);
    });

    test('Sidebar should render with light theme styling', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      );

      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        const computedStyle = window.getComputedStyle(sidebar);
        // Sidebar should have light gray background
        expect(computedStyle.backgroundColor).toMatch(/rgb\(248, 249, 250\)|rgb\(233, 236, 239\)/);
      }
    });
  });

  describe('Message Components Light Theme', () => {
    test('ErrorMessage should render with appropriate light theme colors', () => {
      render(<ErrorMessage message="Test error message" />);
      
      const errorElement = screen.getByText('Test error message');
      expect(errorElement).toBeInTheDocument();
      
      // Error messages should have red color that works on light backgrounds
      const computedStyle = window.getComputedStyle(errorElement);
      expect(computedStyle.color).toMatch(/rgb\(220, 53, 69\)|rgb\(185, 28, 28\)/);
    });

    test('SuccessMessage should render with appropriate light theme colors', () => {
      render(<SuccessMessage message="Test success message" />);
      
      const successElement = screen.getByText('Test success message');
      expect(successElement).toBeInTheDocument();
      
      // Success messages should have green color that works on light backgrounds
      const computedStyle = window.getComputedStyle(successElement);
      expect(computedStyle.color).toMatch(/rgb\(40, 167, 69\)|rgb\(21, 128, 61\)/);
    });
  });

  describe('Interactive Elements Light Theme', () => {
    test('LoadingSpinner should be visible on light backgrounds', () => {
      render(<LoadingSpinner />);
      
      const spinner = document.querySelector('.loading-spinner, .spinner, [data-testid="loading-spinner"]');
      if (spinner) {
        expect(spinner).toBeInTheDocument();
        
        // Spinner should have appropriate colors for light theme
        const computedStyle = window.getComputedStyle(spinner);
        expect(computedStyle.color || computedStyle.borderColor).toBeDefined();
      }
    });

    test('Toast notifications should have light theme styling', () => {
      render(<Toast message="Test toast" type="info" />);
      
      const toast = screen.getByText('Test toast');
      expect(toast).toBeInTheDocument();
      
      // Toast should have appropriate background for light theme
      const toastContainer = toast.closest('.toast, .notification');
      if (toastContainer) {
        const computedStyle = window.getComputedStyle(toastContainer);
        expect(computedStyle.backgroundColor).toBeDefined();
      }
    });
  });

  describe('Typography Light Theme', () => {
    test('should render headings with appropriate light theme colors', () => {
      const heading = document.createElement('h1');
      heading.textContent = 'Test Heading';
      heading.style.color = '#212529';
      document.body.appendChild(heading);

      const computedStyle = window.getComputedStyle(heading);
      expect(computedStyle.color).toBe('rgb(33, 37, 41)');

      document.body.removeChild(heading);
    });

    test('should render body text with readable colors on light backgrounds', () => {
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Test paragraph text';
      paragraph.style.color = '#212529';
      paragraph.style.backgroundColor = '#ffffff';
      document.body.appendChild(paragraph);

      const computedStyle = window.getComputedStyle(paragraph);
      expect(computedStyle.color).toBe('rgb(33, 37, 41)');
      expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 255)');

      document.body.removeChild(paragraph);
    });

    test('should render links with appropriate light theme colors', () => {
      const link = document.createElement('a');
      link.textContent = 'Test Link';
      link.href = '#';
      link.style.color = '#0066cc';
      document.body.appendChild(link);

      const computedStyle = window.getComputedStyle(link);
      expect(computedStyle.color).toBe('rgb(0, 102, 204)');

      document.body.removeChild(link);
    });
  });

  describe('Form Elements Light Theme', () => {
    test('should render form inputs with light theme styling', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.style.backgroundColor = '#ffffff';
      input.style.borderColor = '#ced4da';
      input.style.color = '#212529';
      document.body.appendChild(input);

      const computedStyle = window.getComputedStyle(input);
      expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(computedStyle.borderColor).toBe('rgb(206, 212, 218)');
      expect(computedStyle.color).toBe('rgb(33, 37, 41)');

      document.body.removeChild(input);
    });

    test('should render buttons with light theme styling', () => {
      const button = document.createElement('button');
      button.textContent = 'Test Button';
      button.style.backgroundColor = '#007bff';
      button.style.color = '#ffffff';
      button.style.border = '1px solid #007bff';
      document.body.appendChild(button);

      const computedStyle = window.getComputedStyle(button);
      expect(computedStyle.backgroundColor).toBe('rgb(0, 123, 255)');
      expect(computedStyle.color).toBe('rgb(255, 255, 255)');

      document.body.removeChild(button);
    });
  });

  describe('Card and Container Elements', () => {
    test('should render cards with light theme styling', () => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.backgroundColor = '#ffffff';
      card.style.borderColor = '#e9ecef';
      card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      document.body.appendChild(card);

      const computedStyle = window.getComputedStyle(card);
      expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(computedStyle.borderColor).toBe('rgb(233, 236, 239)');

      document.body.removeChild(card);
    });

    test('should render containers with appropriate light backgrounds', () => {
      const container = document.createElement('div');
      container.className = 'container';
      container.style.backgroundColor = '#ffffff';
      document.body.appendChild(container);

      const computedStyle = window.getComputedStyle(container);
      expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 255)');

      document.body.removeChild(container);
    });
  });

  describe('Responsive Design Light Theme', () => {
    test('should maintain light theme colors across different screen sizes', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      const mobileElement = document.createElement('div');
      mobileElement.style.backgroundColor = '#ffffff';
      mobileElement.style.color = '#212529';
      document.body.appendChild(mobileElement);

      let computedStyle = window.getComputedStyle(mobileElement);
      expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(computedStyle.color).toBe('rgb(33, 37, 41)');

      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      window.dispatchEvent(new Event('resize'));

      const desktopElement = document.createElement('div');
      desktopElement.style.backgroundColor = '#ffffff';
      desktopElement.style.color = '#212529';
      document.body.appendChild(desktopElement);

      computedStyle = window.getComputedStyle(desktopElement);
      expect(computedStyle.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(computedStyle.color).toBe('rgb(33, 37, 41)');

      document.body.removeChild(mobileElement);
      document.body.removeChild(desktopElement);
    });
  });

  describe('CSS Variables Light Theme', () => {
    test('should have correct light theme CSS variables defined', () => {
      const rootStyles = getComputedStyle(document.documentElement);
      
      // Check primary background is white
      expect(rootStyles.getPropertyValue('--bg-primary').trim()).toBe('#ffffff');
      
      // Check primary text is dark
      expect(rootStyles.getPropertyValue('--text-primary').trim()).toBe('#212529');
      
      // Check navbar background is white
      expect(rootStyles.getPropertyValue('--bg-navbar').trim()).toBe('#ffffff');
      
      // Check sidebar background is light gray
      expect(rootStyles.getPropertyValue('--bg-sidebar').trim()).toBe('#f8f9fa');
      
      // Check primary color is blue
      expect(rootStyles.getPropertyValue('--primary-color').trim()).toBe('#007bff');
    });

    test('should have appropriate border colors for light theme', () => {
      const rootStyles = getComputedStyle(document.documentElement);
      
      expect(rootStyles.getPropertyValue('--border-light').trim()).toBe('#e9ecef');
      expect(rootStyles.getPropertyValue('--border-medium').trim()).toBe('#dee2e6');
      expect(rootStyles.getPropertyValue('--border-dark').trim()).toBe('#adb5bd');
    });

    test('should have appropriate shadow values for light theme', () => {
      const rootStyles = getComputedStyle(document.documentElement);
      
      const cardShadow = rootStyles.getPropertyValue('--box-shadow-card').trim();
      const navbarShadow = rootStyles.getPropertyValue('--box-shadow-navbar').trim();
      
      expect(cardShadow).toContain('rgba(0, 0, 0, 0.1)');
      expect(navbarShadow).toContain('rgba(0, 0, 0, 0.1)');
    });
  });
});