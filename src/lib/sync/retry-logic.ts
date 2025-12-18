/**
 * Retry Logic with Exponential Backoff
 * Provides retry functionality for failed operations
 */

import { logInfo, logWarn } from '@/lib/core/logger';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitter: true, // Add randomness to prevent thundering herd
};

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
}

/**
 * Calculate delay for next retry using exponential backoff
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  // Calculate exponential delay: initialDelay * (backoffMultiplier ^ attempt)
  let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);

  // Cap at max delay
  delay = Math.min(delay, config.maxDelay);

  // Add jitter if enabled (randomness between 0% and 100% of delay)
  if (config.jitter) {
    const jitterAmount = delay * Math.random();
    delay = delay - jitterAmount / 2 + jitterAmount * Math.random();
  }

  return Math.floor(delay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  shouldRetry?: (error: Error) => boolean
): Promise<RetryResult<T>> {
  let lastError: Error | undefined;
  let attempts = 0;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    attempts++;

    try {
      const result = await operation();
      return {
        success: true,
        result,
        attempts,
      };
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(lastError)) {
        logWarn('RetryLogic: error not retryable', {
          component: 'retry-logic',
          metadata: { message: lastError.message }
        });
        break;
      }

      // If this was the last attempt, don't wait
      if (attempt === config.maxRetries) {
        break;
      }

      // Calculate delay and wait
      const delay = calculateBackoffDelay(attempt, config);
      logInfo('RetryLogic: retry scheduled', {
        component: 'retry-logic',
        metadata: {
          attempt: attempt + 1,
          maxAttempts: config.maxRetries + 1,
          delay
        }
      });
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts,
  };
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Network errors are retryable
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('fetch')
  ) {
    return true;
  }

  // Rate limit errors are retryable
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return true;
  }

  // Temporary server errors are retryable (5xx)
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return true;
  }

  // Auth errors are not retryable
  if (
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('authentication')
  ) {
    return false;
  }

  // Validation errors are not retryable
  if (message.includes('validation') || message.includes('invalid')) {
    return false;
  }

  // Default to retryable for unknown errors
  return true;
}

/**
 * Retry wrapper for Supabase operations
 */
export async function retrySupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<RetryResult<T | null>> {
  const result = await retryWithBackoff(
    async () => {
      const { data, error } = await operation();
      if (error) {
        throw new Error(error.message || 'Supabase operation failed');
      }
      return data;
    },
    config,
    isRetryableError
  );

  return result;
}

/**
 * Create a retry config with custom values
 */
export function createRetryConfig(
  overrides: Partial<RetryConfig> = {}
): RetryConfig {
  return {
    ...DEFAULT_RETRY_CONFIG,
    ...overrides,
  };
}

/**
 * Retry queue for managing multiple retry operations
 */
export class RetryQueue {
  private queue: Map<string, RetryQueueItem> = new Map();

  /**
   * Add operation to retry queue
   */
  add<T>(
    id: string,
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): void {
    this.queue.set(id, {
      id,
      operation,
      config,
      attempts: 0,
      nextRetryAt: Date.now(),
    });
  }

  /**
   * Process all pending retries
   */
  async processAll(): Promise<Map<string, RetryResult<any>>> {
    const results = new Map<string, RetryResult<any>>();
    const now = Date.now();

    for (const [id, item] of this.queue.entries()) {
      // Skip if not ready for retry
      if (item.nextRetryAt > now) {
        continue;
      }

      try {
        const result = await item.operation();
        results.set(id, {
          success: true,
          result,
          attempts: item.attempts + 1,
        });
        this.queue.delete(id);
      } catch (error) {
        item.attempts++;

        if (item.attempts >= item.config.maxRetries) {
          // Max retries reached
          results.set(id, {
            success: false,
            error: error as Error,
            attempts: item.attempts,
          });
          this.queue.delete(id);
        } else {
          // Schedule next retry
          const delay = calculateBackoffDelay(item.attempts, item.config);
          item.nextRetryAt = Date.now() + delay;
        }
      }
    }

    return results;
  }

  /**
   * Remove operation from queue
   */
  remove(id: string): void {
    this.queue.delete(id);
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.size;
  }

  /**
   * Clear all operations
   */
  clear(): void {
    this.queue.clear();
  }
}

interface RetryQueueItem {
  id: string;
  operation: () => Promise<any>;
  config: RetryConfig;
  attempts: number;
  nextRetryAt: number;
}
