import { NextResponse } from 'next/server';
import { callChatCompletion, extractMessageContent, isAiConfigured } from '@/lib/ai-client';

interface ExplainTheoryRequest {
  question: string;
  context: {
    day: number;
    topic: string;
    theory?: string;
  };
  languageId: string;
}

interface ExplainTheoryResponse {
  explanation: string;
  examples?: string[];
  relatedTopics?: string[];
}

const buildExplainPrompt = ({ question, context, languageId }: ExplainTheoryRequest) => `Ты — опытный преподаватель программирования. Ученик изучает ${languageId} и задал вопрос по теории.

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
    console.warn('Ошибка парсинга ответа AI при объяснении теории:', error, content);
    return null;
  }
};

const baseFallbackResponse = {
  explanation: 'Извините, не удалось получить объяснение. Попробуйте переформулировать вопрос или обратитесь к теории дня.',
  examples: [] as string[],
  relatedTopics: [] as string[]
};

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
  const { question, languageId, context } = request;
  const arithmetic = tryComputeArithmetic(question);

  if (arithmetic) {
    if (arithmetic.result === null) {
      return {
        explanation: `Вопрос "${question}" сводится к делению на ноль. В классической арифметике такое действие не определено.`,
        examples: [
          'Правило: деление на ноль запрещено.',
          'Постарайтесь изменить выражение, чтобы знаменатель не равнялся нулю.'
        ],
        relatedTopics: ['Базовая арифметика', 'Работа с числами']
      };
    }

    const formattedResult = formatNumber(arithmetic.result);
    const expression = arithmetic.expression;
    const codeExample = buildCodeExample(languageId, expression.replace(/×/g, '*'), arithmetic.result);

    return {
      explanation: `Это базовый пример арифметики. ${expression} = ${formattedResult}.`,
      examples: [
        codeExample,
        `Проверка в уме: ${expression.split('×').join(' * ')} = ${formattedResult}`
      ],
      relatedTopics: ['Математические операции', `День ${context.day}: ${context.topic}`]
    };
  }

  return {
    explanation: `Пока не удалось получить ответ от AI. Вопрос был: "${question}". Попробуйте уточнить формулировку или посмотреть теорию по теме "${context.topic}".`,
    examples: [],
    relatedTopics: [`День ${context.day}: ${context.topic}`, 'Повторение теории']
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as ExplainTheoryRequest;

  // Валидация
  if (!body.question || body.question.trim().length < 3) {
    return NextResponse.json({
      explanation: 'Пожалуйста, задайте более конкретный вопрос.',
      examples: [],
      relatedTopics: []
    });
  }

  if (!isAiConfigured()) {
    console.warn('HF_TOKEN не задан. Возвращаем fallback объяснение.');
    return NextResponse.json(createFallbackResponse(body, 'missing_api_key'));
  }

  try {
    const prompt = buildExplainPrompt(body);

    const { data, raw } = await callChatCompletion({
        messages: [
          {
            role: 'system',
            content: 'Ты — преподаватель программирования. Объясняй концепции понятно и с примерами. Отвечай строго в JSON на русском языке.'
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

    if (!parsedResponse) {
      return NextResponse.json(createFallbackResponse(body, 'parse_error'), { status: 200 });
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Ошибка при обращении к AI API для объяснения теории:', error);
    return NextResponse.json(createFallbackResponse(body, 'unexpected_error'), { status: 200 });
  }
}
