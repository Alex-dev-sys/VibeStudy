import { toast } from 'sonner';

export type AuthNotificationType = 'registration' | 'login' | 'logout';
export type Locale = 'ru' | 'en';

export interface AuthNotificationConfig {
  type: AuthNotificationType;
  locale: Locale;
}

const messages: Record<AuthNotificationType, Record<Locale, string>> = {
  registration: {
    ru: 'Вы успешно зарегистрировались! Добро пожаловать в VibeStudy 🎉',
    en: 'Successfully registered! Welcome to VibeStudy 🎉'
  },
  login: {
    ru: 'Добро пожаловать! Вы успешно вошли в систему',
    en: 'Welcome back! Successfully logged in'
  },
  logout: {
    ru: 'Вы вышли из системы',
    en: 'Successfully logged out'
  }
};

/**
 * Display authentication-related notifications
 * @param config - Configuration object with notification type and locale
 */
export function showAuthNotification({ type, locale }: AuthNotificationConfig): void {
  const message = messages[type][locale];
  
  toast.success(message, {
    duration: 4000,
    position: 'top-center',
    className: 'auth-success-toast'
  });
}
