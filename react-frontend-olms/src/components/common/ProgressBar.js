const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  indeterminate = false,
  size = 'medium',
  color = 'primary',
  showLabel = false,
  label = '',
  className = ''
}) => {
  const percentage = indeterminate ? 100 : Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClass = `progress-bar-${size}`;
  const colorClass = `progress-bar-${color}`;
  
  const progressBarClass = [
    'progress-bar',
    sizeClass,
    colorClass,
    className
  ].filter(Boolean).join(' ');

  const fillClass = [
    'progress-bar-fill',
    indeterminate && 'progress-bar-indeterminate'
  ].filter(Boolean).join(' ');

  return (
    <div className="progress-bar-container">
      {showLabel && (
        <div className="progress-bar-label">
          {label || `${Math.round(percentage)}%`}
        </div>
      )}
      <div className={progressBarClass}>
        <div 
          className={fillClass}
          style={!indeterminate ? { width: `${percentage}%` } : {}}
        />
      </div>
    </div>
  );
};

// Circular progress component
export const CircularProgress = ({ 
  value = 0, 
  max = 100, 
  size = 40,
  strokeWidth = 4,
  color = 'primary',
  showLabel = false,
  indeterminate = false,
  className = ''
}) => {
  const percentage = indeterminate ? 25 : Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    primary: 'var(--primary-color)',
    success: 'var(--success-color)',
    danger: 'var(--danger-color)',
    warning: 'var(--warning-color)',
    info: 'var(--info-color)'
  };

  const strokeColor = colorMap[color] || colorMap.primary;

  return (
    <div className={`circular-progress ${className}`}>
      <svg width={size} height={size} className="circular-progress-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={indeterminate ? 0 : strokeDashoffset}
          strokeLinecap="round"
          className={indeterminate ? 'circular-progress-indeterminate' : ''}
          style={{
            transformOrigin: '50% 50%',
            transform: 'rotate(-90deg)'
          }}
        />
      </svg>
      {showLabel && !indeterminate && (
        <div className="circular-progress-label">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;