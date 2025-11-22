/**
 * Property-based tests for AI Assistant Tier Verification
 * Feature: ai-learning-assistant
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { checkTierLimit, TIER_LIMITS, type UserTier } from '@/middleware/with-tier-check';
import { NextRequest } from 'next/server';

/**
 * Mock Supabase client
 */
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabaseClient,
}));

/**
 * Arbitrary generator for UserTier
 */
const userTierArbitrary = fc.constantFrom<UserTier>('free', 'premium', 'pro_plus');

/**
 * Arbitrary generator for user data
 */
const userDataArbitrary = fc.record({
  id: fc.uuid(),
  tier: userTierArbitrary,
  ai_requests_today: fc.integer({ min: 0, max: 200 }),
  ai_requests_reset_at: fc.date({ min: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), max: new Date() }),
  tier_expires_at: fc.option(fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) })),
});

/**
 * Arbitrary generator for expired subscription user data
 */
const expiredUserDataArbitrary = fc.record({
  id: fc.uuid(),
  tier: fc.constantFrom<UserTier>('premium', 'pro_plus'), // Only paid tiers can expire
  ai_requests_today: fc.integer({ min: 0, max: 200 }),
  ai_requests_reset_at: fc.date({ min: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), max: new Date() }),
  tier_expires_at: fc.date({ min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), max: new Date(Date.now() - 1) }), // Expired date
});

/**
 * Helper to create a mock NextRequest
 */
function createMockRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/ai-assistant/chat', {
    method: 'POST',
  });
}

describe('AI Assistant Tier Verification - Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: ai-learning-assistant, Property 1: Premium users see assistant interface
   * Validates: Requirements 1.1
   * 
   * For any premium user accessing the learning dashboard, the AI assistant interface 
   * should be rendered and accessible
   */
  it('Property 1: Premium users are allowed access', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          tier: fc.constantFrom<UserTier>('premium', 'pro_plus'), // Only premium/pro_plus
          ai_requests_today: fc.integer({ min: 0, max: 50 }), // Below any limit
          ai_requests_reset_at: fc.constant(new Date()),
          tier_expires_at: fc.option(fc.date({ min: new Date(Date.now() + 1000), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) })), // Future date or null
        }),
        async (userData) => {
          // Setup: Mock authenticated premium/pro_plus user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: userData.id } },
            error: null,
          });

          mockSupabaseClient.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: userData,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          });

          // Act: Check tier limit
          const request = createMockRequest();
          const result = await checkTierLimit(request);

          // Assert: Premium/Pro+ users should be allowed
          expect(result.allowed).toBe(true);
          expect(['premium', 'pro_plus']).toContain(result.tier);
          expect(result.error).toBeUndefined();
          
          // Premium/Pro+ should have unlimited requests
          expect(result.limit).toBe(Infinity);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ai-learning-assistant, Property 2: Free users see paywall
   * Validates: Requirements 1.2
   * 
   * For any free user attempting to access the AI assistant, a paywall with 
   * subscription options should be displayed instead of the chat interface
   */
  it('Property 2: Free users are blocked when limit exceeded', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          tier: fc.constant<UserTier>('free'),
          ai_requests_today: fc.integer({ min: TIER_LIMITS.free.aiRequestsPerDay, max: 100 }), // At or above limit
          ai_requests_reset_at: fc.constant(new Date()),
          tier_expires_at: fc.constant(null),
        }),
        async (userData) => {
          // Setup: Mock authenticated free user who has exceeded limit
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: userData.id } },
            error: null,
          });

          mockSupabaseClient.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: userData,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          });

          // Act: Check tier limit
          const request = createMockRequest();
          const result = await checkTierLimit(request);

          // Assert: Free users at/above limit should be blocked
          expect(result.allowed).toBe(false);
          expect(result.tier).toBe('free');
          expect(result.error).toBeDefined();
          expect(result.error?.code).toBe('TIER_LIMIT_EXCEEDED');
          expect(result.limit).toBe(TIER_LIMITS.free.aiRequestsPerDay);
          expect(result.requestsToday).toBeGreaterThanOrEqual(TIER_LIMITS.free.aiRequestsPerDay);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2 (continued): Free users within limit are allowed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          tier: fc.constant<UserTier>('free'),
          ai_requests_today: fc.integer({ min: 0, max: TIER_LIMITS.free.aiRequestsPerDay - 2 }), // Well below limit (leave room for increment)
          ai_requests_reset_at: fc.constant(new Date()),
          tier_expires_at: fc.constant(null),
        }),
        async (userData) => {
          // Setup: Mock authenticated free user within limit
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: userData.id } },
            error: null,
          });

          mockSupabaseClient.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: userData,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          });

          // Act: Check tier limit
          const request = createMockRequest();
          const result = await checkTierLimit(request);

          // Assert: Free users within limit should be allowed
          expect(result.allowed).toBe(true);
          expect(result.tier).toBe('free');
          expect(result.error).toBeUndefined();
          expect(result.limit).toBe(TIER_LIMITS.free.aiRequestsPerDay);
          expect(result.requestsToday).toBeLessThanOrEqual(TIER_LIMITS.free.aiRequestsPerDay);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ai-learning-assistant, Property 3: Expired subscriptions are blocked
   * Validates: Requirements 1.3
   * 
   * For any user with an expired subscription, attempting to access the AI assistant 
   * should result in access denial and an upgrade prompt
   */
  it('Property 3: Expired subscriptions are blocked', async () => {
    await fc.assert(
      fc.asyncProperty(
        expiredUserDataArbitrary,
        async (userData) => {
          // Setup: Mock user with expired subscription
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: userData.id } },
            error: null,
          });

          mockSupabaseClient.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: userData,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          });

          // Act: Check tier limit
          const request = createMockRequest();
          const result = await checkTierLimit(request);

          // Assert: Expired subscriptions should be blocked
          expect(result.allowed).toBe(false);
          expect(result.tier).toBe('free'); // Should be downgraded to free
          expect(result.error).toBeDefined();
          expect(result.error?.code).toBe('TIER_EXPIRED');
          expect(result.error?.message).toContain('expired');
          
          // Verify that the tier was downgraded in the database
          expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: ai-learning-assistant, Property 4: Subscription verification on every request
   * Validates: Requirements 1.4
   * 
   * For any AI assistant request, the system should verify the user's subscription 
   * status before processing
   */
  it('Property 4: Subscription is verified on every request', async () => {
    await fc.assert(
      fc.asyncProperty(
        userDataArbitrary,
        async (userData) => {
          // Setup: Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: userData.id } },
            error: null,
          });

          mockSupabaseClient.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: userData,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          });

          // Act: Check tier limit
          const request = createMockRequest();
          await checkTierLimit(request);

          // Assert: Subscription verification should query the database
          expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
          expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
          
          // Verify that the select query was made with user ID
          const fromMock = mockSupabaseClient.from.mock.results[0].value;
          expect(fromMock.select).toHaveBeenCalledWith('tier, ai_requests_today, ai_requests_reset_at, tier_expires_at');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4 (continued): Multiple requests verify subscription each time', async () => {
    await fc.assert(
      fc.asyncProperty(
        userDataArbitrary,
        fc.integer({ min: 2, max: 5 }), // Number of requests
        async (userData, requestCount) => {
          // Clear mocks before each property test iteration
          vi.clearAllMocks();
          
          // Setup: Mock authenticated user
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: { id: userData.id } },
            error: null,
          });

          mockSupabaseClient.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: userData,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          });

          // Act: Make multiple requests
          const request = createMockRequest();
          for (let i = 0; i < requestCount; i++) {
            await checkTierLimit(request);
          }

          // Assert: Subscription should be verified for each request
          // auth.getUser should be called once per request
          expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(requestCount);
          
          // from() is called multiple times per request (select + update operations)
          // So we just verify it was called at least requestCount times
          expect(mockSupabaseClient.from).toHaveBeenCalled();
          expect(mockSupabaseClient.from.mock.calls.length).toBeGreaterThanOrEqual(requestCount);
        }
      ),
      { numRuns: 50 }
    );
  });

  describe('Edge Cases and Additional Properties', () => {
    it('Property: Guest users (unauthenticated) are treated as free tier', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null), // No user
          async () => {
            // Setup: Mock unauthenticated user
            mockSupabaseClient.auth.getUser.mockResolvedValue({
              data: { user: null },
              error: { message: 'Not authenticated' },
            });

            // Act: Check tier limit
            const request = createMockRequest();
            const result = await checkTierLimit(request);

            // Assert: Guest users should be treated as free tier
            expect(result.tier).toBe('free');
            expect(result.limit).toBe(TIER_LIMITS.free.aiRequestsPerDay);
            // Guest users are allowed (client-side will handle limits)
            expect(result.allowed).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Request counter increments for allowed requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            tier: userTierArbitrary,
            ai_requests_today: fc.integer({ min: 0, max: 3 }), // Well below any limit
            ai_requests_reset_at: fc.constant(new Date()),
            tier_expires_at: fc.option(fc.date({ min: new Date(Date.now() + 1000), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) })),
          }),
          async (userData) => {
            // Setup: Mock authenticated user
            mockSupabaseClient.auth.getUser.mockResolvedValue({
              data: { user: { id: userData.id } },
              error: null,
            });

            const updateMock = vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            });

            mockSupabaseClient.from.mockReturnValue({
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: userData,
                    error: null,
                  }),
                }),
              }),
              update: updateMock,
            });

            // Act: Check tier limit
            const request = createMockRequest();
            const result = await checkTierLimit(request);

            // Assert: If allowed, counter should be incremented
            if (result.allowed) {
              expect(updateMock).toHaveBeenCalledWith({
                ai_requests_today: userData.ai_requests_today + 1,
              });
              expect(result.requestsToday).toBe(userData.ai_requests_today + 1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Daily counter resets at midnight', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            tier: userTierArbitrary,
            ai_requests_today: fc.integer({ min: 1, max: 100 }), // Non-zero requests
            ai_requests_reset_at: fc.date({ min: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), max: new Date(Date.now() - 24 * 60 * 60 * 1000) }), // Yesterday or earlier
            tier_expires_at: fc.option(fc.date({ min: new Date(Date.now() + 1000), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) })),
          }),
          async (userData) => {
            // Setup: Mock authenticated user with old reset date
            mockSupabaseClient.auth.getUser.mockResolvedValue({
              data: { user: { id: userData.id } },
              error: null,
            });

            const updateMock = vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            });

            mockSupabaseClient.from.mockReturnValue({
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: userData,
                    error: null,
                  }),
                }),
              }),
              update: updateMock,
            });

            // Act: Check tier limit
            const request = createMockRequest();
            const result = await checkTierLimit(request);

            // Assert: Counter should be reset to 0 (or 1 after increment)
            const updateCalls = updateMock.mock.calls;
            const resetCall = updateCalls.find((call: any) => 
              call[0].ai_requests_today === 0 && call[0].ai_requests_reset_at
            );
            
            // Should have reset the counter
            expect(resetCall).toBeDefined();
            
            // Result should show low request count (reset happened)
            if (result.allowed) {
              expect(result.requestsToday).toBeLessThanOrEqual(1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Tier limits are correctly enforced', async () => {
      await fc.assert(
        fc.asyncProperty(
          userTierArbitrary,
          fc.integer({ min: 0, max: 200 }),
          async (tier, requestCount) => {
            // Setup: Mock user with specific tier and request count
            const userData = {
              id: 'test-user',
              tier,
              ai_requests_today: requestCount,
              ai_requests_reset_at: new Date(),
              tier_expires_at: tier !== 'free' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
            };

            mockSupabaseClient.auth.getUser.mockResolvedValue({
              data: { user: { id: userData.id } },
              error: null,
            });

            mockSupabaseClient.from.mockReturnValue({
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: userData,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            });

            // Act: Check tier limit
            const request = createMockRequest();
            const result = await checkTierLimit(request);

            // Assert: Tier limits should be correctly applied
            const limit = TIER_LIMITS[tier].aiRequestsPerDay;
            expect(result.limit).toBe(limit);
            
            if (requestCount >= limit) {
              expect(result.allowed).toBe(false);
              expect(result.error?.code).toBe('TIER_LIMIT_EXCEEDED');
            } else {
              expect(result.allowed).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Error handling for database failures', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          async (userId) => {
            // Setup: Mock database error
            mockSupabaseClient.auth.getUser.mockResolvedValue({
              data: { user: { id: userId } },
              error: null,
            });

            mockSupabaseClient.from.mockReturnValue({
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' },
                  }),
                }),
              }),
            });

            // Act: Check tier limit
            const request = createMockRequest();
            const result = await checkTierLimit(request);

            // Assert: Should default to free tier on error
            expect(result.tier).toBe('free');
            expect(result.allowed).toBe(true); // Graceful degradation
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
