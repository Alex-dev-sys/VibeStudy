import { logWarn } from '@/lib/core/logger';

interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    shouldRetry?: (error: any) => boolean;
    onRetry?: (attempt: number, error: any) => void;
    component?: string;
    action?: string;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry' | 'component' | 'action'>> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    factor: 2,
};

/**
 * Executes a function with exponential backoff retry logic.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const config = { ...DEFAULT_OPTIONS, ...options };
    let attempt = 0;

    while (true) {
        try {
            return await fn();
        } catch (error) {
            attempt++;

            if (attempt > config.maxRetries) {
                throw error;
            }

            if (config.shouldRetry && !config.shouldRetry(error)) {
                throw error;
            }

            const delay = Math.min(
                config.initialDelay * Math.pow(config.factor, attempt - 1),
                config.maxDelay
            );

            if (config.onRetry) {
                config.onRetry(attempt, error);
            } else {
                logWarn(`Retry attempt ${attempt}/${config.maxRetries} after ${delay}ms`, {
                    component: config.component || 'retry-service',
                    action: config.action || 'retry',
                    metadata: { error: error instanceof Error ? error.message : String(error) }
                });
            }

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}
