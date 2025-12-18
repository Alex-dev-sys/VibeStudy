/**
 * Database Helper Functions
 * Provides type-safe wrappers for Supabase database operations
 *
 * This file re-exports modularized database operations from ./operations/
 * Each operation type is split into its own module for better maintainability:
 *
 * - progress.ts: User progress tracking
 * - achievements.ts: Achievement unlocking and stats
 * - profiles.ts: User profile management
 * - task-attempts.ts: Task submission history
 * - topic-mastery.ts: Topic mastery tracking
 */

export * from './operations';
