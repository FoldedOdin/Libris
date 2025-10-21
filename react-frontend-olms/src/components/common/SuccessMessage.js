import React, { useEffect, useState } from 'react';

const SuccessMessage = ({ 
  message, 
  title = null,
  autoHide = true,
  duration = 5000,
  onClose = null,
  className = '',
  showIcon = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          onClose();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!message || !isVisible) return null;

  return (
    <div className={`alert alert-success success-message ${className}`} role="alert">
      <div className="alert-content">
        {showIcon && (
          <span className="alert-icon" aria-hidden="true">
            ✅
          </span>
        )}
        <div className="alert-message">
          {title && <div className="alert-title">{title}</div>}
          <div className="alert-text">
            {typeof message === 'string' ? message : JSON.stringify(message)}
          </div>
        </div>
        <button 
          className="alert-close" 
          onClick={handleClose}
          aria-label="Close success message"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SuccessMessage;