// /ask Command Handler

import type { BotResponse } from '@/types/telegram';
import { answerQuestion } from '../ai-service';
import { getAIQuestionTracking, incrementAIQuestionCount } from '../database';

export async function handleAskCommand(
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

  const question = args.join(' ').trim();

  if (!question) {
    return {
      text: `💡 *Как задать вопрос AI*

Используй: /ask [твой вопрос]

*Примеры:*
/ask Как работают циклы в Python?
/ask Что такое переменная?
/ask Объясни функции простыми словами

*Лимит:* 10 вопросов в день`,
      parseMode: 'Markdown'
    };
  }

  try {
    // Check daily limit
    const { data: tracking } = await getAIQuestionTracking(userId);

    if (!tracking || tracking.questions_remaining <= 0) {
      return {
        text: `⏳ *Лимит вопросов исчерпан*

Ты использовал все 10 вопросов на сегодня.
Лимит обновится завтра.

💡 Попробуй:
• Поискать ответ в теории урока
• Использовать подсказки (/hint)`,
        parseMode: 'Markdown'
      };
    }

    // Get answer from AI
    const answer = await answerQuestion(question, {
      day: 1, // TODO: Get from user progress
      topic: 'Основы программирования'
    });

    // Increment question count
    await incrementAIQuestionCount(userId);

    const remaining = tracking.questions_remaining - 1;

    const text = `💡 *Ответ AI помощника*

${answer}

📊 Осталось вопросов сегодня: ${remaining}/10`;

    return {
      text,
      parseMode: 'Markdown'
    };
  } catch (error) {
    console.error('Error answering question:', error);
    return {
      text: '❌ Не удалось получить ответ. Попробуй позже или переформулируй вопрос.',
      parseMode: 'Markdown'
    };
  }
}

