const ErrorMessage = ({ 
  message, 
  type = 'error', 
  title = null,
  onClose = null,
  onRetry = null,
  className = '',
  showIcon = true,
  errorType = null,
  isTemporary = false,
  details = null
}) => {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return errorType === 'network' ? '🌐' : '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '❌';
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (errorType) {
      case 'network':
        return 'Connection Error';
      case 'authentication':
        return 'Authentication Required';
      case 'authorization':
        return 'Access Denied';
      case 'validation':
        return 'Validation Error';
      case 'not_found':
        return 'Not Found';
      case 'server':
        return 'Server Error';
      case 'rate_limit':
        return 'Too Many Requests';
      case 'timeout':
        return 'Request Timeout';
      default:
        return 'Error';
    }
  };

  const alertClass = `alert alert-${type}`;

  return (
    <div className={`${alertClass} ${className}`} role="alert">
      <div className="alert-content">
        {showIcon && (
          <span className="alert-icon" aria-hidden="true">
            {getIcon()}
          </span>
        )}
        <div className="alert-message">
          <div className="alert-title">{getTitle()}</div>
          <div className="alert-text">
            {typeof message === 'string' ? message : JSON.stringify(message)}
          </div>
          {isTemporary && (
            <div className="alert-subtitle">
              This appears to be a temporary issue. Please try again.
            </div>
          )}
          {details && process.env.NODE_ENV === 'development' && (
            <details className="alert-details">
              <summary>Technical Details</summary>
              <pre>{JSON.stringify(details, null, 2)}</pre>
            </details>
          )}
        </div>
        <div className="alert-actions">
          {onRetry && (
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={onRetry}
              style={{ marginRight: '8px' }}
            >
              Try Again
            </button>
          )}
          {onClose && (
            <button 
              className="alert-close" 
              onClick={onClose}
              aria-label="Close alert"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;