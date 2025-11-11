import { NextResponse } from 'next/server';
import { getGeneratedContent, saveGeneratedContent } from '@/lib/db';
import { callChatCompletion, extractMessageContent, isAiConfigured } from '@/lib/ai-client';
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
  if (!isAiConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('HF_TOKEN не задан. Перегенерация задачи недоступна.');
    }
    return NextResponse.json({ error: 'AI недоступен: отсутствует ключ API' }, { status: 500 });
  }

  try {
    const prompt = buildPrompt(body);

    const { data, raw } = await callChatCompletion({
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
      maxTokens: 800,
      responseFormat: { type: 'json_object' }
    });

    const content = raw || extractMessageContent(data);

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

