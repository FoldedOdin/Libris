import React from 'react';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  title = null,
  onClose = null,
  className = '',
  showIcon = true 
}) => {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
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
          {title && <div className="alert-title">{title}</div>}
          <div className="alert-text">
            {typeof message === 'string' ? message : JSON.stringify(message)}
          </div>
        </div>
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
  );
};

export default ErrorMessage;