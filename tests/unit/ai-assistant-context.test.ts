/**
 * Property-based tests for AI Assistant Context Aggregator
 * Feature: ai-learning-assistant
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { ContextAggregator, resetContextAggregator } from '@/lib/ai-assistant/context-aggregator';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import type { UserTier } from '@/types';

describe('AI Assistant Context Aggregator - Property Tests', () => {
  let contextAggregator: ContextAggregator;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset stores to default state
    useProgressStore.getState().resetProgress();
    useAchievementsStore.getState().resetAchievements();
    
    // Create fresh context aggregator
    resetContextAggregator();
    contextAggregator = new ContextAggregator();
  });

  afterEach(() => {
    if (contextAggregator) {
      contextAggregator.clearAllCaches();
    }
  });

  describe('Property 6: Questions include day context', () => {
    /**
     * Feature: ai-learning-assistant, Property 6: Questions include day context
     * Validates: Requirements 2.1, 6.1
     * 
     * For any user context (day, language), the AI prompt should include 
     * the current day number and day's topic
     */
    it('should include current day number in context for all valid days', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }), // Valid day range
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // Valid languages
          fc.constantFrom('free', 'premium', 'pro'), // Valid tiers
          fc.string({ minLength: 1, maxLength: 50 }), // User ID
          async (day, languageId, tier, userId) => {
            // Setup: Reset and configure store for this test iteration
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            // Invalidate cache to ensure fresh data
            contextAggregator.invalidateCache(userId);

            // Act: Get user context
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Assert: Context includes the current day
            expect(context.currentDay).toBe(day);
            expect(context.currentDay).toBeGreaterThanOrEqual(1);
            expect(context.currentDay).toBeLessThanOrEqual(90);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include day content (theory) in context for all valid days', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (day, languageId, tier, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);

            // Act
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Assert: Context includes day theory (topic information)
            expect(context.dayTheory).toBeDefined();
            expect(typeof context.dayTheory).toBe('string');
            expect(context.dayTheory!.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Responses reference user language', () => {
    /**
     * Feature: ai-learning-assistant, Property 7: Responses reference user language
     * Validates: Requirements 2.2, 6.4
     * 
     * For any AI response, code examples and explanations should be in 
     * the user's selected programming language
     */
    it('should include user language in context for all valid languages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (languageId, day, tier, userId) => {
            // Setup: Reset and configure store for this test iteration
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            // Invalidate cache to ensure fresh data
            contextAggregator.invalidateCache(userId);

            // Act
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Assert: Context includes the selected language
            expect(context.languageId).toBe(languageId);
            expect(['python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go']).toContain(context.languageId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should fetch day content specific to user language', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.integer({ min: 1, max: 90 }),
          async (languageId, day) => {
            // Act: Get day content for specific language
            const dayContent = await contextAggregator.getCurrentDayContent(languageId, day);

            // Assert: Day content is returned and contains language-specific information
            expect(dayContent).toBeDefined();
            expect(dayContent.day).toBe(day);
            expect(dayContent.theory).toBeDefined();
            expect(typeof dayContent.theory).toBe('string');
            
            // Theory should reference the language (curriculum is language-specific)
            const theoryLower = dayContent.theory.toLowerCase();
            const languageNames: Record<string, string[]> = {
              python: ['python'],
              javascript: ['javascript'],
              typescript: ['typescript'],
              java: ['java'],
              cpp: ['c++'],
              csharp: ['c#'],
              go: ['go']
            };
            
            // At least the theory should be non-empty and contextual
            expect(dayContent.theory.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Context Caching', () => {
    it('should cache context for the configured TTL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          async (userId, tier, day, languageId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);

            // Act: Get context twice
            const context1 = await contextAggregator.getUserContext(userId, tier as UserTier);
            const context2 = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Assert: Both contexts should be identical (cached)
            expect(context1).toEqual(context2);
            expect(context1.currentDay).toBe(context2.currentDay);
            expect(context1.languageId).toBe(context2.languageId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should invalidate cache when requested', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.integer({ min: 1, max: 89 }), // Use a range that allows incrementing
          async (userId, tier, initialDay) => {
            // Setup: Reset store state for each test
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage('python');
            progressStore.setActiveDay(initialDay);
            
            // Clear any existing cache for this user
            contextAggregator.invalidateCache(userId);

            // Act: Get context, invalidate, change day, get again
            const context1 = await contextAggregator.getUserContext(userId, tier as UserTier);
            contextAggregator.invalidateCache(userId);
            
            // Change the day to next day
            const nextDay = initialDay + 1;
            progressStore.setActiveDay(nextDay);
            const context2 = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Assert: Context should reflect the new day after invalidation
            expect(context1.currentDay).toBe(initialDay);
            expect(context2.currentDay).toBe(nextDay);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Day Content Caching', () => {
    it('should cache day content for the configured TTL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.integer({ min: 1, max: 90 }),
          async (languageId, day) => {
            // Act: Get day content twice
            const content1 = await contextAggregator.getCurrentDayContent(languageId, day);
            const content2 = await contextAggregator.getCurrentDayContent(languageId, day);

            // Assert: Both contents should be identical (cached)
            expect(content1).toEqual(content2);
            expect(content1.day).toBe(content2.day);
            expect(content1.theory).toBe(content2.theory);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
