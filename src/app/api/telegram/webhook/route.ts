// Telegram Webhook Endpoint
// Receives updates from Telegram Bot API

import { NextRequest, NextResponse } from 'next/server';
import { botController } from '@/lib/telegram/bot-controller';
import type { TelegramUpdate } from '@/types/telegram';

// Rate limiting map (simple in-memory implementation)
const rateLimitMap = new Map<number, { count: number; resetAt: number }>();

const RATE_LIMIT = 30; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in ms

/**
 * Check rate limit for user
 */
function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

/**
 * Verify webhook request is from Telegram
 */
function verifyWebhook(request: NextRequest): boolean {
  const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
  const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  
  if (!expectedToken) {
    console.warn('TELEGRAM_WEBHOOK_SECRET not set, skipping verification');
    return true; // Allow in development
  }
  
  return secretToken === expectedToken;
}

/**
 * Sanitize input text
 */
function sanitizeInput(text: string): string {
  return text
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 4096); // Telegram message limit
}

/**
 * POST /api/telegram/webhook
 * Receives updates from Telegram
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook
    if (!verifyWebhook(request)) {
      console.error('Webhook verification failed');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse update
    const update: TelegramUpdate = await request.json();
    
    // Extract user ID for rate limiting
    const userId = update.message?.from.id || update.callback_query?.from.id;
    
    if (!userId) {
      console.error('No user ID in update');
      return NextResponse.json({ ok: true }); // Acknowledge but ignore
    }
    
    // Check rate limit
    if (!checkRateLimit(userId)) {
      console.warn(`Rate limit exceeded for user ${userId}`);
      
      // Send rate limit message
      const chatId = update.message?.chat.id || update.callback_query?.message?.chat.id;
      if (chatId) {
        await botController.sendResponse(chatId, {
          text: '⏳ Слишком много запросов. Подожди немного.',
          parseMode: 'Markdown'
        });
      }
      
      return NextResponse.json({ ok: true });
    }
    
    // Sanitize text input if present
    if (update.message?.text) {
      update.message.text = sanitizeInput(update.message.text);
    }
    
    // Process update asynchronously (don't wait for completion)
    botController.handleMessage(update).catch(error => {
      console.error('Error processing update:', error);
    });
    
    // Respond immediately to Telegram
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Still return 200 to prevent Telegram from retrying
    return NextResponse.json({ ok: true });
  }
}

/**
 * GET /api/telegram/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}

