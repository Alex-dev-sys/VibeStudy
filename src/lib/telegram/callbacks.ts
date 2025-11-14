// Callback Query Handlers

import type { CallbackQuery, BotResponse } from '@/types/telegram';

export async function handleCallbackQuery(
  callback: CallbackQuery,
  userId: string
): Promise<BotResponse | null> {
  const data = callback.data;
  
  if (!data) return null;
  
  // Parse callback data
  const [action, ...params] = data.split(':');
  
  switch (action) {
    case 'today_lesson':
      return {
        text: '📚 Открой сегодняшний урок на сайте VibeStudy!',
        parseMode: 'Markdown'
      };
    
    case 'my_progress':
      return {
        text: '📊 Используй /stats для просмотра статистики',
        parseMode: 'Markdown'
      };
    
    case 'get_advice':
      return {
        text: '💡 Используй /advice для получения персонального совета',
        parseMode: 'Markdown'
      };
    
    default:
      return {
        text: '❓ Неизвестное действие',
        parseMode: 'Markdown'
      };
  }
}

