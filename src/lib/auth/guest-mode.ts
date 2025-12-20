/**
 * Guest Mode Manager
 * Handles guest user sessions and data migration to authenticated accounts
 */

import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { useProfileStore } from '@/store/profile-store';
import { useAnalyticsStore } from '@/store/analytics-store';
import { usePlaygroundStore } from '@/store/playground-store';
import { logInfo, logError } from '@/lib/core/logger';
import type { DayStateSnapshot, ProgressRecord, UserStats, Profile } from '@/types';

const GUEST_ID_KEY = 'vibestudy_guest_id';
const GUEST_DATA_MIGRATED_KEY = 'vibestudy_guest_data_migrated';

export interface GuestData {
  guestId: string;
  progress: {
    activeDay: number;
    languageId: string;
    dayStates: Record<number, DayStateSnapshot>;
    record: ProgressRecord;
  };
  achievements: {
    unlockedAchievements: string[];
    stats: UserStats;
  };
  profile: Profile;
  analytics: Record<string, unknown>;
  playground: Record<string, unknown>;
  createdAt: number;
}

export class GuestModeManager {
  /**
   * Initialize guest mode and return guest ID
   * Creates a new guest ID if one doesn't exist
   */
  static initGuestMode(): string {
    if (typeof window === 'undefined') {
      return '';
    }

    let guestId = localStorage.getItem(GUEST_ID_KEY);
    
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(GUEST_ID_KEY, guestId);
      logInfo('Guest mode initialized', { component: 'GuestModeManager' });
    }
    
    return guestId;
  }

  /**
   * Check if currently in guest mode
   */
  static isGuestMode(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return !!localStorage.getItem(GUEST_ID_KEY);
  }

  /**
   * Get current guest ID
   */
  static getGuestId(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem(GUEST_ID_KEY);
  }

  /**
   * Collect all guest data from stores
   */
  static collectGuestData(): GuestData | null {
    const guestId = this.getGuestId();
    
    if (!guestId) {
      return null;
    }

    try {
      const progressState = useProgressStore.getState();
      const achievementsState = useAchievementsStore.getState();
      const profileState = useProfileStore.getState();
      const analyticsState = useAnalyticsStore.getState();
      const playgroundState = usePlaygroundStore.getState();

      return {
        guestId,
        progress: {
          activeDay: progressState.activeDay,
          languageId: progressState.languageId,
          dayStates: progressState.dayStates,
          record: progressState.record,
        },
        achievements: {
          unlockedAchievements: achievementsState.unlockedAchievements.map(a => a.id),
          stats: achievementsState.stats,
        },
        profile: {
          id: profileState.profile.id,
          username: profileState.profile.name || 'Guest',
          created_at: new Date(profileState.profile.joinedAt).toISOString(),
          metadata: {
            bio: profileState.profile.bio,
            preferredLanguage: profileState.profile.preferredLanguage,
          },
        },
        analytics: {
          taskAttempts: analyticsState.taskAttempts,
          topicMastery: analyticsState.topicMastery,
          learningVelocity: analyticsState.learningVelocity,
        },
        playground: {
          savedSnippets: playgroundState.snippets,
        },
        createdAt: Date.now(),
      };
    } catch (error) {
      logError('Failed to collect guest data', error as Error, { component: 'GuestModeManager' });
      return null;
    }
  }

  /**
   * Migrate guest data to authenticated user account
   * This should be called after successful authentication
   */
  static async migrateGuestToUser(userId: string): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    const guestData = this.collectGuestData();
    
    if (!guestData) {
      logInfo('No guest data to migrate', { component: 'GuestModeManager', userId });
      return false;
    }

    try {
      logInfo('Starting guest data migration', { 
        component: 'GuestModeManager'
      });

      // Import sync manager to push data to cloud
      const { syncManager } = await import('@/lib/sync');
      
      // Sync all guest data to the authenticated user's account
      await syncManager.syncAllData({
        userId,
        ...guestData.progress,
        achievements: guestData.achievements,
        profile: guestData.profile,
        analytics: guestData.analytics,
        playground: guestData.playground,
      });

      // Mark migration as complete
      localStorage.setItem(GUEST_DATA_MIGRATED_KEY, 'true');
      
      // Clear guest ID after successful migration
      localStorage.removeItem(GUEST_ID_KEY);
      
      logInfo('Guest data migration completed', { 
        component: 'GuestModeManager'
      });

      return true;
    } catch (error) {
      logError('Failed to migrate guest data', error as Error, { 
        component: 'GuestModeManager', 
        userId 
      });
      return false;
    }
  }

  /**
   * Check if guest data has been migrated
   */
  static hasDataBeenMigrated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return localStorage.getItem(GUEST_DATA_MIGRATED_KEY) === 'true';
  }

  /**
   * Clear guest mode data (use with caution)
   */
  static clearGuestData(): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_DATA_MIGRATED_KEY);
    logInfo('Guest data cleared', { component: 'GuestModeManager' });
  }

  /**
   * Start as guest - initialize guest mode and redirect to learning
   */
  static startAsGuest(): string {
    const guestId = this.initGuestMode();
    logInfo('User started as guest', { component: 'GuestModeManager' });
    return guestId;
  }

  /**
   * Check if user should see account creation prompt
   * Returns true if user completed first day and hasn't created account
   */
  static shouldPromptAccountCreation(): boolean {
    if (!this.isGuestMode()) {
      return false;
    }

    const progressState = useProgressStore.getState();
    const hasCompletedFirstDay = progressState.record.completedDays.includes(1);
    
    return hasCompletedFirstDay && !this.hasDataBeenMigrated();
  }
}
