import { NextResponse } from 'next/server';

interface CheckCodeRequest {
  code: string;
  task: {
    title: string;
    description: string;
    difficulty: string;
    hints?: string[];
  };
  languageId: string;
  day: number;
}

interface CheckCodeResponse {
  isCorrect: boolean;
  feedback: string;
  suggestions: string[];
  score: number; // 0-100
  detectedIssues: {
    type: 'syntax' | 'logic' | 'style' | 'performance';
    message: string;
    line?: number;
  }[];
}

const buildCheckPrompt = ({ code, task, languageId }: CheckCodeRequest) => `Ты — опытный преподаватель программирования и код-ревьюер. Проверь решение студента.

═══════════════════════════════════════
ЗАДАЧА: ${task.title}
ОПИСАНИЕ: ${task.description}
СЛОЖНОСТЬ: ${task.difficulty}
ЯЗЫК: ${languageId}
═══════════════════════════════════════

КОД СТУДЕНТА:
\`\`\`${languageId}
${code}
\`\`\`

ЗАДАНИЕ:
Проанализируй код и верни JSON со следующими полями:

{
  "isCorrect": boolean,  // Решает ли код задачу правильно
  "feedback": string,    // Общая обратная связь (2-3 предложения)
  "suggestions": [       // Конкретные рекомендации по улучшению (2-4 пункта)
    "Рекомендация 1",
    "Рекомендация 2"
  ],
  "score": number,       // Оценка от 0 до 100
  "detectedIssues": [    // Найденные проблемы
    {
      "type": "syntax" | "logic" | "style" | "performance",
      "message": "Описание проблемы",
      "line": номер_строки_или_null
    }
  ]
}

КРИТЕРИИ ОЦЕНКИ:
1. Правильность решения (40%)
2. Качество кода (30%)
3. Эффективность (20%)
4. Читаемость (10%)

ВАЖНО:
- Будь конструктивным и поддерживающим
- Если код правильный, похвали студента
- Если есть ошибки, объясни их понятным языком
- Давай конкретные примеры улучшений
- Учитывай уровень сложности задачи
- Отвечай СТРОГО в формате JSON, без дополнительного текста`;

const fallbackResponse: CheckCodeResponse = {
  isCorrect: false,
  feedback: 'Не удалось проверить код. Попробуйте позже.',
  suggestions: ['Проверьте синтаксис', 'Убедитесь, что код решает задачу'],
  score: 0,
  detectedIssues: []
};

export async function POST(request: Request) {
  const body = (await request.json()) as CheckCodeRequest;

  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    console.warn('HF_API_KEY не задан. Возвращаем fallback.');
    return NextResponse.json(fallbackResponse, { status: 200 });
  }

  if (!body.code || body.code.trim().length < 5) {
    return NextResponse.json({
      isCorrect: false,
      feedback: 'Код слишком короткий. Напишите полное решение задачи.',
      suggestions: ['Добавьте больше кода', 'Убедитесь, что решение полное'],
      score: 0,
      detectedIssues: [
        {
          type: 'logic' as const,
          message: 'Решение не завершено',
          line: null
        }
      ]
    } as CheckCodeResponse);
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
            content: 'Ты — опытный преподаватель программирования. Анализируй код студентов конструктивно и помогай им учиться. Отвечай строго в JSON.'
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
      console.error('Ошибка API HuggingFace:', response.status, errorText);
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

    try {
      const sanitized = String(content).replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(sanitized) as CheckCodeResponse;

      // Валидация ответа
      if (typeof parsed.isCorrect !== 'boolean' || typeof parsed.score !== 'number') {
        console.warn('Некорректный формат ответа AI:', parsed);
        return NextResponse.json(fallbackResponse, { status: 200 });
      }

      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('Ошибка парсинга ответа AI:', parseError, content);
      return NextResponse.json(fallbackResponse, { status: 200 });
    }
  } catch (error) {
    console.error('Ошибка при проверке кода:', error);
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

