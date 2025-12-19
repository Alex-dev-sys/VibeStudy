import { javascriptThemes } from './javascript';
import { javaThemes } from './java';
import { goThemes } from './go';
import { cppThemes } from './cpp';
import { csharpThemes } from './csharp';
import { pythonThemes } from './python';
import { typescriptThemes } from './typescript';

// Re-export types from types.ts
export type { DayTheme, DayCategory, PracticeType, Difficulty } from './types';
import type { DayTheme, DayCategory, Difficulty } from './types';

// Маппинг языков на их темы
const languageThemesMap: Record<string, DayTheme[]> = {
  javascript: javascriptThemes,
  typescript: typescriptThemes,
  python: pythonThemes,
  java: javaThemes,
  go: goThemes,
  cpp: cppThemes,
  csharp: csharpThemes,
};

/**
 * Получить тему для конкретного дня и языка
 * @param languageId - ID языка программирования
 * @param day - День обучения (1-90)
 * @returns Тема дня или null если не найдена
 */
export function getDayTheme(languageId: string, day: number): DayTheme | null {
  const themes = languageThemesMap[languageId.toLowerCase()];
  if (!themes) {
    console.warn(`Темы для языка "${languageId}" не найдены`);
    return null;
  }

  const theme = themes.find((t) => t.day === day);
  if (!theme) {
    console.warn(`Тема для дня ${day} языка "${languageId}" не найдена`);
    return null;
  }

  return theme;
}

/**
 * Получить все темы для языка
 * @param languageId - ID языка программирования
 * @returns Массив всех тем или пустой массив
 */
export function getAllThemes(languageId: string): DayTheme[] {
  const themes = languageThemesMap[languageId.toLowerCase()];
  return themes || [];
}

/**
 * Проверить, есть ли темы для языка
 * @param languageId - ID языка программирования
 * @returns true если темы есть
 */
export function hasThemes(languageId: string): boolean {
  return !!languageThemesMap[languageId.toLowerCase()];
}

/**
 * Получить темы по категории
 * @param languageId - ID языка программирования
 * @param category - Категория тем
 * @returns Массив тем в категории
 */
export function getThemesByCategory(languageId: string, category: DayCategory): DayTheme[] {
  const themes = getAllThemes(languageId);
  return themes.filter((t) => t.category === category);
}

/**
 * Получить темы по сложности
 * @param languageId - ID языка программирования
 * @param difficulty - Уровень сложности (1-5)
 * @returns Массив тем с указанной сложностью
 */
export function getThemesByDifficulty(languageId: string, difficulty: Difficulty): DayTheme[] {
  const themes = getAllThemes(languageId);
  return themes.filter((t) => t.difficulty === difficulty);
}

/**
 * Получить проектные дни
 * @param languageId - ID языка программирования
 * @returns Массив проектных тем
 */
export function getProjectDays(languageId: string): DayTheme[] {
  const themes = getAllThemes(languageId);
  return themes.filter((t) => t.practiceType === 'project');
}

// Экспортируем все темы
export {
  javascriptThemes,
  typescriptThemes,
  pythonThemes,
  javaThemes,
  goThemes,
  cppThemes,
  csharpThemes,
};
