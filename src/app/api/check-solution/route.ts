import { NextResponse } from 'next/server';
import { callChatCompletion, extractMessageContent, isAiConfiguredAsync } from '@/lib/ai-client';
import { solutionCheckSchema } from '@/lib/validation/schemas';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/core/rate-limit';
import { errorHandler } from '@/lib/core/error-handler';
import { aiQueue } from '@/lib/ai/pipeline';
import { logWarn, logError } from '@/lib/core/logger';

interface CheckSolutionRequest {
  code: string;
  task: {
    title: string;
    description: string;
    difficulty: string;
    hints?: string[];
  };
  languageId: string;
  locale?: 'ru' | 'en';
}

interface CheckSolutionResponse {
  success: boolean;
  message: string;
  feedback?: string;
  suggestions?: string[];
  score?: number;
}

const buildCheckPrompt = ({ code, task, languageId, locale = 'ru' }: CheckSolutionRequest) => {
  if (locale === 'en') {
    return buildEnglishCheckPrompt({ code, task, languageId });
  }
  return buildRussianCheckPrompt({ code, task, languageId });
};

const buildRussianCheckPrompt = ({ code, task, languageId }: Omit<CheckSolutionRequest, 'locale'>) => `Ты — опытный преподаватель программирования и code reviewer.

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

const buildEnglishCheckPrompt = ({ code, task, languageId }: Omit<CheckSolutionRequest, 'locale'>) => `You are an experienced programming instructor and code reviewer.

STUDENT'S TASK:
Title: ${task.title}
Description: ${task.description}
Difficulty: ${task.difficulty}
Language: ${languageId}

STUDENT'S CODE:
\`\`\`${languageId}
${code}
\`\`\`

YOUR TASK:
Analyze the student's code and provide detailed feedback.

RESPONSE REQUIREMENTS:
1. Determine if the code solves the task (success: true/false)
2. Give a brief message — praise or point out the problem
3. Provide detailed feedback:
   - What was done correctly
   - What errors exist (logical, syntactic, stylistic)
   - Does the solution match the difficulty level
4. Give 2-3 specific improvement suggestions
5. Rate the solution from 0 to 100 (score)

IMPORTANT:
- Be constructive and supportive
- Explain errors in simple terms
- Give examples of corrections
- Consider the task level (don't require advanced patterns from beginners)

Respond STRICTLY in JSON format:
{
  "success": boolean,
  "message": "brief message",
  "feedback": "detailed analysis",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "score": number from 0 to 100
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
    logWarn('Ошибка парсинга ответа AI при проверке кода', {
      component: 'api/check-solution',
      metadata: { error: error instanceof Error ? error.message : 'unknown' }
    });
    return fallbackResponse;
  }
};

export async function POST(request: Request) {
  const rateState = await evaluateRateLimit(request, RATE_LIMITS.AI_CHECK, {
    bucketId: 'check-solution'
  });

  if (!rateState.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many solution checks. Please wait and try again.'
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateState)
      }
    );
  }

  let body: CheckSolutionRequest;
  try {
    const raw = await request.json();
    body = solutionCheckSchema.parse(raw) as CheckSolutionRequest;
  } catch (error) {
    errorHandler.report(error as Error, {
      component: 'api/check-solution',
      action: 'validate'
    });
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Input validation and sanitization
  const MAX_CODE_LENGTH = 10000; // 10KB max
  const MAX_TASK_DESCRIPTION_LENGTH = 2000;

  if (!body.code || body.code.trim().length < 5) {
    return NextResponse.json({
      success: false,
      message: 'Код слишком короткий или пустой',
      feedback: 'Напишите решение задачи перед проверкой.',
      suggestions: ['Внимательно прочитайте условие задачи', 'Напишите код, который решает задачу'],
      score: 0
    });
  }

  if (body.code.length > MAX_CODE_LENGTH) {
    return NextResponse.json({
      success: false,
      message: 'Код слишком длинный',
      feedback: `Максимальная длина кода: ${MAX_CODE_LENGTH} символов.`,
      suggestions: ['Разбейте решение на несколько частей', 'Удалите ненужные комментарии'],
      score: 0
    }, { status: 400 });
  }

  // Sanitize inputs to prevent prompt injection
  const sanitizeInput = (text: string) => {
    // Remove specific AI control tokens and null bytes
    return text
      .replace(/<\|im_start\|>/g, '')
      .replace(/<\|im_end\|>/g, '')
      .replace(/<\|.*?\|>/g, '') // Generic tag removal
      .replace(/\x00/g, '');
  };

  const sanitizedCode = sanitizeInput(body.code.slice(0, MAX_CODE_LENGTH));

  const sanitizedTask = {
    title: sanitizeInput((body.task.title || '').slice(0, 200)),
    description: sanitizeInput((body.task.description || '').slice(0, MAX_TASK_DESCRIPTION_LENGTH)),
    difficulty: sanitizeInput((body.task.difficulty || 'medium').slice(0, 20)),
    hints: body.task.hints?.slice(0, 5).map(h => sanitizeInput(h.slice(0, 200)))
  };

  // Update body with sanitized values
  body = {
    ...body,
    code: sanitizedCode,
    task: sanitizedTask
  };

  if (!(await isAiConfiguredAsync())) {
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

    const systemMessage = body.locale === 'en'
      ? 'You are an experienced code reviewer and instructor. Analyze student code constructively and in detail. Respond strictly in JSON. All content must be in English.'
      : 'Ты — опытный code reviewer и преподаватель. Анализируй код студентов конструктивно и подробно. Отвечай строго в JSON.';

    const { data, raw } = await aiQueue.enqueue(
      () =>
        callChatCompletion({
          messages: [
            {
              role: 'system',
              content: systemMessage
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          maxTokens: 1500,
          responseFormat: { type: 'json_object' }
        }),
      {
        priority: 'normal',
        metadata: { endpoint: 'check-solution', languageId: body.languageId }
      }
    );

    const content = raw || extractMessageContent(data);

    const parsedResponse = parseAiResponse(String(content));

    return NextResponse.json(parsedResponse);
  } catch (error) {
    logError('Ошибка при обращении к AI API для проверки кода', error as Error, {
      component: 'api/check-solution'
    });
    errorHandler.report(error as Error, {
      component: 'api/check-solution',
      action: 'POST'
    });
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

