// /start Command Handler

import type { BotResponse } from '@/types/telegram';
import { upsertTelegramProfile, getTelegramProfileByTelegramId } from '../database';
import { getMainMenuKeyboard, getPersistentMainKeyboard } from '../keyboards';

export async function handleStartCommand(
  userId: string,
  telegramUserId: number,
  chatId: number,
  args: string[]
): Promise<BotResponse> {
  let isNewUser = true;

  try {
    // Get or create telegram profile
    const { data: existingProfile } = await getTelegramProfileByTelegramId(telegramUserId);

    isNewUser = !existingProfile;

    // Create/update profile for new users
    // Note: userId might be empty for new users, we'll create a guest profile
    if (!existingProfile) {
      await upsertTelegramProfile({
        user_id: userId || undefined, // Allow undefined for guest users
        telegram_user_id: telegramUserId,
        chat_id: chatId,
        language_code: 'ru',
        timezone: 'Europe/Moscow',
        is_active: true,
        preferences: {}
      });
    }
  } catch (error) {
    console.error('Error managing telegram profile:', error);
    // Continue anyway - bot should work even if DB fails
  }

  // Build quick actions keyboard
  const keyboard = getMainMenuKeyboard();
  const persistentKeyboard = getPersistentMainKeyboard();

  const welcomeText = isNewUser
    ? `👋 Привет! Я бот VibeStudy.

Помогу тебе:
• Напоминать о занятиях
• Отслеживать прогресс
• Давать персональные советы
• Мотивировать на обучение

*Основные команды:*
/stats - Твоя статистика
/progress - Детальный прогресс
/topics - Мастерство по темам
/advice - Персональный совет
/help - Все команды

Выбери действие ниже или используй команды! 🚀`
    : `👋 С возвращением!

Рад снова тебя видеть. Чем могу помочь?

Используй кнопки ниже или команды:
/stats - Статистика
/progress - Прогресс
/help - Помощь`;

  // Send message with persistent keyboard
  // Note: We can't send both inline and reply keyboard in the same message easily if we want the reply keyboard to persist.
  // Usually, we send the reply keyboard with the text, and inline keyboard with specific actions.
  // But here, let's attach the persistent keyboard to the welcome message.

  return {
    text: welcomeText,
    parseMode: 'Markdown',
    replyMarkup: persistentKeyboard
  };
}

