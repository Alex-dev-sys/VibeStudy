import { ru } from './locales/ru';
import { en } from './locales/en';
import type { Translations } from './locales/ru';

export type Locale = 'ru' | 'en';

export const locales: Record<Locale, Translations> = {
  ru,
  en
};

export const defaultLocale: Locale = 'ru';

export function getTranslations(locale: Locale): Translations {
  return locales[locale] || locales[defaultLocale];
}

// Helper function to get nested translation
export function t(translations: Translations, path: string): string {
  const keys = path.split('.');
  let result: any = translations;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return path if translation not found
    }
  }
  
  return typeof result === 'string' ? result : path;
}

