// Telegram Webhook Endpoint
// Receives updates from Telegram Bot API

import { NextRequest, NextResponse } from "next/server";
import { botController } from "@/lib/telegram/bot-controller";
import type { TelegramUpdate } from "@/types/telegram";
import { logWarn, logError } from "@/lib/core/logger";
import {
  RATE_LIMIT_REQUESTS_PER_MINUTE,
  RATE_LIMIT_WINDOW_MS
} from "@/lib/telegram/constants";
import {
  recordUpdate,
  recordError,
  recordRateLimit
} from "../metrics";

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
 * Uses constant-time comparison to prevent timing attacks
 */
function verifyWebhook(request: NextRequest): boolean {
  const secretToken = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;

  // Always require secret token, even in development
  if (!expectedToken) {
    logError(
      "TELEGRAM_WEBHOOK_SECRET not configured",
      new Error("Missing webhook secret")
    );
    return false;
  }

  if (!secretToken) {
    logWarn("Webhook request missing X-Telegram-Bot-Api-Secret-Token header");
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  if (secretToken.length !== expectedToken.length) {
    return false;
  }

  let isValid = true;
  for (let i = 0; i < secretToken.length; i++) {
    if (secretToken[i] !== expectedToken[i]) {
      isValid = false;
    }
  }

  if (!isValid) {
    logWarn("Invalid webhook secret token provided");
  }

  return isValid;
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 * Uses defense-in-depth approach with multiple layers of protection
 */
function sanitizeInput(text: string): string {
  // First, decode any HTML entities to catch encoded attacks
  let sanitized = text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/gi, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // Remove all HTML tags (including malformed ones)
  sanitized = sanitized.replace(/<[^>]*>?/g, '');

  // Remove dangerous protocols (case-insensitive, with optional whitespace)
  sanitized = sanitized.replace(/j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '');
  sanitized = sanitized.replace(/v\s*b\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, '');
  sanitized = sanitized.replace(/d\s*a\s*t\s*a\s*:/gi, '');

  // Remove event handlers (various obfuscation attempts)
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  sanitized = sanitized.replace(/on\w+\s*\(/gi, '');

  // Remove expression() which can be used in CSS for XSS
  sanitized = sanitized.replace(/expression\s*\(/gi, '');

  // Remove null bytes and other control characters (except newlines/tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized.trim().slice(0, 4096); // Telegram message limit
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
