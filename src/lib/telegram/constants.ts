/**
 * Telegram Bot Constants
 * Centralized configuration for magic numbers and limits
 */

// Telegram API Limits
export const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;
export const TELEGRAM_MAX_CAPTION_LENGTH = 1024;
export const TELEGRAM_MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 MB
export const TELEGRAM_MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50 MB

// Rate Limiting
export const RATE_LIMIT_REQUESTS_PER_MINUTE = 30;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// AI Service Limits
export const AI_DAILY_QUESTIONS_LIMIT = 10;
export const AI_CACHE_TTL_RECOMMENDATIONS_MINUTES = 60;
export const AI_CACHE_TTL_QUESTIONS_MINUTES = 30;

// Fetch Timeouts
export const FETCH_TIMEOUT_MS = 10000; // 10 seconds
export const FETCH_MAX_RETRIES = 3;
export const FETCH_RETRY_DELAY_MS = 1000; // 1 second

// Reminder Settings
export const REMINDER_TIMES = ['09:00', '14:00', '19:00', '22:00'] as const;

// Conversation Timeouts
export const CONVERSATION_TIMEOUT_MINUTES = 30;

// Database Cleanup
export const MESSAGE_RETENTION_DAYS = 90;

// Bot Response Delays
export const TYPING_INDICATOR_DURATION_MS = 1000;
