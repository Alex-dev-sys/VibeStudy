import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

interface ProfileStore {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAuthenticated: (isAuth: boolean, userData?: Partial<UserProfile>) => void;
  logout: () => void;
}

const defaultProfile: UserProfile = {
  id: 'local-user',
  name: 'Гость',
  joinedAt: Date.now(),
  preferredLanguage: 'python',
  interfaceLanguage: 'ru',
  telegramNotifications: true,
  reminderTime: '19:00',
  isAuthenticated: false
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,

      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates }
        })),

      setAuthenticated: (isAuth, userData = {}) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...userData,
            isAuthenticated: isAuth
          }
        })),

      logout: () =>
        set({
          profile: defaultProfile
        })
    }),
    {
      name: 'vibestudy-profile'
    }
  )
);

