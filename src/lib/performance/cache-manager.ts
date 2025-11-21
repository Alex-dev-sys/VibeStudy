/**
 * Cache Manager for generated content and user progress
 * Implements multi-layer caching strategy with TTL and size limits
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  size: number; // Approximate size in bytes
}

interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  defaultTTL: number; // Default TTL in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private currentSize: number;
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.currentSize = 0;
    this.config = {
      maxSize: config.maxSize || 10 * 1024 * 1024, // 10MB default
      defaultTTL: config.defaultTTL || 30 * 60 * 1000, // 30 minutes default
      cleanupInterval: config.cleanupInterval || 5 * 60 * 1000, // 5 minutes default
    };
    this.cleanupTimer = null;
    this.startCleanup();
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const size = this.estimateSize(data);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      size,
    };

    // Check if adding this entry would exceed max size
    if (this.currentSize + size > this.config.maxSize) {
      this.evictLRU(size);
    }

    // Remove old entry if exists
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.currentSize -= oldEntry.size;
    }

    this.cache.set(key, entry);
    this.currentSize += size;
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (entry) {
      this.currentSize -= entry.size;
      return this.cache.delete(key);
    }

    return false;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      entries: this.cache.size,
      size: this.currentSize,
      maxSize: this.config.maxSize,
      utilization: (this.currentSize / this.config.maxSize) * 100,
    };
  }

  /**
   * Evict least recently used entries to make space
   */
  private evictLRU(requiredSpace: number): void {
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    let freedSpace = 0;
    for (const [key, entry] of entries) {
      if (freedSpace >= requiredSpace) {
        break;
      }
      this.delete(key);
      freedSpace += entry.size;
    }
  }

  /**
   * Estimate size of data in bytes
   */
  private estimateSize(data: any): number {
    const str = JSON.stringify(data);
    return new Blob([str]).size;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.delete(key);
        }
      }
    }, this.config.cleanupInterval);
  }

  /**
   * Stop cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// Singleton instances for different cache types
export const contentCache = new CacheManager({
  maxSize: 5 * 1024 * 1024, // 5MB for generated content
  defaultTTL: 60 * 60 * 1000, // 1 hour
});

export const progressCache = new CacheManager({
  maxSize: 2 * 1024 * 1024, // 2MB for progress data
  defaultTTL: 10 * 60 * 1000, // 10 minutes
});

export const apiCache = new CacheManager({
  maxSize: 3 * 1024 * 1024, // 3MB for API responses
  defaultTTL: 5 * 60 * 1000, // 5 minutes
});

/**
 * Cache key generators
 */
export const cacheKeys = {
  content: (languageId: string, day: number) => `content:${languageId}:${day}`,
  progress: (userId: string) => `progress:${userId}`,
  tasks: (languageId: string, day: number) => `tasks:${languageId}:${day}`,
  achievements: (userId: string) => `achievements:${userId}`,
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
};

/**
 * Cleanup on page unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    contentCache.destroy();
    progressCache.destroy();
    apiCache.destroy();
  });
}
