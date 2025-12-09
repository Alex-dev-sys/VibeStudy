/**
 * Telegram Webhook Endpoint
 *
 * Receives updates from Telegram and processes them
 * Protected by secret token validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/lib/bot/client';

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

/**
 * Validate the secret token from Telegram
 * @see https://core.telegram.org/bots/api#setwebhook
 */
function validateSecretToken(req: NextRequest): boolean {
    // If no secret is configured, skip validation (development mode)
    if (!WEBHOOK_SECRET) {
        console.warn('[webhook] TELEGRAM_WEBHOOK_SECRET not set - skipping validation');
        return true;
    }

    const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
    return secretToken === WEBHOOK_SECRET;
}

export async function POST(req: NextRequest) {
    try {
        // Validate secret token to prevent fake requests
        if (!validateSecretToken(req)) {
            console.warn('[webhook] Invalid secret token received');
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
