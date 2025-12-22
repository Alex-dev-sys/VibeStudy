import { beginnerDays, gameDevDays, systemsDays } from '../paths/cpp/index';
import { mapDaysToThemes } from './utils';
import type { DayTheme } from './types';

// Map path content to themes
export const cppBeginnerThemes = mapDaysToThemes(beginnerDays, 'basics');
export const cppGameDevThemes = mapDaysToThemes(gameDevDays, 'project');
export const cppSystemsThemes = mapDaysToThemes(systemsDays, 'devops');

// Export map by path ID
export const cppPathThemes: Record<string, DayTheme[]> = {
  'cpp-beginner': cppBeginnerThemes,
  'cpp-game-dev': cppGameDevThemes,
  'cpp-systems': cppSystemsThemes,
};

// Default export for backward compatibility
export const cppThemes: DayTheme[] = cppBeginnerThemes;
