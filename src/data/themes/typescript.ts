import { beginnerDays, frontendDays, fullstackDays } from '../paths/typescript/index';
import { mapDaysToThemes } from './utils';
import type { DayTheme } from './types';

// Map path content to themes
export const tsBeginnerThemes = mapDaysToThemes(beginnerDays, 'basics');
export const tsFrontendThemes = mapDaysToThemes(frontendDays, 'web');
export const tsFullstackThemes = mapDaysToThemes(fullstackDays, 'web');

// Export map by path ID
export const tsPathThemes: Record<string, DayTheme[]> = {
  'typescript-beginner': tsBeginnerThemes,
  'typescript-frontend': tsFrontendThemes,
  'typescript-fullstack': tsFullstackThemes,
};

// Default export for backward compatibility
export const typescriptThemes: DayTheme[] = tsBeginnerThemes;
