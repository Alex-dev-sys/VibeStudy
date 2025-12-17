/**
 * Context Aggregator for AI Learning Assistant
 * Collects user data from various stores and provides context for AI requests
 */

import { AssistantContext } from './types';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { useLocaleStore } from '@/store/locale-store';
import { buildCurriculum, getDayTopic } from '@/lib/curriculum';
import type { DayContent, UserTier } from '@/types';

/**
 * Cache entry for context data
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Configuration for ContextAggregator
 */
interface ContextAggregatorConfig {
  cacheTTL: number; // Cache time-to-live in milliseconds
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ContextAggregatorConfig = {
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

/**
 * ContextAggregator class
 * Aggregates user context from progress store, achievements store, and curriculum
 */
export class ContextAggregator {
  private contextCache: Map<string, CacheEntry<AssistantContext>>;
  private dayContentCache: Map<string, CacheEntry<DayContent>>;
  private config: ContextAggregatorConfig;

  constructor(config: Partial<ContextAggregatorConfig> = {}) {
    this.contextCache = new Map();
    this.dayContentCache = new Map();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get complete user context for AI assistant
   */
  async getUserContext(userId: string, tier: UserTier): Promise<AssistantContext> {
    // Check cache first
    const cached = this.contextCache.get(userId);
    if (cached && !this.isCacheExpired(cached)) {
      return cached.data;
    }

    // Fetch fresh data
    const progressStore = useProgressStore.getState();
    const achievementsStore = useAchievementsStore.getState();

    const currentDay = progressStore.activeDay;
    const languageId = progressStore.languageId;
    const dayState = progressStore.dayStates[currentDay];
    const record = progressStore.record;
    const stats = achievementsStore.stats;

    // Get current day content
    const dayContent = await this.getCurrentDayContent(languageId, currentDay);

    // Build context
    const context: AssistantContext = {
      userId,
      tier,
      locale: 'ru',
      currentDay,
      languageId,
      dayState,
      completedDays: record.completedDays,
      currentStreak: stats.currentStreak,
      totalTasksCompleted: stats.totalTasksCompleted,
      dayTheory: dayContent?.theory,
      dayTasks: [], // Tasks are generated dynamically, not stored in curriculum
      recentMessages: [], // Will be populated by SessionManager
    };

    // Cache the context
    this.contextCache.set(userId, {
      data: context,
      timestamp: Date.now(),
    });

    return context;
  }

  /**
   * Get current day content from curriculum
   */
  async getCurrentDayContent(languageId: string, day: number): Promise<DayContent> {
    const cacheKey = `${languageId}_day${day}`;

    // Check cache first
    const cached = this.dayContentCache.get(cacheKey);
    if (cached && !this.isCacheExpired(cached)) {
      return cached.data;
    }

    // Build curriculum and get day content
    const curriculum = buildCurriculum(languageId);
    const dayContent = curriculum[day - 1];

    if (!dayContent) {
      // Fallback to day topic if curriculum doesn't have content
      const dayTopic = getDayTopic(day, languageId);
      const fallbackContent: DayContent = {
        day,
        title: dayTopic.topic,
        theory: dayTopic.description,
        focus: [],
        recapQuestion: '',
      };

      // Cache the fallback content
      this.dayContentCache.set(cacheKey, {
        data: fallbackContent,
        timestamp: Date.now(),
      });

      return fallbackContent;
    }

    // Cache the content
    this.dayContentCache.set(cacheKey, {
      data: dayContent,
      timestamp: Date.now(),
    });

    return dayContent;
  }

  /**
   * Get user progress data
   */
  async getUserProgress(userId: string): Promise<{
    completedDays: number[];
    currentStreak: number;
    totalTasksCompleted: number;
    activeDay: number;
    languageId: string;
  }> {
    const progressStore = useProgressStore.getState();
    const achievementsStore = useAchievementsStore.getState();

    return {
      completedDays: progressStore.record.completedDays,
      currentStreak: achievementsStore.stats.currentStreak,
      totalTasksCompleted: achievementsStore.stats.totalTasksCompleted,
      activeDay: progressStore.activeDay,
      languageId: progressStore.languageId,
    };
  }

  /**
   * Get user achievements and stats
   */
  async getUserAchievements(userId: string): Promise<{
    unlockedAchievements: any[];
    stats: any;
  }> {
    const achievementsStore = useAchievementsStore.getState();

    return {
      unlockedAchievements: achievementsStore.unlockedAchievements,
      stats: achievementsStore.stats,
    };
  }

  /**
   * Invalidate cache for a user
   */
  invalidateCache(userId: string): void {
    this.contextCache.delete(userId);
  }

  /**
   * Invalidate day content cache
   */
  invalidateDayContentCache(languageId: string, day: number): void {
    const cacheKey = `${languageId}_day${day}`;
    this.dayContentCache.delete(cacheKey);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.contextCache.clear();
    this.dayContentCache.clear();
  }

  /**
   * Check if a cache entry has expired
   */
  private isCacheExpired<T>(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age > this.config.cacheTTL;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    contextCacheSize: number;
    dayContentCacheSize: number;
    cacheTTL: number;
  } {
    return {
      contextCacheSize: this.contextCache.size,
      dayContentCacheSize: this.dayContentCache.size,
      cacheTTL: this.config.cacheTTL,
    };
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredCache(): void {
    // Clean context cache
    const expiredContextKeys: string[] = [];
    this.contextCache.forEach((entry, key) => {
      if (this.isCacheExpired(entry)) {
        expiredContextKeys.push(key);
      }
    });
    expiredContextKeys.forEach(key => this.contextCache.delete(key));

    // Clean day content cache
    const expiredDayContentKeys: string[] = [];
    this.dayContentCache.forEach((entry, key) => {
      if (this.isCacheExpired(entry)) {
        expiredDayContentKeys.push(key);
      }
    });
    expiredDayContentKeys.forEach(key => this.dayContentCache.delete(key));
  }
}

/**
 * Singleton instance for global use
 */
let globalContextAggregator: ContextAggregator | null = null;

/**
 * Get or create the global ContextAggregator instance
 */
export function getContextAggregator(): ContextAggregator {
  if (!globalContextAggregator) {
    globalContextAggregator = new ContextAggregator();
  }
  return globalContextAggregator;
}

/**
 * Reset the global ContextAggregator instance (useful for testing)
 */
export function resetContextAggregator(): void {
  globalContextAggregator = null;
}
