/**
 * Bundle size analyzer and optimization utilities
 */

/**
 * Track bundle sizes in development
 */
export function trackBundleSize() {
  if (process.env.NODE_ENV !== 'development') return;

  const scripts = document.querySelectorAll('script[src]');
  let totalSize = 0;

  scripts.forEach(async (script) => {
    const src = script.getAttribute('src');
    if (!src) return;

    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const size = blob.size;
      totalSize += size;

      console.log(`[Bundle] ${src}: ${(size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error(`[Bundle] Failed to fetch ${src}:`, error);
    }
  });

  console.log(`[Bundle] Total size: ${(totalSize / 1024).toFixed(2)} KB`);
}

/**
 * Analyze component render performance
 */
export function analyzeComponentPerformance(componentName: string) {
  if (process.env.NODE_ENV !== 'development') return () => {};

  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) {
      console.warn(
        `[Performance] ${componentName} render took ${duration.toFixed(2)}ms (> 16ms)`
      );
    }
  };
}

/**
 * Monitor memory usage
 */
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const memory = (performance as any).memory;
  if (!memory) return;

  const usedMemory = memory.usedJSHeapSize / 1048576; // Convert to MB
  const totalMemory = memory.totalJSHeapSize / 1048576;
  const limit = memory.jsHeapSizeLimit / 1048576;

  console.log(`[Memory] Used: ${usedMemory.toFixed(2)} MB`);
  console.log(`[Memory] Total: ${totalMemory.toFixed(2)} MB`);
  console.log(`[Memory] Limit: ${limit.toFixed(2)} MB`);
  console.log(`[Memory] Usage: ${((usedMemory / limit) * 100).toFixed(2)}%`);

  if (usedMemory / limit > 0.9) {
    console.warn('[Memory] High memory usage detected!');
  }
}

/**
 * Track resource loading times
 */
export function trackResourceTiming() {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  const resourcesByType: Record<string, number[]> = {};

  resources.forEach((resource) => {
    const type = resource.initiatorType;
    const duration = resource.duration;

    if (!resourcesByType[type]) {
      resourcesByType[type] = [];
    }

    resourcesByType[type].push(duration);
  });

  Object.entries(resourcesByType).forEach(([type, durations]) => {
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const max = Math.max(...durations);

    console.log(`[Resources] ${type}: avg ${avg.toFixed(2)}ms, max ${max.toFixed(2)}ms`);
  });
}

/**
 * Measure First Contentful Paint (FCP)
 */
export function measureFCP() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.log(`[Performance] FCP: ${entry.startTime.toFixed(2)}ms`);
        observer.disconnect();
      }
    }
  });

  observer.observe({ entryTypes: ['paint'] });
}

/**
 * Measure Largest Contentful Paint (LCP)
 */
export function measureLCP() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];

    console.log(`[Performance] LCP: ${lastEntry.startTime.toFixed(2)}ms`);
  });

  observer.observe({ entryTypes: ['largest-contentful-paint'] });
}

/**
 * Measure Cumulative Layout Shift (CLS)
 */
export function measureCLS() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  let clsScore = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsScore += (entry as any).value;
      }
    }

    console.log(`[Performance] CLS: ${clsScore.toFixed(4)}`);
  });

  observer.observe({ entryTypes: ['layout-shift'] });
}

/**
 * Measure First Input Delay (FID)
 */
export function measureFID() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fid = (entry as any).processingStart - entry.startTime;
      console.log(`[Performance] FID: ${fid.toFixed(2)}ms`);
      observer.disconnect();
    }
  });

  observer.observe({ entryTypes: ['first-input'] });
}

/**
 * Comprehensive performance report
 */
export function generatePerformanceReport() {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('[Performance Report]');
  
  measureFCP();
  measureLCP();
  measureCLS();
  measureFID();
  trackResourceTiming();
  monitorMemoryUsage();
  
  console.groupEnd();
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

  // Run on page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      generatePerformanceReport();
    }, 1000);
  });

  // Monitor memory every 30 seconds
  setInterval(() => {
    monitorMemoryUsage();
  }, 30000);
}
