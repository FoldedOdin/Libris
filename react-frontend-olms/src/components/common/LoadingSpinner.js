const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Loading...', 
  showText = true,
  className = '',
  overlay = false,
  fullScreen = false,
  inline = false
}) => {
  const sizeClass = `loading-spinner-${size}`;
  const colorClass = `loading-spinner-${color}`;

  const containerClass = [
    'loading-spinner-container',
    overlay && 'loading-spinner-overlay',
    fullScreen && 'loading-spinner-fullscreen',
    inline && 'loading-spinner-inline',
    className
  ].filter(Boolean).join(' ');

  const spinner = (
    <div className={`loading-spinner ${sizeClass} ${colorClass}`}>
      <div className="loading-spinner-circle"></div>
      <div className="loading-spinner-circle"></div>
      <div className="loading-spinner-circle"></div>
      <div className="loading-spinner-circle"></div>
    </div>
  );

  const content = (
    <div className={containerClass}>
      {spinner}
      {showText && text && (
        <div className="loading-spinner-text">{text}</div>
      )}
    </div>
  );

  if (overlay || fullScreen) {
    return (
      <div className="loading-spinner-backdrop">
        {content}
      </div>
    );
  }

  return content;
};

// Button loading spinner component
export const ButtonSpinner = ({ size = 'small', color = 'white' }) => (
  <LoadingSpinner 
    size={size} 
    color={color} 
    showText={false} 
    inline={true}
    className="button-spinner"
  />
);

// Inline loading component for small areas
export const InlineLoader = ({ text = 'Loading...', size = 'small' }) => (
  <LoadingSpinner 
    size={size} 
    text={text} 
    inline={true}
    className="inline-loader"
  />
);

// Page loading component
export const PageLoader = ({ text = 'Loading page...' }) => (
  <LoadingSpinner 
    size='large' 
    text={text} 
    fullScreen={true}
    className="page-loader"
  />
);

// Section loading component
export const SectionLoader = ({ text = 'Loading...', overlay = true }) => (
  <LoadingSpinner 
    size='medium' 
    text={text} 
    overlay={overlay}
    className="section-loader"
  />
);

export default LoadingSpinner;