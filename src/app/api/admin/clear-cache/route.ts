import { NextRequest, NextResponse } from 'next/server';
import { deleteGeneratedContent, deleteAllGeneratedContent } from '@/lib/database/db';
import { logInfo, logWarn, logError } from '@/lib/core/logger';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/core/rate-limit';

/**
 * Admin API for cache management
 * Security: Requires ADMIN_SECRET env var, rate limited, optional IP whitelist
 */

// Get admin secret - fail if not configured in production
function getAdminSecret(): string {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('ADMIN_SECRET environment variable is required in production');
        }
        console.warn('[admin] ⚠️ ADMIN_SECRET not set. Admin endpoints are DISABLED in development.');
        return '';
    }
    return secret;
}

// Validate IP whitelist if configured
function isIpAllowed(request: NextRequest): boolean {
    const allowedIps = process.env.ADMIN_ALLOWED_IPS;
    if (!allowedIps) {
        // No whitelist configured, allow all (other auth still required)
        return true;
    }

    const whitelist = allowedIps.split(',').map(ip => ip.trim()).filter(Boolean);
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

    return whitelist.includes(clientIp);
}

export async function POST(request: NextRequest) {
    try {
        // 1. Rate limiting - strict for admin
        const rateState = await evaluateRateLimit(request, { limit: 10, windowMs: 60 * 1000 }, {
            bucketId: 'admin-cache'
        });

        if (!rateState.allowed) {
            logWarn('Admin rate limit exceeded', {
                component: 'api/admin',
                action: 'rate-limit'
            });
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: buildRateLimitHeaders(rateState) }
            );
        }

        // 2. IP whitelist check
        if (!isIpAllowed(request)) {
            logWarn('Admin access denied - IP not in whitelist', {
                component: 'api/admin',
                action: 'ip-check'
            });
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 3. Secret validation - from header, not body
        const adminSecret = getAdminSecret();
        if (!adminSecret) {
            return NextResponse.json(
                { error: 'Admin endpoints are disabled' },
                { status: 503 }
            );
        }

        const providedSecret = request.headers.get('x-admin-secret');
        if (!providedSecret || providedSecret !== adminSecret) {
            logWarn('Admin access denied - invalid secret', {
                component: 'api/admin',
                action: 'auth-check'
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 4. Process request
        const body = await request.json();
        const { day, languageId, all } = body;

        if (all) {
            deleteAllGeneratedContent();
            logInfo('Admin CLEARED ALL content cache', {
                component: 'api/admin',
                action: 'clear-all-cache'
            });
            return NextResponse.json({
                success: true,
                message: `ALL generated content cleared successfully`
            });
        }

        if (!day || !languageId) {
            return NextResponse.json(
                { error: 'Missing day or languageId (or "all" flag)' },
                { status: 400 }
            );
        }

        deleteGeneratedContent(day, languageId);

        logInfo('Admin cleared content cache', {
            component: 'api/admin',
            action: 'clear-cache',
            metadata: { day, languageId }
        });

        return NextResponse.json({
            success: true,
            message: `Content for Day ${day} (${languageId}) cleared successfully`
        });
    } catch (error) {
        logError('Admin endpoint error', error as Error, {
            component: 'api/admin',
            action: 'clear-cache'
        });
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

