import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Import main App component
import App from '../../App';

// Import components that might have had performance monitoring
import AdminDashboard from '../../pages/Admin/AdminDashboard';
import UserDashboard from '../../pages/User/UserDashboard';
import BookCatalog from '../../pages/User/BookCatalog';

// Mock AuthContext
const mockAuthContext = {
  user: { id: 1, name: 'Test User', role: 'admin' },
  logout: jest.fn()
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock API calls
jest.mock('../../api', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} }))
}));

// Test wrapper with router
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Performance Monitor Removal Tests', () => {
  beforeEach(() => {
    // Clear any existing performance observers
    if (global.PerformanceObserver) {
      global.PerformanceObserver = undefined;
    }
    
    // Clear console to check for performance-related logs
    jest.clearAllMocks();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  describe('PerformanceMonitor Component Removal', () => {
    test('should not render PerformanceMonitor component in App', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check that no performance monitor elements are present
      expect(screen.queryByTestId('performance-monitor')).not.toBeInTheDocument();
      expect(screen.queryByText(/FCP|LCP|FID|CLS|TTFB/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Performance/)).not.toBeInTheDocument();
      
      // Check for performance-related class names
      const performanceElements = document.querySelectorAll('.performance-monitor, .perf-indicator, .performance-metrics');
      expect(performanceElements).toHaveLength(0);
    });

    test('should not render performance metrics in AdminDashboard', () => {
      render(
        <TestWrapper>
          <AdminDashboard />
        </TestWrapper>
      );

      // Check that no performance metrics are displayed
      expect(screen.queryByText(/FCP/)).not.toBeInTheDocument();
      expect(screen.queryByText(/LCP/)).not.toBeInTheDocument();
      expect(screen.queryByText(/FID/)).not.toBeInTheDocument();
      expect(screen.queryByText(/CLS/)).not.toBeInTheDocument();
      expect(screen.queryByText(/TTFB/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Performance Monitor/)).not.toBeInTheDocument();
    });

    test('should not render performance metrics in UserDashboard', () => {
      render(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      );

      // Check that no performance metrics are displayed
      expect(screen.queryByText(/Performance/)).not.toBeInTheDocument();
      expect(screen.queryByTestId('performance-stats')).not.toBeInTheDocument();
      expect(screen.queryByTestId('performance-chart')).not.toBeInTheDocument();
    });

    test('should not render performance indicators in BookCatalog', () => {
      render(
        <TestWrapper>
          <BookCatalog />
        </TestWrapper>
      );

      // Check that no performance indicators are present
      const performanceIndicators = document.querySelectorAll('.perf-indicator, .loading-time, .render-time');
      expect(performanceIndicators).toHaveLength(0);
    });
  });

  describe('Keyboard Shortcuts Disabled', () => {
    test('should not respond to Ctrl+Shift+P keyboard shortcut', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Simulate Ctrl+Shift+P keyboard shortcut
      fireEvent.keyDown(document, {
        key: 'P',
        code: 'KeyP',
        ctrlKey: true,
        shiftKey: true
      });

      // Check that no performance monitor appears
      expect(screen.queryByTestId('performance-monitor')).not.toBeInTheDocument();
      expect(screen.queryByText(/Performance Monitor/)).not.toBeInTheDocument();
    });

    test('should not respond to Alt+P keyboard shortcut', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Simulate Alt+P keyboard shortcut
      fireEvent.keyDown(document, {
        key: 'P',
        code: 'KeyP',
        altKey: true
      });

      // Check that no performance monitor appears
      expect(screen.queryByTestId('performance-monitor')).not.toBeInTheDocument();
    });
  });

  describe('Performance Metrics Not Collected', () => {
    test('should not collect web vitals metrics', () => {
      // Mock web-vitals functions
      const mockGetCLS = jest.fn();
      const mockGetFID = jest.fn();
      const mockGetFCP = jest.fn();
      const mockGetLCP = jest.fn();
      const mockGetTTFB = jest.fn();

      // Mock web-vitals module
      jest.doMock('web-vitals', () => ({
        getCLS: mockGetCLS,
        getFID: mockGetFID,
        getFCP: mockGetFCP,
        getLCP: mockGetLCP,
        getTTFB: mockGetTTFB
      }));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Verify that web vitals functions are not called
      expect(mockGetCLS).not.toHaveBeenCalled();
      expect(mockGetFID).not.toHaveBeenCalled();
      expect(mockGetFCP).not.toHaveBeenCalled();
      expect(mockGetLCP).not.toHaveBeenCalled();
      expect(mockGetTTFB).not.toHaveBeenCalled();
    });

    test('should not log performance metrics to console', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check that no performance-related console logs are made
      expect(console.log).not.toHaveBeenCalledWith(expect.stringMatching(/FCP|LCP|FID|CLS|TTFB|Performance/));
      expect(console.warn).not.toHaveBeenCalledWith(expect.stringMatching(/Performance/));
    });
  });

  describe('Performance-Related CSS Removed', () => {
    test('should not have performance monitor CSS classes in DOM', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check that performance-related CSS classes are not present
      expect(document.querySelector('.performance-monitor')).toBeNull();
      expect(document.querySelector('.performance-metrics')).toBeNull();
      expect(document.querySelector('.perf-indicator')).toBeNull();
      expect(document.querySelector('.performance-badge')).toBeNull();
      expect(document.querySelector('.metrics-display')).toBeNull();
    });

    test('should not have performance-related inline styles', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check that no elements have performance-related inline styles
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const style = element.getAttribute('style');
        if (style) {
          expect(style).not.toMatch(/performance|perf-/i);
        }
      });
    });
  });

  describe('Production Build Verification', () => {
    test('should not include performance monitoring code in production', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Verify no performance monitoring elements exist
      expect(screen.queryByTestId('performance-monitor')).not.toBeInTheDocument();
      expect(document.querySelector('.performance-monitor')).toBeNull();

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    test('should not have performance monitoring in staging environment', () => {
      // Mock staging environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'staging';

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Verify no performance monitoring elements exist
      expect(screen.queryByTestId('performance-monitor')).not.toBeInTheDocument();

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Memory and Performance Impact', () => {
    test('should not create performance observers', () => {
      const originalPerformanceObserver = global.PerformanceObserver;
      const mockPerformanceObserver = jest.fn();
      global.PerformanceObserver = mockPerformanceObserver;

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Verify PerformanceObserver is not instantiated for monitoring
      expect(mockPerformanceObserver).not.toHaveBeenCalled();

      // Restore original PerformanceObserver
      global.PerformanceObserver = originalPerformanceObserver;
    });

    test('should not set up performance measurement intervals', () => {
      const originalSetInterval = global.setInterval;
      const mockSetInterval = jest.fn();
      global.setInterval = mockSetInterval;

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check that no intervals are set up for performance monitoring
      const performanceIntervals = mockSetInterval.mock.calls.filter(call => 
        call[0].toString().includes('performance') || 
        call[0].toString().includes('metrics')
      );
      expect(performanceIntervals).toHaveLength(0);

      // Restore original setInterval
      global.setInterval = originalSetInterval;
    });
  });

  describe('Local Storage and Session Storage', () => {
    test('should not store performance data in localStorage', () => {
      const originalLocalStorage = global.localStorage;
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
      global.localStorage = mockLocalStorage;

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check that no performance data is stored
      const performanceStorageCalls = mockLocalStorage.setItem.mock.calls.filter(call =>
        call[0].includes('performance') || 
        call[0].includes('metrics') ||
        call[0].includes('vitals')
      );
      expect(performanceStorageCalls).toHaveLength(0);

      // Restore original localStorage
      global.localStorage = originalLocalStorage;
    });

    test('should not store performance data in sessionStorage', () => {
      const originalSessionStorage = global.sessionStorage;
      const mockSessionStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
      global.sessionStorage = mockSessionStorage;

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check that no performance data is stored
      const performanceStorageCalls = mockSessionStorage.setItem.mock.calls.filter(call =>
        call[0].includes('performance') || 
        call[0].includes('metrics') ||
        call[0].includes('vitals')
      );
      expect(performanceStorageCalls).toHaveLength(0);

      // Restore original sessionStorage
      global.sessionStorage = originalSessionStorage;
    });
  });
});