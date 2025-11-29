// Telegram Webhook Endpoint
// Receives updates from Telegram Bot API

import { NextRequest, NextResponse } from "next/server";
import { botController } from "@/lib/telegram/bot-controller";
import type { TelegramUpdate } from "@/types/telegram";
import { logWarn, logError } from "@/lib/logger";
import {
  RATE_LIMIT_REQUESTS_PER_MINUTE,
  RATE_LIMIT_WINDOW_MS
} from "@/lib/telegram/constants";
import {
  recordUpdate,
  recordError,
  recordRateLimit
} from "../health/route";

/**
 * Rate limiting implementation
 * NOTE: In-memory solution - not suitable for multi-instance deployments
 * For production with multiple instances, use Redis or Supabase
 * State is lost on server restart
 */
const rateLimitMap = new Map<number, { count: number; resetAt: number }>();

/**
 * Check rate limit for user
 * Thread-safe for single instance (Node.js is single-threaded)
 */
function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    for (const [id, data] of rateLimitMap.entries()) {
      if (data.resetAt < now) {
        rateLimitMap.delete(id);
      }
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_REQUESTS_PER_MINUTE) {
    return false;
  }

  // Atomic increment
  entry.count++;
  return true;
}

/**
 * Verify webhook request is from Telegram
 */
function verifyWebhook(request: NextRequest): boolean {
  const secretToken = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!expectedToken) {
    logWarn("TELEGRAM_WEBHOOK_SECRET not set, skipping verification");
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return false;
    }
    return true;
  }

  return secretToken === expectedToken;
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 * Uses whitelist approach - removes all HTML tags and dangerous patterns
 */
function sanitizeInput(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick=, onerror=, etc)
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
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
      logError(
        "Webhook verification failed",
        new Error("Invalid webhook token"),
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse update
    const update: TelegramUpdate = await request.json();

    // Extract user ID for rate limiting
    const userId = update.message?.from.id || update.callback_query?.from.id;

    if (!userId) {
      logError("No user ID in update", new Error("Missing user ID"));
      return NextResponse.json({ ok: true }); // Acknowledge but ignore
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      logWarn(`Rate limit exceeded for user ${userId}`);
      recordRateLimit();

      // Send rate limit message
      const chatId =
        update.message?.chat.id || update.callback_query?.message?.chat.id;
      if (chatId) {
        await botController.sendResponse(chatId, {
          text: "⏳ Слишком много запросов. Подожди немного.",
          parseMode: "Markdown",
        });
      }

      return NextResponse.json({ ok: true });
    }

    // Sanitize text input if present
    if (update.message?.text) {
      update.message.text = sanitizeInput(update.message.text);
    }

    // Extract command for metrics
    const command = update.message?.text?.startsWith('/')
      ? update.message.text.split(' ')[0]
      : undefined;

    // Process update asynchronously (don't wait for completion)
    botController.handleMessage(update)
      .then(() => {
        recordUpdate(true, command);
      })
      .catch((error) => {
        logError("Error processing update:", error as Error);
        recordUpdate(false, command);
        recordError(error.message || 'Unknown error');
      });

    // Respond immediately to Telegram
    return NextResponse.json({ ok: true });
  } catch (error) {
    logError("Webhook error:", error as Error);
    recordError((error as Error).message || 'Webhook error');

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
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
