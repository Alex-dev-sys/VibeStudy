// /plan Command Handler

import type { BotResponse } from '@/types/telegram';
import { analyzeLearningPattern, predictCompletionDate } from '../analytics-engine';

export async function handlePlanCommand(
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

  try {
    const pattern = await analyzeLearningPattern(userId);
    const prediction = await predictCompletionDate(userId);

    const optimalTimes = pattern.preferredStudyTimes
      .map(slot => `${slot.hour}:00 (продуктивность ${Math.round(slot.productivity)}%)`)
      .join('\n');

    const requiredDaysPerWeek = pattern.learningVelocity < 5 ? 5 : Math.ceil(pattern.learningVelocity);

    const text = `📅 *Персональный план обучения*

*Твой текущий темп:*
${pattern.learningVelocity.toFixed(1)} дней/неделю

*Рекомендуемый темп:*
${requiredDaysPerWeek} дней/неделю

*Оптимальное время для занятий:*
${optimalTimes || 'Пока нет данных'}

*Рекомендуемая длительность сессии:*
${Math.max(30, Math.round(pattern.averageSessionDuration))} минут

💡 *Совет:*
${prediction.recommendations[0] || 'Занимайся регулярно для лучших результатов'}`;

    return {
      text,
      parseMode: 'Markdown'
    };
  } catch (error) {
    console.error('Error creating plan:', error);
    return {
      text: '❌ Не удалось создать план. Начни обучение чтобы получить рекомендации.',
      parseMode: 'Markdown'
    };
  }
}

