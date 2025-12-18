/**
 * Retry utility with exponential backoff and jitter
 * Use this for network requests and other fallible operations
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Add random jitter to prevent thundering herd (default: true) */
  jitter?: boolean;
  /** Function to determine if error is retryable (default: all errors) */
  isRetryable?: (error: Error) => boolean;
  /** Callback on each retry attempt */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  isRetryable: () => true,
  onRetry: () => {},
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
  // Exponential backoff: initialDelay * (multiplier ^ attempt)
  let delay = initialDelay * Math.pow(backoffMultiplier, attempt);

  // Cap at maxDelay
  delay = Math.min(delay, maxDelay);

  // Add jitter (0-50% of delay) to prevent thundering herd
  if (jitter) {
    const jitterAmount = delay * 0.5 * Math.random();
    delay = delay + jitterAmount;
  }

  return Math.floor(delay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute function with retry and exponential backoff
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => fetch('https://api.example.com/data'),
 *   {
 *     maxRetries: 3,
 *     initialDelay: 1000,
 *     isRetryable: (error) => error.message.includes('ECONNRESET'),
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Retry ${attempt} in ${delay}ms: ${error.message}`);
 *     }
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we've exhausted retries
      if (attempt >= opts.maxRetries) {
        throw lastError;
      }

      // Check if error is retryable
      if (!opts.isRetryable(lastError)) {
        throw lastError;
      }

      // Calculate delay with backoff
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier,
        opts.jitter
      );

      // Notify about retry
      opts.onRetry(lastError, attempt + 1, delay);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Check if error is a network error that should be retried
 */
export function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    message.includes('socket hang up') ||
    message.includes('network') ||
    message.includes('fetch failed') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    error.name === 'AbortError'
  );
}

/**
 * Check if HTTP status code is retryable
 */
export function isRetryableStatusCode(status: number): boolean {
  return (
    status === 408 || // Request Timeout
    status === 429 || // Too Many Requests
    status === 500 || // Internal Server Error
    status === 502 || // Bad Gateway
    status === 503 || // Service Unavailable
    status === 504    // Gateway Timeout
  );
}

/**
 * Create a fetch wrapper with retry functionality
 *
 * @example
 * ```ts
 * const response = await fetchWithRetry('https://api.example.com/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ data: 'test' })
 * }, { maxRetries: 3 });
 * ```
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetch(url, init);

      // Throw error for retryable status codes so they get retried
      if (!response.ok && isRetryableStatusCode(response.status)) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as Error & { status?: number }).status = response.status;
        throw error;
      }

      return response;
    },
    {
      isRetryable: (error) => {
        // Retry network errors
        if (isNetworkError(error)) return true;

        // Retry specific HTTP status codes
        const status = (error as Error & { status?: number }).status;
        if (status && isRetryableStatusCode(status)) return true;

        return false;
      },
      onRetry: (error, attempt, delay) => {
        console.warn(`[fetchWithRetry] Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
      },
      ...retryOptions
    }
  );
}

/**
 * Specialized retry wrapper for blockchain operations
 * Configured with higher retry counts and longer delays suitable for blockchain RPCs
 *
 * @example
 * ```ts
 * const transaction = await retryBlockchain(
 *   () => tonClient.getTransaction(address, hash)
 * );
 * ```
 */
export async function retryBlockchain<T>(
  operation: () => Promise<T>,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return withRetry(operation, {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 60000,
    backoffMultiplier: 2,
    jitter: true,
    isRetryable: (error) => {
      // Retry network errors
      if (isNetworkError(error)) return true;

      // Retry specific blockchain errors
      const message = error.message.toLowerCase();
      if (message.includes('timeout') ||
          message.includes('rate limit') ||
          message.includes('too many requests')) {
        return true;
      }

      return false;
    },
    onRetry: (error, attempt, delay) => {
      console.warn(`[retryBlockchain] Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
    },
    ...retryOptions
  });
}
