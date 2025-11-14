// /predict Command Handler

import type { BotResponse } from '@/types/telegram';
import { predictCompletionDate } from '../analytics-engine';

export async function handlePredictCommand(
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
    const prediction = await predictCompletionDate(userId);
    
    const date = prediction.estimatedCompletionDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let riskText = '';
    if (prediction.riskFactors.length > 0) {
      riskText = '\n\n⚠️ *Факторы риска:*\n';
      prediction.riskFactors.forEach(risk => {
        const emoji = risk.severity === 'high' ? '🔴' : risk.severity === 'medium' ? '🟡' : '🟢';
        riskText += `${emoji} ${risk.description}\n`;
      });
    }

    let recText = '';
    if (prediction.recommendations.length > 0) {
      recText = '\n\n💡 *Рекомендации:*\n';
      prediction.recommendations.forEach(rec => {
        recText += `• ${rec}\n`;
      });
    }

    const text = `🔮 *Прогноз завершения курса*

📅 Ожидаемая дата: ${date}
📊 Уверенность: ${prediction.confidenceScore}%${riskText}${recText}`;

    return {
      text,
      parseMode: 'Markdown'
    };
  } catch (error) {
    console.error('Error predicting completion:', error);
    return {
      text: '❌ Не удалось создать прогноз. Начни обучение чтобы получить данные.',
      parseMode: 'Markdown'
    };
  }
}

