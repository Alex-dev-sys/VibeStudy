import { NextResponse } from 'next/server';

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

const fallbackResponse: ExplainTheoryResponse = {
  explanation: 'Извините, не удалось получить объяснение. Попробуйте переформулировать вопрос или обратитесь к теории дня.',
  examples: [],
  relatedTopics: []
};

const parseAiResponse = (content: string): ExplainTheoryResponse => {
  try {
    const sanitized = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(sanitized) as ExplainTheoryResponse;
    
    if (!parsed.explanation) {
      return fallbackResponse;
    }
    
    return {
      explanation: parsed.explanation,
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      relatedTopics: Array.isArray(parsed.relatedTopics) ? parsed.relatedTopics : []
    };
  } catch (error) {
    console.warn('Ошибка парсинга ответа AI при объяснении теории:', error, content);
    return fallbackResponse;
  }
};

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

  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    console.warn('HF_API_KEY не задан. Возвращаем fallback объяснение.');
    return NextResponse.json(fallbackResponse);
  }

  try {
    const prompt = buildExplainPrompt(body);

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
            content: 'Ты — преподаватель программирования. Объясняй концепции понятно и с примерами. Отвечай строго в JSON на русском языке.'
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
      console.error('Ошибка API HuggingFace при объяснении теории:', response.status, errorText);
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
    console.error('Ошибка при обращении к AI API для объяснения теории:', error);
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}
