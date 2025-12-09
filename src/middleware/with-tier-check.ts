import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tier limits configuration
 */
export const TIER_LIMITS = {
  free: {
    aiRequestsPerDay: 5,
    rateLimit: 10 // requests per minute
  },
  guest: {
    aiRequestsPerDay: 3, // More restrictive for guests
    rateLimit: 5
  },
  premium: {
    aiRequestsPerDay: Infinity,
    rateLimit: 30
  },
  pro_plus: {
    aiRequestsPerDay: Infinity,
    rateLimit: 100
  }
} as const;

/**
 * In-memory store for guest rate limiting by IP
 * In production, this should use Redis or similar
 */
const guestRequestStore = new Map<string, { count: number; resetAt: number }>();
const GUEST_STORE_CLEANUP_INTERVAL = 60 * 1000; // 1 minute
const GUEST_STORE_MAX_SIZE = 10000; // Max IPs to track

// Cleanup old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of guestRequestStore.entries()) {
      if (data.resetAt < now) {
        guestRequestStore.delete(ip);
      }
    }
    // Prevent unbounded growth - remove oldest entries if too large
    if (guestRequestStore.size > GUEST_STORE_MAX_SIZE) {
      const entries = Array.from(guestRequestStore.entries());
      entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
      const toDelete = entries.slice(0, entries.length - GUEST_STORE_MAX_SIZE / 2);
      toDelete.forEach(([ip]) => guestRequestStore.delete(ip));
    }
  }, GUEST_STORE_CLEANUP_INTERVAL);
}

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

/**
 * Check and update guest rate limit by IP
 */
function checkGuestRateLimit(ip: string): { allowed: boolean; requestsToday: number } {
  const now = Date.now();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const resetAt = dayStart.getTime() + 24 * 60 * 60 * 1000; // End of day

  const existing = guestRequestStore.get(ip);

  if (!existing || existing.resetAt < now) {
    // New entry or expired
    guestRequestStore.set(ip, { count: 1, resetAt });
    return { allowed: true, requestsToday: 1 };
  }

  const newCount = existing.count + 1;
  const limit = TIER_LIMITS.guest.aiRequestsPerDay;

  if (newCount > limit) {
    return { allowed: false, requestsToday: existing.count };
  }

  guestRequestStore.set(ip, { count: newCount, resetAt: existing.resetAt });
  return { allowed: true, requestsToday: newCount };
}

export type UserTier = keyof typeof TIER_LIMITS;

interface TierCheckResult {
  allowed: boolean;
  tier: UserTier;
  requestsToday: number;
  limit: number;
  error?: {
    code: 'TIER_LIMIT_EXCEEDED' | 'TIER_EXPIRED' | 'UNAUTHORIZED';
    message: string;
  };
}

/**
 * Check if user's tier allows AI request
 * Returns tier information and whether request is allowed
 */
export async function checkTierLimit(request: NextRequest): Promise<TierCheckResult> {
  const supabase = createClient();
  
  // Get user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // If no user or auth error, treat as guest with IP-based rate limiting
  if (!user || authError) {
    const clientIP = getClientIP(request);
    const guestCheck = checkGuestRateLimit(clientIP);

    if (!guestCheck.allowed) {
      return {
        allowed: false,
        tier: 'guest',
        requestsToday: guestCheck.requestsToday,
        limit: TIER_LIMITS.guest.aiRequestsPerDay,
        error: {
          code: 'TIER_LIMIT_EXCEEDED',
          message: `Guest users are limited to ${TIER_LIMITS.guest.aiRequestsPerDay} AI requests per day. Sign up for more!`
        }
      };
    }

    return {
      allowed: true,
      tier: 'guest',
      requestsToday: guestCheck.requestsToday,
      limit: TIER_LIMITS.guest.aiRequestsPerDay
    };
  }

  // Fetch user's tier information from database
  const { data: userData, error: dbError } = await supabase
    .from('users')
    .select('tier, ai_requests_today, ai_requests_reset_at, tier_expires_at')
    .eq('id', user.id)
    .single();

  if (dbError || !userData) {
    console.error('Error fetching user tier:', dbError);
    // Default to free tier on error
    return {
      allowed: true,
      tier: 'free',
      requestsToday: 0,
      limit: TIER_LIMITS.free.aiRequestsPerDay
    };
  }

  const tier = (userData.tier || 'free') as UserTier;
  const requestsToday = userData.ai_requests_today || 0;
  const resetAt = userData.ai_requests_reset_at ? new Date(userData.ai_requests_reset_at) : new Date();
  const tierExpiresAt = userData.tier_expires_at ? new Date(userData.tier_expires_at) : null;

  // Check if tier has expired (for paid tiers)
  if (tierExpiresAt && tierExpiresAt < new Date() && tier !== 'free') {
    // Tier expired, downgrade to free
    await supabase
      .from('users')
      .update({ 
        tier: 'free',
        tier_expires_at: null 
      })
      .eq('id', user.id);

    return {
      allowed: false,
      tier: 'free',
      requestsToday: 0,
      limit: TIER_LIMITS.free.aiRequestsPerDay,
      error: {
        code: 'TIER_EXPIRED',
        message: 'Your subscription has expired. Please upgrade to continue using AI features.'
      }
    };
  }

  // Check if we need to reset daily counter
  const now = new Date();
  const resetDate = new Date(resetAt);
  resetDate.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  let currentRequests = requestsToday;

  if (resetDate < today) {
    // Reset counter for new day
    currentRequests = 0;
    await supabase
      .from('users')
      .update({ 
        ai_requests_today: 0,
        ai_requests_reset_at: now.toISOString()
      })
      .eq('id', user.id);
  }

  const limit = TIER_LIMITS[tier].aiRequestsPerDay;

  // Check if limit exceeded
  if (currentRequests >= limit) {
    return {
      allowed: false,
      tier,
      requestsToday: currentRequests,
      limit,
      error: {
        code: 'TIER_LIMIT_EXCEEDED',
        message: `You've reached your daily limit of ${limit} AI requests. Upgrade to Premium for unlimited access.`
      }
    };
  }

  // Increment request counter
  await supabase
    .from('users')
    .update({ 
      ai_requests_today: currentRequests + 1
    })
    .eq('id', user.id);

  return {
    allowed: true,
    tier,
    requestsToday: currentRequests + 1,
    limit
  };
}

/**
 * Middleware wrapper for API routes that require tier checking
 * Usage: export const POST = withTierCheck(async (request) => { ... });
 */
export function withTierCheck(
  handler: (request: NextRequest, tierInfo: TierCheckResult) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const tierCheck = await checkTierLimit(request);

    if (!tierCheck.allowed && tierCheck.error) {
      return NextResponse.json(
        {
          error: tierCheck.error.code,
          message: tierCheck.error.message,
          tier: tierCheck.tier,
          requestsToday: tierCheck.requestsToday,
          limit: tierCheck.limit,
          upgradeUrl: '/pricing'
        },
        { status: 403 }
      );
    }

    // Add tier info to response headers for client tracking
    const response = await handler(request, tierCheck);
    
    response.headers.set('X-User-Tier', tierCheck.tier);
    response.headers.set('X-Requests-Today', tierCheck.requestsToday.toString());
    response.headers.set('X-Requests-Limit', tierCheck.limit.toString());

    return response;
  };
}
