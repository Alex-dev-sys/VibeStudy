/**
 * Property-based tests for AI Assistant Error Handling
 * Feature: ai-learning-assistant
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { AIAssistantService, getAIAssistantService, resetAIAssistantService } from '@/lib/ai-assistant/service';
import { AssistantRequest, AssistantContext, Message } from '@/lib/ai-assistant/types';
import type { UserTier } from '@/types';

/**
 * Arbitrary generator for user tiers
 */
const userTierArbitrary = fc.constantFrom('free', 'premium', 'pro_plus') as fc.Arbitrary<UserTier>;

/**
 * Arbitrary generator for request types
 */
const requestTypeArbitrary = fc.constantFrom('question', 'code-help', 'advice', 'general') as fc.Arbitrary<'question' | 'code-help' | 'advice' | 'general'>;

/**
 * Arbitrary generator for AssistantContext
 */
const assistantContextArbitrary = fc.record({
  userId: fc.uuid(),
  tier: userTierArbitrary,
  currentDay: fc.integer({ min: 1, max: 90 }),
  languageId: fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
  completedDays: fc.array(fc.integer({ min: 1, max: 90 }), { minLength: 0, maxLength: 30 }),
  currentStreak: fc.integer({ min: 0, max: 90 }),
  totalTasksCompleted: fc.integer({ min: 0, max: 300 }),
  recentMessages: fc.array(
    fc.record({
      id: fc.uuid(),
      sessionId: fc.uuid(),
      role: fc.constantFrom('user', 'assistant', 'system') as fc.Arbitrary<'user' | 'assistant' | 'system'>,
      content: fc.string({ minLength: 1, maxLength: 500 }),
      timestamp: fc.integer({ min: Date.now() - 1000000, max: Date.now() }),
    }),
    { minLength: 0, maxLength: 10 }
  ),
});

/**
 * Arbitrary generator for AssistantRequest
 */
const assistantRequestArbitrary = fc.record({
  message: fc.string({ minLength: 1, maxLength: 2000 }),
  context: assistantContextArbitrary,
  requestType: requestTypeArbitrary,
  code: fc.option(fc.string({ minLength: 10, maxLength: 500 }), { nil: undefined }),
  taskId: fc.option(fc.uuid(), { nil: undefined }),
});

/**
 * Mock AI client to simulate failures
 */
// Note: @/lib/ai-client is mocked globally in tests/setup.ts

/**
 * Mock Supabase to prevent actual database calls
 */
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null })),
    })),
  })),
}));

describe('AI Assistant Error Handling - Property Tests', () => {
  let aiService: AIAssistantService;

  beforeEach(() => {
    vi.clearAllMocks();
    resetAIAssistantService();
    aiService = getAIAssistantService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Set timeout for tests that involve retries with delays
  const RETRY_TEST_TIMEOUT = 15000; // 15 seconds

  /**
   * Feature: ai-learning-assistant, Property 26: Error messages on service failure
   * Validates: Requirements 7.2
   * 
   * For any AI service failure, a clear error message with retry option should 
   * be displayed to the user
   */
  it('Property 26: Error messages are provided on service failure', { timeout: RETRY_TEST_TIMEOUT }, async () => {
    await fc.assert(
      fc.asyncProperty(
        assistantRequestArbitrary,
        fc.constantFrom(
          'NETWORK_ERROR',
          'TIMEOUT_ERROR',
          'AI_SERVICE_ERROR',
          'INVALID_RESPONSE',
          'RATE_LIMIT_ERROR'
        ),
        async (request, errorType) => {
          // Mock AI client to throw error
          const { callChatCompletionWithTier } = await import('@/lib/ai-client');
          const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

          // Clear previous mocks
          mockCall.mockClear();

          // Simulate different error types
          let errorMessage: string;
          switch (errorType) {
            case 'NETWORK_ERROR':
              errorMessage = 'Network connection failed';
              break;
            case 'TIMEOUT_ERROR':
              errorMessage = 'Request timeout';
              break;
            case 'AI_SERVICE_ERROR':
              errorMessage = 'AI service unavailable';
              break;
            case 'INVALID_RESPONSE':
              errorMessage = 'Invalid response format';
              break;
            case 'RATE_LIMIT_ERROR':
              errorMessage = 'Rate limit exceeded';
              break;
            default:
              errorMessage = 'Unknown error';
          }

          // Mock to fail all 3 attempts
          mockCall.mockRejectedValue(new Error(errorMessage));

          // Act: Try to send message
          let thrownError: Error | null = null;
          try {
            await aiService.sendMessage(request);
          } catch (error) {
            thrownError = error as Error;
          }

          // Assert: Error should be thrown
          expect(thrownError).not.toBeNull();
          expect(thrownError).toBeInstanceOf(Error);

          // Assert: Error message should be clear and informative
          if (thrownError) {
            expect(thrownError.message).toBeTruthy();
            expect(thrownError.message.length).toBeGreaterThan(0);
            expect(thrownError.message).toBe(errorMessage);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 26 (continued): Service logs failed requests for monitoring', { timeout: RETRY_TEST_TIMEOUT }, async () => {
    await fc.assert(
      fc.asyncProperty(
        assistantRequestArbitrary,
        async (request) => {
          // Mock AI client to fail
          const { callChatCompletionWithTier } = await import('@/lib/ai-client');
          const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

          // Clear previous mocks
          mockCall.mockClear();

          // Mock to fail all attempts
          mockCall.mockRejectedValue(new Error('Service failure'));

          // Spy on console.log to verify logging
          const consoleLogSpy = vi.spyOn(console, 'log');

          // Act: Try to send message
          try {
            await aiService.sendMessage(request);
          } catch (error) {
            // Expected to fail
          }

          // Assert: Analytics should be logged
          expect(consoleLogSpy).toHaveBeenCalled();

          // Find the analytics log call
          const analyticsCall = consoleLogSpy.mock.calls.find(
            call => call[0] === '[AI Assistant Analytics]'
          );

          expect(analyticsCall).toBeDefined();

          if (analyticsCall) {
            const logData = analyticsCall[1];
            expect(logData).toHaveProperty('success', false);
            expect(logData).toHaveProperty('error');
            expect(logData.error).toBeTruthy();
            expect(logData).toHaveProperty('userId', request.context.userId);
            expect(logData).toHaveProperty('tier', request.context.tier);
            expect(logData).toHaveProperty('requestType', request.requestType);
          }

          consoleLogSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 26 (continued): Different error types are distinguishable', { timeout: RETRY_TEST_TIMEOUT }, async () => {
    await fc.assert(
      fc.asyncProperty(
        assistantRequestArbitrary,
        fc.array(
          fc.record({
            errorType: fc.constantFrom('network', 'timeout', 'service', 'validation'),
            errorMessage: fc.string({ minLength: 5, maxLength: 100 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (request, errorScenarios) => {
          const { callChatCompletionWithTier } = await import('@/lib/ai-client');
          const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

          // Clear previous mocks
          mockCall.mockClear();

          const errors: string[] = [];

          // Test each error scenario
          for (const scenario of errorScenarios) {
            // Mock to fail all 3 attempts with this error
            mockCall.mockRejectedValue(new Error(scenario.errorMessage));

            try {
              await aiService.sendMessage(request);
            } catch (error) {
              if (error instanceof Error) {
                errors.push(error.message);
              }
            }

            // Clear mock for next scenario
            mockCall.mockClear();
          }

          // Assert: Each error should be captured
          expect(errors.length).toBe(errorScenarios.length);

          // Assert: Error messages should match what was thrown
          errors.forEach((errorMsg, index) => {
            expect(errorMsg).toBe(errorScenarios[index].errorMessage);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: ai-learning-assistant, Property 28: Failed requests are queued
   * Validates: Requirements 7.4
   * 
   * For any network error during a request, the message should be queued for retry
   * Max 3 attempts means: can handle up to 2 failures, then succeed on 3rd attempt
   */
  it('Property 28: Service retries failed requests automatically', { timeout: RETRY_TEST_TIMEOUT }, async () => {
    await fc.assert(
      fc.asyncProperty(
        assistantRequestArbitrary,
        fc.integer({ min: 1, max: 2 }), // Number of failures before success (max 2 for 3 total attempts)
        async (request, failureCount) => {
          const { callChatCompletionWithTier } = await import('@/lib/ai-client');
          const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

          // Clear previous mocks
          mockCall.mockClear();

          // Mock to fail N times, then succeed
          for (let i = 0; i < failureCount; i++) {
            mockCall.mockRejectedValueOnce(new Error('Temporary network error'));
          }

          // Then succeed
          mockCall.mockResolvedValueOnce({
            raw: 'This is a helpful response to your question.',
            model: 'test-model',
          });

          // Act: Send message
          let result;
          let error;
          try {
            result = await aiService.sendMessage(request);
          } catch (err) {
            error = err;
          }

          // Assert: With max 3 attempts, should handle up to 2 failures
          expect(error).toBeUndefined();
          expect(result).toBeDefined();
          expect(result?.message).toBeTruthy();

          // Assert: Should have been called failureCount + 1 times (failures + success)
          expect(mockCall).toHaveBeenCalledTimes(failureCount + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 28 (continued): Retry delay increases with each attempt', { timeout: RETRY_TEST_TIMEOUT }, async () => {
    await fc.assert(
      fc.asyncProperty(
        assistantRequestArbitrary,
        async (request) => {
          const { callChatCompletionWithTier } = await import('@/lib/ai-client');
          const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

          // Clear previous mocks
          mockCall.mockClear();

          // Mock to fail twice, then succeed
          mockCall.mockRejectedValueOnce(new Error('Network error 1'));
          mockCall.mockRejectedValueOnce(new Error('Network error 2'));
          mockCall.mockResolvedValueOnce({
            raw: 'Success after retries',
            model: 'test-model',
          });

          // Track timing
          const startTime = Date.now();

          // Act: Send message (should retry)
          await aiService.sendMessage(request);

          const endTime = Date.now();
          const totalTime = endTime - startTime;

          // Assert: Should have taken some time due to retry delays
          // First retry: 1000ms, Second retry: 2000ms = 3000ms minimum
          // We'll be lenient and check for at least 2000ms
          expect(totalTime).toBeGreaterThanOrEqual(2000);

          // Assert: Should have been called 3 times (2 failures + 1 success)
          expect(mockCall).toHaveBeenCalledTimes(3);
        }
      ),
      { numRuns: 20, timeout: 10000 } // Fewer runs due to delays
    );
  });

  it('Property 28 (continued): Max retry limit is enforced', { timeout: RETRY_TEST_TIMEOUT }, async () => {
    await fc.assert(
      fc.asyncProperty(
        assistantRequestArbitrary,
        fc.integer({ min: 4, max: 10 }), // More failures than max retries
        async (request, failureCount) => {
          const { callChatCompletionWithTier } = await import('@/lib/ai-client');
          const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

          // Clear previous mocks
          mockCall.mockClear();

          // Mock to fail all attempts
          mockCall.mockRejectedValue(new Error('Network error'));

          // Act: Try to send message
          let thrownError: Error | null = null;
          try {
            await aiService.sendMessage(request);
          } catch (error) {
            thrownError = error as Error;
          }

          // Assert: Should eventually give up and throw error
          expect(thrownError).not.toBeNull();

          // Assert: Should have tried exactly maxRetries times (3)
          expect(mockCall).toHaveBeenCalledTimes(3);
        }
      ),
      { numRuns: 50, timeout: 15000 }
    );
  });

  it('Property 28 (continued): Successful requests do not trigger retries', async () => {
    await fc.assert(
      fc.asyncProperty(
        assistantRequestArbitrary,
        async (request) => {
          const { callChatCompletionWithTier } = await import('@/lib/ai-client');
          const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

          // Clear previous calls
          mockCall.mockClear();

          // Mock to succeed immediately
          mockCall.mockResolvedValueOnce({
            raw: 'Immediate success response',
            model: 'test-model',
          });

          // Act: Send message
          const result = await aiService.sendMessage(request);

          // Assert: Should succeed
          expect(result).toBeDefined();
          expect(result.message).toBeTruthy();

          // Assert: Should have been called exactly once (no retries)
          expect(mockCall).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  describe('Error Recovery Scenarios', () => {
    it('Property: Transient errors are recovered via retry', { timeout: RETRY_TEST_TIMEOUT }, async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request) => {
            const { callChatCompletionWithTier } = await import('@/lib/ai-client');
            const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

            // Clear previous mocks
            mockCall.mockClear();

            // Simulate transient error (fails once, then succeeds)
            mockCall.mockRejectedValueOnce(new Error('Transient network error'));
            mockCall.mockResolvedValueOnce({
              raw: 'Recovered successfully',
              model: 'test-model',
            });

            // Act: Send message
            const result = await aiService.sendMessage(request);

            // Assert: Should eventually succeed
            expect(result).toBeDefined();
            expect(result.message).toBe('Recovered successfully');

            // Assert: Should have retried once
            expect(mockCall).toHaveBeenCalledTimes(2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Persistent errors are not retried indefinitely', { timeout: RETRY_TEST_TIMEOUT }, async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request) => {
            const { callChatCompletionWithTier } = await import('@/lib/ai-client');
            const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

            // Clear previous mocks
            mockCall.mockClear();

            // Simulate persistent error
            mockCall.mockRejectedValue(new Error('Persistent service error'));

            // Track start time
            const startTime = Date.now();

            // Act: Try to send message
            let error: Error | null = null;
            try {
              await aiService.sendMessage(request);
            } catch (err) {
              error = err as Error;
            }

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // Assert: Should fail after max retries
            expect(error).not.toBeNull();
            expect(error?.message).toBe('Persistent service error');

            // Assert: Should have tried 3 times
            expect(mockCall).toHaveBeenCalledTimes(3);

            // Assert: Should have taken at least 3 seconds (1s + 2s delays)
            expect(totalTime).toBeGreaterThanOrEqual(3000);
          }
        ),
        { numRuns: 20, timeout: 15000 }
      );
    });

    it('Property: Error context is preserved across retries', { timeout: RETRY_TEST_TIMEOUT }, async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request) => {
            const { callChatCompletionWithTier } = await import('@/lib/ai-client');
            const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

            // Clear previous mocks
            mockCall.mockClear();

            // Fail once, then succeed
            mockCall.mockRejectedValueOnce(new Error('First attempt failed'));
            mockCall.mockResolvedValueOnce({
              raw: 'Success on retry',
              model: 'test-model',
            });

            // Act: Send message
            await aiService.sendMessage(request);

            // Assert: Both calls should have received the same context
            expect(mockCall).toHaveBeenCalledTimes(2);

            const firstCall = mockCall.mock.calls[0];
            const secondCall = mockCall.mock.calls[1];

            // Both calls should have the same messages
            expect(firstCall[0]).toEqual(secondCall[0]);

            // Both calls should have the same tier
            expect(firstCall[1]).toEqual(secondCall[1]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Error Message Quality', () => {
    it('Property: Error messages are non-empty and informative', { timeout: RETRY_TEST_TIMEOUT }, async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          fc.string({ minLength: 10, maxLength: 200 }),
          async (request, errorMessage) => {
            const { callChatCompletionWithTier } = await import('@/lib/ai-client');
            const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

            // Clear previous mocks
            mockCall.mockClear();

            mockCall.mockRejectedValue(new Error(errorMessage));

            // Act: Try to send message
            let error: Error | null = null;
            try {
              await aiService.sendMessage(request);
            } catch (err) {
              error = err as Error;
            }

            // Assert: Error message should be preserved
            expect(error).not.toBeNull();
            expect(error?.message).toBe(errorMessage);
            expect(error?.message.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Error logging includes all relevant context', { timeout: RETRY_TEST_TIMEOUT }, async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request) => {
            const { callChatCompletionWithTier } = await import('@/lib/ai-client');
            const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

            // Clear previous mocks
            mockCall.mockClear();

            mockCall.mockRejectedValue(new Error('Test error'));

            const consoleLogSpy = vi.spyOn(console, 'log');

            // Act: Try to send message
            try {
              await aiService.sendMessage(request);
            } catch (error) {
              // Expected
            }

            // Assert: Log should include context
            const analyticsCall = consoleLogSpy.mock.calls.find(
              call => call[0] === '[AI Assistant Analytics]'
            );

            expect(analyticsCall).toBeDefined();

            if (analyticsCall) {
              const logData = analyticsCall[1];

              // Should include all key fields
              expect(logData).toHaveProperty('userId');
              expect(logData).toHaveProperty('tier');
              expect(logData).toHaveProperty('requestType');
              expect(logData).toHaveProperty('messageLength');
              expect(logData).toHaveProperty('processingTime');
              expect(logData).toHaveProperty('success');
              expect(logData).toHaveProperty('error');

              // Values should match request
              expect(logData.userId).toBe(request.context.userId);
              expect(logData.tier).toBe(request.context.tier);
              expect(logData.requestType).toBe(request.requestType);
              expect(logData.messageLength).toBe(request.message.length);
              expect(logData.success).toBe(false);
              expect(logData.error).toBeTruthy();
            }

            consoleLogSpy.mockRestore();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('Property: Empty error messages are handled gracefully', { timeout: RETRY_TEST_TIMEOUT }, async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request) => {
            const { callChatCompletionWithTier } = await import('@/lib/ai-client');
            const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

            // Clear previous mocks
            mockCall.mockClear();

            // Throw error with empty message
            mockCall.mockRejectedValue(new Error(''));

            // Act: Try to send message
            let error: Error | null = null;
            try {
              await aiService.sendMessage(request);
            } catch (err) {
              error = err as Error;
            }

            // Assert: Should still throw error
            expect(error).not.toBeNull();
            expect(error).toBeInstanceOf(Error);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Non-Error exceptions are handled', { timeout: RETRY_TEST_TIMEOUT }, async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          fc.string({ minLength: 1, maxLength: 100 }),
          async (request, errorString) => {
            const { callChatCompletionWithTier } = await import('@/lib/ai-client');
            const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

            // Clear previous mocks
            mockCall.mockClear();

            // Throw non-Error object
            mockCall.mockRejectedValue(errorString);

            // Act: Try to send message
            let caughtError: unknown = null;
            try {
              await aiService.sendMessage(request);
            } catch (err) {
              caughtError = err;
            }

            // Assert: Should still catch the error
            expect(caughtError).not.toBeNull();
            expect(caughtError).toBe(errorString);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Concurrent failed requests are handled independently', { timeout: 25000 }, async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(assistantRequestArbitrary, { minLength: 2, maxLength: 5 }),
          async (requests) => {
            const { callChatCompletionWithTier } = await import('@/lib/ai-client');
            const mockCall = callChatCompletionWithTier as ReturnType<typeof vi.fn>;

            // Clear previous mocks
            mockCall.mockClear();

            // Make all requests fail
            mockCall.mockRejectedValue(new Error('Service unavailable'));

            // Act: Send all requests concurrently
            const results = await Promise.allSettled(
              requests.map(req => aiService.sendMessage(req))
            );

            // Assert: All should be rejected
            expect(results.every(r => r.status === 'rejected')).toBe(true);

            // Assert: Each should have its own error
            results.forEach(result => {
              if (result.status === 'rejected') {
                expect(result.reason).toBeInstanceOf(Error);
                expect(result.reason.message).toBe('Service unavailable');
              }
            });

            // Assert: Should have attempted each request 3 times (max retries)
            expect(mockCall).toHaveBeenCalledTimes(requests.length * 3);
          }
        ),
        { numRuns: 20, timeout: 20000 }
      );
    });
  });
});
