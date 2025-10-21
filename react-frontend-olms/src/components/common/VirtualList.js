// Virtual scrolling component for large lists
import React, { useState, useEffect, useRef, useMemo, memo } from 'react';

const VirtualList = memo(({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  className = '',
  style = {},
  overscan = 5,
  onScroll,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef();

  // Calculate visible items
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      key: startIndex + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = (e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    if (onScroll) onScroll(e);
  };

  // Scroll to specific item
  const scrollToItem = (index) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTop = scrollTop;
      setScrollTop(scrollTop);
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    scrollToItem(0);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    scrollToItem(items.length - 1);
  };

  const containerStyle = {
    height: containerHeight,
    overflow: 'auto',
    position: 'relative',
    ...style
  };

  const innerStyle = {
    height: totalHeight,
    position: 'relative'
  };

  const contentStyle = {
    transform: `translateY(${offsetY}px)`,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  };

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={containerStyle}
      onScroll={handleScroll}
      {...props}
    >
      <div style={innerStyle}>
        <div style={contentStyle}>
          {visibleItems.map(({ item, index, key }) => (
            <div
              key={key}
              style={{
                height: itemHeight,
                overflow: 'hidden'
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

// Hook for using virtual list
export const useVirtualList = (items, itemHeight, containerHeight) => {
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

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  return {
    visibleItems,
    handleScroll,
    scrollTop
  };
};

export default VirtualList;