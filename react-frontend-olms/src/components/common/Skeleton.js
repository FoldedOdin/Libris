const Skeleton = ({ 
  width = '100%', 
  height = '1em', 
  variant = 'text',
  className = '',
  count = 1,
  style = {}
}) => {
  const skeletonClass = [
    'skeleton',
    `skeleton-${variant}`,
    className
  ].filter(Boolean).join(' ');

  const skeletonStyle = {
    width,
    height,
    ...style
  };

  if (count === 1) {
    return <div className={skeletonClass} style={skeletonStyle} />;
  }

  return (
    <div className="skeleton-group">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={skeletonClass} style={skeletonStyle} />
      ))}
    </div>
  );
};

// Predefined skeleton components
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`skeleton-text-group ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton 
        key={index}
        variant="text"
        width={index === lines - 1 ? '80%' : '100%'}
        className="skeleton-text-line"
      />
    ))}
  </div>
);

export const SkeletonTitle = ({ className = '' }) => (
  <Skeleton 
    variant="title"
    width="60%"
    height="1.5em"
    className={`skeleton-title ${className}`}
  />
);

export const SkeletonAvatar = ({ size = 40, className = '' }) => (
  <Skeleton 
    variant="avatar"
    width={size}
    height={size}
    className={`skeleton-avatar ${className}`}
    style={{ borderRadius: '50%' }}
  />
);

export const SkeletonButton = ({ width = '100px', className = '' }) => (
  <Skeleton 
    variant="button"
    width={width}
    height="36px"
    className={`skeleton-button ${className}`}
  />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`}>
    <SkeletonTitle />
    <SkeletonText lines={3} />
    <div className="skeleton-card-actions">
      <SkeletonButton width="80px" />
      <SkeletonButton width="60px" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`skeleton-table ${className}`}>
    <div className="skeleton-table-header">
      {Array.from({ length: columns }, (_, index) => (
        <Skeleton key={index} variant="text" height="1.2em" />
      ))}
    </div>
    <div className="skeleton-table-body">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={colIndex} variant="text" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonList = ({ items = 5, showAvatar = false, className = '' }) => (
  <div className={`skeleton-list ${className}`}>
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="skeleton-list-item">
        {showAvatar && <SkeletonAvatar size={32} />}
        <div className="skeleton-list-content">
          <Skeleton variant="text" width="70%" height="1.2em" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;