import { NextResponse } from 'next/server';
import { callChatCompletion, extractMessageContent, isAiConfigured } from '@/lib/ai-client';

interface CheckSolutionRequest {
  code: string;
  task: {
    title: string;
    description: string;
    difficulty: string;
    hints?: string[];
  };
  languageId: string;
}

interface CheckSolutionResponse {
  success: boolean;
  message: string;
  feedback?: string;
  suggestions?: string[];
  score?: number;
}

const buildCheckPrompt = ({ code, task, languageId }: CheckSolutionRequest) => `Ты — опытный преподаватель программирования и code reviewer.

ЗАДАЧА УЧЕНИКА:
Название: ${task.title}
Описание: ${task.description}
Сложность: ${task.difficulty}
Язык: ${languageId}

КОД УЧЕНИКА:
\`\`\`${languageId}
${code}
\`\`\`

ТВОЯ ЗАДАЧА:
Проанализируй код ученика и дай детальную обратную связь.

ТРЕБОВАНИЯ К ОТВЕТУ:
1. Определи, решает ли код поставленную задачу (success: true/false)
2. Дай краткое сообщение (message) — похвали или укажи на проблему
3. Предоставь детальную обратную связь (feedback):
   - Что сделано правильно
   - Какие есть ошибки (логические, синтаксические, стилистические)
   - Соответствует ли решение уровню сложности
4. Дай 2-3 конкретных совета по улучшению (suggestions)
5. Оцени решение от 0 до 100 (score)

ВАЖНО:
- Будь конструктивным и поддерживающим
- Объясняй ошибки простым языком
- Давай примеры исправлений
- Учитывай уровень задачи (не требуй от новичка продвинутых паттернов)

Ответь СТРОГО в JSON формате:
{
  "success": boolean,
  "message": "краткое сообщение",
  "feedback": "детальный разбор",
  "suggestions": ["совет 1", "совет 2", "совет 3"],
  "score": число от 0 до 100
}`;

const fallbackResponse: CheckSolutionResponse = {
  success: false,
  message: 'Не удалось проверить решение. Попробуйте позже.',
  feedback: 'Сервис проверки временно недоступен.',
  suggestions: ['Проверьте синтаксис кода', 'Убедитесь, что код решает задачу'],
  score: 0
};

const parseAiResponse = (content: string): CheckSolutionResponse => {
  try {
    const sanitized = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(sanitized) as CheckSolutionResponse;
    
    // Валидация обязательных полей
    if (typeof parsed.success !== 'boolean' || !parsed.message) {
      return fallbackResponse;
    }
    
    return {
      success: parsed.success,
      message: parsed.message,
      feedback: parsed.feedback || '',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 0
    };
  } catch (error) {
    console.warn('Ошибка парсинга ответа AI при проверке кода:', error, content);
    return fallbackResponse;
  }
};

export async function POST(request: Request) {
  const body = (await request.json()) as CheckSolutionRequest;

  // Базовая валидация
  if (!body.code || body.code.trim().length < 5) {
    return NextResponse.json({
      success: false,
      message: 'Код слишком короткий или пустой',
      feedback: 'Напишите решение задачи перед проверкой.',
      suggestions: ['Внимательно прочитайте условие задачи', 'Напишите код, который решает задачу'],
      score: 0
    });
  }

  if (!isAiConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('HF_TOKEN не задан. Возвращаем fallback для проверки кода.');
    }
    return NextResponse.json({
      success: true,
      message: 'Код принят! (проверка в демо-режиме)',
      feedback: 'Автоматическая проверка временно недоступна. Ваше решение сохранено.',
      suggestions: ['Попросите наставника проверить ваш код', 'Сравните с примерами решений'],
      score: 75
    });
  }

  try {
    const prompt = buildCheckPrompt(body);

    const { data, raw } = await callChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Ты — опытный code reviewer и преподаватель. Анализируй код студентов конструктивно и подробно. Отвечай строго в JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      maxTokens: 1500,
      responseFormat: { type: 'json_object' }
    });

    const content = raw || extractMessageContent(data);

    const parsedResponse = parseAiResponse(String(content));

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Ошибка при обращении к AI API для проверки кода:', error);
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

