import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Loading...', 
  showText = true,
  className = '' 
}) => {
  const sizeClass = `loading-spinner-${size}`;
  const colorClass = `loading-spinner-${color}`;

  return (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner ${sizeClass} ${colorClass}`}>
        <div className="loading-spinner-circle"></div>
        <div className="loading-spinner-circle"></div>
        <div className="loading-spinner-circle"></div>
        <div className="loading-spinner-circle"></div>
      </div>
      {showText && text && (
        <div className="loading-spinner-text">{text}</div>
      )}
    </div>
  );
};

export default LoadingSpinner;