// Performance monitoring component
import React, { useEffect, useState, memo } from 'react';

const PerformanceMonitor = memo(() => {
  const [metrics, setMetrics] = useState({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || 
        process.env.REACT_APP_SHOW_PERFORMANCE_MONITOR === 'true') {
      
      // Load web-vitals dynamically to avoid increasing bundle size
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => {
          setMetrics(prev => ({ ...prev, cls: metric }));
        });
        
        getFID((metric) => {
          setMetrics(prev => ({ ...prev, fid: metric }));
        });
        
        getFCP((metric) => {
          setMetrics(prev => ({ ...prev, fcp: metric }));
        });
        
        getLCP((metric) => {
          setMetrics(prev => ({ ...prev, lcp: metric }));
        });
        
        getTTFB((metric) => {
          setMetrics(prev => ({ ...prev, ttfb: metric }));
        });
      }).catch(() => {
        console.warn('web-vitals library not available');
      });
    }

    // Keyboard shortcut to toggle visibility (Ctrl+Shift+P)
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const formatMetric = (metric) => {
    if (!metric) return 'N/A';
    return `${metric.value.toFixed(2)}${metric.unit || 'ms'}`;
  };

  const getMetricColor = (metricName, value) => {
    if (!value) return '#999';
    
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metricName];
    if (!threshold) return '#999';

    if (value <= threshold.good) return '#0f5132'; // Good - green
    if (value <= threshold.poor) return '#664d03'; // Needs improvement - yellow
    return '#842029'; // Poor - red
  };

  if (!isVisible && process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="performance-monitor">
      <div className="performance-monitor-header">
        <h4>Performance Metrics</h4>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="toggle-btn"
          title="Toggle Performance Monitor (Ctrl+Shift+P)"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>
      
      {isVisible && (
        <div className="performance-monitor-content">
          <div className="metric">
            <span className="metric-label">FCP:</span>
            <span 
              className="metric-value"
              style={{ color: getMetricColor('fcp', metrics.fcp?.value) }}
            >
              {formatMetric(metrics.fcp)}
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">LCP:</span>
            <span 
              className="metric-value"
              style={{ color: getMetricColor('lcp', metrics.lcp?.value) }}
            >
              {formatMetric(metrics.lcp)}
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">FID:</span>
            <span 
              className="metric-value"
              style={{ color: getMetricColor('fid', metrics.fid?.value) }}
            >
              {formatMetric(metrics.fid)}
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">CLS:</span>
            <span 
              className="metric-value"
              style={{ color: getMetricColor('cls', metrics.cls?.value) }}
            >
              {formatMetric(metrics.cls)}
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">TTFB:</span>
            <span 
              className="metric-value"
              style={{ color: getMetricColor('ttfb', metrics.ttfb?.value) }}
            >
              {formatMetric(metrics.ttfb)}
            </span>
          </div>
          
          <div className="performance-info">
            <small>
              Press Ctrl+Shift+P to toggle
              <br />
              <span style={{ color: '#0f5132' }}>Green</span>: Good, 
              <span style={{ color: '#664d03' }}> Yellow</span>: Needs improvement, 
              <span style={{ color: '#842029' }}> Red</span>: Poor
            </small>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .performance-monitor {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #dee2e6;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-family: 'Courier New', monospace;
          font-size: 12px;
          z-index: 9999;
          min-width: 200px;
          backdrop-filter: blur(10px);
        }
        
        .performance-monitor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid #dee2e6;
          background: rgba(0, 123, 255, 0.1);
        }
        
        .performance-monitor-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #495057;
        }
        
        .toggle-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #495057;
        }
        
        .toggle-btn:hover {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        
        .performance-monitor-content {
          padding: 12px;
        }
        
        .metric {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          padding: 2px 0;
        }
        
        .metric-label {
          font-weight: 600;
          color: #495057;
        }
        
        .metric-value {
          font-weight: 500;
        }
        
        .performance-info {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #dee2e6;
          color: #6c757d;
          line-height: 1.4;
        }
        
        @media (max-width: 768px) {
          .performance-monitor {
            top: 10px;
            right: 10px;
            font-size: 11px;
            min-width: 180px;
          }
        }
      `}</style>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;