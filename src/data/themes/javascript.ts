import { days as beginnerDays } from '../paths/javascript/beginner';
import { days as frontendDays } from '../paths/javascript/frontend';
import { days as fullstackDays } from '../paths/javascript/fullstack';
import { days as nodejsDays } from '../paths/javascript/nodejs';
import { mapDaysToThemes } from './utils';
import type { DayTheme } from './types';

// Map path content to themes
export const jsBeginnerThemes = mapDaysToThemes(beginnerDays, 'basics');
export const jsFrontendThemes = mapDaysToThemes(frontendDays, 'web');
export const jsFullstackThemes = mapDaysToThemes(fullstackDays, 'web');
export const jsNodejsThemes = mapDaysToThemes(nodejsDays, 'web');

// Export map by path ID
export const jsPathThemes: Record<string, DayTheme[]> = {
  'javascript-beginner': jsBeginnerThemes,
  'javascript-frontend': jsFrontendThemes,
  'javascript-fullstack': jsFullstackThemes,
  'javascript-nodejs': jsNodejsThemes,
};

// Default export for backward compatibility
export const javascriptThemes: DayTheme[] = jsBeginnerThemes;
