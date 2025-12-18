import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { saveGeneratedContent } from '@/lib/database/db';
import { callChatCompletion, extractMessageContent, isAiConfiguredAsync } from '@/lib/ai-client';
import { taskGenerationSchema } from '@/lib/validation/schemas';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/core/rate-limit';
import { logWarn, logError, logInfo } from '@/lib/core/logger';
import { errorHandler } from '@/lib/core/error-handler';
import { aiQueue } from '@/lib/ai/pipeline';
import { apiCache, CACHE_TTL, generateCacheKey } from '@/lib/cache/api-cache';
import { withTierCheck } from '@/middleware/with-tier-check';
import { buildPrompt, ExtendedRequestBody } from '@/lib/ai/prompts';
import { withRetry } from '@/lib/ai/retry-service';
import { generatedContentSchema, GeneratedContent } from '@/lib/ai/schemas';
import { getDayTheme } from '@/data/themes';

const fallbackResponse: GeneratedContent = {
  theory: `# Основы программирования

Программирование — это искусство создания инструкций для компьютера. Представь, что ты пишешь рецепт для робота-повара: каждый шаг должен быть чётким и понятным.

## Почему это важно?

Умение программировать открывает двери в мир технологий. Ты сможешь создавать сайты, приложения, игры и автоматизировать рутинные задачи.

## Ключевые концепции

**Переменные** — это как коробки с именами, в которых хранятся данные. Например:
\`\`\`python
name = "Иван"
age = 25
\`\`\`

**Функции** — это набор инструкций, которые можно вызывать по имени:
\`\`\`python
def greet(name):
    print(f"Привет, {name}!")

greet("Мир")
\`\`\`

**Условия** позволяют программе принимать решения:
\`\`\`python
if age >= 18:
    print("Ты совершеннолетний")
else:
    print("Ты ещё молод")
\`\`\`

## Важные замечания

- Пиши код понятно — это поможет и тебе, и другим
- Тестируй каждый шаг — ошибки легче найти в маленьком коде
- Не бойся ошибок — они часть обучения

Практикуйся каждый день, и успех придёт!`,
  recap: 'Какие основные концепции программирования ты уже знаешь? Расскажи своими словами.',
  recapTask: undefined,
  tasks: [
    {
      id: 'fallback-1',
      difficulty: 'easy',
      prompt: 'Создай переменную с твоим именем и выведи её на экран с помощью print().',
      solutionHint: 'Используй формат: name = "Твоё имя", затем print(name)'
    },
    {
      id: 'fallback-2',
      difficulty: 'easy',
      prompt: 'Создай две числовые переменные a = 10 и b = 5. Выведи их сумму.',
      solutionHint: 'Сложи переменные: result = a + b, затем выведи result'
    },
    {
      id: 'fallback-3',
      difficulty: 'medium',
      prompt: 'Запроси у пользователя имя через input() и выведи приветствие: "Привет, [имя]!"',
      solutionHint: 'Используй input() для получения данных и f-строку для вывода'
    },
    {
      id: 'fallback-4',
      difficulty: 'hard',
      prompt: 'Напиши программу, которая запрашивает два числа и выводит большее из них.',
      solutionHint: 'Используй if-else для сравнения чисел. Не забудь преобразовать input() в int()'
    },
    {
      id: 'fallback-5',
      difficulty: 'challenge',
      prompt: 'Создай простой калькулятор: запроси два числа и операцию (+, -, *, /), выведи результат.',
      solutionHint: 'Используй if-elif-else для выбора операции. Обработай деление на ноль.'
    }
  ]
};

/**
 * Robust JSON parser with multiple recovery strategies
 */
const parseAiResponse = (content: string): GeneratedContent => {
  try {
    // Step 1: Clean up the response
    let sanitized = content
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Step 2: Try to extract JSON if wrapped in other text
    const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      sanitized = jsonMatch[0];
    }

    if (!sanitized || sanitized === 'null' || sanitized === 'undefined') {
      console.warn('[AI Parser] Empty or null response');
      return fallbackResponse;
    }

    if (!sanitized.startsWith('{')) {
      console.warn('[AI Parser] Response does not start with {:', sanitized.slice(0, 100));
      return fallbackResponse;
    }

    // Step 3: Fix common JSON issues before parsing
    sanitized = sanitized
      // Remove trailing commas before } or ]
      .replace(/,(\s*[}\]])/g, '$1')
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    // Step 4: Parse JSON with recovery attempts
    let parsed: unknown;
    try {
      parsed = JSON.parse(sanitized);
    } catch (parseError) {
      console.warn('[AI Parser] Initial parse failed, attempting recovery');

      // Attempt 1: Fix unescaped quotes in strings
      try {
        const fixedQuotes = sanitized
          .replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, '\\\\') // Fix invalid escapes
          .replace(/\t/g, '\\t') // Escape tabs
          .replace(/\r\n/g, '\\n') // Normalize line endings
          .replace(/\r/g, '\\n');
        parsed = JSON.parse(fixedQuotes);
      } catch {
        // Attempt 2: More aggressive cleanup
        try {
          const aggressiveClean = sanitized
            .replace(/[\u0000-\u001F]+/g, ' ')
            .replace(/\n\s*\n/g, '\n');
          parsed = JSON.parse(aggressiveClean);
        } catch {
          console.error('[AI Parser] All recovery attempts failed');
          return fallbackResponse;
        }
      }
    }

    // Step 5: Validate with Zod
    const result = generatedContentSchema.safeParse(parsed);
    if (!result.success) {
      console.warn('[AI Parser] Validation failed:', result.error.issues.map(i => i.message).join(', '));

      // Try to fix common validation issues
      const fixedContent = tryFixValidationIssues(parsed as Record<string, unknown>);
      const retryResult = generatedContentSchema.safeParse(fixedContent);

      if (retryResult.success) {
        console.log('[AI Parser] Content fixed after validation retry');
        return retryResult.data;
      }

      console.error('[AI Parser] Could not fix validation issues');
      return fallbackResponse;
    }

    return result.data;
  } catch (error) {
    console.error('[AI Parser] Unexpected error:', error);
    return fallbackResponse;
  }
};

/**
 * Try to fix common validation issues in AI response
 */
function tryFixValidationIssues(content: Record<string, unknown>): Record<string, unknown> {
  const fixed = { ...content };

  // Ensure recap exists
  if (!fixed.recap || typeof fixed.recap !== 'string' || (fixed.recap as string).length < 20) {
    fixed.recap = 'Что ты узнал из предыдущего урока? Расскажи своими словами.';
  }

  // Fix tasks array
  if (Array.isArray(fixed.tasks)) {
    const difficulties = ['easy', 'easy', 'medium', 'hard', 'challenge'];

    fixed.tasks = fixed.tasks.map((task: unknown, index: number) => {
      if (typeof task !== 'object' || task === null) {
        return {
          id: `task_${index + 1}`,
          difficulty: difficulties[index] || 'medium',
          prompt: 'Выполни практическое задание по теме урока',
          solutionHint: 'Используй изученный материал'
        };
      }

      const t = task as Record<string, unknown>;
      return {
        id: t.id || `task_${index + 1}`,
        difficulty: t.difficulty || difficulties[index] || 'medium',
        prompt: t.prompt || 'Выполни задание',
        solutionHint: t.solutionHint || t.hint || 'Примени знания из теории'
      };
    });

    // Ensure exactly 5 tasks
    while ((fixed.tasks as unknown[]).length < 5) {
      const idx = (fixed.tasks as unknown[]).length;
      (fixed.tasks as unknown[]).push({
        id: `task_${idx + 1}`,
        difficulty: difficulties[idx] || 'challenge',
        prompt: 'Дополнительное задание для практики',
        solutionHint: 'Используй изученный материал'
      });
    }
    if ((fixed.tasks as unknown[]).length > 5) {
      fixed.tasks = (fixed.tasks as unknown[]).slice(0, 5);
    }
  } else {
    // Create default tasks array
    fixed.tasks = [
      { id: 'task_1', difficulty: 'easy', prompt: 'Начни с простого примера', solutionHint: 'Следуй теории' },
      { id: 'task_2', difficulty: 'easy', prompt: 'Закрепи базовые навыки', solutionHint: 'Используй примеры' },
      { id: 'task_3', difficulty: 'medium', prompt: 'Примени знания на практике', solutionHint: 'Комбинируй концепции' },
      { id: 'task_4', difficulty: 'hard', prompt: 'Реши более сложную задачу', solutionHint: 'Разбей на подзадачи' },
      { id: 'task_5', difficulty: 'challenge', prompt: 'Покажи мастерство', solutionHint: 'Используй всё изученное' }
    ];
  }

  return fixed;
}

export const POST = withTierCheck(async (request: NextRequest, tierInfo) => {
  const rateLimitState = await evaluateRateLimit(request, RATE_LIMITS.AI_GENERATION, {
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

  // Получаем тему дня из наших файлов с темами ДО создания кеш ключа
  const dayTheme = getDayTheme(body.languageId, body.day);
  const dayTopic = dayTheme?.topic || '';

  const cacheFingerprint = createHash('sha256')
    .update(
      JSON.stringify({
        day: body.day,
        languageId: body.languageId,
        theorySummary: body.theorySummary,
        previousDaySummary: body.previousDaySummary ?? '',
        locale: body.locale ?? 'ru',
        dayTopic: dayTopic // Добавляем тему в кеш для правильного кеширования
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

  if (!(await isAiConfiguredAsync())) {
    if (process.env.NODE_ENV !== 'production') {
      logWarn('HF_TOKEN not configured, returning fallback', { component: 'api', action: 'generate-tasks' });
    }
    return NextResponse.json({ ...fallbackResponse, isFallback: true }, { status: 200 });
  }

  try {
    // Добавляем тему в body для передачи в промпт (тема уже получена выше)
    if (dayTopic) {
      body.dayTopic = dayTopic;
      logInfo('Using theme for day generation', {
        component: 'api',
        action: 'generate-tasks',
        metadata: { day: body.day, language: body.languageId, theme: dayTopic }
      });
    } else {
      logWarn('No theme found for day, using default generation', {
        component: 'api',
        action: 'generate-tasks',
        metadata: { day: body.day, language: body.languageId }
      });
    }

    const prompt = buildPrompt(body);

    const systemMessage = body.locale === 'en'
      ? `You are an expert programming instructor with 20+ years of experience creating educational content.

CRITICAL REQUIREMENTS:
1. Generate DETAILED theory (minimum 500 words) with 4-5 working code examples
2. Create EXACTLY 5 tasks with gradual difficulty: easy, easy, medium, hard, challenge
3. Respond ONLY with valid JSON - no markdown, no comments, no extra text
4. Theory must be beginner-friendly with real-world analogies
5. All code examples must be syntactically correct and runnable

JSON STRUCTURE (follow exactly):
{
  "theory": "detailed theory text with code examples using triple backticks",
  "recap": "review question about previous lesson",
  "tasks": [
    {"id": "task_1", "difficulty": "easy", "prompt": "specific task", "solutionHint": "brief hint"},
    {"id": "task_2", "difficulty": "easy", "prompt": "specific task", "solutionHint": "brief hint"},
    {"id": "task_3", "difficulty": "medium", "prompt": "specific task", "solutionHint": "brief hint"},
    {"id": "task_4", "difficulty": "hard", "prompt": "specific task", "solutionHint": "brief hint"},
    {"id": "task_5", "difficulty": "challenge", "prompt": "specific task", "solutionHint": "brief hint"}
  ]
}`
      : `Ты — эксперт-преподаватель программирования с 20+ годами опыта создания учебных материалов.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
1. Генерируй ПОДРОБНУЮ теорию (минимум 500 слов) с 4-5 рабочими примерами кода
2. Создай РОВНО 5 задач с нарастающей сложностью: easy, easy, medium, hard, challenge
3. Отвечай ТОЛЬКО валидным JSON — без markdown, без комментариев, без лишнего текста
4. Теория должна быть понятной для новичков с аналогиями из реальной жизни
5. Все примеры кода должны быть синтаксически корректными и запускаемыми

СТРУКТУРА JSON (следуй точно):
{
  "theory": "подробный текст теории с примерами кода в тройных обратных кавычках",
  "recap": "контрольный вопрос по предыдущему уроку",
  "tasks": [
    {"id": "task_1", "difficulty": "easy", "prompt": "конкретное задание", "solutionHint": "краткая подсказка"},
    {"id": "task_2", "difficulty": "easy", "prompt": "конкретное задание", "solutionHint": "краткая подсказка"},
    {"id": "task_3", "difficulty": "medium", "prompt": "конкретное задание", "solutionHint": "краткая подсказка"},
    {"id": "task_4", "difficulty": "hard", "prompt": "конкретное задание", "solutionHint": "краткая подсказка"},
    {"id": "task_5", "difficulty": "challenge", "prompt": "конкретное задание", "solutionHint": "краткая подсказка"}
  ]
}`;

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
              temperature: 0.5, // Снижено для более стабильного и структурированного ответа
              maxTokens: 4500, // Увеличено для детальной теории с примерами
              responseFormat: { type: 'json_object' } // Гарантирует JSON ответ
            }),
          {
            timeoutMs: 150_000, // Увеличен таймаут для длинной генерации
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
