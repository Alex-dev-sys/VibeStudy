// /challenge Command Handler

import type { BotResponse, InlineKeyboard } from '@/types/telegram';

export async function handleChallengeCommand(
  userId: string,
  telegramUserId: number,
  chatId: number,
  args: string[]
): Promise<BotResponse> {
  const challenges = [
    {
      title: 'Быстрый код',
      description: 'Напиши функцию за 5 минут',
      difficulty: 'Легко',
      points: 10
    },
    {
      title: 'Без ошибок',
      description: 'Реши 3 задачи без подсказок',
      difficulty: 'Средне',
      points: 25
    },
    {
      title: 'Марафон',
      description: 'Занимайся 7 дней подряд',
      difficulty: 'Сложно',
      points: 50
    }
  ];

  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Принять челлендж', callback_data: 'challenge:accept' },
        { text: '🔄 Другой', callback_data: 'challenge:next' }
      ]
    ]
  };

  const text = `🎯 *Ежедневный челлендж*

*${randomChallenge.title}*
${randomChallenge.description}

📊 Сложность: ${randomChallenge.difficulty}
⭐ Награда: ${randomChallenge.points} баллов

Принимаешь вызов?`;

  return {
    text,
    parseMode: 'Markdown',
    replyMarkup: keyboard
  };
}

