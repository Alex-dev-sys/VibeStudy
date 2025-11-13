/**
 * Debouncing Utilities
 * Provides debouncing functionality for rapid changes
 */

export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
};

/**
 * Create a debounced function that delays execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  // Cancel pending execution
  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  // Execute immediately with last args
  debouncedFn.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  // Check if execution is pending
  debouncedFn.pending = () => {
    return timeoutId !== null;
  };

  return debouncedFn;
}

/**
 * Create a throttled function that limits execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): DebouncedFunction<T> {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  const throttledFn = (...args: Parameters<T>) => {
    lastArgs = args;

    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      lastArgs = null;

      setTimeout(() => {
        inThrottle = false;
        // Execute with last args if any were queued
        if (lastArgs) {
          throttledFn(...lastArgs);
        }
      }, limit);
    }
  };

  throttledFn.cancel = () => {
    inThrottle = false;
    lastArgs = null;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  throttledFn.flush = () => {
    if (lastArgs) {
      func(...lastArgs);
      lastArgs = null;
    }
  };

  throttledFn.pending = () => {
    return lastArgs !== null;
  };

  return throttledFn;
}

/**
 * Debounce manager for multiple operations
 */
export class DebounceManager {
  private debouncedFunctions: Map<string, DebouncedFunction<any>> = new Map();

  /**
   * Register a debounced function
   */
  register<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number
  ): DebouncedFunction<T> {
    const debouncedFn = debounce(func, delay);
    this.debouncedFunctions.set(key, debouncedFn);
    return debouncedFn;
  }

  /**
   * Get a debounced function by key
   */
  get(key: string): DebouncedFunction<any> | undefined {
    return this.debouncedFunctions.get(key);
  }

  /**
   * Execute a debounced function
   */
  execute(key: string, ...args: any[]): void {
    const fn = this.debouncedFunctions.get(key);
    if (fn) {
      fn(...args);
    }
  }

  /**
   * Cancel a debounced function
   */
  cancel(key: string): void {
    const fn = this.debouncedFunctions.get(key);
    if (fn) {
      fn.cancel();
    }
  }

  /**
   * Flush a debounced function (execute immediately)
   */
  flush(key: string): void {
    const fn = this.debouncedFunctions.get(key);
    if (fn) {
      fn.flush();
    }
  }

  /**
   * Cancel all debounced functions
   */
  cancelAll(): void {
    for (const fn of this.debouncedFunctions.values()) {
      fn.cancel();
    }
  }

  /**
   * Flush all debounced functions
   */
  flushAll(): void {
    for (const fn of this.debouncedFunctions.values()) {
      fn.flush();
    }
  }

  /**
   * Check if any function is pending
   */
  hasPending(): boolean {
    for (const fn of this.debouncedFunctions.values()) {
      if (fn.pending()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clear all registered functions
   */
  clear(): void {
    this.cancelAll();
    this.debouncedFunctions.clear();
  }
}

/**
 * Debounce delays for different operation types
 */
export const DEBOUNCE_DELAYS = {
  CODE_EDITOR: 2000, // 2 seconds for code changes
  NOTES: 2000, // 2 seconds for notes
  RECAP_ANSWER: 2000, // 2 seconds for recap answers
  TASK_COMPLETION: 0, // Immediate for task completions
  PROFILE: 1000, // 1 second for profile updates
  SEARCH: 300, // 300ms for search inputs
} as const;

/**
 * Create a debounced sync function
 */
export function createDebouncedSync<T extends (...args: any[]) => Promise<any>>(
  syncFunction: T,
  delay: number
): DebouncedFunction<T> {
  return debounce(syncFunction, delay);
}
