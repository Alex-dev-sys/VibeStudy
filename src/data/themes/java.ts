import { beginnerDays, backendDays, androidDays } from '../paths/java/index';
import { mapDaysToThemes } from './utils';
import type { DayTheme } from './types';

// Map path content to themes
export const javaBeginnerThemes = mapDaysToThemes(beginnerDays, 'basics');
export const javaBackendThemes = mapDaysToThemes(backendDays, 'web');
export const javaAndroidThemes = mapDaysToThemes(androidDays, 'project'); // Android is project-heavy/mobile

// Export map by path ID
export const javaPathThemes: Record<string, DayTheme[]> = {
  'java-beginner': javaBeginnerThemes,
  'java-backend': javaBackendThemes,
  'java-android': javaAndroidThemes,
};

// Default export for backward compatibility
export const javaThemes: DayTheme[] = javaBeginnerThemes;
