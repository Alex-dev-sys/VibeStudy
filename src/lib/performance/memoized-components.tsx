/**
 * Memoized versions of heavy components for performance optimization
 */

'use client';

import { memo } from 'react';
import type { ComponentType } from 'react';

/**
 * Higher-order component for memoization with custom comparison
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return memo(Component, propsAreEqual);
}

/**
 * Deep comparison for complex props
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Shallow comparison for simple props
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

/**
 * Memoization utilities for specific use cases
 */

// Memoize components that depend only on primitive props
export function memoWithPrimitives<P extends object>(Component: ComponentType<P>) {
  return memo(Component, shallowEqual);
}

// Memoize components with complex nested props
export function memoWithDeepCompare<P extends object>(Component: ComponentType<P>) {
  return memo(Component, deepEqual);
}

// Memoize components that should only update on specific prop changes
export function memoWithKeys<P extends object>(
  Component: ComponentType<P>,
  keys: (keyof P)[]
) {
  return memo(Component, (prevProps, nextProps) => {
    return keys.every(key => prevProps[key] === nextProps[key]);
  });
}

/**
 * Example usage patterns
 */

// For simple components with primitive props
// export const MemoizedButton = memoWithPrimitives(Button);

// For complex components with nested objects
// export const MemoizedDayCard = memoWithDeepCompare(DayCard);

// For components that should only update on specific props
// export const MemoizedTaskList = memoWithKeys(TaskList, ['tasks', 'day']);

/**
 * Performance monitoring wrapper
 */
export function withPerformanceMonitoring<P extends object>(
  Component: ComponentType<P>,
  componentName: string
) {
  const MemoizedComponent = memo((props: P) => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      const result = <Component {...props} />;
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(
          `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`
        );
      }
      
      return result;
    }
    
    return <Component {...props} />;
  });
  
  MemoizedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return MemoizedComponent;
}

/**
 * Debounced component updates
 */
export function withDebounce<P extends object>(
  Component: ComponentType<P>,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  const DebouncedComponent = memo((props: P) => {
    clearTimeout(timeoutId);
    
    return new Promise<JSX.Element>((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(<Component {...props} />);
      }, delay);
    }) as any;
  });
  
  DebouncedComponent.displayName = `withDebounce(${Component.displayName || Component.name || 'Component'})`;
  return DebouncedComponent;
}
