import { NextResponse } from 'next/server';
import { getGeneratedContent, saveGeneratedContent } from '@/lib/db';
import type { Difficulty, GeneratedTask } from '@/types';

interface RequestBody {
  day: number;
  languageId: string;
  taskId: string;
  difficulty: Difficulty;
  dayTopic: string;
  dayDescription: string;
  existingTasks: Array<{ id: string; difficulty: Difficulty; prompt: string }>;
}

const buildPrompt = ({ day, languageId, taskId, difficulty, dayTopic, dayDescription, existingTasks }: RequestBody) => {
  const existingSummary = existingTasks
    .map((task, index) => `${index + 1}. [${task.difficulty.toUpperCase()}] ${task.prompt}`)
    .join('\n');

  return `Ты — опытный преподаватель программирования. Нужна новая ЗАМЕНА для одной задачи в программе обучения.

ДЕНЬ: ${day} / 90
ТЕМА ДНЯ: ${dayTopic}
ОПИСАНИЕ ТЕМЫ: ${dayDescription}
ЯЗЫК: ${languageId}
НУЖНАЯ СЛОЖНОСТЬ: ${difficulty.toUpperCase()}

УЖЕ ЕСТЬ ЗАДАНИЯ:
${existingSummary || 'Пока нет других задач'}

⚠️ Требования:
- Задача должна быть по теме "${dayTopic}".
- Не повторяй существующие задания и не дублируй формулировки.
- Сложность должна соответствовать ${difficulty.toUpperCase()}.
- Верни ровно один JSON-объект с полями id, difficulty, prompt, solutionHint.
- Поле id должно начинаться с "${taskId}" и иметь уникальный суффикс (например, "${taskId}_alt1").
- prompt — чёткое практическое задание, без лишнего текста.
- solutionHint — короткая подсказка по решению.

Формат ответа (только JSON, без Markdown):
{"id":"${taskId}_alt1","difficulty":"${difficulty}","prompt":"...","solutionHint":"..."}
`;
};

const parseTask = (content: string): GeneratedTask => {
  try {
    const sanitized = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(sanitized) as GeneratedTask;

    if (!parsed?.id || !parsed?.prompt) {
      throw new Error('Ответ не содержит корректной задачи');
    }

    return parsed;
  } catch (error) {
    throw new Error('Не удалось распарсить ответ модели при перегенерации задачи.');
  }
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'HF_API_KEY не задан' }, { status: 500 });
  }

  try {
    const prompt = buildPrompt(body);

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
            content: 'Ты — методист образовательной платформы. Генерируй структурированные задания, отвечай строго в JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка HuggingFace при перегенерации задачи:', response.status, errorText);
      return NextResponse.json({ error: 'Не удалось перегенерировать задачу' }, { status: 500 });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content ?? '';
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
      : rawContent;

    const regeneratedTask = parseTask(String(content));

    try {
      const stored = getGeneratedContent(body.day, body.languageId);

      if (stored) {
        const parseTasks = (): GeneratedTask[] => {
          if (!stored.tasks) return [];
          if (Array.isArray(stored.tasks)) return stored.tasks as GeneratedTask[];
          if (typeof stored.tasks === 'string') {
            try {
              return JSON.parse(stored.tasks) as GeneratedTask[];
            } catch (error) {
              console.warn('Не удалось распарсить сохранённые задачи, создаём заново.', error);
              return [];
            }
          }
          return [];
        };

        const existingTasks = parseTasks();
        const updatedTasks = existingTasks.map((task) => (task.id === body.taskId ? regeneratedTask : task));

        saveGeneratedContent({
          day: stored.day,
          languageId: stored.languageId,
          topic: stored.topic,
          theory: stored.theory,
          recap: stored.recap,
          recapTask: stored.recapTask ?? undefined,
          tasks: updatedTasks
        });
      }
    } catch (dbError) {
      console.error('Не удалось сохранить перегенерированную задачу в БД', dbError);
    }

    return NextResponse.json({ task: regeneratedTask });
  } catch (error) {
    console.error('Ошибка перегенерации задачи:', error);
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

