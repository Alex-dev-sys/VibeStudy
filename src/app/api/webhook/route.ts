/**
 * Telegram Webhook Endpoint
 *
 * Receives updates from Telegram and processes them
 * Protected by secret token validation and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/lib/bot/client';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/core/rate-limit';

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

/**
 * Validate the secret token from Telegram
 * @see https://core.telegram.org/bots/api#setwebhook
 */
function validateSecretToken(req: NextRequest): boolean {
    // In production, secret is REQUIRED
    if (process.env.NODE_ENV === 'production') {
        if (!WEBHOOK_SECRET) {
            console.error('[webhook] CRITICAL: TELEGRAM_WEBHOOK_SECRET is required in production');
            return false;
        }
        const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
        return secretToken === WEBHOOK_SECRET;
    }

    // In development, warn but allow without secret for testing
    if (!WEBHOOK_SECRET) {
        console.warn('[webhook] ⚠️ Development mode: TELEGRAM_WEBHOOK_SECRET not set - validation disabled');
        return true;
    }

    const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
    return secretToken === WEBHOOK_SECRET;
}

export async function POST(req: NextRequest) {
    try {
        // Rate limiting to prevent flood attacks
        const rateState = await evaluateRateLimit(req, { limit: 100, windowMs: 60 * 1000 }, {
            bucketId: 'telegram-webhook'
        });

        if (!rateState.allowed) {
            console.warn('[webhook] Rate limit exceeded');
            return NextResponse.json(
                { ok: false, error: 'Rate limit exceeded' },
                { status: 429, headers: buildRateLimitHeaders(rateState) }
            );
        }

        // Validate secret token to prevent fake requests
        if (!validateSecretToken(req)) {
            console.warn('[webhook] Invalid or missing secret token received');
            return NextResponse.json(
                { ok: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const update = await req.json();

        const bot = getBot();
        if (!bot) {
            return NextResponse.json(
                { ok: false, error: 'Bot not initialized' },
                { status: 500 }
            );
        }

        // Process the update
        bot.processUpdate(update);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[webhook] Error processing update:', error);
        return NextResponse.json(
            { ok: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'VibeStudy Telegram Bot Webhook',
        timestamp: new Date().toISOString(),
    });
}

