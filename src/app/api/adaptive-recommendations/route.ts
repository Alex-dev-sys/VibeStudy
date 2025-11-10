import { NextResponse } from 'next/server';
import { callChatCompletion, extractMessageContent, isAiConfigured } from '@/lib/ai-client';

interface AdaptiveRecommendationsRequest {
  knowledgeProfile: {
    topicMastery: Record<string, {
      topic: string;
      averageScore: number;
      masteryLevel: string;
      totalAttempts: number;
      weakPoints: string[];
    }>;
    weakTopics: string[];
    stats: {
      averageScore: number;
      totalTasksCompleted: number;
    };
  };
  currentDay: number;
  languageId: string;
}

interface AdaptiveRecommendationsResponse {
  recommendations: {
    type: 'review' | 'practice' | 'advance' | 'alternative';
    topic: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    suggestedTasks: {
      title: string;
      difficulty: 'easy' | 'medium' | 'hard';
      description: string;
    }[];
  }[];
  motivationalMessage: string;
  learningPath: {
    current: string;
    next: string[];
    shouldSlowDown: boolean;
    shouldSpeedUp: boolean;
  };
}

const buildRecommendationsPrompt = ({ knowledgeProfile, currentDay, languageId }: AdaptiveRecommendationsRequest) => {
  const weakTopicsText = knowledgeProfile.weakTopics.length > 0
    ? knowledgeProfile.weakTopics.join(', ')
    : 'Нет слабых тем';

  const topicMasteryText = Object.values(knowledgeProfile.topicMastery)
    .slice(0, 10)
    .map(t => `- ${t.topic}: уровень ${t.masteryLevel}, средний балл ${t.averageScore}`)
    .join('\n');

  return `Ты — адаптивная система обучения программированию. Проанализируй профиль студента и дай персональные рекомендации.

═══════════════════════════════════════
ДЕНЬ КУРСА: ${currentDay} из 90
ЯЗЫК: ${languageId}
СРЕДНИЙ БАЛЛ: ${knowledgeProfile.stats.averageScore}
ЗАДАЧ ЗАВЕРШЕНО: ${knowledgeProfile.stats.totalTasksCompleted}
═══════════════════════════════════════

СЛАБЫЕ ТЕМЫ:
${weakTopicsText}

МАСТЕРСТВО ПО ТЕМАМ:
${topicMasteryText || 'Пока нет данных'}

ЗАДАНИЕ:
Проанализируй профиль и верни JSON с рекомендациями:

{
  "recommendations": [
    {
      "type": "review" | "practice" | "advance" | "alternative",
      "topic": "Название темы",
      "reason": "Почему эта рекомендация",
      "priority": "high" | "medium" | "low",
      "suggestedTasks": [
        {
          "title": "Название задачи",
          "difficulty": "easy" | "medium" | "hard",
          "description": "Краткое описание"
        }
      ]
    }
  ],
  "motivationalMessage": "Персональное мотивирующее сообщение",
  "learningPath": {
    "current": "Текущий фокус обучения",
    "next": ["Следующая тема 1", "Следующая тема 2"],
    "shouldSlowDown": false,
    "shouldSpeedUp": false
  }
}

ТИПЫ РЕКОМЕНДАЦИЙ:
- "review": Повторить тему, где есть проблемы
- "practice": Больше практики в текущей теме
- "advance": Готов к более сложным задачам
- "alternative": Альтернативный подход к изучению

ПРАВИЛА:
- Давай 3-5 конкретных рекомендаций
- Учитывай прогресс и слабые места
- Будь конструктивным и мотивирующим
- Если студент отстаёт, рекомендуй замедлиться (shouldSlowDown: true)
- Если студент опережает, можно ускориться (shouldSpeedUp: true)
- Предлагай конкретные задачи для практики
- Отвечай СТРОГО в формате JSON`;
};

const fallbackResponse: AdaptiveRecommendationsResponse = {
  recommendations: [
    {
      type: 'practice',
      topic: 'Текущая тема',
      reason: 'Продолжайте практиковаться для закрепления материала',
      priority: 'medium',
      suggestedTasks: [
        {
          title: 'Базовая практика',
          difficulty: 'easy',
          description: 'Закрепите основы текущей темы'
        }
      ]
    }
  ],
  motivationalMessage: 'Вы отлично справляетесь! Продолжайте в том же духе.',
  learningPath: {
    current: 'Базовые концепции',
    next: ['Следующая тема'],
    shouldSlowDown: false,
    shouldSpeedUp: false
  }
};

export async function POST(request: Request) {
  const body = (await request.json()) as AdaptiveRecommendationsRequest;

  if (!isAiConfigured()) {
    console.warn('GPTLAMA_API_KEY не задан. Возвращаем fallback.');
    return NextResponse.json(fallbackResponse, { status: 200 });
  }

  try {
    const prompt = buildRecommendationsPrompt(body);

    const { data, raw } = await callChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Ты — адаптивная система обучения. Анализируй профиль студента и давай персональные рекомендации. Отвечай строго в JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      maxTokens: 2000,
      responseFormat: { type: 'json_object' }
    });

    const content = raw || extractMessageContent(data);

    try {
      const sanitized = String(content).replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(sanitized) as AdaptiveRecommendationsResponse;

      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        console.warn('Некорректный формат ответа AI:', parsed);
        return NextResponse.json(fallbackResponse, { status: 200 });
      }

      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('Ошибка парсинга ответа AI:', parseError, content);
      return NextResponse.json(fallbackResponse, { status: 200 });
    }
  } catch (error) {
    console.error('Ошибка при получении рекомендаций:', error);
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

