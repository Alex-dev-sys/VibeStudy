/**
 * Sync Manager
 * Coordinates synchronization with debouncing and conflict resolution
 */

import { syncQueue } from "./sync-queue";
import { SyncOperationType, SyncAction } from "./types";
import { DebounceManager, DEBOUNCE_DELAYS } from "./debounce";
import { getSupabaseClient } from "../supabase/client";
import { logWarn, logError, logInfo } from "@/lib/core/logger";

class SyncManager {
  private debounceManager = new DebounceManager();
  private userId: string | null = null;

  /**
   * Initialize sync manager with user ID
   */
  initialize(userId: string): void {
    this.userId = userId;
    this.setupDebouncedFunctions();
  }

  /**
   * Clear sync manager state
   */
  clear(): void {
    this.debounceManager.clear();
    this.userId = null;
  }

  /**
   * Setup debounced sync functions
   */
  private setupDebouncedFunctions(): void {
    // Code editor sync (debounced)
    this.debounceManager.register(
      "code",
      (data: any) => this.syncImmediate("progress", "update", data),
      DEBOUNCE_DELAYS.CODE_EDITOR,
    );

    // Notes sync (debounced)
    this.debounceManager.register(
      "notes",
      (data: any) => this.syncImmediate("progress", "update", data),
      DEBOUNCE_DELAYS.NOTES,
    );

    // Recap answer sync (debounced)
    this.debounceManager.register(
      "recap",
      (data: any) => this.syncImmediate("progress", "update", data),
      DEBOUNCE_DELAYS.RECAP_ANSWER,
    );

    // Profile sync (debounced)
    this.debounceManager.register(
      "profile",
      (data: any) => this.syncImmediate("profile", "update", data),
      DEBOUNCE_DELAYS.PROFILE,
    );
  }

  /**
   * Sync code changes (debounced)
   */
  syncCode(topicId: string, taskId: string, code: string): void {
    if (!this.userId) {
      logWarn("SyncManager: Cannot sync code - user not initialized");
      return;
    }

    this.debounceManager.execute("code", {
      topic_id: topicId,
      task_id: taskId,
      code,
      updated_at: Date.now(),
    });
  }

  /**
   * Sync notes changes (debounced)
   */
  syncNotes(topicId: string, notes: string): void {
    if (!this.userId) {
      logWarn("SyncManager: Cannot sync notes - user not initialized");
      return;
    }

    this.debounceManager.execute("notes", {
      topic_id: topicId,
      notes,
      updated_at: Date.now(),
    });
  }

  /**
   * Sync recap answer (debounced)
   */
  syncRecapAnswer(topicId: string, recapAnswer: string): void {
    if (!this.userId) {
      logWarn("SyncManager: Cannot sync recap - user not initialized");
      return;
    }

    this.debounceManager.execute("recap", {
      topic_id: topicId,
      recap_answer: recapAnswer,
      updated_at: Date.now(),
    });
  }

  /**
   * Sync task completion (immediate)
   */
  async syncTaskCompletion(
    topicId: string,
    taskId: string,
    completed: boolean,
  ): Promise<void> {
    if (!this.userId) {
      logWarn(
        "SyncManager: Cannot sync task completion - user not initialized",
      );
      return;
    }

    await this.syncImmediate("progress", "update", {
      topic_id: topicId,
      task_id: taskId,
      completed,
      completed_at: completed ? Date.now() : null,
      updated_at: Date.now(),
    });
  }

  /**
   * Sync day completion (immediate)
   */
  async syncDayCompletion(topicId: string, completed: boolean): Promise<void> {
    if (!this.userId) {
      logWarn("SyncManager: Cannot sync day completion - user not initialized");
      return;
    }

    await this.syncImmediate("progress", "update", {
      topic_id: topicId,
      day_completed: completed,
      day_completed_at: completed ? Date.now() : null,
      updated_at: Date.now(),
    });
  }

  /**
   * Sync achievement unlock (immediate)
   */
  async syncAchievementUnlock(achievementId: string): Promise<void> {
    if (!this.userId) {
      logWarn("SyncManager: Cannot sync achievement - user not initialized");
      return;
    }

    await this.syncImmediate("achievement", "create", {
      achievement_id: achievementId,
      unlocked_at: Date.now(),
    });
  }

  /**
   * Sync user stats (immediate)
   */
  async syncUserStats(stats: any): Promise<void> {
    if (!this.userId) {
      logWarn("SyncManager: Cannot sync user stats - user not initialized");
      return;
    }

    await this.syncImmediate("achievement", "update", {
      stats,
      updated_at: Date.now(),
    });
  }

  /**
   * Sync profile changes (debounced)
   */
  syncProfile(profileData: any): void {
    if (!this.userId) {
      logWarn("SyncManager: Cannot sync profile - user not initialized");
      return;
    }

    this.debounceManager.execute("profile", {
      ...profileData,
      updated_at: Date.now(),
    });
  }

  /**
   * Sync task attempt (immediate)
   */
  async syncTaskAttempt(attemptData: any): Promise<void> {
    if (!this.userId) {
      logWarn("SyncManager: Cannot sync task attempt - user not initialized");
      return;
    }

    await this.syncImmediate("task_attempt", "create", {
      ...attemptData,
      attempted_at: Date.now(),
    });
  }

  /**
   * Sync topic mastery (immediate)
   */
  async syncTopicMastery(topic: string, masteryData: any): Promise<void> {
    if (!this.userId) {
      logWarn("SyncManager: Cannot sync topic mastery - user not initialized");
      return;
    }

    await this.syncImmediate("topic_mastery", "update", {
      topic,
      ...masteryData,
      updated_at: Date.now(),
    });
  }

  /**
   * Immediate sync (no debouncing)
   */
  private async syncImmediate(
    type: SyncOperationType,
    action: SyncAction,
    data: any,
  ): Promise<void> {
    if (!this.userId) {
      throw new Error("User not initialized");
    }

    try {
      await syncQueue.queueOperation(type, action, data, this.userId);
    } catch (error) {
      logError("SyncManager: Failed to queue sync operation", error as Error);
      throw error;
    }
  }

  /**
   * Flush all pending debounced operations
   */
  flushAll(): void {
    this.debounceManager.flushAll();
  }

  /**
   * Cancel all pending debounced operations
   */
  cancelAll(): void {
    this.debounceManager.cancelAll();
  }

  /**
   * Check if there are pending operations
   */
  hasPending(): boolean {
    return this.debounceManager.hasPending();
  }

  /**
   * Sync all data at once (used for guest data migration)
   */
  async syncAllData(data: any): Promise<void> {
    const {
      userId,
      activeDay,
      languageId,
      dayStates,
      record,
      achievements,
      profile,
      analytics,
      playground,
    } = data;

    if (!userId) {
      throw new Error("User ID is required for syncing all data");
    }

    // Temporarily set userId for sync operations
    const previousUserId = this.userId;
    this.userId = userId;

    try {
      // Sync progress data
      if (dayStates && record) {
        await this.syncImmediate("progress", "update", {
          active_day: activeDay,
          language_id: languageId,
          day_states: dayStates,
          record: record,
          updated_at: Date.now(),
        });
      }

      // Sync achievements
      if (achievements?.unlockedAchievements) {
        for (const achievementId of achievements.unlockedAchievements) {
          await this.syncAchievementUnlock(achievementId);
        }
      }

      // Sync achievement stats
      if (achievements?.stats) {
        await this.syncUserStats(achievements.stats);
      }

      // Sync profile
      if (profile) {
        await this.syncImmediate("profile", "update", {
          ...profile,
          updated_at: Date.now(),
        });
      }

      // Note: Analytics and playground data are stored locally only
      // They can be synced through profile metadata if needed in the future

      logInfo("SyncManager: All data synced successfully");
    } catch (error) {
      logError("SyncManager: Failed to sync all data", error as Error);
      throw error;
    } finally {
      // Restore previous userId
      this.userId = previousUserId;
    }
  }

  /**
   * Fetch data from cloud
   */
  async fetchFromCloud(type: SyncOperationType): Promise<any> {
    if (!this.userId) {
      throw new Error("User not initialized");
    }

    const client = getSupabaseClient();
    if (!client) {
      throw new Error("Supabase client not available");
    }

    switch (type) {
      case "progress": {
        const { data, error } = await client
          .from("user_progress")
          .select("*")
          .eq("user_id", this.userId);

        if (error) throw error;
        return data;
      }

      case "achievement": {
        const { data, error } = await client
          .from("user_achievements")
          .select("*")
          .eq("user_id", this.userId);

        if (error) throw error;
        return data;
      }

      case "profile": {
        const { data, error } = await client
          .from("user_profiles")
          .select("*")
          .eq("user_id", this.userId)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        return data;
      }

      case "topic_mastery": {
        const { data, error } = await client
          .from("topic_mastery")
          .select("*")
          .eq("user_id", this.userId);

        if (error) throw error;
        return data;
      }

      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  }
}

// Singleton instance
export const syncManager = new SyncManager();
