import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Achievement, UserStats } from '@/types/achievements';
import { ACHIEVEMENTS, checkNewAchievements } from '@/lib/achievements';

interface AchievementsStore {
  unlockedAchievements: Achievement[];
  stats: UserStats;
  unlockAchievement: (achievementId: string) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  checkAndUnlockAchievements: () => Achievement[];
  resetAchievements: () => void;
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
  totalTimeSpent: 0
};

export const useAchievementsStore = create<AchievementsStore>()(
  persist(
    (set, get) => ({
      unlockedAchievements: [],
      stats: defaultStats,

      unlockAchievement: (achievementId) =>
        set((state) => {
          const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
          if (!achievement) return state;

          const alreadyUnlocked = state.unlockedAchievements.some((a) => a.id === achievementId);
          if (alreadyUnlocked) return state;

          return {
            unlockedAchievements: [
              ...state.unlockedAchievements,
              { ...achievement, unlockedAt: Date.now() }
            ]
          };
        }),

      updateStats: (newStats) =>
        set((state) => ({
          stats: { ...state.stats, ...newStats }
        })),

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
          stats: defaultStats
        })
    }),
    {
      name: 'vibestudy-achievements'
    }
  )
);

