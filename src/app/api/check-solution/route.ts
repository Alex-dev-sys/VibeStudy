import { NextResponse } from 'next/server';

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

  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    console.warn('HF_API_KEY не задан. Возвращаем fallback для проверки кода.');
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

    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:groq',
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
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка API HuggingFace при проверке кода:', response.status, errorText);
      return NextResponse.json(fallbackResponse, { status: 200 });
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const rawContent = choice?.message?.content;

    const content = Array.isArray(rawContent)
      ? rawContent
          .map((part: any) => {
            if (typeof part === 'string') return part;
            if ('text' in part && typeof part.text === 'string') return part.text;
            if ('text' in part && part.text && 'value' in part.text) {
              return typeof part.text.value === 'string' ? part.text.value : '';
            }
            return '';
          })
          .join('\n')
      : rawContent ?? '';

    const parsedResponse = parseAiResponse(String(content));

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Ошибка при обращении к AI API для проверки кода:', error);
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

