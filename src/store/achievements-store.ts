import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Achievement, UserStats } from "@/types/achievements";
import { ACHIEVEMENTS, checkNewAchievements } from "@/lib/core/achievements";
import { logInfo, logError } from "@/lib/core/logger";

interface AchievementsStore {
  unlockedAchievements: Achievement[];
  stats: UserStats;

  // Sync state
  isSyncing: boolean;
  lastSyncTime: number;

  unlockAchievement: (achievementId: string) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  checkAndUnlockAchievements: () => Achievement[];
  resetAchievements: () => void;

  // Sync methods
  syncToCloud: () => Promise<void>;
  fetchFromCloud: () => Promise<void>;
}

const defaultStats: UserStats = {
  completedDays: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalTasksCompleted: 0,
  easyTasksCompleted: 0,
  mediumTasksCompleted: 0,
  hardTasksCompleted: 0,
  challengeTasksCompleted: 0,
  perfectDays: 0,
  totalTimeSpent: 0,
};

export const useAchievementsStore = create<AchievementsStore>()(
  persist(
    (set, get) => ({
      unlockedAchievements: [],
      stats: defaultStats,

      // Sync state
      isSyncing: false,
      lastSyncTime: 0,

      unlockAchievement: (achievementId) =>
        set((state) => {
          const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
          if (!achievement) return state;

          const alreadyUnlocked = state.unlockedAchievements.some(
            (a) => a.id === achievementId,
          );
          if (alreadyUnlocked) return state;

          // Trigger sync to cloud
          setTimeout(async () => {
            const { syncManager } = await import("@/lib/sync");
            const { getCurrentUser } = await import("@/lib/supabase/auth");
            const user = await getCurrentUser();
            if (user) {
              await syncManager.syncAchievementUnlock(achievementId);
            }
          }, 0);

          return {
            unlockedAchievements: [
              ...state.unlockedAchievements,
              { ...achievement, unlockedAt: Date.now() },
            ],
          };
        }),

      updateStats: (newStats) =>
        set((state) => {
          // Trigger sync to cloud
          setTimeout(async () => {
            const { syncManager } = await import("@/lib/sync");
            const { getCurrentUser } = await import("@/lib/supabase/auth");
            const user = await getCurrentUser();
            if (user) {
              await syncManager.syncUserStats({ ...state.stats, ...newStats });
            }
          }, 0);

          return {
            stats: { ...state.stats, ...newStats },
          };
        }),

      checkAndUnlockAchievements: () => {
        const { stats, unlockedAchievements } = get();
        const unlockedIds = unlockedAchievements.map((a) => a.id);
        const newAchievements = checkNewAchievements(stats, unlockedIds);

        newAchievements.forEach((achievement) => {
          get().unlockAchievement(achievement.id);
        });

        return newAchievements.map((a) => ({ ...a, unlockedAt: Date.now() }));
      },

      resetAchievements: () =>
        set({
          unlockedAchievements: [],
          stats: defaultStats,
        }),

      // Sync methods
      syncToCloud: async () => {
        const state = get();
        const { getCurrentUser } = await import("@/lib/supabase/auth");
        const { syncManager } = await import("@/lib/sync");

        const user = await getCurrentUser();
        if (!user) {
          logInfo("No user logged in, skipping achievements sync");
          return;
        }

        set({ isSyncing: true });

        try {
          // Sync all unlocked achievements
          for (const achievement of state.unlockedAchievements) {
            await syncManager.syncAchievementUnlock(achievement.id);
          }

          // Sync stats
          await syncManager.syncUserStats(state.stats);

          set({ isSyncing: false, lastSyncTime: Date.now() });
          logInfo("Achievements synced to cloud");
        } catch (error) {
          set({ isSyncing: false });
          logError("Failed to sync achievements", error as Error);
        }
      },

      fetchFromCloud: async () => {
        const { getCurrentUser } = await import("@/lib/supabase/auth");
        const { syncManager } = await import("@/lib/sync");

        const user = await getCurrentUser();
        if (!user) {
          logInfo("No user logged in, skipping achievements fetch");
          return;
        }

        set({ isSyncing: true });

        try {
          const remoteData = await syncManager.fetchFromCloud("achievement");

          if (remoteData && remoteData.length > 0) {
            // Merge with local achievements
            const localIds = get().unlockedAchievements.map((a) => a.id);
            const remoteIds = remoteData.map((a: any) => a.achievement_id);
            const allIds = Array.from(new Set([...localIds, ...remoteIds]));

            const mergedAchievements = allIds
              .map((id) => {
                const achievement = ACHIEVEMENTS.find((a) => a.id === id);
                const remote = remoteData.find(
                  (a: any) => a.achievement_id === id,
                );
                return {
                  ...achievement!,
                  unlockedAt: remote?.unlocked_at
                    ? new Date(remote.unlocked_at).getTime()
                    : Date.now(),
                };
              })
              .filter((a) => a.id);

            set({
              unlockedAchievements: mergedAchievements,
              isSyncing: false,
              lastSyncTime: Date.now(),
            });
            logInfo("Achievements fetched from cloud");
          } else {
            set({ isSyncing: false });
          }
        } catch (error) {
          set({ isSyncing: false });
          logError("Failed to fetch achievements", error as Error);
        }
      },
    }),
    {
      name: "vibestudy-achievements",
      partialize: (state) => ({
        unlockedAchievements: state.unlockedAchievements,
        stats: state.stats,
      }),
    },
  ),
);
