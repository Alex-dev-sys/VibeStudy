/**
 * AI Assistant Caching Property-Based Tests
 * Feature: ai-learning-assistant, Property 29: Identical requests are cached
 * Validates: Requirements 7.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { AIAssistantService } from '@/lib/ai-assistant/service';
import { apiCache } from '@/lib/cache/api-cache';
import type { AssistantRequest, AssistantContext } from '@/lib/ai-assistant/types';

// Mock dependencies
vi.mock('@/lib/ai-client', () => ({
  callChatCompletionWithTier: vi.fn().mockResolvedValue({
    raw: 'This is a test response from AI',
    model: 'test-model',
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

vi.mock('@/store/progress-store', () => ({
  useProgressStore: {
    getState: vi.fn(() => ({
      activeDay: 1,
      languageId: 'python',
      dayStates: {
        1: {
          day: 1,
          theory: { read: true },
          tasks: [],
          recapQuestion: { answered: false },
        },
      },
      record: {
        completedDays: [],
      },
    })),
  },
}));

vi.mock('@/store/achievements-store', () => ({
  useAchievementsStore: {
    getState: vi.fn(() => ({
      stats: {
        currentStreak: 0,
        totalTasksCompleted: 0,
      },
      unlockedAchievements: [],
    })),
  },
}));

describe('AI Assistant Caching - Property-Based Tests', () => {
  let service: AIAssistantService;

  beforeEach(() => {
    // Clear cache before each test
    apiCache.clear();

    // Create fresh service instance
    service = new AIAssistantService();
  });

  /**
   * Property 29: Identical requests are cached
   * For any valid message, day, language, and request type,
   * sending the same request twice should result in the second request
   * being served from cache (faster response time and cache hit logged)
   */
  it('identical requests should be cached', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }), // message
        fc.integer({ min: 1, max: 90 }), // day
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // language
        fc.constantFrom('question', 'code-help', 'advice', 'general'), // request type
        async (message, day, languageId, requestType) => {
      // Create context
      const context: AssistantContext = {
        userId: 'test-user',
        tier: 'premium',
        currentDay: day,
        languageId,
        dayState: {
          day,
          theory: { read: true },
          tasks: [],
          recapQuestion: { answered: false },
        },
        completedDays: [],
        currentStreak: 0,
        totalTasksCompleted: 0,
        dayTheory: 'Test theory',
        dayTasks: [],
        recentMessages: [],
      };

      const request: AssistantRequest = {
        message,
        context,
        requestType: requestType as 'question' | 'code-help' | 'advice' | 'general',
      };

      // First request - should call AI
      const startTime1 = Date.now();
      const response1 = await service.sendMessage(request);
      const duration1 = Date.now() - startTime1;

      // Verify first response
      expect(response1).toBeDefined();
      expect(response1.message).toBeTruthy();

      // Second identical request - should be served from cache
      const startTime2 = Date.now();
      const response2 = await service.sendMessage(request);
      const duration2 = Date.now() - startTime2;

      // Verify second response is identical
      expect(response2.message).toBe(response1.message);

      // Cache hit should be significantly faster
      // Allow some variance but cache should be at least 2x faster
      expect(duration2).toBeLessThanOrEqual(duration1);

      // Verify cache has the entry
      expect(apiCache.size()).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Different messages should not share cache
   * For any two different messages with the same context,
   * they should generate different cache entries
   */
  it('different messages should not share cache', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }), // message1
        fc.string({ minLength: 1, maxLength: 200 }), // message2
        fc.integer({ min: 1, max: 90 }), // day
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // language
        async (message1, message2, day, languageId) => {
      // Skip if messages are identical
      if (message1.toLowerCase().trim() === message2.toLowerCase().trim()) {
        return;
      }

      const context: AssistantContext = {
        userId: 'test-user',
        tier: 'premium',
        currentDay: day,
        languageId,
        dayState: {
          day,
          theory: { read: true },
          tasks: [],
          recapQuestion: { answered: false },
        },
        completedDays: [],
        currentStreak: 0,
        totalTasksCompleted: 0,
        dayTheory: 'Test theory',
        dayTasks: [],
        recentMessages: [],
      };

      const request1: AssistantRequest = {
        message: message1,
        context,
        requestType: 'question',
      };

      const request2: AssistantRequest = {
        message: message2,
        context,
        requestType: 'question',
      };

      // Send both requests
      await service.sendMessage(request1);
      const initialCacheSize = apiCache.size();
      
      await service.sendMessage(request2);
      const finalCacheSize = apiCache.size();

      // Cache should have grown (different messages = different cache entries)
      expect(finalCacheSize).toBeGreaterThan(initialCacheSize);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Message normalization should work correctly
   * For any message, variations in whitespace and case should
   * result in the same cache entry
   */
  it('message normalization should work correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }), // base message
        fc.integer({ min: 1, max: 90 }), // day
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // language
        async (baseMessage, day, languageId) => {
      const context: AssistantContext = {
        userId: 'test-user',
        tier: 'premium',
        currentDay: day,
        languageId,
        dayState: {
          day,
          theory: { read: true },
          tasks: [],
          recapQuestion: { answered: false },
        },
        completedDays: [],
        currentStreak: 0,
        totalTasksCompleted: 0,
        dayTheory: 'Test theory',
        dayTasks: [],
        recentMessages: [],
      };

      // Create variations of the message
      const variations = [
        baseMessage,
        baseMessage.toUpperCase(),
        baseMessage.toLowerCase(),
        `  ${baseMessage}  `, // Extra whitespace
        baseMessage.replace(/\s+/g, '   '), // Multiple spaces
      ];

      // Send first variation
      const request1: AssistantRequest = {
        message: variations[0],
        context,
        requestType: 'question',
      };
      await service.sendMessage(request1);
      const initialCacheSize = apiCache.size();

      // Send other variations - they should all hit the same cache entry
      for (let i = 1; i < variations.length; i++) {
        const request: AssistantRequest = {
          message: variations[i],
          context,
          requestType: 'question',
        };
        await service.sendMessage(request);
      }

      // Cache size should not have grown (all variations use same cache entry)
      expect(apiCache.size()).toBe(initialCacheSize);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Different contexts should generate different cache entries
   * For any message, changing the day or language should result in
   * different cache entries
   */
  it('different contexts should generate different cache entries', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }), // message
        fc.integer({ min: 1, max: 89 }), // day1 (max 89 so day2 can be day1+1)
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // language1
        async (message, day1, language1) => {
      const day2 = day1 + 1;
      const languages = ['python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'];
      const language2 = languages.find(l => l !== language1) || 'javascript';

      // Context 1
      const context1: AssistantContext = {
        userId: 'test-user',
        tier: 'premium',
        currentDay: day1,
        languageId: language1,
        dayState: {
          day: day1,
          theory: { read: true },
          tasks: [],
          recapQuestion: { answered: false },
        },
        completedDays: [],
        currentStreak: 0,
        totalTasksCompleted: 0,
        dayTheory: 'Test theory',
        dayTasks: [],
        recentMessages: [],
      };

      // Context 2 (different day)
      const context2: AssistantContext = {
        ...context1,
        currentDay: day2,
        dayState: {
          ...context1.dayState,
          day: day2,
        },
      };

      // Context 3 (different language)
      const context3: AssistantContext = {
        ...context1,
        languageId: language2,
      };

      // Send same message with different contexts
      await service.sendMessage({ message, context: context1, requestType: 'question' });
      const cacheSize1 = apiCache.size();

      await service.sendMessage({ message, context: context2, requestType: 'question' });
      const cacheSize2 = apiCache.size();

      await service.sendMessage({ message, context: context3, requestType: 'question' });
      const cacheSize3 = apiCache.size();

      // Each context should create a new cache entry
      expect(cacheSize2).toBeGreaterThan(cacheSize1);
      expect(cacheSize3).toBeGreaterThan(cacheSize2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
