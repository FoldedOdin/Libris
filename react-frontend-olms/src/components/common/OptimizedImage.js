// Optimized image component with lazy loading and performance optimizations
import React, { useState, useRef, useEffect, memo } from 'react';

const OptimizedImage = memo(({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  className = '',
  style = {},
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();
  const observerRef = useRef();

  useEffect(() => {
    if (!src) return;

    // Use Intersection Observer for lazy loading
    if (loading === 'lazy' && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observerRef.current.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Load immediately if not lazy loading or IntersectionObserver not supported
      loadImage();
    }

    return () => {
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [src, loading]);

  const loadImage = () => {
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setHasError(false);
      if (onLoad) onLoad();
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
      if (onError) onError();
    };
    
    img.src = src;
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(false);
    if (onError) onError();
  };

  const imageClasses = [
    'optimized-image',
    className,
    isLoaded ? 'loaded' : 'loading',
    hasError ? 'error' : ''
  ].filter(Boolean).join(' ');

  const imageStyle = {
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0.7,
    ...style
  };

  if (hasError) {
    return (
      <div 
        className={`${imageClasses} image-error`}
        style={{
          ...imageStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#999',
          fontSize: '14px',
          minHeight: '100px'
        }}
        {...props}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={imageClasses}
      style={imageStyle}
      onLoad={handleImageLoad}
      onError={handleImageError}
      loading={loading}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;