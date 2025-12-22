/**
 * Property-based tests for AI Assistant Progress Inclusion
 * Feature: ai-learning-assistant
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { ContextAggregator, resetContextAggregator } from '@/lib/ai-assistant/context-aggregator';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import type { UserTier } from '@/types';

describe('AI Assistant Progress Inclusion - Property Tests', () => {
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

  describe('Property 16: Progress is analyzed for advice', () => {
    /**
     * Feature: ai-learning-assistant, Property 16: Progress is analyzed for advice
     * Validates: Requirements 4.1
     * 
     * For any advice request, the system should fetch and include 
     * the user's progress history in the AI prompt
     */
    it('should include completed days in context for all users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }), // User ID
          fc.constantFrom('free', 'premium', 'pro'), // Tier
          fc.array(fc.integer({ min: 1, max: 90 }), { minLength: 0, maxLength: 30 }), // Completed days
          async (userId, tier, completedDays) => {
            // Setup: Reset stores for this iteration
            const progressStore = useProgressStore.getState();
            const achievementsStore = useAchievementsStore.getState();
            progressStore.resetProgress();
            achievementsStore.resetAchievements();
            contextAggregator.invalidateCache(userId);

            const uniqueCompletedDays = Array.from(new Set(completedDays)).sort((a, b) => a - b);

            // Mark each day as complete
            for (const day of uniqueCompletedDays) {
              progressStore.setActiveDay(day);
              progressStore.markDayComplete(day);
            }

            // Act: Get user context
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Assert: Context includes completed days
            expect(context.completedDays).toBeDefined();
            expect(Array.isArray(context.completedDays)).toBe(true);
            expect(context.completedDays.length).toBe(uniqueCompletedDays.length);

            // All completed days should be in the context
            uniqueCompletedDays.forEach(day => {
              expect(context.completedDays).toContain(day);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include progress history through getUserProgress', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.array(fc.integer({ min: 1, max: 90 }), { minLength: 0, maxLength: 20 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          async (userId, completedDays, languageId) => {
            // Setup: Reset stores for this iteration
            const progressStore = useProgressStore.getState();
            const achievementsStore = useAchievementsStore.getState();
            progressStore.resetProgress();
            achievementsStore.resetAchievements();

            progressStore.setLanguage(languageId);

            const uniqueCompletedDays = Array.from(new Set(completedDays)).sort((a, b) => a - b);
            for (const day of uniqueCompletedDays) {
              progressStore.setActiveDay(day);
              progressStore.markDayComplete(day);
            }

            // Act: Get user progress
            const progress = await contextAggregator.getUserProgress(userId);

            // Assert: Progress includes all completed days
            expect(progress.completedDays).toBeDefined();
            expect(progress.completedDays.length).toBe(uniqueCompletedDays.length);
            expect(progress.languageId).toBe(languageId);

            // Verify all completed days are present
            uniqueCompletedDays.forEach(day => {
              expect(progress.completedDays).toContain(day);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 17: Recommendations consider metrics', () => {
    /**
     * Feature: ai-learning-assistant, Property 17: Recommendations consider metrics
     * Validates: Requirements 4.2
     * 
     * For any recommendation request, the AI prompt should include 
     * completed days, achievements, and struggle areas
     */
    it('should include achievement stats in context for all users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.integer({ min: 0, max: 100 }), // Total tasks completed
          fc.integer({ min: 0, max: 30 }), // Current streak
          async (userId, tier, totalTasks, streak) => {
            // Setup: Reset stores for this iteration
            const progressStore = useProgressStore.getState();
            const achievementsStore = useAchievementsStore.getState();
            progressStore.resetProgress();
            achievementsStore.resetAchievements();
            contextAggregator.invalidateCache(userId);

            // Update achievement stats
            achievementsStore.updateStats({
              totalTasksCompleted: totalTasks,
              currentStreak: streak,
            });

            // Act: Get user context
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Assert: Context includes achievement metrics
            expect(context.totalTasksCompleted).toBe(totalTasks);
            expect(context.currentStreak).toBe(streak);
            expect(context.totalTasksCompleted).toBeGreaterThanOrEqual(0);
            expect(context.currentStreak).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include all achievement data through getUserAchievements', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 0, max: 90 }), // Completed days
          fc.integer({ min: 0, max: 50 }), // Current streak
          fc.integer({ min: 0, max: 50 }), // Longest streak
          fc.integer({ min: 0, max: 500 }), // Total tasks
          async (userId, completedDays, currentStreak, longestStreak, totalTasks) => {
            // Setup: Update comprehensive stats
            const achievementsStore = useAchievementsStore.getState();
            achievementsStore.updateStats({
              completedDays,
              currentStreak,
              longestStreak,
              totalTasksCompleted: totalTasks,
            });

            // Act: Get user achievements
            const achievements = await contextAggregator.getUserAchievements(userId);

            // Assert: All stats are included
            expect(achievements.stats).toBeDefined();
            expect(achievements.stats.completedDays).toBe(completedDays);
            expect(achievements.stats.currentStreak).toBe(currentStreak);
            expect(achievements.stats.longestStreak).toBe(longestStreak);
            expect(achievements.stats.totalTasksCompleted).toBe(totalTasks);

            // Unlocked achievements array should exist
            expect(Array.isArray(achievements.unlockedAchievements)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include both progress and achievements in full context', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.array(fc.integer({ min: 1, max: 90 }), { minLength: 0, maxLength: 15 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 30 }),
          async (userId, tier, completedDays, totalTasks, streak) => {
            // Setup: Reset stores for this iteration
            const progressStore = useProgressStore.getState();
            const achievementsStore = useAchievementsStore.getState();
            progressStore.resetProgress();
            achievementsStore.resetAchievements();
            contextAggregator.invalidateCache(userId);

            const uniqueCompletedDays = Array.from(new Set(completedDays)).sort((a, b) => a - b);
            for (const day of uniqueCompletedDays) {
              progressStore.setActiveDay(day);
              progressStore.markDayComplete(day);
            }

            achievementsStore.updateStats({
              totalTasksCompleted: totalTasks,
              currentStreak: streak,
            });

            // Act: Get full user context
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Assert: Context includes both progress and achievement metrics
            expect(context.completedDays.length).toBe(uniqueCompletedDays.length);
            expect(context.totalTasksCompleted).toBe(totalTasks);
            expect(context.currentStreak).toBe(streak);

            // Verify completed days match
            uniqueCompletedDays.forEach(day => {
              expect(context.completedDays).toContain(day);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should track struggle areas through incomplete tasks', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.integer({ min: 1, max: 90 }),
          fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 1, maxLength: 5 }), // minLength: 1 to ensure at least one task
          async (userId, tier, day, completedTasks) => {
            // Setup: Reset stores for this iteration
            const progressStore = useProgressStore.getState();
            const achievementsStore = useAchievementsStore.getState();
            progressStore.resetProgress();
            achievementsStore.resetAchievements();
            contextAggregator.invalidateCache(userId);

            progressStore.setActiveDay(day);

            // Complete some tasks (filter out duplicates)
            const uniqueTasks = Array.from(new Set(completedTasks));
            for (const taskId of uniqueTasks) {
              progressStore.toggleTask(day, taskId);
            }

            // Act: Get user context
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Assert: Context includes day state with completed tasks
            // Day state should exist after toggling tasks
            if (uniqueTasks.length > 0) {
              expect(context.dayState).toBeDefined();
              expect(context.dayState!.completedTasks).toBeDefined();
              expect(Array.isArray(context.dayState!.completedTasks)).toBe(true);

              // All completed tasks should be in the day state
              uniqueTasks.forEach(taskId => {
                expect(context.dayState!.completedTasks).toContain(taskId);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Context Completeness', () => {
    it('should provide complete context with all required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          async (userId, tier, day, languageId) => {
            // Setup: Reset stores for this iteration
            const progressStore = useProgressStore.getState();
            const achievementsStore = useAchievementsStore.getState();
            progressStore.resetProgress();
            achievementsStore.resetAchievements();
            contextAggregator.invalidateCache(userId);

            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);

            // Act: Get user context
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Assert: All required fields are present
            expect(context.userId).toBe(userId);
            expect(context.tier).toBe(tier);
            expect(context.currentDay).toBe(day);
            expect(context.languageId).toBe(languageId);
            expect(context.completedDays).toBeDefined();
            expect(context.currentStreak).toBeDefined();
            expect(context.totalTasksCompleted).toBeDefined();
            expect(context.dayTheory).toBeDefined();
            expect(context.recentMessages).toBeDefined();

            // Verify types
            expect(typeof context.userId).toBe('string');
            expect(typeof context.tier).toBe('string');
            expect(typeof context.currentDay).toBe('number');
            expect(typeof context.languageId).toBe('string');
            expect(Array.isArray(context.completedDays)).toBe(true);
            expect(typeof context.currentStreak).toBe('number');
            expect(typeof context.totalTasksCompleted).toBe('number');
            expect(Array.isArray(context.recentMessages)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
