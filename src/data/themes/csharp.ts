import { beginnerDays, unityDays, dotnetDays } from '../paths/csharp/index';
import { mapDaysToThemes } from './utils';
import type { DayTheme } from './types';

// Map path content to themes
export const csharpBeginnerThemes = mapDaysToThemes(beginnerDays, 'basics');
export const csharpUnityThemes = mapDaysToThemes(unityDays, 'project');
export const csharpDotnetThemes = mapDaysToThemes(dotnetDays, 'web');

// Export map by path ID
export const csharpPathThemes: Record<string, DayTheme[]> = {
  'csharp-beginner': csharpBeginnerThemes,
  'csharp-game-unity': csharpUnityThemes,
  'csharp-dotnet': csharpDotnetThemes,
};

// Default export for backward compatibility
export const csharpThemes: DayTheme[] = csharpBeginnerThemes;
