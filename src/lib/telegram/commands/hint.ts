// /hint Command Handler

import type { BotResponse } from '@/types/telegram';
import { generateHint } from '../ai-service';

export async function handleHintCommand(
  userId: string,
  args: string[]
): Promise<BotResponse> {
  if (!userId) {
    return {
      text: '⚠️ Сначала зарегистрируйся на сайте VibeStudy.',
      parseMode: 'Markdown'
    };
  }

  const taskId = args[0];

  if (!taskId) {
    return {
      text: `💡 *Система подсказок*

Используй: /hint [номер_задачи]

*Пример:* /hint task1

*Уровни подсказок:*
1️⃣ Тонкая - направление мысли
2️⃣ Средняя - больше деталей
3️⃣ Детальная - почти решение

⚠️ За подсказки снимаются баллы`,
      parseMode: 'Markdown'
    };
  }

  try {
    const hint = await generateHint(taskId, '', 'subtle');

    return {
      text: `💡 *Подсказка для ${taskId}*

${hint}

Нужна более детальная подсказка? Подожди 5 минут и запроси снова.`,
      parseMode: 'Markdown'
    };
  } catch (error) {
    return {
      text: '❌ Не удалось получить подсказку. Попробуй позже.',
      parseMode: 'Markdown'
    };
  }
}

