import { NextResponse } from 'next/server';
import { callChatCompletion, extractMessageContent, isAiConfigured } from '@/lib/ai-client';
import { theoryExplanationSchema } from '@/lib/validation/schemas';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/rate-limit';
import { aiQueue } from '@/lib/ai/pipeline';
import { errorHandler } from '@/lib/error-handler';
import { logWarn, logError } from '@/lib/logger';
import { apiCache, CACHE_TTL, generateCacheKey } from '@/lib/cache/api-cache';
import { createHash } from 'crypto';

interface ExplainTheoryRequest {
  question: string;
  context: {
    day: number;
    topic: string;
    theory?: string;
  };
  languageId: string;
  locale?: 'ru' | 'en';
}

interface ExplainTheoryResponse {
  explanation: string;
  examples?: string[];
  relatedTopics?: string[];
}

const buildExplainPrompt = ({ question, context, languageId, locale = 'ru' }: ExplainTheoryRequest) => {
  if (locale === 'en') {
    return buildEnglishExplainPrompt({ question, context, languageId });
  }
  return buildRussianExplainPrompt({ question, context, languageId });
};

const buildRussianExplainPrompt = ({ question, context, languageId }: Omit<ExplainTheoryRequest, 'locale'>) => `Ты — опытный преподаватель программирования. Ученик изучает ${languageId} и задал вопрос по теории.

КОНТЕКСТ ОБУЧЕНИЯ:
День: ${context.day} из 90
Тема дня: ${context.topic}
${context.theory ? `Теория:\n${context.theory.slice(0, 500)}...` : ''}

ВОПРОС УЧЕНИКА:
${question}

ТВОЯ ЗАДАЧА:
Дай понятное и подробное объяснение на вопрос ученика.

ТРЕБОВАНИЯ:
1. Объясни концепцию простым языком, подходящим для уровня ученика (день ${context.day})
2. Приведи 1-3 практических примера на ${languageId}
3. Укажи связанные темы, которые помогут глубже понять вопрос
4. Будь точным, но не перегружай терминами
5. Если вопрос выходит за рамки текущего уровня — объясни базовую часть и укажи, что изучить позже

ВАЖНО:
- Отвечай на русском языке
- Примеры кода должны быть короткими и понятными
- Связывай объяснение с темой дня
- Мотивируй продолжать обучение

Ответь СТРОГО в JSON формате:
{
  "explanation": "подробное объяснение",
  "examples": ["пример 1 с комментариями", "пример 2"],
  "relatedTopics": ["связанная тема 1", "связанная тема 2"]
}`;

const buildEnglishExplainPrompt = ({ question, context, languageId }: Omit<ExplainTheoryRequest, 'locale'>) => `You are an experienced programming teacher. A student is learning ${languageId} and asked a question about theory.

LEARNING CONTEXT:
Day: ${context.day} of 90
Today's Topic: ${context.topic}
${context.theory ? `Theory:\n${context.theory.slice(0, 500)}...` : ''}

STUDENT'S QUESTION:
${question}

YOUR TASK:
Provide a clear and detailed explanation to the student's question.

REQUIREMENTS:
1. Explain the concept in simple language, appropriate for the student's level (day ${context.day})
2. Provide 1-3 practical examples in ${languageId}
3. Mention related topics that will help understand the question better
4. Be precise, but don't overload with terminology
5. If the question is beyond the current level — explain the basic part and indicate what to study later

IMPORTANT:
- Respond in English
- Code examples should be short and clear
- Connect the explanation to today's topic
- Motivate to continue learning

Respond STRICTLY in JSON format:
{
  "explanation": "detailed explanation",
  "examples": ["example 1 with comments", "example 2"],
  "relatedTopics": ["related topic 1", "related topic 2"]
}`;

const parseAiResponse = (content: string): ExplainTheoryResponse | null => {
  try {
    const sanitized = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(sanitized) as ExplainTheoryResponse;
    
    if (!parsed.explanation) {
      return null;
    }
    
    return {
      explanation: parsed.explanation,
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : []
    };
  } catch (error) {
    logWarn('Ошибка парсинга ответа AI при объяснении теории', {
      component: 'api/explain-theory',
      metadata: { error: error instanceof Error ? error.message : 'unknown' }
    });
    return null;
  }
};

const getBaseFallbackResponse = (locale: 'ru' | 'en' = 'ru'): ExplainTheoryResponse => ({
  explanation: locale === 'en'
    ? 'Sorry, unable to get an explanation. Try rephrasing your question or refer to today\'s theory.'
    : 'Извините, не удалось получить объяснение. Попробуйте переформулировать вопрос или обратитесь к теории дня.',
  examples: [] as string[],
  relatedTopics: [] as string[]
});

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function buildCodeExample(languageId: string, expression: string, result: number) {
  const formattedResult = formatNumber(result);

  switch (languageId) {
    case 'python':
      return `result = ${expression}\nprint(result)  # ${formattedResult}`;
    case 'javascript':
    case 'typescript':
      return `const result = ${expression};\nconsole.log(result); // ${formattedResult}`;
    case 'java':
      return `int result = ${expression};\nSystem.out.println(result); // ${formattedResult}`;
    case 'cpp':
      return `int result = ${expression};\nstd::cout << result; // ${formattedResult}`;
    case 'go':
      return `result := ${expression}\nfmt.Println(result) // ${formattedResult}`;
    case 'csharp':
      return `var result = ${expression};\nConsole.WriteLine(result); // ${formattedResult}`;
    default:
      return `${expression} = ${formattedResult}`;
  }
}

function tryComputeArithmetic(question: string) {
  const normalized = question.toLowerCase().replace(/,/g, '.');
  const sanitized = normalized.replace(/[?!]+/g, ' ');

  const patterns: Array<{ regex: RegExp; op: (a: number, b: number) => number; symbol: string }> = [
    { regex: /(\d+(?:\.\d+)?)\s*(?:\+|плюс|сложить|добавить|прибавить)\s*(\d+(?:\.\d+)?)/, op: (a, b) => a + b, symbol: '+' },
    { regex: /(\d+(?:\.\d+)?)\s*(?:-|\u2212|минус|вычесть|отнять)\s*(\d+(?:\.\d+)?)/, op: (a, b) => a - b, symbol: '-' },
    { regex: /(\d+(?:\.\d+)?)\s*(?:\*|x|×|умножить на|умножь на|умножаем на)\s*(\d+(?:\.\d+)?)/, op: (a, b) => a * b, symbol: '*' },
    { regex: /сколько\s+будет\s+(\d+(?:\.\d+)?)\s+на\s+(\d+(?:\.\d+)?)/, op: (a, b) => a * b, symbol: '*' },
    { regex: /(\d+(?:\.\d+)?)\s+на\s+(\d+(?:\.\d+)?)/, op: (a, b) => a * b, symbol: '*' },
    { regex: /(\d+(?:\.\d+)?)\s*(?:\/|:|делить на|разделить на|раздели на)\s*(\d+(?:\.\d+)?)/, op: (a, b) => a / b, symbol: '/' }
  ];

  for (const { regex, op, symbol } of patterns) {
    const match = sanitized.match(regex);
    if (match) {
      const [_, firstRaw, secondRaw] = match;
      const a = parseFloat(firstRaw);
      const b = parseFloat(secondRaw);
      if (!Number.isNaN(a) && !Number.isNaN(b)) {
        if (symbol === '/' && b === 0) {
          return {
            expression: `${formatNumber(a)} ÷ ${formatNumber(b)}`,
            result: null,
            note: 'Деление на ноль не определено.'
          };
        }

        const result = op(a, b);
        return {
          expression: `${formatNumber(a)} ${symbol === '*' ? '×' : symbol} ${formatNumber(b)}`,
          result,
          note: null
        };
      }
    }
  }

  const expression = sanitized
    .replace(/\b(умножить|умножь|умножаем)\s+на\b/g, '*')
    .replace(/\bразделить\s+на\b/g, '/')
    .replace(/\bделить\s+на\b/g, '/')
    .replace(/\bплюс\b/g, '+')
    .replace(/\bминус\b/g, '-')
    .replace(/[^\d+\-*/().\s]/g, '');

  if (expression && /^[\d+\-*/().\s]+$/.test(expression) && /[+\-*/]/.test(expression)) {
    try {
      const result = Function(`"use strict"; return (${expression});`)();
      if (typeof result === 'number' && Number.isFinite(result)) {
        return {
          expression: expression,
          result,
          note: null
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

function createFallbackResponse(request: ExplainTheoryRequest, reason?: string): ExplainTheoryResponse {
  const { question, languageId, context, locale = 'ru' } = request;
  const arithmetic = tryComputeArithmetic(question);

  if (arithmetic) {
    if (arithmetic.result === null) {
      return {
        explanation: locale === 'en'
          ? `The question "${question}" involves division by zero. In classical arithmetic, this operation is undefined.`
          : `Вопрос "${question}" сводится к делению на ноль. В классической арифметике такое действие не определено.`,
        examples: locale === 'en'
          ? [
              'Rule: division by zero is forbidden.',
              'Try to modify the expression so the denominator is not zero.'
            ]
          : [
              'Правило: деление на ноль запрещено.',
              'Постарайтесь изменить выражение, чтобы знаменатель не равнялся нулю.'
            ],
        relatedTopics: locale === 'en'
          ? ['Basic Arithmetic', 'Working with Numbers']
          : ['Базовая арифметика', 'Работа с числами']
      };
    }

    const formattedResult = formatNumber(arithmetic.result);
    const expression = arithmetic.expression;
    const codeExample = buildCodeExample(languageId, expression.replace(/×/g, '*'), arithmetic.result);

    return {
      explanation: locale === 'en'
        ? `This is a basic arithmetic example. ${expression} = ${formattedResult}.`
        : `Это базовый пример арифметики. ${expression} = ${formattedResult}.`,
      examples: [
        codeExample,
        locale === 'en'
          ? `Mental check: ${expression.split('×').join(' * ')} = ${formattedResult}`
          : `Проверка в уме: ${expression.split('×').join(' * ')} = ${formattedResult}`
      ],
      relatedTopics: locale === 'en'
        ? ['Mathematical Operations', `Day ${context.day}: ${context.topic}`]
        : ['Математические операции', `День ${context.day}: ${context.topic}`]
    };
  }

  return {
    explanation: locale === 'en'
      ? `Unable to get an answer from AI yet. The question was: "${question}". Try to clarify the wording or review the theory on "${context.topic}".`
      : `Пока не удалось получить ответ от AI. Вопрос был: "${question}". Попробуйте уточнить формулировку или посмотреть теорию по теме "${context.topic}".`,
    examples: [],
    relatedTopics: locale === 'en'
      ? [`Day ${context.day}: ${context.topic}`, 'Theory Review']
      : [`День ${context.day}: ${context.topic}`, 'Повторение теории']
  };
}

export async function POST(request: Request) {
  const rateState = evaluateRateLimit(request, RATE_LIMITS.AI_EXPLAIN, {
    bucketId: 'explain-theory'
  });

  if (!rateState.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Please wait before requesting another explanation.'
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateState)
      }
    );
  }

  let body: ExplainTheoryRequest;
  try {
    const raw = await request.json();
    body = theoryExplanationSchema.parse(raw) as ExplainTheoryRequest;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Валидация
  if (!body.question || body.question.trim().length < 3) {
    const locale = body.locale || 'ru';
    return NextResponse.json({
      explanation: locale === 'en'
        ? 'Please ask a more specific question.'
        : 'Пожалуйста, задайте более конкретный вопрос.',
      examples: [],
      relatedTopics: []
    });
  }

  if (!isAiConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      logWarn('HF_TOKEN не задан. Возвращаем fallback объяснение.', {
        component: 'api/explain-theory'
      });
    }
    return NextResponse.json(createFallbackResponse(body, 'missing_api_key'));
  }

  const cacheKey = generateCacheKey(
    'ai:explain-theory',
    createHash('sha1')
      .update(
        JSON.stringify({
          question: body.question,
          topic: body.context.topic,
          languageId: body.languageId,
          locale: body.locale ?? 'ru'
        })
      )
      .digest('hex')
  );

  const cached = apiCache.get<ExplainTheoryResponse>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, fromCache: true });
  }

  try {
    const prompt = buildExplainPrompt(body);

    const systemMessage = body.locale === 'en'
      ? 'You are a programming teacher. Explain concepts clearly with examples. Respond strictly in JSON. All content must be in English.'
      : 'Ты — преподаватель программирования. Объясняй концепции понятно и с примерами. Отвечай строго в JSON на русском языке.';

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
        metadata: { endpoint: 'explain-theory', topic: body.context.topic }
      }
    );

    const content = raw || extractMessageContent(data);

    const parsedResponse = parseAiResponse(String(content));

    if (!parsedResponse) {
      return NextResponse.json(createFallbackResponse(body, 'parse_error'), { status: 200 });
    }

    apiCache.set(cacheKey, parsedResponse, CACHE_TTL.AI_CONTENT);
    return NextResponse.json(parsedResponse);
  } catch (error) {
    logError('Ошибка при обращении к AI API для объяснения теории', error as Error, {
      component: 'api/explain-theory'
    });
    errorHandler.report(error as Error, {
      component: 'api/explain-theory',
      action: 'POST'
    });
    return NextResponse.json(createFallbackResponse(body, 'unexpected_error'), { status: 200 });
  }
}
