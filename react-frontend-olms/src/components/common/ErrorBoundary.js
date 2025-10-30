// Error boundary component for catching and handling React errors
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Send error to monitoring service in production
    if (process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // This would typically send to a service like Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      environment: process.env.REACT_APP_ENVIRONMENT
    };

    // Example: Send to your error reporting service
    console.error('Error reported to monitoring service:', errorData);
    
    // You would replace this with actual error reporting service call
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  };

  getUserId = () => {
    // Get user ID from localStorage or context
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>Oops! Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="btn btn-primary"
              >
                Try Again
              </button>
              <button 
                onClick={this.handleReload}
                className="btn btn-secondary"
              >
                Reload Page
              </button>
            </div>
            
            <p className="error-help">
              If this problem persists, please contact support.
            </p>
          </div>
          
          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 20px;
              background-color: #f8f9fa;
            }
            
            .error-boundary-content {
              max-width: 600px;
              text-align: center;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .error-boundary-content h2 {
              color: #dc3545;
              margin-bottom: 16px;
            }
            
            .error-boundary-content p {
              color: #6c757d;
              margin-bottom: 24px;
            }
            
            .error-details {
              text-align: left;
              margin: 20px 0;
              padding: 16px;
              background-color: #f8f9fa;
              border-radius: 4px;
              border: 1px solid #dee2e6;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .error-stack {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              white-space: pre-wrap;
              word-break: break-word;
              color: #dc3545;
              background-color: #fff;
              padding: 10px;
              border-radius: 4px;
              border: 1px solid #dee2e6;
              max-height: 200px;
              overflow-y: auto;
            }
            
            .error-actions {
              display: flex;
              gap: 12px;
              justify-content: center;
              margin-bottom: 20px;
            }
            
            .btn {
              padding: 10px 20px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              transition: background-color 0.2s;
            }
            
            .btn-primary {
              background-color: #007bff;
              color: white;
            }
            
            .btn-primary:hover {
              background-color: #0056b3;
            }
            
            .btn-secondary {
              background-color: #6c757d;
              color: white;
            }
            
            .btn-secondary:hover {
              background-color: #545b62;
            }
            
            .error-help {
              font-size: 12px;
              color: #6c757d;
              margin-top: 20px;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, fallback) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error, errorInfo = {}) => {
    setError({ error, errorInfo });
    
    if (process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true') {
      console.error('Error captured:', error, errorInfo);
      // Send to error reporting service
    }
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error.error;
  }

  return { captureError, resetError };
};

export default ErrorBoundary;