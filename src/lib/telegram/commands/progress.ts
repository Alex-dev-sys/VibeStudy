// /progress Command Handler

import type { BotResponse } from '@/types/telegram';

export async function handleProgressCommand(
  userId: string
): Promise<BotResponse> {
  if (!userId) {
    return {
      text: '⚠️ Сначала зарегистрируйся на сайте VibeStudy.',
      parseMode: 'Markdown'
    };
  }
  
  const text = `📈 *Детальный прогресс*

*Эта неделя:*
Дней завершено: 0/7
Задач выполнено: 0
Скорость: 0 дней/неделю

*Сравнение:*
Ты: 0% завершено
Средний пользователь: 15%

Начни обучение чтобы увидеть прогресс! 💪`;

  return {
    text,
    parseMode: 'Markdown'
  };
}

