// /remind Command Handler
// Smart adaptive reminder configuration

import type { BotResponse, InlineKeyboard } from '@/types/telegram';
import { getReminderSchedule, getTelegramProfile } from '../database';

export async function handleRemindCommand(
  userId: string,
  telegramUserId: number,
  chatId: number,
  args: string[]
): Promise<BotResponse> {
  if (!userId) {
    return {
      text: '⚠️ Сначала зарегистрируйся на сайте VibeStudy.',
      parseMode: 'Markdown'
    };
  }

  // Get current reminder settings
  const { data: profile } = await getTelegramProfile(userId);
  const { data: reminders } = await getReminderSchedule(userId);

  const hasReminders = reminders && reminders.length > 0;
  const dailyReminder = reminders?.find(r => r.reminder_type === 'daily_study');
  const streakReminder = reminders?.find(r => r.reminder_type === 'streak_protection');

  const currentTime = dailyReminder?.scheduled_time || 'не установлено';
  const adaptiveMode = dailyReminder?.adaptive_mode || false;
  const dndSettings = profile?.preferences?.do_not_disturb_start
    ? `${profile.preferences.do_not_disturb_start} - ${profile.preferences.do_not_disturb_end}`
    : 'не установлено';

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🌅 Утро (9:00)', callback_data: 'remind:time:09:00' },
        { text: '☀️ День (14:00)', callback_data: 'remind:time:14:00' }
      ],
      [
        { text: '🌆 Вечер (19:00)', callback_data: 'remind:time:19:00' },
        { text: '🌙 Ночь (22:00)', callback_data: 'remind:time:22:00' }
      ],
      [
        { text: adaptiveMode ? '🤖 Адаптивный ✓' : '🤖 Адаптивный режим',
          callback_data: 'remind:toggle:adaptive' },
        { text: streakReminder?.enabled ? '🔥 Защита серии ✓' : '🔥 Защита серии',
          callback_data: 'remind:toggle:streak' }
      ],
      [
        { text: '😴 DND режим', callback_data: 'remind:dnd' },
        { text: hasReminders ? '🔕 Отключить все' : '🔔 Включить',
          callback_data: 'remind:toggle:all' }
      ],
      [
        { text: '🔙 Назад', callback_data: 'btn_menu' }
      ]
    ]
  };

  const text = `⏰ *Умные напоминания*

📱 *Текущие настройки:*
• Время: ${currentTime}
• Адаптивный режим: ${adaptiveMode ? '✅ Вкл' : '❌ Выкл'}
• Защита серии: ${streakReminder?.enabled ? '✅ Вкл' : '❌ Выкл'}
• DND режим: ${dndSettings}

🤖 *Адаптивный режим*
Бот автоматически подберёт лучшее время для напоминаний на основе твоей активности!

🔥 *Защита серии*
Дополнительное напоминание вечером, если ты еще не занимался и серия под угрозой.

😴 *Do-Not-Disturb*
Установи период, когда не хочешь получать напоминания (например, ночью).

Выбери опцию ниже:`;

  return {
    text,
    parseMode: 'Markdown',
    replyMarkup: keyboard
  };
}

