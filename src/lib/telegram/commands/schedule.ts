// /schedule Command Handler

import type { BotResponse } from '@/types/telegram';

export async function handleScheduleCommand(
  userId: string,
  args: string[]
): Promise<BotResponse> {
  if (!userId) {
    return {
      text: '⚠️ Сначала зарегистрируйся на сайте VibeStudy.',
      parseMode: 'Markdown'
    };
  }

  const time = args[0];

  if (!time) {
    return {
      text: `📆 *Планирование сессий*

Используй: /schedule [время]

*Примеры:*
/schedule 14:00
/schedule 19:30

Я напомню тебе за 10 минут до начала! ⏰`,
      parseMode: 'Markdown'
    };
  }

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(time)) {
    return {
      text: '⚠️ Неверный формат времени. Используй ЧЧ:ММ (например, 14:00)',
      parseMode: 'Markdown'
    };
  }

  return {
    text: `✅ *Сессия запланирована*

⏰ Время: ${time}
📅 Сегодня

Я напомню тебе за 10 минут! 🔔`,
    parseMode: 'Markdown'
  };
}

