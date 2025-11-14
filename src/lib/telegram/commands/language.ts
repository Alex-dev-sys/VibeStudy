// /language Command Handler

import type { BotResponse, InlineKeyboard } from '@/types/telegram';

export async function handleLanguageCommand(): Promise<BotResponse> {
  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🇷🇺 Русский', callback_data: 'lang:ru' },
        { text: '🇬🇧 English', callback_data: 'lang:en' }
      ]
    ]
  };

  const text = `🌍 *Выбор языка / Language Selection*

Выбери язык интерфейса бота:
Choose bot interface language:

🇷🇺 Русский - текущий
🇬🇧 English - available`;

  return {
    text,
    parseMode: 'Markdown',
    replyMarkup: keyboard
  };
}

