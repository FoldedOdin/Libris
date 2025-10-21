// Performance optimization hook
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Hook for debouncing values (useful for search inputs)
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for throttling function calls
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Hook for memoizing expensive calculations
export const useMemoizedValue = (computeValue, dependencies) => {
  return useMemo(computeValue, dependencies);
};

// Hook for lazy loading images
export const useLazyImage = (src, placeholder = '') => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
            };
            img.src = src;
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return { imageSrc, isLoaded, imgRef };
};

// Hook for virtual scrolling (useful for large lists)
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    scrollTop
  };
};

// Hook for measuring component performance
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }

    startTime.current = performance.now();
  });

  return renderCount.current;
};

// Hook for preloading routes
export const useRoutePreloader = () => {
  const preloadRoute = useCallback((routeImport) => {
    // Preload the route component
    routeImport();
  }, []);

  const preloadOnHover = useCallback((routeImport) => {
    return {
      onMouseEnter: () => preloadRoute(routeImport),
      onFocus: () => preloadRoute(routeImport)
    };
  }, [preloadRoute]);

  return { preloadRoute, preloadOnHover };
};

// Hook for optimizing re-renders
export const useOptimizedCallback = (callback, dependencies) => {
  return useCallback(callback, dependencies);
};

export const useOptimizedMemo = (factory, dependencies) => {
  return useMemo(factory, dependencies);
};

// Hook for Web Vitals monitoring
export const useWebVitals = () => {
  useEffect(() => {
    if (process.env.REACT_APP_ENABLE_ANALYTICS === 'true') {
      // Dynamically import web-vitals to avoid increasing bundle size
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      }).catch(() => {
        // web-vitals not available, ignore
      });
    }
  }, []);
};

// Hook for error boundary functionality
export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error, errorInfo) => {
    setError({ error, errorInfo });
    
    if (process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true') {
      // Send error to monitoring service
      console.error('Error caught by error handler:', error, errorInfo);
    }
  }, []);

  return { error, resetError, handleError };
};

export default {
  useDebounce,
  useThrottle,
  useMemoizedValue,
  useLazyImage,
  useVirtualScroll,
  usePerformanceMonitor,
  useRoutePreloader,
  useOptimizedCallback,
  useOptimizedMemo,
  useWebVitals,
  useErrorHandler
};