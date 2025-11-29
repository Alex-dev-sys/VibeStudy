import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { saveGeneratedContent } from '@/lib/db';
import { callChatCompletion, extractMessageContent, isAiConfigured } from '@/lib/ai-client';
import { taskGenerationSchema } from '@/lib/validation/schemas';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/rate-limit';
import { logWarn, logError, logInfo } from '@/lib/logger';
import { errorHandler } from '@/lib/error-handler';
import { aiQueue } from '@/lib/ai/pipeline';
import { apiCache, CACHE_TTL, generateCacheKey } from '@/lib/cache/api-cache';
import { withTierCheck } from '@/middleware/with-tier-check';
import { buildPrompt, ExtendedRequestBody } from '@/lib/ai/prompts';
import { withRetry } from '@/lib/ai/retry-service';
import { generatedContentSchema, GeneratedContent } from '@/lib/ai/schemas';

const fallbackResponse: GeneratedContent = {
  theory: 'Сегодня закрепляем материал через повторение ключевых концепций и реализацию практических сценариев.',
  recap: 'Расскажи своими словами, что важного ты вынес из вчерашнего дня обучения.',
  recapTask: undefined,
  tasks: [
    {
      id: 'fallback-1',
      difficulty: 'easy',
      prompt: 'Опиши шаги решения вчерашней задачи и постарайся улучшить свой алгоритм.',
      solutionHint: 'Вспомни приёмы оптимизации, которые мы обсуждали.'
    },
    {
      id: 'fallback-2',
      difficulty: 'easy',
      prompt: 'Создай простую программу, демонстрирующую базовые концепции.',
      solutionHint: 'Начни с минимальной реализации.'
    },
    {
      id: 'fallback-3',
      difficulty: 'medium',
      prompt: 'Объедини несколько изученных концепций в одной программе.',
      solutionHint: 'Разбей задачу на подзадачи.'
    },
    {
      id: 'fallback-4',
      difficulty: 'hard',
      prompt: 'Реализуй алгоритм с учётом граничных случаев и оптимизации.',
      solutionHint: 'Подумай об обработке ошибок.'
    },
    {
      id: 'fallback-5',
      difficulty: 'challenge',
      prompt: 'Создай законченное мини-приложение, демонстрирующее мастерство.',
      solutionHint: 'Используй всё изученное ранее.'
    }
  ]
};

const parseAiResponse = (content: string): GeneratedContent => {
  try {
    const sanitized = content.replace(/```json|```/g, '').trim();
    if (!sanitized || sanitized === 'null' || sanitized === 'undefined') {
      return fallbackResponse;
    }
    if (!sanitized.startsWith('{')) {
      console.warn('Ответ AI не похож на JSON, возвращаем fallback.', sanitized.slice(0, 120));
      return fallbackResponse;
    }
    const parsed = JSON.parse(sanitized);

    // Validate content with Zod
    const result = generatedContentSchema.safeParse(parsed);
    if (!result.success) {
      console.warn('Content validation failed:', result.error.message);
      return fallbackResponse;
    }

    return result.data;
  } catch (error) {
    console.warn('Ошибка парсинга ответа AI', error, content);
    return fallbackResponse;
  }
};

export const POST = withTierCheck(async (request: NextRequest, tierInfo) => {
  const rateLimitState = evaluateRateLimit(request, RATE_LIMITS.AI_GENERATION, {
    bucketId: 'generate-tasks'
  });

  if (!rateLimitState.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: rateLimitState.retryAfterSeconds
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateLimitState)
      }
    );
  }

  // Validate request body
  let body: ExtendedRequestBody;
  try {
    const rawBody = await request.json();
    body = taskGenerationSchema.parse(rawBody) as ExtendedRequestBody;
  } catch (error) {
    logWarn('Invalid request body for generate-tasks', {
      component: 'api',
      action: 'generate-tasks',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    return NextResponse.json(
      { error: 'Invalid request body', details: error instanceof Error ? error.message : 'Validation failed' },
      { status: 400 }
    );
  }

  const cacheFingerprint = createHash('sha256')
    .update(
      JSON.stringify({
        day: body.day,
        languageId: body.languageId,
        theorySummary: body.theorySummary,
        previousDaySummary: body.previousDaySummary ?? '',
        locale: body.locale ?? 'ru'
      })
    )
    .digest('hex');
  const cacheKey = generateCacheKey('ai:generate-tasks', cacheFingerprint);
  const cached = apiCache.get<(GeneratedContent & { isFallback?: boolean })>(cacheKey);
  if (cached) {
    return NextResponse.json({
      ...cached,
      isFallback: cached.isFallback ?? false,
      fromCache: true
    });
  }

  if (!isAiConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      logWarn('HF_TOKEN not configured, returning fallback', { component: 'api', action: 'generate-tasks' });
    }
    return NextResponse.json({ ...fallbackResponse, isFallback: true }, { status: 200 });
  }

  try {
    const prompt = buildPrompt(body);

    const systemMessage = body.locale === 'en'
      ? 'You are an expert programming instructor with 20+ years of experience. Your task is to create EXCELLENT educational content. Generate detailed, well-structured theory (minimum 400-600 words) with code examples, and create 5 tasks with gradual difficulty increase. Respond STRICTLY in JSON format. Theory must be beginner-friendly with analogies and practical examples. All code examples must be working and self-contained.'
      : 'Ты — эксперт-преподаватель программирования с 20+ годами опыта. Твоя задача — создать ОТЛИЧНЫЙ учебный материал. Генерируй подробную, хорошо структурированную теорию (минимум 400-600 слов) с примерами кода, создавай 5 задач с плавным нарастанием сложности. Отвечай СТРОГО в JSON формате. Теория должна быть понятной для новичков, с аналогиями и практическими примерами. Все примеры кода должны быть рабочими и самодостаточными.';

    let parsedResponse: GeneratedContent = fallbackResponse;
    let isFallback = true;

    try {
      parsedResponse = await withRetry(async () => {
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
              temperature: 0.7, // Немного снижено для более стабильного и структурированного ответа
              maxTokens: 4000 // Увеличено для детальной теории с примерами
            }),
          {
            timeoutMs: 120_000,
            priority: 'high',
            metadata: { endpoint: 'generate-tasks', day: body.day, languageId: body.languageId }
          }
        );

        const content = raw || extractMessageContent(data);
        const parsed = parseAiResponse(String(content));

        // Check if parsing resulted in fallback (meaning invalid content)
        const isFallbackContent = parsed.tasks?.[0]?.id?.startsWith('fallback-') ?? false;

        if (isFallbackContent) {
          throw new Error('AI returned invalid or fallback content');
        }

        return parsed;
      }, {
        maxRetries: 2,
        component: 'api',
        action: 'generate-tasks',
        shouldRetry: (error) => {
          // Retry on network errors or invalid content
          const errorMessage = error instanceof Error ? error.message : String(error);
          return errorMessage.includes('timeout') ||
            errorMessage.includes('Connection reset') ||
            errorMessage.includes('invalid or fallback content');
        }
      });

      isFallback = false;
    } catch (error) {
      logWarn('All retry attempts failed, using fallback content', {
        component: 'api',
        action: 'generate-tasks',
        metadata: { day: body.day, languageId: body.languageId, lastError: error instanceof Error ? error.message : String(error) }
      });
      // parsedResponse is already fallbackResponse by default, but let's ensure it
      parsedResponse = fallbackResponse;
      isFallback = true;
    }

    // Сохраняем в базу данных
    if (!isFallback) {
      try {
        await saveGeneratedContent({
          day: body.day,
          languageId: body.languageId,
          topic: body.dayTopic ?? 'Тема дня',
          theory: parsedResponse.theory,
          recap: parsedResponse.recap,
          recapTask: parsedResponse.recapTask,
          tasks: parsedResponse.tasks
        });
        apiCache.set(cacheKey, { ...parsedResponse, isFallback }, CACHE_TTL.AI_CONTENT);
        logInfo('Content saved successfully', {
          component: 'api',
          action: 'generate-tasks',
          metadata: { day: body.day, languageId: body.languageId }
        });
      } catch (dbError) {
        logError('Failed to save generated content to DB', dbError as Error, {
          component: 'api',
          action: 'generate-tasks',
          metadata: { day: body.day, languageId: body.languageId }
        });
        // Продолжаем работу даже если не удалось сохранить
      }
    } else {
      logWarn('Skipping save for fallback content', {
        component: 'api',
        action: 'generate-tasks',
        metadata: { day: body.day, languageId: body.languageId }
      });
    }

    return NextResponse.json({ ...parsedResponse, isFallback });
  } catch (error) {
    logError('Error calling AI API', error as Error, {
      component: 'api',
      action: 'generate-tasks',
      metadata: { day: body.day, languageId: body.languageId }
    });
    errorHandler.report(error as Error, {
      component: 'api/generate-tasks',
      action: 'POST',
      metadata: { day: body.day, languageId: body.languageId }
    });
    return NextResponse.json({ ...fallbackResponse, isFallback: true }, { status: 200 });
  }
});

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: 'Используйте POST запрос с данными дня обучения для генерации контента.',
    },
    { status: 200 }
  );
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
