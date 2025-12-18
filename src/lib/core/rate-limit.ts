/**
 * Rate Limiting Utility
 * Database-backed rate limiting for distributed systems
 * Supports multiple server instances via Supabase
 */

import { getSupabaseClient } from '@/lib/supabase/client';

interface RateLimitEntry {
  count: number;
  resetAt: number;
  lastAccess: number;
}

// Fallback in-memory cache for when DB is unavailable
const fallbackStore = new Map<string, RateLimitEntry>();
const MAX_FALLBACK_SIZE = 1000;

/**
 * Clean up expired entries from fallback store
 */
function cleanupFallbackStore(): void {
  const now = Date.now();
  for (const [key, entry] of fallbackStore.entries()) {
    if (entry.resetAt < now) {
      fallbackStore.delete(key);
    }
  }

  // LRU cleanup if too large
  if (fallbackStore.size > MAX_FALLBACK_SIZE) {
    const entries = Array.from(fallbackStore.entries());
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    const toDelete = entries.slice(0, entries.length - MAX_FALLBACK_SIZE);
    toDelete.forEach(([key]) => fallbackStore.delete(key));
  }
}

// Periodic cleanup
setInterval(cleanupFallbackStore, 60000);

class RateLimiter {
  private useDatabase: boolean = true;

  /**
   * Check if request is within rate limit (database-backed)
   * @param identifier - Unique identifier (userId, IP, etc.)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  async check(identifier: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const resetAt = now + windowMs;

    if (!this.useDatabase) {
      return this.checkFallback(identifier, limit, resetAt, now);
    }

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return this.checkFallback(identifier, limit, resetAt, now);
      }

      // Try to increment atomically in database
      const { data, error } = await supabase
        .from('rate_limits')
        .select('count, reset_at')
        .eq('identifier', identifier)
        .gte('reset_at', new Date(now).toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        // DB error, use fallback
        return this.checkFallback(identifier, limit, resetAt, now);
      }

      if (!data || new Date(data.reset_at).getTime() < now) {
        // Create new entry or reset expired one
        const { error: upsertError } = await supabase
          .from('rate_limits')
          .upsert({
            identifier,
            count: 1,
            reset_at: new Date(resetAt).toISOString(),
            last_access: new Date(now).toISOString()
          }, { onConflict: 'identifier' });

        if (upsertError) {
          return this.checkFallback(identifier, limit, resetAt, now);
        }

        return true;
      }

      if (data.count >= limit) {
        // Update last access even when limited
        await supabase
          .from('rate_limits')
          .update({ last_access: new Date(now).toISOString() })
          .eq('identifier', identifier);

        return false;
      }

      // Increment counter atomically
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({
          count: data.count + 1,
          last_access: new Date(now).toISOString()
        })
        .eq('identifier', identifier)
        .eq('count', data.count); // Optimistic locking

      if (updateError) {
        // Race condition detected, be conservative and deny
        return false;
      }

      return true;
    } catch (error) {
      // Fallback to in-memory on any error
      return this.checkFallback(identifier, limit, resetAt, now);
    }
  }

  /**
   * Fallback to in-memory rate limiting
   */
  private checkFallback(identifier: string, limit: number, resetAt: number, now: number): boolean {
    const entry = fallbackStore.get(identifier);

    if (!entry || entry.resetAt < now) {
      fallbackStore.set(identifier, {
        count: 1,
        resetAt,
        lastAccess: now
      });
      return true;
    }

    if (entry.count >= limit) {
      entry.lastAccess = now;
      return false;
    }

    entry.count++;
    entry.lastAccess = now;
    return true;
  }

  /**
   * Get current store size (for monitoring)
   */
  getStoreSize(): number {
    return fallbackStore.size;
  }

  /**
   * Get remaining requests for identifier
   */
  async getRemaining(identifier: string, limit: number): Promise<number> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return this.getRemainingFallback(identifier, limit);
      }

      const { data } = await supabase
        .from('rate_limits')
        .select('count, reset_at')
        .eq('identifier', identifier)
        .gte('reset_at', new Date().toISOString())
        .single();

      if (!data || new Date(data.reset_at).getTime() < Date.now()) {
        return limit;
      }

      return Math.max(0, limit - data.count);
    } catch {
      return this.getRemainingFallback(identifier, limit);
    }
  }

  private getRemainingFallback(identifier: string, limit: number): number {
    const entry = fallbackStore.get(identifier);
    if (!entry || entry.resetAt < Date.now()) {
      return limit;
    }
    return Math.max(0, limit - entry.count);
  }

  /**
   * Get reset time for identifier
   */
  async getResetTime(identifier: string): Promise<number | null> {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return this.getResetTimeFallback(identifier);
      }

      const { data } = await supabase
        .from('rate_limits')
        .select('reset_at')
        .eq('identifier', identifier)
        .single();

      if (!data) {
        return null;
      }

      const resetAt = new Date(data.reset_at).getTime();
      return resetAt < Date.now() ? null : resetAt;
    } catch {
      return this.getResetTimeFallback(identifier);
    }
  }

  private getResetTimeFallback(identifier: string): number | null {
    const entry = fallbackStore.get(identifier);
    if (!entry || entry.resetAt < Date.now()) {
      return null;
    }
    return entry.resetAt;
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from('rate_limits')
          .delete()
          .eq('identifier', identifier);
      }
    } catch {
      // Ignore errors
    }

    fallbackStore.delete(identifier);
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
export async function evaluateRateLimit(
  request: Request,
  bucket: RateLimitBucket,
  options?: { bucketId?: string }
): Promise<RateLimitState> {
  const identifier = `${options?.bucketId ?? 'global'}:${getRateLimitIdentifier(request)}`;
  const allowed = await rateLimiter.check(identifier, bucket.limit, bucket.windowMs);
  const remaining = await rateLimiter.getRemaining(identifier, bucket.limit);
  const resetAt = await rateLimiter.getResetTime(identifier);
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

