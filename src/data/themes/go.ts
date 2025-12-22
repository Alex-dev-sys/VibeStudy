import { beginnerDays, backendDays, devopsDays } from '../paths/go/index';
import { mapDaysToThemes } from './utils';
import type { DayTheme } from './types';

// Map path content to themes
export const goBeginnerThemes = mapDaysToThemes(beginnerDays, 'basics');
export const goBackendThemes = mapDaysToThemes(backendDays, 'web');
export const goDevopsThemes = mapDaysToThemes(devopsDays, 'devops');

// Export map by path ID
export const goPathThemes: Record<string, DayTheme[]> = {
  'go-beginner': goBeginnerThemes,
  'go-backend': goBackendThemes,
  'go-devops': goDevopsThemes,
};

// Default export for backward compatibility
export const goThemes: DayTheme[] = goBeginnerThemes;
