import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/lib/i18n';
import { getTranslations, defaultLocale, isValidLocale } from '@/lib/i18n';
import type { Translations } from '@/lib/i18n/locales/ru';

interface LocaleStore {
  locale: Locale;
  translations: Translations;
  hasHydrated: boolean;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      // Initialize with default locale and translations immediately
      locale: defaultLocale,
      translations: getTranslations(defaultLocale),
      hasHydrated: false,
      setLocale: (locale) => {
        // Validate locale parameter
        if (!isValidLocale(locale)) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[locale-store] Invalid locale "${locale}", using default locale "${defaultLocale}"`);
          }
          locale = defaultLocale;
        }
        
        // Update translations atomically with locale change
        set({
          locale,
          translations: getTranslations(locale)
        });
      }
    }),
    {
      name: 'vibestudy-locale',
      // Only persist locale field, translations are derived
      partialize: (state) => ({
        locale: state.locale
      }),
      // Handle hydration safely
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[locale-store] Hydration error:', error);
          return;
        }
        
        if (state) {
          // Validate and reload translations after locale is restored
          if (!isValidLocale(state.locale)) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[locale-store] Invalid persisted locale "${state.locale}", falling back to default`);
            }
            state.locale = defaultLocale;
          }
          
          // Reload translations based on restored locale
          state.translations = getTranslations(state.locale);
          state.hasHydrated = true;
        }
      }
    }
  )
);

// Hook for easy access to translations with fallback
export function useTranslations(): Translations {
  const translations = useLocaleStore((state) => state.translations);
  
  // Fallback to default if undefined (defensive programming)
  if (!translations) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[locale-store] Translations undefined, using default');
    }
    return getTranslations(defaultLocale);
  }
  
  return translations;
}

