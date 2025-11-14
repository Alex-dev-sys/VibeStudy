// /topics Command Handler

import type { BotResponse } from '@/types/telegram';

export async function handleTopicsCommand(
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
  
  const text = `📚 *Твоё мастерство по темам*

Пока нет данных. Начни обучение чтобы увидеть свой прогресс по темам!

После прохождения нескольких дней здесь появится:
• Процент владения каждой темой
• Рекомендации для повторения
• Слабые места для улучшения

Удачи в обучении! 🚀`;

  return {
    text,
    parseMode: 'Markdown'
  };
}

