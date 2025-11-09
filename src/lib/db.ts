import path from 'path';
import fs from 'fs';

const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel ? path.join('/tmp', 'vibestudy-data') : path.join(process.cwd(), 'data');
const contentFile = path.join(dataDir, 'generated-content.json');

let useMemoryStore = false;
let memoryStore: Record<string, any> = {};
let storageInitialized = false;

function ensureStorageInitialized() {
  if (storageInitialized || useMemoryStore) {
    return;
  }

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(contentFile)) {
      fs.writeFileSync(contentFile, JSON.stringify({}), 'utf-8');
    }

    storageInitialized = true;
  } catch (error) {
    console.warn('⚠️ Файловое хранилище недоступно, используем память. Ошибка:', error);
    useMemoryStore = true;
    memoryStore = {};
  }
}

// Читаем все данные
function readData(): Record<string, any> {
  ensureStorageInitialized();

  if (useMemoryStore) {
    return memoryStore;
  }

  try {
    const data = fs.readFileSync(contentFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения данных:', error);
    return {};
  }
}

// Записываем все данные
function writeData(data: Record<string, any>): void {
  if (useMemoryStore) {
    memoryStore = data;
    return;
  }

  try {
    fs.writeFileSync(contentFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Ошибка записи данных:', error);
  }
}

// Генерируем ключ для хранения
function getKey(day: number, languageId: string): string {
  return `${languageId}_day${day}`;
}

export interface SavedContent {
  id: number;
  day: number;
  languageId: string;
  topic: string;
  theory: string;
  recap: string;
  recapTask: string | null;
  tasks: string;
  createdAt: number;
  updatedAt: number;
}

export interface ContentToSave {
  day: number;
  languageId: string;
  topic: string;
  theory: string;
  recap: string;
  recapTask?: any;
  tasks: any[];
}

// Сохранить сгенерированный контент
export function saveGeneratedContent(content: ContentToSave): void {
  const data = readData();
  const key = getKey(content.day, content.languageId);
  const now = Date.now();
  const existing = data[key];

  data[key] = {
    day: content.day,
    languageId: content.languageId,
    topic: content.topic,
    theory: content.theory,
    recap: content.recap,
    recapTask: content.recapTask ?? null,
    tasks: content.tasks,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  writeData(data);
}

// Получить сохранённый контент
export function getGeneratedContent(day: number, languageId: string): SavedContent | null {
  const data = readData();
  const key = getKey(day, languageId);
  return data[key] ?? null;
}

// Получить все сгенерированные дни для языка
export function getAllGeneratedDays(languageId: string): number[] {
  const data = readData();
  const days: number[] = [];

  Object.keys(data).forEach((key) => {
    if (key.startsWith(`${languageId}_day`)) {
      const dayNum = parseInt(key.replace(`${languageId}_day`, ''));
      if (!isNaN(dayNum)) {
        days.push(dayNum);
      }
    }
  });

  return days.sort((a, b) => a - b);
}

// Проверить, есть ли контент для дня
export function hasGeneratedContent(day: number, languageId: string): boolean {
  const data = readData();
  const key = getKey(day, languageId);
  return key in data;
}

// Удалить контент для дня (если нужно перегенерировать)
export function deleteGeneratedContent(day: number, languageId: string): void {
  const data = readData();
  const key = getKey(day, languageId);
  delete data[key];
  writeData(data);
}

// Получить статистику
export function getGenerationStats(languageId: string): {
  total: number;
  generated: number;
  percentage: number;
} {
  const days = getAllGeneratedDays(languageId);
  const total = 90;
  const generated = days.length;

  return {
    total,
    generated,
    percentage: Math.round((generated / total) * 100)
  };
}

