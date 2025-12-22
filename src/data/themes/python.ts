import { days as beginnerDays } from '../paths/python/beginner';
import { days as dsDays } from '../paths/python/data-scientist';
import { days as backendDays } from '../paths/python/backend';
import { days as mlDays } from '../paths/python/ml-engineer';
import { mapDaysToThemes } from './utils';
import type { DayTheme } from './types';

// Map path content to themes
export const pythonBeginnerThemes = mapDaysToThemes(beginnerDays, 'basics');
export const pythonDataScientistThemes = mapDaysToThemes(dsDays, 'ai-ml');
export const pythonBackendThemes = mapDaysToThemes(backendDays, 'web');
export const pythonMlEngineerThemes = mapDaysToThemes(mlDays, 'ai-ml');

// Export map by path ID
export const pythonPathThemes: Record<string, DayTheme[]> = {
  'python-beginner': pythonBeginnerThemes,
  'python-data-scientist': pythonDataScientistThemes,
  'python-backend': pythonBackendThemes,
  'python-ml-engineer': pythonMlEngineerThemes,
};

// Default export for backward compatibility (defaults to beginner)
export const pythonThemes: DayTheme[] = pythonBeginnerThemes;

