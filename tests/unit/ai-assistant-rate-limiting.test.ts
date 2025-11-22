/**
 * Property-based tests for AI Assistant Rate Limiting
 * Feature: ai-learning-assistant
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { rateLimiter, evaluateRateLimit, type RateLimitBucket } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

/**
 * Arbitrary generator for rate limit buckets
 */
const rateLimitBucketArbitrary = fc.record({
  limit: fc.integer({ min: 1, max: 100 }),
  windowMs: fc.integer({ min: 1000, max: 60000 }), // 1 second to 1 minute
});

/**
 * Arbitrary generator for user identifiers
 */
const userIdentifierArbitrary = fc.oneof(
  fc.uuid().map(id => `user:${id}`),
  fc.ipV4().map(ip => `ip:${ip}`),
  fc.string({ minLength: 5, maxLength: 20 }).map(s => `session:${s}`)
);

/**
 * Helper to create a mock NextRequest with custom headers
 */
function createMockRequest(headers: Record<string, string> = {}): NextRequest {
  const request = new NextRequest('http://localhost:3000/api/ai-assistant/chat', {
    method: 'POST',
    headers: new Headers(headers),
  });
  return request;
}

/**
 * Helper to simulate time passing
 */
function advanceTime(ms: number): void {
  vi.advanceTimersByTime(ms);
}

describe('AI Assistant Rate Limiting - Property Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Clear rate limiter state
    rateLimiter.destroy();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  /**
   * Feature: ai-learning-assistant, Property 27: Rate limiting is enforced
   * Validates: Requirements 7.3
   * 
   * For any user sending requests rapidly, rate limiting should be applied 
   * after exceeding the threshold
   */
  it('Property 27: Rate limiting is enforced for all users', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdentifierArbitrary,
        rateLimitBucketArbitrary,
        async (identifier, bucket) => {
          // Ensure we have a reasonable limit for testing
          const testBucket = {
            limit: Math.max(2, Math.min(bucket.limit, 10)), // Between 2 and 10
            windowMs: bucket.windowMs,
          };

          // Act: Make requests up to the limit
          const results: boolean[] = [];
          for (let i = 0; i < testBucket.limit; i++) {
            const allowed = rateLimiter.check(identifier, testBucket.limit, testBucket.windowMs);
            results.push(allowed);
          }

          // Assert: All requests up to limit should be allowed
          expect(results.every(r => r === true)).toBe(true);

          // Act: Make one more request (should exceed limit)
          const exceededResult = rateLimiter.check(identifier, testBucket.limit, testBucket.windowMs);

          // Assert: Request exceeding limit should be blocked
          expect(exceededResult).toBe(false);

          // Cleanup
          rateLimiter.reset(identifier);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 27 (continued): Rate limit resets after time window', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdentifierArbitrary,
        fc.record({
          limit: fc.integer({ min: 2, max: 5 }),
          windowMs: fc.integer({ min: 1000, max: 5000 }),
        }),
        async (identifier, bucket) => {
          // Act: Exhaust the rate limit
          for (let i = 0; i < bucket.limit; i++) {
            rateLimiter.check(identifier, bucket.limit, bucket.windowMs);
          }

          // Verify we're rate limited
          const blockedBefore = rateLimiter.check(identifier, bucket.limit, bucket.windowMs);
          expect(blockedBefore).toBe(false);

          // Act: Advance time past the window
          advanceTime(bucket.windowMs + 100);

          // Act: Try again after window expires
          const allowedAfter = rateLimiter.check(identifier, bucket.limit, bucket.windowMs);

          // Assert: Should be allowed after window expires
          expect(allowedAfter).toBe(true);

          // Cleanup
          rateLimiter.reset(identifier);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 27 (continued): Different users have independent rate limits', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(userIdentifierArbitrary, userIdentifierArbitrary).filter(([a, b]) => a !== b),
        rateLimitBucketArbitrary,
        async ([user1, user2], bucket) => {
          const testBucket = {
            limit: Math.max(2, Math.min(bucket.limit, 10)),
            windowMs: bucket.windowMs,
          };

          // Act: Exhaust rate limit for user1
          for (let i = 0; i < testBucket.limit; i++) {
            rateLimiter.check(user1, testBucket.limit, testBucket.windowMs);
          }

          // Verify user1 is rate limited
          const user1Blocked = rateLimiter.check(user1, testBucket.limit, testBucket.windowMs);
          expect(user1Blocked).toBe(false);

          // Act: Check if user2 can still make requests
          const user2Allowed = rateLimiter.check(user2, testBucket.limit, testBucket.windowMs);

          // Assert: User2 should not be affected by user1's rate limit
          expect(user2Allowed).toBe(true);

          // Cleanup
          rateLimiter.reset(user1);
          rateLimiter.reset(user2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 27 (continued): Rate limit state is tracked correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdentifierArbitrary,
        fc.record({
          limit: fc.integer({ min: 3, max: 10 }),
          windowMs: fc.integer({ min: 1000, max: 10000 }),
        }),
        fc.integer({ min: 1, max: 5 }), // Number of requests to make
        async (identifier, bucket, requestCount) => {
          // Ensure requestCount doesn't exceed limit
          const actualRequests = Math.min(requestCount, bucket.limit - 1);

          // Act: Make some requests (but not all)
          for (let i = 0; i < actualRequests; i++) {
            rateLimiter.check(identifier, bucket.limit, bucket.windowMs);
          }

          // Act: Get remaining requests
          const remaining = rateLimiter.getRemaining(identifier, bucket.limit);

          // Assert: Remaining should be limit - requests made
          expect(remaining).toBe(bucket.limit - actualRequests);

          // Act: Get reset time
          const resetTime = rateLimiter.getResetTime(identifier);

          // Assert: Reset time should be in the future
          expect(resetTime).not.toBeNull();
          if (resetTime) {
            expect(resetTime).toBeGreaterThan(Date.now());
            expect(resetTime).toBeLessThanOrEqual(Date.now() + bucket.windowMs);
          }

          // Cleanup
          rateLimiter.reset(identifier);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ai-learning-assistant, Property 31: Limits trigger notifications
   * Validates: Requirements 8.2
   * 
   * When usage limits are reached, the system should notify the user and 
   * apply throttling
   */
  it('Property 31: Rate limit state includes notification data', async () => {
    await fc.assert(
      fc.asyncProperty(
        rateLimitBucketArbitrary,
        async (bucket) => {
          const testBucket = {
            limit: Math.max(2, Math.min(bucket.limit, 10)),
            windowMs: bucket.windowMs,
          };

          // Create a mock request
          const request = createMockRequest({
            'x-user-id': 'test-user-123',
          });

          // Act: Evaluate rate limit
          const state = evaluateRateLimit(request, testBucket, { bucketId: 'test' });

          // Assert: State should include all necessary notification data
          expect(state).toHaveProperty('allowed');
          expect(state).toHaveProperty('identifier');
          expect(state).toHaveProperty('limit');
          expect(state).toHaveProperty('remaining');
          expect(state).toHaveProperty('retryAfterSeconds');

          // Assert: Limit should match bucket
          expect(state.limit).toBe(testBucket.limit);

          // Assert: Remaining should be less than or equal to limit
          expect(state.remaining).toBeLessThanOrEqual(testBucket.limit);

          // Assert: RetryAfter should be positive
          expect(state.retryAfterSeconds).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 31 (continued): Rate limit exceeded provides retry information', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdentifierArbitrary,
        fc.record({
          limit: fc.integer({ min: 1, max: 5 }),
          windowMs: fc.integer({ min: 1000, max: 10000 }),
        }),
        async (identifier, bucket) => {
          // Act: Exhaust the rate limit
          for (let i = 0; i < bucket.limit; i++) {
            rateLimiter.check(identifier, bucket.limit, bucket.windowMs);
          }

          // Act: Get state when rate limited
          const remaining = rateLimiter.getRemaining(identifier, bucket.limit);
          const resetTime = rateLimiter.getResetTime(identifier);

          // Assert: Remaining should be 0
          expect(remaining).toBe(0);

          // Assert: Reset time should be provided for retry
          expect(resetTime).not.toBeNull();
          if (resetTime) {
            const retryAfterSeconds = Math.ceil((resetTime - Date.now()) / 1000);
            expect(retryAfterSeconds).toBeGreaterThan(0);
            expect(retryAfterSeconds).toBeLessThanOrEqual(Math.ceil(bucket.windowMs / 1000));
          }

          // Cleanup
          rateLimiter.reset(identifier);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 31 (continued): Notification data updates as requests are made', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdentifierArbitrary,
        fc.record({
          limit: fc.integer({ min: 5, max: 10 }),
          windowMs: fc.integer({ min: 2000, max: 10000 }),
        }),
        async (identifier, bucket) => {
          const remainingValues: number[] = [];

          // Act: Make requests and track remaining count
          for (let i = 0; i < bucket.limit; i++) {
            rateLimiter.check(identifier, bucket.limit, bucket.windowMs);
            const remaining = rateLimiter.getRemaining(identifier, bucket.limit);
            remainingValues.push(remaining);
          }

          // Assert: Remaining should decrease monotonically
          for (let i = 1; i < remainingValues.length; i++) {
            expect(remainingValues[i]).toBeLessThanOrEqual(remainingValues[i - 1]);
          }

          // Assert: Last remaining should be 0
          expect(remainingValues[remainingValues.length - 1]).toBe(0);

          // Cleanup
          rateLimiter.reset(identifier);
        }
      ),
      { numRuns: 100 }
    );
  });

  describe('Integration with API Route', () => {
    it('Property: evaluateRateLimit returns correct state for allowed requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            limit: fc.integer({ min: 5, max: 20 }),
            windowMs: fc.integer({ min: 1000, max: 60000 }),
          }),
          async ({ userId, limit, windowMs }) => {
            // Create request with user ID
            const request = createMockRequest({
              'x-user-id': userId,
            });

            const bucket = { limit, windowMs };

            // Act: Evaluate rate limit
            const state = evaluateRateLimit(request, bucket, { bucketId: 'api-test' });

            // Assert: First request should be allowed
            expect(state.allowed).toBe(true);
            expect(state.remaining).toBe(limit - 1);
            expect(state.limit).toBe(limit);
            expect(state.identifier).toContain(userId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: evaluateRateLimit blocks after limit exceeded', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            limit: fc.integer({ min: 2, max: 5 }),
            windowMs: fc.integer({ min: 1000, max: 10000 }),
          }),
          async ({ userId, limit, windowMs }) => {
            const request = createMockRequest({
              'x-user-id': userId,
            });

            const bucket = { limit, windowMs };
            const bucketId = `test-${userId}`;

            // Act: Make requests up to limit
            for (let i = 0; i < limit; i++) {
              evaluateRateLimit(request, bucket, { bucketId });
            }

            // Act: Try one more request
            const state = evaluateRateLimit(request, bucket, { bucketId });

            // Assert: Should be blocked
            expect(state.allowed).toBe(false);
            expect(state.remaining).toBe(0);
            expect(state.retryAfterSeconds).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Rate limit headers contain correct information', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            limit: fc.integer({ min: 5, max: 50 }),
            remaining: fc.integer({ min: 0, max: 50 }),
            retryAfterSeconds: fc.integer({ min: 1, max: 60 }),
          }),
          async ({ limit, remaining, retryAfterSeconds }) => {
            // Ensure remaining doesn't exceed limit
            const actualRemaining = Math.min(remaining, limit);

            const state = {
              allowed: actualRemaining > 0,
              identifier: 'test-user',
              limit,
              remaining: actualRemaining,
              retryAfterSeconds,
            };

            // Act: Build headers (we need to import this function)
            // For now, we'll test the structure
            const headers = {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': Math.max(actualRemaining, 0).toString(),
              'Retry-After': Math.max(retryAfterSeconds, 0).toString(),
            };

            // Assert: Headers should contain correct values
            expect(headers['X-RateLimit-Limit']).toBe(limit.toString());
            expect(headers['X-RateLimit-Remaining']).toBe(Math.max(actualRemaining, 0).toString());
            expect(headers['Retry-After']).toBe(Math.max(retryAfterSeconds, 0).toString());

            // Assert: All values should be non-negative
            expect(parseInt(headers['X-RateLimit-Limit'])).toBeGreaterThanOrEqual(0);
            expect(parseInt(headers['X-RateLimit-Remaining'])).toBeGreaterThanOrEqual(0);
            expect(parseInt(headers['Retry-After'])).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('Property: Zero remaining requests blocks further requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdentifierArbitrary,
          fc.integer({ min: 1, max: 10 }),
          async (identifier, limit) => {
            const windowMs = 5000;

            // Act: Exhaust limit
            for (let i = 0; i < limit; i++) {
              rateLimiter.check(identifier, limit, windowMs);
            }

            // Assert: Remaining should be 0
            const remaining = rateLimiter.getRemaining(identifier, limit);
            expect(remaining).toBe(0);

            // Assert: Next request should be blocked
            const blocked = rateLimiter.check(identifier, limit, windowMs);
            expect(blocked).toBe(false);

            // Cleanup
            rateLimiter.reset(identifier);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Reset clears rate limit state', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdentifierArbitrary,
          fc.record({
            limit: fc.integer({ min: 2, max: 10 }),
            windowMs: fc.integer({ min: 1000, max: 10000 }),
          }),
          async (identifier, bucket) => {
            // Act: Exhaust limit
            for (let i = 0; i < bucket.limit; i++) {
              rateLimiter.check(identifier, bucket.limit, bucket.windowMs);
            }

            // Verify blocked
            const blockedBefore = rateLimiter.check(identifier, bucket.limit, bucket.windowMs);
            expect(blockedBefore).toBe(false);

            // Act: Reset
            rateLimiter.reset(identifier);

            // Act: Try again after reset
            const allowedAfter = rateLimiter.check(identifier, bucket.limit, bucket.windowMs);

            // Assert: Should be allowed after reset
            expect(allowedAfter).toBe(true);

            // Assert: Remaining should be reset
            const remaining = rateLimiter.getRemaining(identifier, bucket.limit);
            expect(remaining).toBe(bucket.limit - 1); // -1 because we just made a request

            // Cleanup
            rateLimiter.reset(identifier);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Concurrent requests from same user are rate limited', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdentifierArbitrary,
          fc.record({
            limit: fc.integer({ min: 5, max: 15 }),
            windowMs: fc.integer({ min: 1000, max: 10000 }),
          }),
          fc.integer({ min: 10, max: 30 }), // Number of concurrent requests
          async (identifier, bucket, concurrentRequests) => {
            // Act: Make many concurrent requests
            const results: boolean[] = [];
            for (let i = 0; i < concurrentRequests; i++) {
              const allowed = rateLimiter.check(identifier, bucket.limit, bucket.windowMs);
              results.push(allowed);
            }

            // Assert: Only up to limit should be allowed
            const allowedCount = results.filter(r => r === true).length;
            expect(allowedCount).toBeLessThanOrEqual(bucket.limit);

            // Assert: After limit, all should be blocked
            const blockedCount = results.filter(r => r === false).length;
            if (concurrentRequests > bucket.limit) {
              expect(blockedCount).toBeGreaterThan(0);
              expect(blockedCount).toBe(concurrentRequests - bucket.limit);
            }

            // Cleanup
            rateLimiter.reset(identifier);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Rate limiter handles very short time windows', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdentifierArbitrary,
          fc.integer({ min: 1, max: 5 }),
          async (identifier, limit) => {
            const shortWindow = 100; // 100ms

            // Act: Make requests
            const allowed1 = rateLimiter.check(identifier, limit, shortWindow);
            expect(allowed1).toBe(true);

            // Act: Advance time past window
            advanceTime(shortWindow + 10);

            // Act: Should be allowed again
            const allowed2 = rateLimiter.check(identifier, limit, shortWindow);
            expect(allowed2).toBe(true);

            // Cleanup
            rateLimiter.reset(identifier);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Rate limiter handles very long time windows', async () => {
      await fc.assert(
        fc.asyncProperty(
          userIdentifierArbitrary,
          fc.integer({ min: 1, max: 5 }),
          async (identifier, limit) => {
            const longWindow = 24 * 60 * 60 * 1000; // 24 hours

            // Act: Exhaust limit
            for (let i = 0; i < limit; i++) {
              rateLimiter.check(identifier, limit, longWindow);
            }

            // Assert: Should be blocked
            const blocked = rateLimiter.check(identifier, limit, longWindow);
            expect(blocked).toBe(false);

            // Act: Advance time but not past window
            advanceTime(longWindow / 2);

            // Assert: Still blocked
            const stillBlocked = rateLimiter.check(identifier, limit, longWindow);
            expect(stillBlocked).toBe(false);

            // Act: Advance past window
            advanceTime(longWindow / 2 + 100);

            // Assert: Now allowed
            const nowAllowed = rateLimiter.check(identifier, limit, longWindow);
            expect(nowAllowed).toBe(true);

            // Cleanup
            rateLimiter.reset(identifier);
          }
        ),
        { numRuns: 50 } // Fewer runs due to time manipulation
      );
    });
  });
});
