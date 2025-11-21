/**
 * Retry Handler for Failed Operations
 * 
 * Provides intelligent retry logic with exponential backoff,
 * jitter, and configurable retry strategies.
 */

import { logInfo, logWarn } from '@/lib/logger';
import { identifyErrorType } from './user-friendly-errors';
import type { ErrorType } from './user-friendly-errors';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryableErrors?: ErrorType[];
  onRetry?: (attempt: number, error: unknown) => void;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  attempts: number;
  totalTime: number;
}

const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'shouldRetry'>> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: [
    'NETWORK_ERROR',
    'AI_TIMEOUT',
    'RATE_LIMIT',
    'SERVER_ERROR',
    'SYNC_FAILED',
    'CACHE_ERROR'
  ]
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  jitter: boolean
): number {
  // Exponential backoff: delay = initialDelay * (backoffMultiplier ^ attempt)
  let delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  
  // Cap at maxDelay
  delay = Math.min(delay, maxDelay);
  
  // Add jitter to prevent thundering herd
  if (jitter) {
    // Random jitter between 0% and 25% of delay
    const jitterAmount = delay * 0.25 * Math.random();
    delay += jitterAmount;
  }
  
  return Math.floor(delay);
}

/**
 * Check if error is retryable
 */
function isRetryable(
  error: unknown,
  retryableErrors: ErrorType[]
): boolean {
  const errorType = identifyErrorType(error);
  return retryableErrors.includes(errorType);
}

/**
 * Retry an async operation with exponential backoff
 * 
 * @param operation - The async operation to retry
 * @param options - Retry configuration options
 * @returns Result with success status and data or error
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const startTime = Date.now();
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      logInfo(`Attempt ${attempt}/${config.maxAttempts}`, {
        component: 'retry-handler',
        metadata: { attempt, maxAttempts: config.maxAttempts }
      });
      
      const data = await operation();
      
      const totalTime = Date.now() - startTime;
      
      logInfo(`Operation succeeded on attempt ${attempt}`, {
        component: 'retry-handler',
        metadata: { attempt, totalTime }
      });
      
      return {
        success: true,
        data,
        attempts: attempt,
        totalTime
      };
    } catch (error) {
      lastError = error;
      
      logWarn(`Attempt ${attempt} failed`, {
        component: 'retry-handler',
        metadata: {
          attempt,
          error: String(error),
          errorType: identifyErrorType(error)
        }
      });
      
      // Check if we should retry
      const shouldRetryDefault = isRetryable(error, config.retryableErrors);
      const shouldRetryCustom = options.shouldRetry?.(error, attempt) ?? true;
      const shouldRetry = shouldRetryDefault && shouldRetryCustom;
      
      // If this is the last attempt or error is not retryable, fail
      if (attempt >= config.maxAttempts || !shouldRetry) {
        const totalTime = Date.now() - startTime;
        
        logWarn(`Operation failed after ${attempt} attempts`, {
          component: 'retry-handler',
          metadata: {
            attempts: attempt,
            totalTime,
            errorType: identifyErrorType(error)
          }
        });
        
        return {
          success: false,
          error: lastError,
          attempts: attempt,
          totalTime
        };
      }
      
      // Calculate delay before next retry
      const delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffMultiplier,
        config.jitter
      );
      
      logInfo(`Retrying in ${delay}ms`, {
        component: 'retry-handler',
        metadata: { attempt, delay }
      });
      
      // Call onRetry callback if provided
      options.onRetry?.(attempt, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Should never reach here, but TypeScript needs it
  const totalTime = Date.now() - startTime;
  return {
    success: false,
    error: lastError,
    attempts: config.maxAttempts,
    totalTime
  };
}

/**
 * Retry with custom strategy for specific error types
 */
export async function retryWithStrategy<T>(
  operation: () => Promise<T>,
  strategy: 'aggressive' | 'conservative' | 'patient'
): Promise<RetryResult<T>> {
  const strategies: Record<string, RetryOptions> = {
    aggressive: {
      maxAttempts: 5,
      initialDelay: 500,
      maxDelay: 5000,
      backoffMultiplier: 1.5,
      jitter: true
    },
    conservative: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true
    },
    patient: {
      maxAttempts: 3,
      initialDelay: 2000,
      maxDelay: 30000,
      backoffMultiplier: 3,
      jitter: true
    }
  };
  
  return retryOperation(operation, strategies[strategy]);
}

/**
 * Retry only for specific error types
 */
export async function retryForErrors<T>(
  operation: () => Promise<T>,
  retryableErrors: ErrorType[],
  maxAttempts: number = 3
): Promise<RetryResult<T>> {
  return retryOperation(operation, {
    maxAttempts,
    retryableErrors
  });
}

/**
 * Retry with timeout
 * If operation takes longer than timeout, it will be cancelled
 */
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const operationWithTimeout = async (): Promise<T> => {
    return Promise.race([
      operation(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  };
  
  return retryOperation(operationWithTimeout, options);
}

/**
 * Batch retry multiple operations
 * Retries failed operations while keeping successful ones
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<Array<RetryResult<T>>> {
  const results = await Promise.all(
    operations.map(op => retryOperation(op, options))
  );
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  logInfo(`Batch retry completed: ${successCount} succeeded, ${failCount} failed`, {
    component: 'retry-handler',
    metadata: { total: results.length, successCount, failCount }
  });
  
  return results;
}

/**
 * Retry with circuit breaker pattern
 * Stops retrying if too many failures occur in a short time
 */
export class CircuitBreaker<T> {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private operation: () => Promise<T>,
    private options: {
      failureThreshold?: number;
      resetTimeout?: number;
      retryOptions?: RetryOptions;
    } = {}
  ) {
    this.options.failureThreshold = options.failureThreshold ?? 5;
    this.options.resetTimeout = options.resetTimeout ?? 60000; // 1 minute
  }
  
  async execute(): Promise<RetryResult<T>> {
    // Check if circuit is open
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      
      if (timeSinceLastFailure < this.options.resetTimeout!) {
        logWarn('Circuit breaker is OPEN, rejecting request', {
          component: 'circuit-breaker',
          metadata: {
            failureCount: this.failureCount,
            timeSinceLastFailure
          }
        });
        
        return {
          success: false,
          error: new Error('Circuit breaker is open'),
          attempts: 0,
          totalTime: 0
        };
      }
      
      // Try to close circuit (half-open state)
      this.state = 'half-open';
      logInfo('Circuit breaker entering HALF-OPEN state', {
        component: 'circuit-breaker'
      });
    }
    
    // Execute operation with retry
    const result = await retryOperation(this.operation, this.options.retryOptions);
    
    if (result.success) {
      // Reset on success
      this.failureCount = 0;
      this.state = 'closed';
      
      logInfo('Circuit breaker CLOSED', {
        component: 'circuit-breaker'
      });
    } else {
      // Increment failure count
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      // Open circuit if threshold reached
      if (this.failureCount >= this.options.failureThreshold!) {
        this.state = 'open';
        
        logWarn('Circuit breaker OPENED', {
          component: 'circuit-breaker',
          metadata: {
            failureCount: this.failureCount,
            threshold: this.options.failureThreshold
          }
        });
      }
    }
    
    return result;
  }
  
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
  
  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
    
    logInfo('Circuit breaker manually reset', {
      component: 'circuit-breaker'
    });
  }
}

/**
 * Create a circuit breaker for an operation
 */
export function createCircuitBreaker<T>(
  operation: () => Promise<T>,
  options?: {
    failureThreshold?: number;
    resetTimeout?: number;
    retryOptions?: RetryOptions;
  }
): CircuitBreaker<T> {
  return new CircuitBreaker(operation, options);
}
