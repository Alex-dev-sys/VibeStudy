/**
 * Property-based tests for AI Assistant Analytics and Request Tracking
 * Feature: ai-learning-assistant
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { AIAssistantService, resetAIAssistantService } from '@/lib/ai-assistant/service';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import type { AssistantRequest, AssistantContext } from '@/lib/ai-assistant/types';
import type { UserTier } from '@/types';

/**
 * Mock console.log to capture analytics logs
 */
let capturedLogs: any[] = [];
const originalConsoleLog = console.log;

function mockConsoleLog() {
  capturedLogs = [];
  console.log = vi.fn((...args: any[]) => {
    if (args[0] === '[AI Assistant Analytics]') {
      capturedLogs.push(args[1]);
    }
    originalConsoleLog(...args);
  });
}

function restoreConsoleLog() {
  console.log = originalConsoleLog;
}

/**
 * Arbitrary generator for AssistantContext
 */
const assistantContextArbitrary = fc.record({
  userId: fc.string({ minLength: 1, maxLength: 50 }),
  tier: fc.constantFrom('free', 'premium', 'pro_plus') as fc.Arbitrary<UserTier>,
  currentDay: fc.integer({ min: 1, max: 90 }),
  languageId: fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
  completedDays: fc.array(fc.integer({ min: 1, max: 90 }), { minLength: 0, maxLength: 30 }),
  currentStreak: fc.integer({ min: 0, max: 90 }),
  totalTasksCompleted: fc.integer({ min: 0, max: 300 }),
  dayTheory: fc.string({ minLength: 10, maxLength: 500 }),
  recentMessages: fc.array(fc.record({
    role: fc.constantFrom('user', 'assistant') as fc.Arbitrary<'user' | 'assistant'>,
    content: fc.string({ minLength: 1, maxLength: 200 }),
  }), { maxLength: 0 }) as fc.Arbitrary<never[]>,
});

/**
 * Arbitrary generator for AssistantRequest
 */
const assistantRequestArbitrary = fc.record({
  message: fc.string({ minLength: 1, maxLength: 500 }),
  context: assistantContextArbitrary,
  requestType: fc.constantFrom('question', 'code-help', 'advice', 'general') as fc.Arbitrary<'question' | 'code-help' | 'advice' | 'general'>,
  code: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined }),
  taskId: fc.option(fc.uuid(), { nil: undefined }),
});

describe('AI Assistant Analytics - Property Tests', () => {
  let service: AIAssistantService;

  beforeEach(() => {
    // Reset stores
    useProgressStore.getState().resetProgress();
    useAchievementsStore.getState().resetAchievements();
    
    // Reset service
    resetAIAssistantService();
    service = new AIAssistantService();

    // Mock console.log to capture analytics
    mockConsoleLog();

    // Note: AI client is mocked globally in tests/setup.ts
  });

  afterEach(() => {
    restoreConsoleLog();
    vi.clearAllMocks();
  });

  /**
   * Feature: ai-learning-assistant, Property 30: Requests are tracked
   * Validates: Requirements 8.1
   * 
   * For any AI assistant request, the user's request count should be incremented
   */
  describe('Property 30: Requests are tracked', () => {
    it('should track every AI assistant request', async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request: AssistantRequest) => {
            // Clear captured logs before test
            capturedLogs = [];
            
            try {
              // Act: Send message to AI assistant
              await service.sendMessage(request);
              
              // Assert: At least one analytics log should be captured
              expect(capturedLogs.length).toBeGreaterThan(0);
              
              // Assert: The log should contain the user ID
              const log = capturedLogs[0];
              expect(log).toHaveProperty('userId');
              expect(log.userId).toBe(request.context.userId);
              
              // Assert: The log should track the request
              expect(log).toHaveProperty('requestType');
              expect(log.requestType).toBe(request.requestType);
            } catch (error) {
              // Even if the request fails, it should still be tracked
              expect(capturedLogs.length).toBeGreaterThan(0);
              const log = capturedLogs[0];
              expect(log).toHaveProperty('userId');
              expect(log.userId).toBe(request.context.userId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should track request count for each user independently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(assistantRequestArbitrary, { minLength: 2, maxLength: 5 }),
          async (requests: AssistantRequest[]) => {
            // Clear captured logs
            capturedLogs = [];
            
            // Act: Send multiple requests
            for (const request of requests) {
              try {
                await service.sendMessage(request);
              } catch (error) {
                // Continue even if request fails
              }
            }
            
            // Assert: Number of logs should match number of requests
            expect(capturedLogs.length).toBe(requests.length);
            
            // Assert: Each request should be tracked with correct user ID
            requests.forEach((request, index) => {
              expect(capturedLogs[index].userId).toBe(request.context.userId);
            });
            
            // Assert: Count requests per user
            const requestCountByUser = new Map<string, number>();
            capturedLogs.forEach((log) => {
              const count = requestCountByUser.get(log.userId) || 0;
              requestCountByUser.set(log.userId, count + 1);
            });
            
            // Verify counts match actual requests per user
            const expectedCountByUser = new Map<string, number>();
            requests.forEach((request) => {
              const count = expectedCountByUser.get(request.context.userId) || 0;
              expectedCountByUser.set(request.context.userId, count + 1);
            });
            
            expectedCountByUser.forEach((expectedCount, userId) => {
              expect(requestCountByUser.get(userId)).toBe(expectedCount);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should track requests across different tiers', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.array(
            fc.record({
              tier: fc.constantFrom('free', 'premium', 'pro') as fc.Arbitrary<UserTier>,
              message: fc.string({ minLength: 1, maxLength: 200 }),
            }),
            { minLength: 1, maxLength: 3 }
          ),
          async (userId, requestData) => {
            // Clear captured logs
            capturedLogs = [];
            
            // Act: Send requests with different tiers
            for (const data of requestData) {
              const context: AssistantContext = {
                userId,
                tier: data.tier,
                currentDay: 1,
                languageId: 'python',
                completedDays: [],
                currentStreak: 0,
                totalTasksCompleted: 0,
                recentMessages: [],
              };
              
              const request: AssistantRequest = {
                message: data.message,
                context,
                requestType: 'general',
              };
              
              try {
                await service.sendMessage(request);
              } catch (error) {
                // Continue even if request fails
              }
            }
            
            // Assert: All requests should be tracked
            expect(capturedLogs.length).toBe(requestData.length);
            
            // Assert: Each log should have the correct tier
            requestData.forEach((data, index) => {
              expect(capturedLogs[index].tier).toBe(data.tier);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Feature: ai-learning-assistant, Property 32: Interactions are logged
   * Validates: Requirements 8.3
   * 
   * For any AI assistant interaction, a log entry should be created with request details
   */
  describe('Property 32: Interactions are logged', () => {
    it('should log all interaction details for every request', async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request: AssistantRequest) => {
            // Clear captured logs
            capturedLogs = [];
            
            let requestSucceeded = false;
            
            try {
              // Act: Send message
              await service.sendMessage(request);
              requestSucceeded = true;
            } catch (error) {
              // Request failed
              requestSucceeded = false;
            }
            
            // Assert: Log should exist regardless of success/failure
            expect(capturedLogs.length).toBeGreaterThan(0);
            
            const log = capturedLogs[0];
            
            // Assert: Log contains all required fields
            expect(log).toHaveProperty('userId');
            expect(log).toHaveProperty('tier');
            expect(log).toHaveProperty('requestType');
            expect(log).toHaveProperty('messageLength');
            expect(log).toHaveProperty('responseLength');
            expect(log).toHaveProperty('processingTime');
            expect(log).toHaveProperty('modelUsed');
            expect(log).toHaveProperty('timestamp');
            expect(log).toHaveProperty('success');
            
            // Assert: Log values are correct
            expect(log.userId).toBe(request.context.userId);
            expect(log.tier).toBe(request.context.tier);
            expect(log.requestType).toBe(request.requestType);
            expect(log.messageLength).toBe(request.message.length);
            expect(typeof log.timestamp).toBe('string');
            expect(typeof log.success).toBe('boolean');
            
            // Assert: Success status matches actual outcome
            expect(log.success).toBe(requestSucceeded);
            
            // Assert: Error field present only on failure
            if (!requestSucceeded) {
              expect(log).toHaveProperty('error');
              expect(typeof log.error).toBe('string');
            }
            
            // Assert: Processing time is a string with "ms" suffix (formatted for display)
            expect(typeof log.processingTime).toBe('string');
            expect(log.processingTime).toMatch(/^\d+ms$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should log message length accurately', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.string({ minLength: 1, maxLength: 1000 }), // message
          fc.constantFrom('free', 'premium', 'pro') as fc.Arbitrary<UserTier>,
          async (userId, message, tier) => {
            // Clear captured logs
            capturedLogs = [];
            
            const context: AssistantContext = {
              userId,
              tier,
              currentDay: 1,
              languageId: 'python',
              completedDays: [],
              currentStreak: 0,
              totalTasksCompleted: 0,
              recentMessages: [],
            };
            
            const request: AssistantRequest = {
              message,
              context,
              requestType: 'general',
            };
            
            try {
              // Act
              await service.sendMessage(request);
              
              // Assert: Message length should match
              expect(capturedLogs.length).toBeGreaterThan(0);
              const log = capturedLogs[0];
              expect(log.messageLength).toBe(message.length);
            } catch (error) {
              // Even on error, message length should be logged
              if (capturedLogs.length > 0) {
                expect(capturedLogs[0].messageLength).toBe(message.length);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should log processing time for all requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request: AssistantRequest) => {
            // Clear captured logs
            capturedLogs = [];
            
            const startTime = Date.now();
            
            try {
              // Act
              await service.sendMessage(request);
            } catch (error) {
              // Continue even on error
            }
            
            const endTime = Date.now();
            const actualDuration = endTime - startTime;
            
            // Assert: Processing time should be logged
            expect(capturedLogs.length).toBeGreaterThan(0);
            const log = capturedLogs[0];
            
            // Assert: Processing time is formatted as string with "ms" suffix
            expect(typeof log.processingTime).toBe('string');
            expect(log.processingTime).toMatch(/^\d+ms$/);
            
            // Extract numeric value from string (e.g., "123ms" -> 123)
            const processingTimeMs = parseInt(log.processingTime.replace('ms', ''), 10);
            
            // Assert: Processing time is non-negative
            expect(processingTimeMs).toBeGreaterThanOrEqual(0);
            
            // Assert: Processing time should be reasonable (within actual duration + buffer)
            expect(processingTimeMs).toBeLessThanOrEqual(actualDuration + 1000);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should log success status correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request: AssistantRequest) => {
            // Clear captured logs
            capturedLogs = [];
            
            try {
              // Act
              await service.sendMessage(request);
              
              // Assert: Success should be true
              expect(capturedLogs.length).toBeGreaterThan(0);
              const log = capturedLogs[0];
              expect(log.success).toBe(true);
              expect(log.error).toBeUndefined();
            } catch (error) {
              // On error, success should be false and error should be logged
              expect(capturedLogs.length).toBeGreaterThan(0);
              const log = capturedLogs[0];
              expect(log.success).toBe(false);
              expect(log.error).toBeDefined();
              expect(typeof log.error).toBe('string');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should log model information', async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request: AssistantRequest) => {
            // Clear captured logs
            capturedLogs = [];
            
            try {
              // Act
              await service.sendMessage(request);
              
              // Assert: Model should be logged
              expect(capturedLogs.length).toBeGreaterThan(0);
              const log = capturedLogs[0];
              expect(log).toHaveProperty('modelUsed');
              expect(typeof log.modelUsed).toBe('string');
              expect(log.modelUsed.length).toBeGreaterThan(0);
            } catch (error) {
              // Even on error, model info should be present
              if (capturedLogs.length > 0) {
                expect(capturedLogs[0]).toHaveProperty('modelUsed');
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should log timestamp for all interactions', async () => {
      await fc.assert(
        fc.asyncProperty(
          assistantRequestArbitrary,
          async (request: AssistantRequest) => {
            // Clear captured logs
            capturedLogs = [];
            
            const beforeTime = Date.now();
            
            try {
              // Act
              await service.sendMessage(request);
              
              const afterTime = Date.now();
              
              // Assert: Timestamp should be logged
              expect(capturedLogs.length).toBeGreaterThan(0);
              const log = capturedLogs[0];
              expect(log).toHaveProperty('timestamp');
              expect(typeof log.timestamp).toBe('string');
              
              // Timestamp should be within reasonable range
              const logTime = new Date(log.timestamp).getTime();
              expect(logTime).toBeGreaterThanOrEqual(beforeTime - 1000);
              expect(logTime).toBeLessThanOrEqual(afterTime + 1000);
            } catch (error) {
              // Even on error, timestamp should be present
              if (capturedLogs.length > 0) {
                expect(capturedLogs[0]).toHaveProperty('timestamp');
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should log different request types correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.array(
            fc.constantFrom('question', 'code-help', 'advice', 'general') as fc.Arbitrary<'question' | 'code-help' | 'advice' | 'general'>,
            { minLength: 1, maxLength: 4 }
          ),
          async (userId, requestTypes) => {
            // Clear captured logs
            capturedLogs = [];
            
            const context: AssistantContext = {
              userId,
              tier: 'premium',
              currentDay: 1,
              languageId: 'python',
              completedDays: [],
              currentStreak: 0,
              totalTasksCompleted: 0,
              recentMessages: [],
            };
            
            // Act: Send requests of different types
            for (const requestType of requestTypes) {
              const request: AssistantRequest = {
                message: `Test message for ${requestType}`,
                context,
                requestType,
              };
              
              try {
                await service.sendMessage(request);
              } catch (error) {
                // Continue even if request fails
              }
            }
            
            // Assert: All request types should be logged correctly
            expect(capturedLogs.length).toBe(requestTypes.length);
            requestTypes.forEach((expectedType, index) => {
              expect(capturedLogs[index].requestType).toBe(expectedType);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Analytics Log Completeness', () => {
    it('should never lose analytics data even on errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(assistantRequestArbitrary, { minLength: 1, maxLength: 10 }),
          async (requests: AssistantRequest[]) => {
            // Clear captured logs
            capturedLogs = [];
            
            // Act: Send all requests (some may fail)
            for (const request of requests) {
              try {
                await service.sendMessage(request);
              } catch (error) {
                // Continue processing even on error
              }
            }
            
            // Assert: Every request should have a log entry
            expect(capturedLogs.length).toBe(requests.length);
            
            // Assert: Every log should have essential fields
            capturedLogs.forEach((log) => {
              expect(log).toHaveProperty('userId');
              expect(log).toHaveProperty('tier');
              expect(log).toHaveProperty('requestType');
              expect(log).toHaveProperty('success');
              expect(log).toHaveProperty('timestamp');
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
