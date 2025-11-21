/**
 * Content Fallback System
 * 
 * Implements graceful degradation with fallback chain:
 * 1. AI Generation (primary)
 * 2. Cached Content (secondary)
 * 3. Static Fallback (tertiary)
 * 
 * Ensures users always get content even when AI is unavailable.
 */

import { logInfo, logWarn, logError } from '@/lib/logger';
import { handleError } from '@/lib/errors/user-friendly-errors';
import type { GeneratedTask } from '@/types';

export type ContentSource = 'ai' | 'cache' | 'static' | 'fallback';

export interface ContentResult<T> {
  content: T;
  source: ContentSource;
  isFallback: boolean;
  timestamp: number;
}

/**
 * Static fallback content for when AI and cache are unavailable
 */
const STATIC_FALLBACK_TASKS: Record<string, Record<number, GeneratedTask[]>> = {
  python: {
    1: [
      {
        id: 'fallback-py-1-1',
        prompt: 'Напиши программу, которая выводит "Hello, World!" на экран.',
        difficulty: 'easy' as const,
        solutionHint: 'Используй функцию print() и заключи текст в кавычки'
      },
      {
        id: 'fallback-py-1-2',
        prompt: 'Создай переменную name со своим именем и выведи её.',
        difficulty: 'easy' as const,
        solutionHint: 'Переменные создаются через знак =, используй print() для вывода'
      }
    ]
  },
  javascript: {
    1: [
      {
        id: 'fallback-js-1-1',
        prompt: 'Напиши код, который выводит "Hello, World!" в консоль.',
        difficulty: 'easy' as const,
        solutionHint: 'Используй console.log() и заключи текст в кавычки'
      },
      {
        id: 'fallback-js-1-2',
        prompt: 'Создай переменную name со своим именем и выведи её.',
        difficulty: 'easy' as const,
        solutionHint: 'Используй let или const, затем console.log() для вывода'
      }
    ]
  }
};

const STATIC_FALLBACK_THEORY: Record<string, Record<number, string>> = {
  python: {
    1: `# Основы Python

Python - это простой и мощный язык программирования. Начнём с основ:

## Вывод текста
Для вывода текста используется функция \`print()\`:
\`\`\`python
print("Hello, World!")
\`\`\`

## Переменные
Переменные хранят данные:
\`\`\`python
name = "Иван"
age = 25
\`\`\`

## Типы данных
- Строки (str): \`"текст"\`
- Числа (int): \`42\`
- Дробные числа (float): \`3.14\`
- Логические (bool): \`True\`, \`False\`
`
  },
  javascript: {
    1: `# Основы JavaScript

JavaScript - язык программирования для веб-разработки.

## Вывод в консоль
Для вывода используется \`console.log()\`:
\`\`\`javascript
console.log("Hello, World!");
\`\`\`

## Переменные
Переменные объявляются с помощью \`let\` или \`const\`:
\`\`\`javascript
const name = "Иван";
let age = 25;
\`\`\`

## Типы данных
- Строки: \`"текст"\`
- Числа: \`42\`, \`3.14\`
- Логические: \`true\`, \`false\`
- Undefined: \`undefined\`
- Null: \`null\`
`
  }
};

/**
 * Get static fallback tasks for a specific day and language
 */
function getStaticFallbackTasks(languageId: string, day: number): GeneratedTask[] {
  const languageFallbacks = STATIC_FALLBACK_TASKS[languageId.toLowerCase()];
  
  if (!languageFallbacks || !languageFallbacks[day]) {
    // Generic fallback if specific day not available
    return [
      {
        id: `fallback-${languageId}-${day}-1`,
        prompt: 'Попробуй написать простую программу на основе изученной теории.',
        difficulty: 'easy' as const,
        solutionHint: 'Используй базовые конструкции языка и начни с простого примера'
      }
    ];
  }

  return languageFallbacks[day];
}

/**
 * Get static fallback theory for a specific day and language
 */
function getStaticFallbackTheory(languageId: string, day: number): string {
  const languageFallbacks = STATIC_FALLBACK_THEORY[languageId.toLowerCase()];
  
  if (!languageFallbacks || !languageFallbacks[day]) {
    return `# День ${day}

К сожалению, AI временно недоступен, и для этого дня нет сохранённого контента.

Попробуй:
1. Обновить страницу через несколько минут
2. Проверить подключение к интернету
3. Использовать песочницу для практики

Твой прогресс сохранён и не потерян.`;
  }

  return languageFallbacks[day];
}

/**
 * Try to get content from cache
 */
async function getFromCache<T>(
  cacheKey: string,
  context: string
): Promise<T | null> {
  try {
    // Try localStorage first
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - (parsed.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (cacheAge < maxAge) {
        logInfo(`Cache HIT for ${cacheKey}`, {
          component: context,
          metadata: { cacheAge: Math.round(cacheAge / 1000 / 60) + ' minutes' }
        });
        return parsed.data as T;
      } else {
        logInfo(`Cache EXPIRED for ${cacheKey}`, {
          component: context,
          metadata: { cacheAge: Math.round(cacheAge / 1000 / 60 / 60) + ' hours' }
        });
      }
    }

    logInfo(`Cache MISS for ${cacheKey}`, { component: context });
    return null;
  } catch (error) {
    logWarn(`Cache read error for ${cacheKey}`, {
      component: context,
      metadata: { error: String(error) }
    });
    return null;
  }
}

/**
 * Save content to cache
 */
async function saveToCache<T>(
  cacheKey: string,
  data: T,
  context: string
): Promise<void> {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    logInfo(`Saved to cache: ${cacheKey}`, { component: context });
  } catch (error) {
    logWarn(`Cache write error for ${cacheKey}`, {
      component: context,
      metadata: { error: String(error) }
    });
    
    // If quota exceeded, try to clear old cache
    if (String(error).includes('quota')) {
      try {
        clearOldCache();
        // Try again after clearing
        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
      } catch (retryError) {
        logError('Failed to save to cache even after clearing', retryError as Error, {
          component: context
        });
      }
    }
  }
}

/**
 * Clear old cache entries to free up space
 */
function clearOldCache(): void {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = Date.now();
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('content-cache-')) continue;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) continue;
      
      const parsed = JSON.parse(item);
      const age = now - (parsed.timestamp || 0);
      
      if (age > maxAge) {
        localStorage.removeItem(key);
        logInfo(`Cleared old cache entry: ${key}`, {
          component: 'content-fallback',
          metadata: { age: Math.round(age / 1000 / 60 / 60 / 24) + ' days' }
        });
      }
    } catch (error) {
      // Invalid cache entry, remove it
      localStorage.removeItem(key);
    }
  }
}

/**
 * Get content with automatic fallback chain
 * 
 * @param aiGenerator - Function to generate content with AI
 * @param languageId - Programming language ID
 * @param day - Day number
 * @param context - Context for logging
 * @returns Content with source information
 */
export async function getContentWithFallback<T>(
  aiGenerator: () => Promise<T>,
  languageId: string,
  day: number,
  context: string
): Promise<ContentResult<T>> {
  const cacheKey = `content-cache-${languageId}-day-${day}`;
  
  // Step 1: Try AI generation
  try {
    logInfo(`Attempting AI generation for ${languageId} day ${day}`, {
      component: context
    });
    
    const content = await aiGenerator();
    
    // Save to cache for future use
    await saveToCache(cacheKey, content, context);
    
    return {
      content,
      source: 'ai',
      isFallback: false,
      timestamp: Date.now()
    };
  } catch (aiError) {
    logWarn(`AI generation failed for ${languageId} day ${day}, trying cache`, {
      component: context,
      metadata: { error: String(aiError) }
    });
    
    // Step 2: Try cache
    const cachedContent = await getFromCache<T>(cacheKey, context);
    
    if (cachedContent) {
      // Show info toast that we're using cached content
      handleError(aiError, context, {
        showToast: true,
        logError: false,
        customTitle: 'Используем сохранённый контент',
        customMessage: 'AI недоступен, но у нас есть сохранённая версия заданий.'
      });
      
      return {
        content: cachedContent,
        source: 'cache',
        isFallback: true,
        timestamp: Date.now()
      };
    }
    
    // Step 3: Use static fallback
    logWarn(`Cache miss for ${languageId} day ${day}, using static fallback`, {
      component: context
    });
    
    // Show warning toast
    handleError(aiError, context, {
      showToast: true,
      logError: false,
      customTitle: 'Используем базовые задания',
      customMessage: 'AI и кэш недоступны. Показываем стандартные задания.'
    });
    
    // Create static fallback content
    const staticContent = {
      theory: getStaticFallbackTheory(languageId, day),
      tasks: getStaticFallbackTasks(languageId, day)
    } as T;
    
    return {
      content: staticContent,
      source: 'static',
      isFallback: true,
      timestamp: Date.now()
    };
  }
}

/**
 * Get tasks with fallback
 */
export async function getTasksWithFallback(
  aiGenerator: () => Promise<GeneratedTask[]>,
  languageId: string,
  day: number
): Promise<ContentResult<GeneratedTask[]>> {
  return getContentWithFallback(
    aiGenerator,
    languageId,
    day,
    'task-generation'
  );
}

/**
 * Get theory with fallback
 */
export async function getTheoryWithFallback(
  aiGenerator: () => Promise<string>,
  languageId: string,
  day: number
): Promise<ContentResult<string>> {
  return getContentWithFallback(
    aiGenerator,
    languageId,
    day,
    'theory-generation'
  );
}

/**
 * Prefetch content for upcoming days
 * Helps ensure content is available even if AI becomes unavailable
 */
export async function prefetchContent(
  languageId: string,
  currentDay: number,
  daysAhead: number = 3
): Promise<void> {
  logInfo(`Prefetching content for ${languageId} days ${currentDay + 1} to ${currentDay + daysAhead}`, {
    component: 'content-fallback'
  });
  
  // Prefetch in background, don't block
  for (let day = currentDay + 1; day <= currentDay + daysAhead; day++) {
    const cacheKey = `content-cache-${languageId}-day-${day}`;
    
    // Check if already cached
    const cached = await getFromCache(cacheKey, 'prefetch');
    if (cached) {
      logInfo(`Day ${day} already cached, skipping`, { component: 'prefetch' });
      continue;
    }
    
    // Note: Actual prefetching would require calling the AI API
    // This is a placeholder for the prefetch logic
    logInfo(`Would prefetch day ${day}`, { component: 'prefetch' });
  }
}

/**
 * Clear all cached content
 */
export function clearContentCache(): void {
  const keys: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('content-cache-')) {
      keys.push(key);
    }
  }
  
  keys.forEach(key => localStorage.removeItem(key));
  
  logInfo(`Cleared ${keys.length} cache entries`, {
    component: 'content-fallback'
  });
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  totalSize: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  let totalEntries = 0;
  let totalSize = 0;
  let oldestEntry: number | null = null;
  let newestEntry: number | null = null;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('content-cache-')) continue;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) continue;
      
      totalEntries++;
      totalSize += item.length;
      
      const parsed = JSON.parse(item);
      const timestamp = parsed.timestamp || 0;
      
      if (!oldestEntry || timestamp < oldestEntry) {
        oldestEntry = timestamp;
      }
      if (!newestEntry || timestamp > newestEntry) {
        newestEntry = timestamp;
      }
    } catch (error) {
      // Skip invalid entries
    }
  }
  
  return {
    totalEntries,
    totalSize,
    oldestEntry,
    newestEntry
  };
}
