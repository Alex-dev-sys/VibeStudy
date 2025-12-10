import { create } from 'zustand';
import { getTranslations } from '@/lib/i18n';
import type { Translations } from '@/lib/i18n/locales/ru';

interface LocaleStore {
  locale: 'ru';
  translations: Translations;
}

export const useLocaleStore = create<LocaleStore>()(() => ({
  locale: 'ru',
  translations: getTranslations('ru')
}));

// Hook for easy access to translations
export function useTranslations(): Translations {
  return useLocaleStore((state) => state.translations);
}

