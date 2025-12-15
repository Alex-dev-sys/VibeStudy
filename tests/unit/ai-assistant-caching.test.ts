/**
 * AI Assistant Caching Tests
 * Tests for response caching functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIAssistantService } from '@/lib/ai-assistant/service';
import { apiCache } from '@/lib/cache/api-cache';
import type { AssistantRequest, AssistantContext } from '@/lib/ai-assistant/types';

// Mock dependencies
// Note: @/lib/ai-client is mocked globally in tests/setup.ts

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

describe('AI Assistant Caching', () => {
  let service: AIAssistantService;
  let mockContext: AssistantContext;

  beforeEach(() => {
    // Clear cache before each test
    apiCache.clear();

    // Create fresh service instance
    service = new AIAssistantService();

    // Mock context
    mockContext = {
      userId: 'test-user',
      tier: 'premium',
      currentDay: 1,
      languageId: 'python',
      dayState: {
        day: 1,
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
  });

  it('should cache AI responses', async () => {
    const request: AssistantRequest = {
      message: 'What is a variable?',
      context: mockContext,
      requestType: 'question',
    };

    // First request - should call AI
    const response1 = await service.sendMessage(request);
    expect(response1).toBeDefined();
    expect(response1.message).toBeTruthy();

    // Cache should now have 1 entry
    expect(apiCache.size()).toBeGreaterThan(0);
  });

  it('should serve identical requests from cache', async () => {
    const request: AssistantRequest = {
      message: 'What is a variable?',
      context: mockContext,
      requestType: 'question',
    };

    // First request
    const response1 = await service.sendMessage(request);
    const firstCallTime = Date.now();

    // Second identical request - should be much faster (from cache)
    const startTime = Date.now();
    const response2 = await service.sendMessage(request);
    const cacheCallTime = Date.now() - startTime;

    // Response should be identical
    expect(response2.message).toBe(response1.message);

    // Cache call should be significantly faster (< 10ms)
    expect(cacheCallTime).toBeLessThan(10);
  });

  it('should generate different cache keys for different messages', async () => {
    const request1: AssistantRequest = {
      message: 'What is a variable?',
      context: mockContext,
      requestType: 'question',
    };

    const request2: AssistantRequest = {
      message: 'What is a function?',
      context: mockContext,
      requestType: 'question',
    };

    await service.sendMessage(request1);
    await service.sendMessage(request2);

    // Should have 2 cache entries
    expect(apiCache.size()).toBe(2);
  });

  it('should generate different cache keys for different days', async () => {
    const request1: AssistantRequest = {
      message: 'What is a variable?',
      context: { ...mockContext, currentDay: 1 },
      requestType: 'question',
    };

    const request2: AssistantRequest = {
      message: 'What is a variable?',
      context: { ...mockContext, currentDay: 2 },
      requestType: 'question',
    };

    await service.sendMessage(request1);
    await service.sendMessage(request2);

    // Should have 2 cache entries (different days)
    expect(apiCache.size()).toBe(2);
  });

  it('should generate different cache keys for different languages', async () => {
    const request1: AssistantRequest = {
      message: 'What is a variable?',
      context: { ...mockContext, languageId: 'python' },
      requestType: 'question',
    };

    const request2: AssistantRequest = {
      message: 'What is a variable?',
      context: { ...mockContext, languageId: 'javascript' },
      requestType: 'question',
    };

    await service.sendMessage(request1);
    await service.sendMessage(request2);

    // Should have 2 cache entries (different languages)
    expect(apiCache.size()).toBe(2);
  });

  it('should generate different cache keys for different request types', async () => {
    const request1: AssistantRequest = {
      message: 'Help me with this code',
      context: mockContext,
      requestType: 'question',
    };

    const request2: AssistantRequest = {
      message: 'Help me with this code',
      context: mockContext,
      requestType: 'code-help',
    };

    await service.sendMessage(request1);
    await service.sendMessage(request2);

    // Should have 2 cache entries (different request types)
    expect(apiCache.size()).toBe(2);
  });

  it('should normalize messages for cache key generation', async () => {
    const request1: AssistantRequest = {
      message: 'What is a variable?',
      context: mockContext,
      requestType: 'question',
    };

    const request2: AssistantRequest = {
      message: '  WHAT   IS   A   VARIABLE?  ', // Different spacing and case
      context: mockContext,
      requestType: 'question',
    };

    await service.sendMessage(request1);
    const response2 = await service.sendMessage(request2);

    // Should use cache (only 1 entry)
    expect(apiCache.size()).toBe(1);
  });

  it('should invalidate cache for specific language and day', async () => {
    const request: AssistantRequest = {
      message: 'What is a variable?',
      context: mockContext,
      requestType: 'question',
    };

    await service.sendMessage(request);
    expect(apiCache.size()).toBeGreaterThan(0);

    // Invalidate cache for python day 1
    service.invalidateCache('python', 1);

    // Cache should be cleared for this context
    const cachedResponse = apiCache.get('ai-assistant:python:day1:question:*');
    expect(cachedResponse).toBeNull();
  });

  it('should clear all caches', async () => {
    const request1: AssistantRequest = {
      message: 'What is a variable?',
      context: mockContext,
      requestType: 'question',
    };

    const request2: AssistantRequest = {
      message: 'What is a function?',
      context: mockContext,
      requestType: 'question',
    };

    await service.sendMessage(request1);
    await service.sendMessage(request2);
    expect(apiCache.size()).toBeGreaterThan(0);

    // Clear all caches
    service.clearAllCaches();

    // Cache should be empty
    expect(apiCache.size()).toBe(0);
  });

  it('should provide cache statistics', async () => {
    const request: AssistantRequest = {
      message: 'What is a variable?',
      context: mockContext,
      requestType: 'question',
    };

    await service.sendMessage(request);

    const stats = service.getCacheStats();
    expect(stats).toBeDefined();
    expect(stats.size).toBeGreaterThan(0);
    expect(stats.contextCacheStats).toBeDefined();
  });
});
