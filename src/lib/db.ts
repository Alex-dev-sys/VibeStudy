import path from 'path';
import fs from 'fs';

const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel ? path.join('/tmp', 'vibestudy-data') : path.join(process.cwd(), 'data');
const contentFile = path.join(dataDir, 'generated-content.json');

let useMemoryStore = false;
let memoryStore: Record<string, any> = {};
let storageInitialized = false;

// Enhanced content storage types
export interface GeneratedContentRecord {
  key: string;
  content: any;
  timestamp: number;
  version: string;
  syncStatus?: 'local' | 'synced' | 'pending';
}

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

// Enhanced ContentStorage class for multi-layer persistence
class ContentStorage {
  private memoryCache: Map<string, GeneratedContentRecord> = new Map();
  private readonly STORAGE_VERSION = '1.0';

  async save(key: string, content: any): Promise<void> {
    const record: GeneratedContentRecord = {
      key,
      content,
      timestamp: Date.now(),
      version: this.STORAGE_VERSION,
      syncStatus: 'local'
    };

    // 1. Save to memory cache
    this.memoryCache.set(key, record);

    // 2. Save to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`vibestudy_content_${key}`, JSON.stringify(record));
      } catch (e) {
        console.warn('localStorage save failed:', e);
      }
    }

    // 3. Save to file system (server-side)
    await this.saveToFile(key, record);
  }

  async load(key: string): Promise<any | null> {
    // Try memory first
    const cached = this.memoryCache.get(key);
    if (cached) return cached.content;

    // Try localStorage (client-side)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`vibestudy_content_${key}`);
        if (stored) {
          const record: GeneratedContentRecord = JSON.parse(stored);
          this.memoryCache.set(key, record);
          return record.content;
        }
      } catch (e) {
        console.warn('localStorage load failed:', e);
      }
    }

    // Try file system (server-side)
    return await this.loadFromFile(key);
  }

  private async saveToFile(key: string, record: GeneratedContentRecord): Promise<void> {
    if (typeof window !== 'undefined') return; // Skip on client-side

    try {
      const data = readData();
      data[key] = record;
      writeData(data);
    } catch (error) {
      console.warn('File system save failed:', error);
    }
  }

  private async loadFromFile(key: string): Promise<any | null> {
    if (typeof window !== 'undefined') return null; // Skip on client-side

    try {
      const data = readData();
      const record = data[key] as GeneratedContentRecord | undefined;
      if (record) {
        this.memoryCache.set(key, record);
        return record.content;
      }
    } catch (error) {
      console.warn('File system load failed:', error);
    }

    return null;
  }

  clear(key: string): void {
    this.memoryCache.delete(key);

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`vibestudy_content_${key}`);
      } catch (e) {
        console.warn('localStorage clear failed:', e);
      }
    }
  }

  clearAll(): void {
    this.memoryCache.clear();
    // Note: LocalStorage clearing on client side would require iteration or specific prefix handling
    // We assume major cleanup happens via file system flush
  }
}

// Export singleton instance
export const contentStorage = new ContentStorage();

// Сохранить сгенерированный контент (legacy function, now uses ContentStorage)
export async function saveGeneratedContent(content: ContentToSave): Promise<void> {
  const key = getKey(content.day, content.languageId);
  const now = Date.now();

  const contentData = {
    day: content.day,
    languageId: content.languageId,
    topic: content.topic,
    theory: content.theory,
    recap: content.recap,
    recapTask: content.recapTask ?? null,
    tasks: content.tasks,
    createdAt: now,
    updatedAt: now
  };

  await contentStorage.save(key, contentData);
}

// Получить сохранённый контент (now uses ContentStorage)
export async function getGeneratedContent(day: number, languageId: string): Promise<SavedContent | null> {
  const key = getKey(day, languageId);
  const content = await contentStorage.load(key);
  return content ?? null;
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
  const key = getKey(day, languageId);
  contentStorage.clear(key);

  // Also clear from file system
  const data = readData();
  delete data[key];
  writeData(data);
}

// Удалить ВЕСЬ сгенерированный контент
export function deleteAllGeneratedContent(): void {
  contentStorage.clearAll();
  writeData({});
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

