/**
 * Rate Limiting Utility
 * Simple in-memory rate limiting for API endpoints
 * For production, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

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
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        this.store.delete(key);
      }
    }
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
        resetAt: now + windowMs
      });
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
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

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // AI endpoints (more restrictive)
  AI_GENERATION: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  AI_CHECK: { limit: 30, windowMs: 60 * 1000 }, // 30 per minute
  AI_EXPLAIN: { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
  
  // General API endpoints
  API_GENERAL: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
  API_AUTH: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
  
  // Analytics
  ANALYTICS: { limit: 50, windowMs: 60 * 1000 }, // 50 per minute
} as const;

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

