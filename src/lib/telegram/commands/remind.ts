// /remind Command Handler

import type { BotResponse, InlineKeyboard } from '@/types/telegram';

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

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🌅 Утро (9:00)', callback_data: 'remind:morning' },
        { text: '☀️ День (14:00)', callback_data: 'remind:afternoon' }
      ],
      [
        { text: '🌆 Вечер (19:00)', callback_data: 'remind:evening' },
        { text: '🌙 Ночь (22:00)', callback_data: 'remind:night' }
      ],
      [
        { text: '⏰ Свое время', callback_data: 'remind:custom' },
        { text: '🔕 Отключить', callback_data: 'remind:off' }
      ]
    ]
  };

  const text = `⏰ *Настройка напоминаний*

Выбери удобное время для напоминаний о занятиях:

🌅 *Утро* - 9:00
☀️ *День* - 14:00
🌆 *Вечер* - 19:00
🌙 *Ночь* - 22:00

Напоминания помогут не забывать о занятиях и поддерживать серию! 🔥`;

  return {
    text,
    parseMode: 'Markdown',
    replyMarkup: keyboard
  };
}

