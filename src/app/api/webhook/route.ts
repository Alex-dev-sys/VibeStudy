/**
 * Telegram Webhook Endpoint
 * 
 * Receives updates from Telegram and processes them
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/lib/bot/client';

export async function POST(req: NextRequest) {
    try {
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
        console.error('Webhook error:', error);
        return NextResponse.json(
            { ok: false, error: String(error) },
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
