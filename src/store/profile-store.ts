import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/lib/auth/roles';

export interface PrivacySettings {
  showOnLeaderboard: boolean;
  showProfile: boolean;
  showProgress: boolean;
  allowMessages: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  joinedAt: number;
  preferredLanguage: string; // язык программирования
  interfaceLanguage: string; // язык интерфейса
  goal?: string;
  githubUsername?: string;
  telegramUsername?: string; // Telegram username для бота
  telegramChatId?: number; // ID чата с ботом
  telegramNotifications: boolean; // Включены ли уведомления
  reminderTime: string; // Время напоминаний ("09:00", "14:00", "19:00", "22:00")
  isAuthenticated: boolean;
  privacySettings: PrivacySettings;
  role: UserRole;
}

interface ProfileStore {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  setAuthenticated: (isAuth: boolean, userData?: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
  
  // Sync methods
  syncToCloud: () => Promise<void>;
  fetchFromCloud: () => Promise<void>;
}

const defaultPrivacySettings: PrivacySettings = {
  showOnLeaderboard: true,
  showProfile: true,
  showProgress: true,
  allowMessages: true,
};

const defaultProfile: UserProfile = {
  id: 'local-user',
  name: 'Гость',
  joinedAt: Date.now(),
  preferredLanguage: 'python',
  interfaceLanguage: 'ru',
  telegramNotifications: true,
  reminderTime: '19:00',
  isAuthenticated: false,
  privacySettings: defaultPrivacySettings,
  role: 'student'
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,

      updateProfile: (updates) =>
        set((state) => {
          // Trigger sync to cloud
          setTimeout(async () => {
            const { syncManager } = await import('@/lib/sync');
            const { getCurrentUser } = await import('@/lib/supabase/auth');
            const user = await getCurrentUser();
            if (user) {
              syncManager.syncProfile({ ...state.profile, ...updates });
            }
          }, 0);

          return {
            profile: { ...state.profile, ...updates }
          };
        }),

      updatePrivacySettings: (settings) =>
        set((state) => {
          const newPrivacySettings = { ...state.profile.privacySettings, ...settings };
          
          // Trigger sync to cloud
          setTimeout(async () => {
            const { syncManager } = await import('@/lib/sync');
            const { getCurrentUser } = await import('@/lib/supabase/auth');
            const user = await getCurrentUser();
            if (user) {
              syncManager.syncProfile({ 
                ...state.profile, 
                privacySettings: newPrivacySettings 
              });
            }
          }, 0);

          return {
            profile: {
              ...state.profile,
              privacySettings: newPrivacySettings
            }
          };
        }),

      setAuthenticated: (isAuth, userData = {}) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...userData,
            isAuthenticated: isAuth,
            role: (userData.role as UserRole) ?? state.profile.role
          }
        })),

      setRole: (role) =>
        set((state) => {
          setTimeout(async () => {
            const { syncManager } = await import('@/lib/sync');
            syncManager.syncProfile({ ...state.profile, role });
          }, 0);
          return {
            profile: { ...state.profile, role }
          };
        }),

      logout: () =>
        set({
          profile: defaultProfile
        }),
      
      // Sync methods
      syncToCloud: async () => {
        const { getCurrentUser } = await import('@/lib/supabase/auth');
        const { syncManager } = await import('@/lib/sync');
        
        const user = await getCurrentUser();
        if (!user) {
          console.log('No user logged in, skipping profile sync');
          return;
        }
        
        try {
          const state = useProfileStore.getState();
          syncManager.syncProfile(state.profile);
          console.log('✅ Profile synced to cloud');
        } catch (error) {
          console.error('❌ Failed to sync profile:', error);
        }
      },
      
      fetchFromCloud: async () => {
        const { getCurrentUser } = await import('@/lib/supabase/auth');
        const { syncManager } = await import('@/lib/sync');
        
        const user = await getCurrentUser();
        if (!user) {
          console.log('No user logged in, skipping profile fetch');
          return;
        }
        
        try {
          const remoteData = await syncManager.fetchFromCloud('profile');
          
          if (remoteData) {
            set({
              profile: {
                ...useProfileStore.getState().profile,
                name: remoteData.name,
                bio: remoteData.bio,
                preferredLanguage: remoteData.preferred_language,
                githubUsername: remoteData.github_username,
                telegramUsername: remoteData.telegram_username,
                privacySettings: remoteData.privacy_settings || defaultPrivacySettings,
                role: (remoteData.role as UserRole) || useProfileStore.getState().profile.role
              }
            });
            console.log('✅ Profile fetched from cloud');
          }
        } catch (error) {
          console.error('❌ Failed to fetch profile:', error);
        }
      }
    }),
    {
      name: 'vibestudy-profile'
    }
  )
);

