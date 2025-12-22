import { javascriptThemes, jsPathThemes } from './javascript';
import { javaThemes, javaPathThemes } from './java';
import { goThemes, goPathThemes } from './go';
import { cppThemes, cppPathThemes } from './cpp';
import { csharpThemes, csharpPathThemes } from './csharp';
import { pythonThemes, pythonPathThemes } from './python';
import { typescriptThemes, tsPathThemes } from './typescript';

// Re-export types from types.ts
export type { DayTheme, DayCategory, PracticeType, Difficulty } from './types';
import type { DayTheme, DayCategory, Difficulty } from './types';

// Маппинг языков на их темы (Default / Beginner)
const languageThemesMap: Record<string, DayTheme[]> = {
  javascript: javascriptThemes,
  typescript: typescriptThemes,
  python: pythonThemes,
  java: javaThemes,
  go: goThemes,
  cpp: cppThemes,
  csharp: csharpThemes,
};

// Маппинг всех путей на их темы
const allPathThemes: Record<string, DayTheme[]> = {
  ...jsPathThemes,
  ...tsPathThemes,
  ...pythonPathThemes,
  ...javaPathThemes,
  ...goPathThemes,
  ...cppPathThemes,
  ...csharpPathThemes,
};

/**
 * Получить тему для конкретного дня и языка/пути
 * @param languageId - ID языка программирования
 * @param day - День обучения
 * @param pathId - (Опционально) ID пути обучения
 * @returns Тема дня или null если не найдена
 */
export function getDayTheme(languageId: string, day: number, pathId?: string): DayTheme | null {
  // Пытаемся найти по pathId если передан
  if (pathId && allPathThemes[pathId]) {
    const theme = allPathThemes[pathId].find((t) => t.day === day);
    if (theme) return theme;
  }

  // Fallback к языку (обычно beginner path)
  const themes = languageThemesMap[languageId.toLowerCase()];
  if (!themes) {
    console.warn(`Темы для языка "${languageId}" не найдены`);
    return null;
  }

  const theme = themes.find((t) => t.day === day);
  if (!theme) {
    // Не спамим варнингами, так как длина пути может быть меньше 90 дней
    return null;
  }

  return theme;
}

/**
 * Получить все темы для языка или пути
 * @param languageId - ID языка программирования
 * @param pathId - (Опционально) ID пути обучения
 * @returns Массив всех тем или пустой массив
 */
export function getAllThemes(languageId: string, pathId?: string): DayTheme[] {
  if (pathId && allPathThemes[pathId]) {
    return allPathThemes[pathId];
  }
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
  allPathThemes
};
