import { javascriptThemes } from './javascript';
import { javaThemes } from './java';
import { goThemes } from './go';
import { cppThemes } from './cpp';
import { csharpThemes } from './csharp';
import { pythonThemes } from './python';
import { typescriptThemes } from './typescript';

export interface DayTheme {
  day: number;
  topic: string;
}

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
