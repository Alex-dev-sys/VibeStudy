import { ru } from './locales/ru';
import type { Translations } from './locales/ru';

export type Locale = 'ru';

export const locales: Record<Locale, Translations> = {
  ru
};

export const defaultLocale: Locale = 'ru';

/**
 * Validates if a string is a valid locale
 * @param locale - The locale string to validate
 * @returns True if the locale is valid ('ru')
 */
export function isValidLocale(locale: string): locale is Locale {
  return locale === 'ru';
}

/**
 * Gets translations for a given locale with validation
 * @param locale - The locale to get translations for
 * @returns Translations object for the locale
 */
export function getTranslations(locale: Locale): Translations {
  return locales['ru'];
}

// Helper function to get nested translation
export function t(translations: Translations, path: string): string {
  const keys = path.split('.');
  let result: unknown = translations;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  if (typeof result === 'string') {
    return result;
  }

  return path;
}

