/**
 * Sync Hook
 * Manages synchronization on app load and auth state changes
 */

import { useEffect, useRef, useCallback } from 'react';
import { syncManager } from '@/lib/sync';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { useProfileStore } from '@/store/profile-store';
import { getCurrentUser } from '@/lib/supabase/auth';
import { resolveProgressConflict } from '@/lib/sync/conflict-resolution';

/**
 * Hook to initialize sync on app load
 */
export function useSync() {
  const initialized = useRef(false);
  const progressStore = useProgressStore();
  const achievementsStore = useAchievementsStore();
  const profileStore = useProfileStore();

  /**
   * Sync progress data from cloud
   */
  const syncProgress = useCallback(async () => {
    try {
      const remoteData = await syncManager.fetchFromCloud('progress');
      
      if (!remoteData || remoteData.length === 0) {
        console.log('[useSync] No remote progress data found');
        return;
      }

      const localState = progressStore.dayStates;
      const mergedStates: any = { ...localState };

      // Merge each day's data
      for (const remoteDay of remoteData) {
        const day = remoteDay.topic_id;
        const localDay = localState[day];

        if (localDay) {
          // Resolve conflict
          const resolution = resolveProgressConflict(
            {
              ...localDay,
              updated_at: localDay.lastUpdated,
            },
            {
              code: remoteDay.code,
              notes: remoteDay.notes,
              completedTasks: remoteDay.completed_tasks || [],
              recapAnswer: remoteDay.recap_answer,
              updated_at: remoteDay.updated_at,
            }
          );

          if (resolution.resolved) {
            mergedStates[day] = {
              code: resolution.resolved.code || '',
              notes: resolution.resolved.notes || '',
              completedTasks: resolution.resolved.completedTasks || [],
              recapAnswer: resolution.resolved.recapAnswer || '',
              isLocked: false,
              lastUpdated: new Date(resolution.resolved.updated_at).getTime(),
            };
          }
        } else {
          // No local data, use remote
          mergedStates[day] = {
            code: remoteDay.code || '',
            notes: remoteDay.notes || '',
            completedTasks: remoteDay.completed_tasks || [],
            recapAnswer: remoteDay.recap_answer || '',
            isLocked: false,
            lastUpdated: new Date(remoteDay.updated_at).getTime(),
          };
        }
      }

      // Update store with merged data
      useProgressStore.setState({ dayStates: mergedStates });
      console.log('[useSync] Progress data synced from cloud');
    } catch (error) {
      console.error('[useSync] Failed to sync progress:', error);
    }
  }, [progressStore]);

  /**
   * Sync achievements data from cloud
   */
  const syncAchievements = useCallback(async () => {
    try {
      const remoteData = await syncManager.fetchFromCloud('achievement');
      
      if (!remoteData || remoteData.length === 0) {
        console.log('[useSync] No remote achievements data found');
        return;
      }

      // Merge unlocked achievements
      const localUnlocked = achievementsStore.unlockedAchievements;
      const remoteUnlocked = remoteData.map((a: any) => a.achievement_id);
      const mergedUnlocked = Array.from(new Set([...localUnlocked, ...remoteUnlocked]));

      useAchievementsStore.setState({ unlockedAchievements: mergedUnlocked });
      console.log('[useSync] Achievements data synced from cloud');
    } catch (error) {
      console.error('[useSync] Failed to sync achievements:', error);
    }
  }, [achievementsStore]);

  /**
   * Sync profile data from cloud
   */
  const syncProfile = useCallback(async () => {
    try {
      const remoteData = await syncManager.fetchFromCloud('profile');
      
      if (!remoteData) {
        console.log('[useSync] No remote profile data found');
        return;
      }

      // Use remote data if it's newer
      const localUpdated = profileStore.profile.joinedAt || 0;
      const remoteUpdated = new Date(remoteData.updated_at).getTime();

      if (remoteUpdated > localUpdated) {
        profileStore.updateProfile({
          name: remoteData.name || profileStore.profile.name,
          preferredLanguage: remoteData.preferred_language || profileStore.profile.preferredLanguage,
          telegramUsername: remoteData.telegram_username || profileStore.profile.telegramUsername,
          bio: remoteData.bio,
          githubUsername: remoteData.github_username,
        });
        console.log('[useSync] Profile data synced from cloud');
      }
    } catch (error) {
      console.error('[useSync] Failed to sync profile:', error);
    }
  }, [profileStore]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeSync = async () => {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          console.log('[useSync] No user logged in, skipping sync initialization');
          return;
        }

        console.log('[useSync] Initializing sync for user:', user.id);
        
        // Initialize sync manager with user ID
        syncManager.initialize(user.id);

        // Fetch and merge progress data
        await syncProgress();
        
        // Fetch and merge achievements data
        await syncAchievements();
        
        // Fetch and merge profile data
        await syncProfile();

        console.log('[useSync] Sync initialization complete');
      } catch (error) {
        console.error('[useSync] Failed to initialize sync:', error);
      }
    };

    initializeSync();

    // Cleanup on unmount
    return () => {
      syncManager.flushAll();
    };
  }, [syncProgress, syncAchievements, syncProfile]);

  return {
    syncProgress,
    syncAchievements,
    syncProfile,
  };
}

/**
 * Hook to sync on auth state changes
 */
export function useSyncOnAuth() {
  const { syncProgress, syncAchievements, syncProfile } = useSync();

  useEffect(() => {
    const checkAuthAndSync = async () => {
      const user = await getCurrentUser();
      
      if (user) {
        // User logged in, sync data
        await syncProgress();
        await syncAchievements();
        await syncProfile();
      } else {
        // User logged out, clear sync manager
        syncManager.clear();
      }
    };

    checkAuthAndSync();
  }, [syncProgress, syncAchievements, syncProfile]);
}
