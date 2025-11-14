// /community Command Handler

import type { BotResponse, InlineKeyboard } from '@/types/telegram';

export async function handleCommunityCommand(
  userId: string,
  telegramUserId: number,
  chatId: number,
  args: string[]
): Promise<BotResponse> {
  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: '🏆 Лидерборд', callback_data: 'community:leaderboard' },
        { text: '👥 Группы', callback_data: 'community:groups' }
      ],
      [
        { text: '💬 Обсуждения', callback_data: 'community:discussions' },
        { text: '🤝 Найти напарника', callback_data: 'community:buddy' }
      ]
    ]
  };

  const text = `👥 *Сообщество VibeStudy*

*Лидерборд* 🏆
Посмотри топ учеников и свою позицию

*Группы обучения* 👥
Присоединяйся к группам по интересам

*Обсуждения* 💬
Задавай вопросы и помогай другим

*Напарник по обучению* 🤝
Найди того, кто учится вместе с тобой

Выбери раздел:`;

  return {
    text,
    parseMode: 'Markdown',
    replyMarkup: keyboard
  };
}

