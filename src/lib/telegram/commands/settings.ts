// /settings Command Handler

import type { BotResponse, InlineKeyboard } from '@/types/telegram';

export async function handleSettingsCommand(): Promise<BotResponse> {
  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: '⏰ Напоминания', callback_data: 'settings:reminders' },
        { text: '🌍 Язык', callback_data: 'settings:language' }
      ],
      [
        { text: '🔔 Уведомления', callback_data: 'settings:notifications' },
        { text: '🔒 Приватность', callback_data: 'settings:privacy' }
      ]
    ]
  };
  
  const text = `⚙️ *Настройки бота*

Выбери что хочешь настроить:

⏰ *Напоминания* - время и частота
🌍 *Язык* - русский или английский
🔔 *Уведомления* - что получать
🔒 *Приватность* - управление данными

Или используй команды:
/remind - Настроить напоминания
/language - Сменить язык
/privacy - Приватность`;

  return {
    text,
    parseMode: 'Markdown',
    replyMarkup: keyboard
  };
}

