import { NextResponse } from 'next/server';
import { callChatCompletion, extractMessageContent, isAiConfigured } from '@/lib/ai-client';

interface GetHintRequest {
  code: string;
  task: {
    title: string;
    description: string;
    difficulty: string;
  };
  languageId: string;
  errorMessage?: string;
  attemptNumber: number;
}

interface GetHintResponse {
  hint: string;
  example?: string;
  nextSteps?: string[];
}

const buildHintPrompt = ({ code, task, languageId, errorMessage, attemptNumber }: GetHintRequest) => `Ты — опытный наставник по программированию. Ученик застрял на задаче и просит помощи.

ЗАДАЧА:
${task.title}
${task.description}

ЯЗЫК: ${languageId}
ПОПЫТКА: ${attemptNumber}

КОД УЧЕНИКА:
\`\`\`${languageId}
${code || '(код ещё не написан)'}
\`\`\`

${errorMessage ? `ОШИБКА:\n${errorMessage}\n` : ''}

ТВОЯ ЗАДАЧА:
Дай ученику подсказку, которая поможет продвинуться, но НЕ решай задачу полностью.

ТРЕБОВАНИЯ:
1. Подсказка должна быть понятной и конкретной
2. Если это первая попытка (1-2) — дай общее направление
3. Если попыток много (3+) — дай более детальную подсказку с примером
4. Если есть ошибка — объясни её причину простым языком
5. Предложи 2-3 следующих шага (nextSteps)
6. Если уместно, дай небольшой пример кода (example), но НЕ полное решение

ВАЖНО:
- Не давай готовое решение целиком
- Объясняй концепции, а не просто код
- Будь поддерживающим и мотивирующим
- Учитывай уровень сложности задачи

Ответь СТРОГО в JSON формате:
{
  "hint": "основная подсказка",
  "example": "небольшой пример кода (если нужен)",
  "nextSteps": ["шаг 1", "шаг 2", "шаг 3"]
}`;

const fallbackResponse: GetHintResponse = {
  hint: 'Внимательно прочитайте условие задачи и попробуйте разбить её на маленькие шаги.',
  nextSteps: [
    'Определите входные и выходные данные',
    'Подумайте, какие конструкции языка помогут решить задачу',
    'Напишите псевдокод или план решения'
  ]
};

const parseAiResponse = (content: string): GetHintResponse => {
  try {
    const sanitized = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(sanitized) as GetHintResponse;
    
    if (!parsed.hint) {
      return fallbackResponse;
    }
    
    return {
      hint: parsed.hint,
      example: parsed.example,
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : []
    };
  } catch (error) {
    console.warn('Ошибка парсинга ответа AI при генерации подсказки:', error, content);
    return fallbackResponse;
  }
};

export async function POST(request: Request) {
  const body = (await request.json()) as GetHintRequest;

  if (!isAiConfigured()) {
    console.warn('GPTLAMA_API_KEY не задан. Возвращаем fallback подсказку.');
    return NextResponse.json(fallbackResponse);
  }

  try {
    const prompt = buildHintPrompt(body);

    const { data, raw } = await callChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Ты — терпеливый наставник по программированию. Помогай студентам подсказками, но не решай задачи за них. Отвечай строго в JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      maxTokens: 1000,
      responseFormat: { type: 'json_object' }
    });

    const content = raw || extractMessageContent(data);

    const parsedResponse = parseAiResponse(String(content));

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Ошибка при обращении к AI API для подсказки:', error);
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}
