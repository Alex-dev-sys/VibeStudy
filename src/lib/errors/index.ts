/**
 * Error Handling System - Main Export
 * 
 * Comprehensive error handling with:
 * - User-friendly error messages
 * - Error tracking and analytics
 * - Retry logic with exponential backoff
 * - Circuit breaker pattern
 * - Content fallback system
 */

// User-friendly errors
export {
  ERROR_MESSAGES,
  identifyErrorType,
  getUserFriendlyError,
  handleError,
  handleErrorWithRetry,
  withErrorHandling,
  type ErrorType,
  type UserFriendlyError,
  type HandleErrorOptions
} from './user-friendly-errors';

// Error tracking
export {
  errorTracker,
  useErrorTracking,
  getErrorTrackingStats,
  exportErrorLog,
  clearErrorLog,
  type ErrorEvent,
  type ErrorStats
} from './error-tracker';

// Retry handling
export {
  retryOperation,
  retryWithStrategy,
  retryForErrors,
  retryWithTimeout,
  retryBatch,
  createCircuitBreaker,
  CircuitBreaker,
  type RetryOptions,
  type RetryResult
} from './retry-handler';

// Content fallback
export {
  getContentWithFallback,
  getTasksWithFallback,
  getTheoryWithFallback,
  prefetchContent,
  clearContentCache,
  getCacheStats,
  type ContentSource,
  type ContentResult
} from '../fallbacks/content-fallback';

/**
 * Quick start guide:
 * 
 * 1. Handle errors with user-friendly messages:
 *    ```ts
 *    try {
 *      await someOperation();
 *    } catch (error) {
 *      handleError(error, 'my-component');
 *    }
 *    ```
 * 
 * 2. Retry failed operations:
 *    ```ts
 *    const result = await retryOperation(
 *      () => fetchData(),
 *      { maxAttempts: 3 }
 *    );
 *    ```
 * 
 * 3. Use content fallback:
 *    ```ts
 *    const { content, source } = await getContentWithFallback(
 *      () => generateAIContent(),
 *      'python',
 *      1,
 *      'task-generation'
 *    );
 *    ```
 * 
 * 4. Track errors for analytics:
 *    ```ts
 *    errorTracker.track(error, 'NETWORK_ERROR', 'api-call');
 *    const stats = errorTracker.getStats();
 *    ```
 */
