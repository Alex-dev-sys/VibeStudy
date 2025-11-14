// /advice Command Handler

import type { BotResponse } from '@/types/telegram';
import { generateRecommendation } from '../ai-service';

export async function handleAdviceCommand(
  userId: string
): Promise<BotResponse> {
  if (!userId) {
    return {
      text: '⚠️ Сначала зарегистрируйся на сайте VibeStudy.',
      parseMode: 'Markdown'
    };
  }

  try {
    // TODO: Fetch real user context from database
    const context = {
      userId,
      currentDay: 1,
      completedDays: 0,
      streak: 0,
      weakTopics: [],
      learningVelocity: 0,
      lastActiveTime: new Date()
    };

    const advice = await generateRecommendation(context);

    const text = `🎓 *Персональный совет*

${advice}

💡 *Общие советы:*
• Занимайся каждый день хотя бы 30 минут
• Не спеши, лучше понять чем быстро пройти
• Практикуйся на реальных задачах
• Задавай вопросы AI помощнику (/ask)

Удачи в обучении! 🚀`;

    return {
      text,
      parseMode: 'Markdown'
    };
  } catch (error) {
    console.error('Error generating advice:', error);
    return {
      text: '❌ Не удалось сгенерировать совет. Попробуй позже.',
      parseMode: 'Markdown'
    };
  }
}

