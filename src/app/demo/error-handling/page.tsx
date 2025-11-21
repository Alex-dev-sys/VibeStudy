'use client';

/**
 * Error Handling System Demo
 * 
 * Demonstrates all error handling features:
 * - User-friendly error messages
 * - Retry logic
 * - Content fallback
 * - Error tracking
 * - Circuit breaker
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  handleError,
  handleErrorWithRetry,
  retryOperation,
  retryWithStrategy,
  createCircuitBreaker,
  getContentWithFallback,
  errorTracker,
  useErrorTracking,
  type ErrorType
} from '@/lib/errors';
import { toast } from '@/lib/toast';

export default function ErrorHandlingDemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const { getStats, getRecentErrors, clearErrors } = useErrorTracking();

  // Simulate different error types
  const simulateError = (errorType: ErrorType) => {
    const errors: Record<ErrorType, Error> = {
      NETWORK_ERROR: new Error('fetch failed: network error'),
      AI_GENERATION_FAILED: new Error('ai_request_failed: model unavailable'),
      AI_TIMEOUT: new Error('timeout: request took too long'),
      AUTH_FAILED: new Error('authentication failed'),
      AUTH_SESSION_EXPIRED: new Error('session expired'),
      STORAGE_FULL: new Error('quota exceeded'),
      STORAGE_ERROR: new Error('localStorage error'),
      VALIDATION_ERROR: new Error('validation failed: invalid input'),
      RATE_LIMIT: new Error('rate limit exceeded: 429'),
      SERVER_ERROR: new Error('server error: 500'),
      NOT_FOUND: new Error('not found: 404'),
      PERMISSION_DENIED: new Error('permission denied: 403'),
      CODE_EXECUTION_FAILED: new Error('execution failed: syntax error'),
      SYNC_FAILED: new Error('sync failed'),
      CACHE_ERROR: new Error('cache error'),
      UNKNOWN_ERROR: new Error('unknown error')
    };

    return errors[errorType];
  };

  // Demo 1: Basic error handling
  const demoBasicError = (errorType: ErrorType) => {
    try {
      throw simulateError(errorType);
    } catch (error) {
      handleError(error, 'demo-basic-error');
    }
  };

  // Demo 2: Error with retry
  const demoErrorWithRetry = async () => {
    setLoading(true);
    setResult('');

    try {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          throw simulateError('NETWORK_ERROR');
        }
        return 'Success after 3 attempts!';
      };

      const result = await handleErrorWithRetry(
        simulateError('NETWORK_ERROR'),
        'demo-retry',
        operation,
        3
      );

      if (result) {
        setResult(result);
        toast.success('Успешно!', result);
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo 3: Retry with different strategies
  const demoRetryStrategy = async (strategy: 'aggressive' | 'conservative' | 'patient') => {
    setLoading(true);
    setResult('');

    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 2) {
        throw simulateError('NETWORK_ERROR');
      }
      return `Success with ${strategy} strategy after ${attempts} attempts!`;
    };

    const result = await retryWithStrategy(operation, strategy);

    if (result.success) {
      setResult(result.data || '');
      toast.success('Успешно!', result.data);
    } else {
      toast.error('Ошибка', 'Не удалось выполнить операцию');
    }

    setLoading(false);
  };

  // Demo 4: Content fallback
  const demoContentFallback = async () => {
    setLoading(true);
    setResult('');

    const { content, source, isFallback } = await getContentWithFallback(
      async () => {
        // Simulate AI failure
        throw simulateError('AI_GENERATION_FAILED');
      },
      'python',
      1,
      'demo-fallback'
    );

    setResult(`Content source: ${source}, Is fallback: ${isFallback}`);
    setLoading(false);
  };

  // Demo 5: Circuit breaker
  const demoCircuitBreaker = async () => {
    setLoading(true);
    setResult('');

    const breaker = createCircuitBreaker(
      async () => {
        throw simulateError('SERVER_ERROR');
      },
      {
        failureThreshold: 3,
        resetTimeout: 5000
      }
    );

    // Try multiple times to trigger circuit breaker
    const results: string[] = [];
    for (let i = 0; i < 5; i++) {
      const result = await breaker.execute();
      results.push(`Attempt ${i + 1}: ${result.success ? 'Success' : 'Failed'}`);
    }

    setResult(`Circuit breaker state: ${breaker.getState()}\n${results.join('\n')}`);
    setLoading(false);
  };

  // Demo 6: Error tracking stats
  const showErrorStats = () => {
    const stats = getStats();
    const recentErrors = getRecentErrors(5);

    setResult(`
Total Errors: ${stats.totalErrors}
Error Rate: ${stats.errorRate} per minute
Recent Errors: ${recentErrors.length}

Errors by Type:
${Object.entries(stats.errorsByType)
  .map(([type, count]) => `  ${type}: ${count}`)
  .join('\n')}

Errors by Context:
${Object.entries(stats.errorsByContext)
  .map(([context, count]) => `  ${context}: ${count}`)
  .join('\n')}
    `.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c061c] via-[#1a0b2e] to-[#0c061c] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Error Handling System Demo
          </h1>
          <p className="text-white/70 text-lg">
            Comprehensive error handling with user-friendly messages, retry logic, and graceful degradation
          </p>
        </div>

        {/* Demo 1: Basic Error Handling */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">1. User-Friendly Error Messages</h2>
          <p className="text-white/70">
            Click any button to see how different error types are handled with clear, actionable messages.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={() => demoBasicError('NETWORK_ERROR')} variant="secondary">
              Network Error
            </Button>
            <Button onClick={() => demoBasicError('AI_GENERATION_FAILED')} variant="secondary">
              AI Failed
            </Button>
            <Button onClick={() => demoBasicError('AUTH_FAILED')} variant="secondary">
              Auth Failed
            </Button>
            <Button onClick={() => demoBasicError('STORAGE_FULL')} variant="secondary">
              Storage Full
            </Button>
            <Button onClick={() => demoBasicError('RATE_LIMIT')} variant="secondary">
              Rate Limit
            </Button>
            <Button onClick={() => demoBasicError('SERVER_ERROR')} variant="secondary">
              Server Error
            </Button>
            <Button onClick={() => demoBasicError('VALIDATION_ERROR')} variant="secondary">
              Validation Error
            </Button>
            <Button onClick={() => demoBasicError('UNKNOWN_ERROR')} variant="secondary">
              Unknown Error
            </Button>
          </div>
        </Card>

        {/* Demo 2: Retry Logic */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">2. Automatic Retry with Exponential Backoff</h2>
          <p className="text-white/70">
            Automatically retries failed operations with increasing delays between attempts.
          </p>
          <Button onClick={demoErrorWithRetry} disabled={loading} variant="primary">
            {loading ? 'Retrying...' : 'Test Retry Logic'}
          </Button>
        </Card>

        {/* Demo 3: Retry Strategies */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">3. Retry Strategies</h2>
          <p className="text-white/70">
            Different retry strategies for different scenarios.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => demoRetryStrategy('aggressive')} disabled={loading} variant="secondary">
              Aggressive (5 attempts, short delays)
            </Button>
            <Button onClick={() => demoRetryStrategy('conservative')} disabled={loading} variant="secondary">
              Conservative (3 attempts, medium delays)
            </Button>
            <Button onClick={() => demoRetryStrategy('patient')} disabled={loading} variant="secondary">
              Patient (3 attempts, long delays)
            </Button>
          </div>
        </Card>

        {/* Demo 4: Content Fallback */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">4. Content Fallback Chain</h2>
          <p className="text-white/70">
            AI → Cache → Static fallback ensures users always get content.
          </p>
          <Button onClick={demoContentFallback} disabled={loading} variant="primary">
            {loading ? 'Loading...' : 'Test Content Fallback'}
          </Button>
        </Card>

        {/* Demo 5: Circuit Breaker */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">5. Circuit Breaker Pattern</h2>
          <p className="text-white/70">
            Prevents cascading failures by stopping requests after too many failures.
          </p>
          <Button onClick={demoCircuitBreaker} disabled={loading} variant="primary">
            {loading ? 'Testing...' : 'Test Circuit Breaker'}
          </Button>
        </Card>

        {/* Demo 6: Error Tracking */}
        <Card className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">6. Error Tracking & Analytics</h2>
          <p className="text-white/70">
            Track errors for debugging and analytics.
          </p>
          <div className="flex gap-3">
            <Button onClick={showErrorStats} variant="secondary">
              Show Error Stats
            </Button>
            <Button onClick={clearErrors} variant="ghost">
              Clear Error Log
            </Button>
          </div>
        </Card>

        {/* Result Display */}
        {result && (
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Result:</h3>
            <pre className="text-white/80 whitespace-pre-wrap font-mono text-sm bg-black/30 p-4 rounded-lg">
              {result}
            </pre>
          </Card>
        )}

        {/* Documentation Link */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
          <h3 className="text-xl font-bold text-white mb-2">📚 Documentation</h3>
          <p className="text-white/70 mb-4">
            For complete documentation, see <code className="bg-black/30 px-2 py-1 rounded">src/lib/errors/README.md</code>
          </p>
          <div className="space-y-2 text-sm text-white/60">
            <p>✓ User-friendly error messages with recovery steps</p>
            <p>✓ Intelligent retry logic with exponential backoff</p>
            <p>✓ Content fallback chain (AI → Cache → Static)</p>
            <p>✓ Error tracking and analytics</p>
            <p>✓ Circuit breaker pattern</p>
            <p>✓ TypeScript support with full type safety</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
