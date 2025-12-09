/**
 * Rate Limiting Utility
 * Simple in-memory rate limiting for API endpoints
 * For production, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  lastAccess: number;
}

// Configuration constants
const MAX_STORE_SIZE = 50000; // Maximum entries to prevent memory leak
const CLEANUP_THRESHOLD = 0.8; // Start cleanup when 80% full
const CLEANUP_TARGET = 0.5; // Clean down to 50% capacity

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();

    // First pass: remove expired entries
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
      }
    }

    // Second pass: if still too large, remove oldest entries (LRU)
    if (this.store.size > MAX_STORE_SIZE * CLEANUP_THRESHOLD) {
      const entries = Array.from(this.store.entries());
      // Sort by lastAccess (oldest first)
      entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);

      // Remove oldest entries until we reach target size
      const targetSize = Math.floor(MAX_STORE_SIZE * CLEANUP_TARGET);
      const toRemove = entries.slice(0, entries.length - targetSize);

      for (const [key] of toRemove) {
        this.store.delete(key);
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[RateLimiter] LRU cleanup: removed ${toRemove.length} entries, ${this.store.size} remaining`);
      }
    }
  }

  /**
   * Get current store size (for monitoring)
   */
  getStoreSize(): number {
    return this.store.size;
  }

  /**
   * Check if request is within rate limit
   * @param identifier - Unique identifier (userId, IP, etc.)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  check(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || entry.resetAt < now) {
      // Create new entry or reset expired one
      this.store.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
        lastAccess: now
      });
      return true;
    }

    if (entry.count >= limit) {
      entry.lastAccess = now; // Update access time even when limited
      return false;
    }

    entry.count++;
    entry.lastAccess = now;
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string, limit: number): number {
    const entry = this.store.get(identifier);
    if (!entry || entry.resetAt < Date.now()) {
      return limit;
    }
    return Math.max(0, limit - entry.count);
  }

  /**
   * Get reset time for identifier
   */
  getResetTime(identifier: string): number | null {
    const entry = this.store.get(identifier);
    if (!entry || entry.resetAt < Date.now()) {
      return null;
    }
    return entry.resetAt;
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

export interface RateLimitBucket {
  limit: number;
  windowMs: number;
}

export interface RateLimitState {
  allowed: boolean;
  identifier: string;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

// Predefined rate limit configurations
export const RATE_LIMITS: Record<string, RateLimitBucket> = {
  // AI endpoints (more restrictive)
  AI_GENERATION: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  AI_CHECK: { limit: 30, windowMs: 60 * 1000 }, // 30 per minute
  AI_EXPLAIN: { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
  
  // General API endpoints
  API_GENERAL: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
  API_AUTH: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  
  // Analytics
  ANALYTICS: { limit: 50, windowMs: 60 * 1000 }, // 50 per minute
};

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get user ID from headers or use IP
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fallback to IP (in production, get real IP from headers)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `ip:${ip}`;
}

/**
 * Evaluate rate limiting for request and bucket.
 */
export function evaluateRateLimit(
  request: Request,
  bucket: RateLimitBucket,
  options?: { bucketId?: string }
): RateLimitState {
  const identifier = `${options?.bucketId ?? 'global'}:${getRateLimitIdentifier(request)}`;
  const allowed = rateLimiter.check(identifier, bucket.limit, bucket.windowMs);
  const remaining = rateLimiter.getRemaining(identifier, bucket.limit);
  const resetAt = rateLimiter.getResetTime(identifier);
  const retryAfterSeconds = resetAt ? Math.ceil((resetAt - Date.now()) / 1000) : bucket.windowMs / 1000;

  return {
    allowed,
    identifier,
    limit: bucket.limit,
    remaining,
    retryAfterSeconds
  };
}

export function buildRateLimitHeaders(state: RateLimitState): Record<string, string> {
  return {
    'X-RateLimit-Limit': state.limit.toString(),
    'X-RateLimit-Remaining': Math.max(state.remaining, 0).toString(),
    'Retry-After': Math.max(state.retryAfterSeconds, 0).toString()
  };
}

