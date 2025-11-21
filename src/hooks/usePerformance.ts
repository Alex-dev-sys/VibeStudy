/**
 * Performance monitoring hook
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
}

/**
 * Hook to monitor component performance
 */
export function usePerformance(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
  });

  useEffect(() => {
    mountTime.current = performance.now();

    return () => {
      if (process.env.NODE_ENV === 'development') {
        const totalTime = performance.now() - mountTime.current;
        console.log(
          `[Performance] ${componentName} was mounted for ${totalTime.toFixed(2)}ms`
        );
      }
    };
  }, [componentName]);

  useEffect(() => {
    renderCount.current++;
    
    if (process.env.NODE_ENV === 'development' && renderCount.current > 10) {
      console.warn(
        `[Performance] ${componentName} has rendered ${renderCount.current} times`
      );
    }

    setMetrics((prev) => ({
      ...prev,
      updateCount: renderCount.current,
    }));
  });

  return metrics;
}

/**
 * Hook to measure render time
 */
export function useRenderTime(componentName: string) {
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - startTime.current;

    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(
        `[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms (> 16ms)`
      );
    }
  });
}

/**
 * Hook to detect slow renders
 */
export function useSlowRenderDetection(
  componentName: string,
  threshold: number = 16
) {
  const renderStartTime = useRef<number>(0);

  // Before render
  renderStartTime.current = performance.now();

  useEffect(() => {
    // After render
    const renderTime = performance.now() - renderStartTime.current;

    if (renderTime > threshold) {
      console.warn(
        `[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }
  });
}

/**
 * Hook to track component lifecycle
 */
export function useLifecycleTracking(componentName: string) {
  useEffect(() => {
    console.log(`[Lifecycle] ${componentName} mounted`);

    return () => {
      console.log(`[Lifecycle] ${componentName} unmounted`);
    };
  }, [componentName]);
}

/**
 * Hook to measure effect execution time
 */
export function useEffectPerformance(
  effect: () => void | (() => void),
  deps: any[],
  effectName: string
) {
  useEffect(() => {
    const startTime = performance.now();
    const cleanup = effect();
    const endTime = performance.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] Effect "${effectName}" took ${(endTime - startTime).toFixed(2)}ms`
      );
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook to detect memory leaks
 */
export function useMemoryLeakDetection(componentName: string) {
  const mountCount = useRef(0);

  useEffect(() => {
    mountCount.current++;

    if (mountCount.current > 5) {
      console.warn(
        `[Memory] ${componentName} has been mounted ${mountCount.current} times. Possible memory leak?`
      );
    }
  }, [componentName]);
}

/**
 * Hook to measure data fetching performance
 */
export function useFetchPerformance<T>(
  fetchFn: () => Promise<T>,
  deps: any[]
): [T | null, boolean, Error | null, number] {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fetchTime, setFetchTime] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const startTime = performance.now();

    setLoading(true);
    setError(null);

    fetchFn()
      .then((result) => {
        if (!cancelled) {
          const endTime = performance.now();
          const duration = endTime - startTime;

          setData(result);
          setFetchTime(duration);

          if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] Fetch took ${duration.toFixed(2)}ms`);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [data, loading, error, fetchTime];
}
