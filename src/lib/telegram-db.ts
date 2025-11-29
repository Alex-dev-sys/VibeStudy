/**
 * DEPRECATED: This file is deprecated in favor of src/lib/telegram/database.ts
 *
 * Migration Notice:
 * - Old localStorage-based storage has been migrated to Supabase
 * - Use src/lib/telegram/database.ts for all Telegram data operations
 * - This file is kept for backward compatibility only
 *
 * New functions in database.ts:
 * - getTelegramProfile(userId)
 * - getTelegramProfileByTelegramId(telegramUserId)
 * - upsertTelegramProfile(profile)
 * - getReminderSchedule(userId)
 * - upsertReminderSchedule(schedule)
 * - logTelegramMessage(userId, telegramUserId, type, content, metadata)
 * - getConversation(userId)
 * - upsertConversation(conversation)
 *
 * @deprecated Use src/lib/telegram/database.ts instead
 */

import {
  getTelegramProfile,
  getTelegramProfileByTelegramId,
  upsertTelegramProfile,
  getReminderSchedule,
  upsertReminderSchedule
} from './telegram/database';

interface TelegramUserData {
  telegramUsername: string;
  telegramChatId: number;
  reminderTime: string; // "09:00", "14:00", "19:00", "22:00"
  reminderEnabled: boolean;
  timezone: string;
  currentDay: number;
  completedDays: number;
  streak: number;
  averageScore: number;
  lastActivity: number;
  languageId: string;
}

/**
 * @deprecated Use getTelegramProfileByTelegramId from database.ts
 */
export async function saveTelegramUser(username: string, chatId: number): Promise<void> {
  console.warn('saveTelegramUser is deprecated. Use upsertTelegramProfile from telegram/database.ts');

  try {
    await upsertTelegramProfile({
      telegram_user_id: chatId,
      chat_id: chatId,
      username: username,
      language_code: 'ru',
      timezone: 'Europe/Moscow',
      is_active: true,
      preferences: {
        notifications_enabled: true,
        daily_digest_time: '19:00'
      }
    });
  } catch (error) {
    console.error('Error saving telegram user:', error);
  }
}

/**
 * @deprecated No direct replacement - query Supabase directly
 */
export async function getTelegramUsers(): Promise<Record<string, Partial<TelegramUserData>>> {
  console.warn('getTelegramUsers is deprecated. Query Supabase directly for your use case.');
  return {};
}

/**
 * @deprecated Use getTelegramProfileByTelegramId from database.ts
 */
export async function getChatIdByUsername(username: string): Promise<number | null> {
  console.warn('getChatIdByUsername is deprecated. Use getTelegramProfileByTelegramId from telegram/database.ts');
  return null;
}

/**
 * @deprecated Use upsertReminderSchedule from database.ts
 */
export async function updateReminderSettings(
  username: string,
  settings: {
    reminderEnabled?: boolean;
    reminderTime?: string;
    timezone?: string;
  }
): Promise<void> {
  console.warn('updateReminderSettings is deprecated. Use upsertReminderSchedule from telegram/database.ts');
}

/**
 * @deprecated Use getReminderSchedule from database.ts with proper filtering
 */
export async function getUsersForReminder(hour: number): Promise<TelegramUserData[]> {
  console.warn('getUsersForReminder is deprecated. Query reminder_schedules table directly.');
  return [];
}

/**
 * @deprecated Use getTelegramProfile from database.ts
 */
export async function isTelegramConnected(username: string): Promise<boolean> {
  console.warn('isTelegramConnected is deprecated. Use getTelegramProfile from telegram/database.ts');
  return false;
}

const telegramDb = {
  saveTelegramUser,
  getTelegramUsers,
  getChatIdByUsername,
  updateReminderSettings,
  getUsersForReminder,
  isTelegramConnected
};

export default telegramDb;

