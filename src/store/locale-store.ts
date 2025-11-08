import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/lib/i18n';
import { getTranslations } from '@/lib/i18n';
import type { Translations } from '@/lib/i18n/locales/ru';

interface LocaleStore {
  locale: Locale;
  translations: Translations;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'ru',
      translations: getTranslations('ru'),
      setLocale: (locale) =>
        set({
          locale,
          translations: getTranslations(locale)
        })
    }),
    {
      name: 'vibestudy-locale'
    }
  )
);

// Hook for easy access to translations
export function useTranslations() {
  return useLocaleStore((state) => state.translations);
}

