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
  
  // Sync state
  isSyncing: boolean;
  lastSyncTime: number;
  syncError: Error | null;
  queuedOperations: any[];
  
  // Original methods
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
  
  // Sync methods
  syncToCloud: () => Promise<void>;
  fetchFromCloud: () => Promise<void>;
  addToQueue: (operation: any) => void;
  processQueue: () => Promise<void>;
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
    (set, get) => ({
      activeDay: 1,
      languageId: 'python',
      dayStates: { 1: defaultDayState },
      record: defaultRecord,
      
      // Sync state
      isSyncing: false,
      lastSyncTime: 0,
      syncError: null,
      queuedOperations: [],
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

          const newState = {
            dayStates: {
              ...state.dayStates,
              [day]: {
                ...snapshot,
                completedTasks,
                lastUpdated: Date.now()
              }
            }
          };
          
          // Trigger immediate sync to cloud
          setTimeout(async () => {
            const { syncManager } = await import('@/lib/sync');
            const { getCurrentUser } = await import('@/lib/supabase/auth');
            const user = await getCurrentUser();
            if (user) {
              await syncManager.syncTaskCompletion(String(day), taskId, !alreadyCompleted);
            }
          }, 0);
          
          return newState;
        }),
      updateCode: (day, code) =>
        set((state) => {
          const newState = {
            dayStates: {
              ...state.dayStates,
              [day]: {
                ...(state.dayStates[day] ?? defaultDayState),
                code,
                lastUpdated: Date.now()
              }
            }
          };
          
          // Trigger debounced sync to cloud
          setTimeout(async () => {
            const { syncManager } = await import('@/lib/sync');
            const { getCurrentUser } = await import('@/lib/supabase/auth');
            const user = await getCurrentUser();
            if (user) {
              syncManager.syncCode(String(day), 'code', code);
            }
          }, 0);
          
          return newState;
        }),
      updateNotes: (day, notes) =>
        set((state) => {
          const newState = {
            dayStates: {
              ...state.dayStates,
              [day]: {
                ...(state.dayStates[day] ?? defaultDayState),
                notes,
                lastUpdated: Date.now()
              }
            }
          };
          
          // Trigger debounced sync to cloud
          setTimeout(async () => {
            const { syncManager } = await import('@/lib/sync');
            const { getCurrentUser } = await import('@/lib/supabase/auth');
            const user = await getCurrentUser();
            if (user) {
              syncManager.syncNotes(String(day), notes);
            }
          }, 0);
          
          return newState;
        }),
      updateRecapAnswer: (day, answer) =>
        set((state) => {
          const newState = {
            dayStates: {
              ...state.dayStates,
              [day]: {
                ...(state.dayStates[day] ?? defaultDayState),
                recapAnswer: answer,
                lastUpdated: Date.now()
              }
            }
          };
          
          // Trigger debounced sync to cloud
          setTimeout(async () => {
            const { syncManager } = await import('@/lib/sync');
            const { getCurrentUser } = await import('@/lib/supabase/auth');
            const user = await getCurrentUser();
            if (user) {
              syncManager.syncRecapAnswer(String(day), answer);
            }
          }, 0);
          
          return newState;
        }),
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

          const newState = {
            record: {
              completedDays,
              lastActiveDay: day,
              streak: completedDays.length,
              history: [...state.record.history, historyEntry]
            }
          };
          
          // Trigger immediate sync to cloud
          setTimeout(async () => {
            const { syncManager } = await import('@/lib/sync');
            const { getCurrentUser } = await import('@/lib/supabase/auth');
            const user = await getCurrentUser();
            if (user) {
              await syncManager.syncDayCompletion(String(day), true);
            }
          }, 0);
          
          return newState;
        }),
      resetProgress: () =>
        set({
          activeDay: 1,
          dayStates: { 1: defaultDayState },
          record: defaultRecord
        }),
      
      // Sync methods
      syncToCloud: async () => {
        const state = get();
        const { getCurrentUser } = await import('@/lib/supabase/auth');
        const { upsertProgress } = await import('@/lib/supabase/database');
        
        const user = await getCurrentUser();
        if (!user) {
          console.log('No user logged in, skipping sync');
          return;
        }
        
        set({ isSyncing: true, syncError: null });
        
        try {
          const result = await upsertProgress({
            userId: user.id,
            dayStates: state.dayStates,
            record: state.record,
            languageId: state.languageId,
            activeDay: state.activeDay
          });
          
          if (result.error) {
            throw result.error;
          }
          
          set({ isSyncing: false, lastSyncTime: Date.now() });
          console.log('✅ Progress synced to cloud');
        } catch (error) {
          set({ isSyncing: false, syncError: error as Error });
          console.error('❌ Failed to sync progress:', error);
        }
      },
      
      fetchFromCloud: async () => {
        const { getCurrentUser } = await import('@/lib/supabase/auth');
        const { fetchProgress } = await import('@/lib/supabase/database');
        
        const user = await getCurrentUser();
        if (!user) {
          console.log('No user logged in, skipping fetch');
          return;
        }
        
        set({ isSyncing: true, syncError: null });
        
        try {
          const result = await fetchProgress(user.id);
          
          if (result.error) {
            throw result.error;
          }
          
          if (result.data) {
            set({
              dayStates: result.data.dayStates,
              record: result.data.record,
              languageId: result.data.languageId,
              activeDay: result.data.activeDay,
              isSyncing: false,
              lastSyncTime: Date.now()
            });
            console.log('✅ Progress fetched from cloud');
          } else {
            set({ isSyncing: false });
          }
        } catch (error) {
          set({ isSyncing: false, syncError: error as Error });
          console.error('❌ Failed to fetch progress:', error);
        }
      },
      
      addToQueue: (operation) => {
        set((state) => ({
          queuedOperations: [...state.queuedOperations, operation]
        }));
      },
      
      processQueue: async () => {
        // TODO: Implement in next task
        console.log('processQueue called - not yet implemented');
      }
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

