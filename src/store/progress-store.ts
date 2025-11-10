import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DayStateSnapshot, ProgressRecord } from '@/types';
import { useAchievementsStore } from './achievements-store';
import { showAchievementToast } from '@/components/achievements/AchievementToast';

interface ProgressStore {
  activeDay: number;
  languageId: string;
  dayStates: Record<number, DayStateSnapshot>;
  record: ProgressRecord;
  setLanguage: (languageId: string) => void;
  setActiveDay: (day: number) => void;
  toggleTask: (day: number, taskId: string) => void;
  updateCode: (day: number, code: string) => void;
  updateNotes: (day: number, notes: string) => void;
  updateRecapAnswer: (day: number, answer: string) => void;
  resetDayTasks: (day: number) => void;
  replaceTask: (day: number, previousTaskId: string, newTaskId: string) => void;
  markDayComplete: (day: number) => void;
  resetProgress: () => void;
}

const defaultDayState: DayStateSnapshot = {
  code: '',
  notes: '',
  completedTasks: [],
  isLocked: false,
  lastUpdated: Date.now(),
  recapAnswer: ''
};

const defaultRecord: ProgressRecord = {
  completedDays: [],
  lastActiveDay: 1,
  streak: 0,
  history: []
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      activeDay: 1,
      languageId: 'python',
      dayStates: { 1: defaultDayState },
      record: defaultRecord,
      setLanguage: (languageId) => set({ languageId }),
      setActiveDay: (day) =>
        set((state) => ({
          activeDay: day,
          record: { ...state.record, lastActiveDay: day }
        })),
      toggleTask: (day, taskId) =>
        set((state) => {
          const snapshot = state.dayStates[day] ?? { ...defaultDayState, lastUpdated: Date.now() };
          const alreadyCompleted = snapshot.completedTasks.includes(taskId);
          const completedTasks = alreadyCompleted
            ? snapshot.completedTasks.filter((id) => id !== taskId)
            : [...snapshot.completedTasks, taskId];

          // Update achievements stats
          if (!alreadyCompleted) {
            const achievementsStore = useAchievementsStore.getState();
            const currentStats = achievementsStore.stats;
            
            // Determine task difficulty and update stats
            const difficulty = taskId.includes('task1') || taskId.includes('task2') ? 'easy'
              : taskId.includes('task3') ? 'medium'
              : taskId.includes('task4') ? 'hard'
              : 'challenge';
            
            const newStats = {
              totalTasksCompleted: currentStats.totalTasksCompleted + 1,
              easyTasksCompleted: difficulty === 'easy' ? currentStats.easyTasksCompleted + 1 : currentStats.easyTasksCompleted,
              mediumTasksCompleted: difficulty === 'medium' ? currentStats.mediumTasksCompleted + 1 : currentStats.mediumTasksCompleted,
              hardTasksCompleted: difficulty === 'hard' ? currentStats.hardTasksCompleted + 1 : currentStats.hardTasksCompleted,
              challengeTasksCompleted: difficulty === 'challenge' ? currentStats.challengeTasksCompleted + 1 : currentStats.challengeTasksCompleted
            };
            
            achievementsStore.updateStats(newStats);
            
            // Check for new achievements
            const newAchievements = achievementsStore.checkAndUnlockAchievements();
            newAchievements.forEach((achievement) => {
              showAchievementToast(achievement);
            });
          }

          return {
            dayStates: {
              ...state.dayStates,
              [day]: {
                ...snapshot,
                completedTasks,
                lastUpdated: Date.now()
              }
            }
          };
        }),
      updateCode: (day, code) =>
        set((state) => ({
          dayStates: {
            ...state.dayStates,
            [day]: {
              ...(state.dayStates[day] ?? defaultDayState),
              code,
              lastUpdated: Date.now()
            }
          }
        })),
      updateNotes: (day, notes) =>
        set((state) => ({
          dayStates: {
            ...state.dayStates,
            [day]: {
              ...(state.dayStates[day] ?? defaultDayState),
              notes,
              lastUpdated: Date.now()
            }
          }
        })),
      updateRecapAnswer: (day, answer) =>
        set((state) => ({
          dayStates: {
            ...state.dayStates,
            [day]: {
              ...(state.dayStates[day] ?? defaultDayState),
              recapAnswer: answer,
              lastUpdated: Date.now()
            }
          }
        })),
      resetDayTasks: (day) =>
        set((state) => ({
          dayStates: {
            ...state.dayStates,
            [day]: {
              ...(state.dayStates[day] ?? defaultDayState),
              completedTasks: [],
              lastUpdated: Date.now()
            }
          }
        })),
      replaceTask: (day, previousTaskId, newTaskId) =>
        set((state) => {
          const snapshot = state.dayStates[day] ?? { ...defaultDayState, lastUpdated: Date.now() };
          const completedTasks = snapshot.completedTasks.includes(previousTaskId)
            ? snapshot.completedTasks.map((id) => (id === previousTaskId ? newTaskId : id))
            : snapshot.completedTasks;

          return {
            dayStates: {
              ...state.dayStates,
              [day]: {
                ...snapshot,
                completedTasks,
                lastUpdated: Date.now()
              }
            }
          };
        }),
      markDayComplete: (day) =>
        set((state) => {
          if (state.record.completedDays.includes(day)) {
            return state;
          }

          const completedDays = [...state.record.completedDays, day].sort((a, b) => a - b);
          const historyEntry = {
            day,
            timestamp: Date.now(),
            notes: state.dayStates[day]?.notes
          };

          // Update achievements stats
          const achievementsStore = useAchievementsStore.getState();
          const currentStats = achievementsStore.stats;
          
          // Check if all tasks completed (perfect day)
          const dayTasks = state.dayStates[day]?.completedTasks?.length || 0;
          const isPerfectDay = dayTasks >= 5; // Assuming 5 tasks per day
          
          // Calculate streak
          const newStreak = completedDays.length > 0 && completedDays[completedDays.length - 1] === day - 1
            ? currentStats.currentStreak + 1
            : 1;
          
          const newStats = {
            completedDays: completedDays.length,
            currentStreak: newStreak,
            longestStreak: Math.max(currentStats.longestStreak, newStreak),
            perfectDays: isPerfectDay ? currentStats.perfectDays + 1 : currentStats.perfectDays
          };
          
          achievementsStore.updateStats(newStats);
          
          // Check for new achievements
          const newAchievements = achievementsStore.checkAndUnlockAchievements();
          newAchievements.forEach((achievement) => {
            showAchievementToast(achievement);
          });

          return {
            record: {
              completedDays,
              lastActiveDay: day,
              streak: completedDays.length,
              history: [...state.record.history, historyEntry]
            }
          };
        }),
      resetProgress: () =>
        set({
          activeDay: 1,
          dayStates: { 1: defaultDayState },
          record: defaultRecord
        })
    }),
    {
      name: 'vibestudy-progress',
      partialize: (state) => ({
        activeDay: state.activeDay,
        languageId: state.languageId,
        dayStates: state.dayStates,
        record: state.record
      })
    }
  )
);

export const getDayState = (day: number) => {
  const state = useProgressStore.getState().dayStates[day];
  return state ?? { ...defaultDayState, lastUpdated: Date.now() };
};

export const isDayCompleted = (day: number) => useProgressStore.getState().record.completedDays.includes(day);

