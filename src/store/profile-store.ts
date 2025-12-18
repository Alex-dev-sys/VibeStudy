import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logInfo, logError } from "@/lib/core/logger";

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
}

interface ProfileStore {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  setAuthenticated: (isAuth: boolean, userData?: Partial<UserProfile>) => void;
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
  id: "local-user",
  name: "Гость",
  joinedAt: Date.now(),
  preferredLanguage: "python",
  interfaceLanguage: "ru",
  telegramNotifications: true,
  reminderTime: "19:00",
  isAuthenticated: false,
  privacySettings: defaultPrivacySettings,
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,

      updateProfile: (updates) =>
        set((state) => {
          const newProfile = { ...state.profile, ...updates };

          // Trigger sync to cloud with proper error handling
          queueMicrotask(async () => {
            try {
              const { syncManager } = await import("@/lib/sync");
              const { getCurrentUser } = await import("@/lib/supabase/auth");
              const user = await getCurrentUser();
              if (user) {
                await syncManager.syncProfile(newProfile);
              }
            } catch (error) {
              logError("Failed to sync profile to cloud", error as Error);
              // Profile is still updated locally, sync will retry on next update
            }
          });

          return { profile: newProfile };
        }),

      updatePrivacySettings: (settings) =>
        set((state) => {
          const newPrivacySettings = {
            ...state.profile.privacySettings,
            ...settings,
          };
          const newProfile = {
            ...state.profile,
            privacySettings: newPrivacySettings,
          };

          // Trigger sync to cloud with proper error handling
          queueMicrotask(async () => {
            try {
              const { syncManager } = await import("@/lib/sync");
              const { getCurrentUser } = await import("@/lib/supabase/auth");
              const user = await getCurrentUser();
              if (user) {
                await syncManager.syncProfile(newProfile);
              }
            } catch (error) {
              logError("Failed to sync privacy settings to cloud", error as Error);
              // Settings are still updated locally
            }
          });

          return { profile: newProfile };
        }),

      setAuthenticated: (isAuth, userData = {}) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...userData,
            isAuthenticated: isAuth,
          },
        })),

      logout: () =>
        set({
          profile: defaultProfile,
        }),

      // Sync methods
      syncToCloud: async () => {
        const { getCurrentUser } = await import("@/lib/supabase/auth");
        const { syncManager } = await import("@/lib/sync");

        const user = await getCurrentUser();
        if (!user) {
          logInfo("No user logged in, skipping profile sync");
          return;
        }

        try {
          const state = useProfileStore.getState();
          syncManager.syncProfile(state.profile);
          logInfo("Profile synced to cloud");
        } catch (error) {
          logError("Failed to sync profile", error as Error);
        }
      },

      fetchFromCloud: async () => {
        const { getCurrentUser } = await import("@/lib/supabase/auth");
        const { syncManager } = await import("@/lib/sync");

        const user = await getCurrentUser();
        if (!user) {
          logInfo("No user logged in, skipping profile fetch");
          return;
        }

        try {
          const remoteData = await syncManager.fetchFromCloud("profile");

          if (remoteData) {
            set({
              profile: {
                ...useProfileStore.getState().profile,
                name: remoteData.name,
                bio: remoteData.bio,
                preferredLanguage: remoteData.preferred_language,
                githubUsername: remoteData.github_username,
                telegramUsername: remoteData.telegram_username,
                privacySettings:
                  remoteData.privacy_settings || defaultPrivacySettings,
              },
            });
            logInfo("Profile fetched from cloud");
          }
        } catch (error) {
          logError("Failed to fetch profile", error as Error);
        }
      },
    }),
    {
      name: "vibestudy-profile",
    },
  ),
);
