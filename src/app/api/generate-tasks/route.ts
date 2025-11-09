import { NextResponse } from 'next/server';
import { saveGeneratedContent } from '@/lib/db';

interface RequestBody {
  day: number;
  languageId: string;
  theorySummary: string;
  previousDaySummary?: string;
}

interface TaskResponse {
  id: string;
  difficulty: string;
  prompt: string;
  solutionHint?: string;
}

interface GeneratedContent {
  theory: string;
  recap: string;
  recapTask?: TaskResponse;
  tasks: TaskResponse[];
}

interface ExtendedRequestBody extends RequestBody {
  dayTopic?: string;
  dayDescription?: string;
}

const buildPrompt = ({ day, languageId, dayTopic, dayDescription, previousDaySummary }: ExtendedRequestBody) => `Ты — опытный преподаватель программирования. Создай учебный материал для дня ${day} из 90-дневного курса.

═══════════════════════════════════════
ДЕНЬ ${day} из 90
ТЕМА: ${dayTopic}
ДЕТАЛИ: ${dayDescription}
ЯЗЫК: ${languageId}
ПРЕДЫДУЩАЯ ТЕМА: ${previousDaySummary ?? 'Первый день курса'}
УРОВЕНЬ УЧЕНИКА: ${day <= 10 ? 'АБСОЛЮТНЫЙ НОВИЧОК (ничего не знает)' : day <= 30 ? 'НАЧИНАЮЩИЙ (знает только базу)' : day <= 60 ? 'ПРОДОЛЖАЮЩИЙ' : 'ПРОДВИНУТЫЙ'}
═══════════════════════════════════════

⚠️ УЧИТЫВАЙ ПРОГРЕСС ОБУЧЕНИЯ:
${day === 1 ? '- Это ПЕРВЫЙ день! Ученик НИЧЕГО не знает о программировании\n- НЕ используй термины, которые ещё не изучались\n- Только самые базовые концепции темы "${dayTopic}"' : ''}
${day <= 10 ? '- Дни 1-10: только БАЗОВЫЙ синтаксис, НЕТ сложных конструкций\n- Ученик только начинает, не знает циклов, функций, классов' : ''}
${day <= 30 ? '- Дни 11-30: можно использовать базовые конструкции из предыдущих дней' : ''}
- Задачи СТРОГО по теме "${dayTopic}", без забегания вперёд
- Если тема "Переменные" — НЕ используй функции, циклы, списки
- Если тема "Циклы" — можно использовать переменные, но НЕ функции, классы

ЗАДАНИЕ:
Создай JSON с полями theory, recap и tasks (массив из 5 задач).

ТРЕБОВАНИЯ К ТЕОРИИ (theory):
Создай ПОДРОБНУЮ и СТРУКТУРИРОВАННУЮ теорию по теме "${dayTopic}" для языка ${languageId}.

ФОРМАТ ТЕОРИИ (обязательно следуй этой структуре):

1. ВСТУПЛЕНИЕ (2-3 предложения):
   - Что такое "${dayTopic}"
   - Зачем это нужно
   - Где применяется

2. ОСНОВНЫЕ КОНЦЕПЦИИ:
   - Перечисли ключевые понятия темы
   - Для каждого дай краткое объяснение
   - Пример: если тема "Переменные", то опиши типы данных (int, float, str, bool)

3. ПРИМЕРЫ КОДА (3-5 примеров):
   - Каждый пример с комментарием
   - Примеры от простого к сложному
   - Весь код на языке ${languageId}
   - Формат: сначала описание, потом код

4. ВАЖНЫЕ ЗАМЕЧАНИЯ:
   - 1-2 важных момента, которые нужно запомнить
   - Частые ошибки новичков

ОБРАЗЕЦ ХОРОШЕЙ ТЕОРИИ (для темы "Переменные и типы данных" на Python):

"Python — популярный язык программирования, подходящий для новичков и профи. Программы пишутся в виде обычного текста, а потом интерпретатор Python выполняет их по строкам.

Типы данных:
• int: целое число, например 5, -3, 100
• float: число с точкой, например 3.14, -0.5
• str: строка, например 'Привет!', 'Python'
• bool: логическое значение True или False

Переменные:
Переменная — это имя для хранения значения:

x = 10       # int
y = 3.5      # float
name = 'Ivan'  # str
flag = True    # bool

Ввод и вывод:
Чтобы вывести что-то, используют функцию print:

print('Привет, Python!')

Чтобы получить ввод с клавиатуры, используют функцию input:

user_input = input('Введите число: ')

Весь ввод возвращается как строка. Чтобы преобразовать ввод в число:

num = int(input('Введите целое число: '))

Важно: Имена переменных должны быть понятными. Используй snake_case для ${languageId}."

СОЗДАЙ АНАЛОГИЧНУЮ ПОДРОБНУЮ ТЕОРИЮ для темы "${dayTopic}"

ТРЕБОВАНИЯ К КОНТРОЛЬНОМУ ВОПРОСУ (recap):
- Вопрос по теме предыдущего дня: "${previousDaySummary ?? 'мотивация к обучению'}"
- Должен проверять понимание концепции

${day > 1 ? `КОНТРОЛЬНОЕ ЗАДАНИЕ ПО ПРЕДЫДУЩЕМУ ДНЮ (recapTask):
Создай ОДНО дополнительное задание для повторения материала предыдущего дня.

Требования к контрольному заданию:
- Тема: "${previousDaySummary ?? 'предыдущий день'}"
- Сложность: EASY или MEDIUM (не сложное, для закрепления)
- Задание должно проверять понимание ОСНОВНОЙ концепции предыдущего дня
- id: "day${day}_recap"
- difficulty: "easy" или "medium"
- prompt: конкретная задача по теме предыдущего дня
- solutionHint: краткая подсказка

Пример для дня 2 (предыдущий день "Первая программа"):
{
  "id": "day2_recap",
  "difficulty": "easy",
  "prompt": "Напиши программу, которая выводит 3 строки: приветствие, твоё имя и твой город",
  "solutionHint": "Используй print() три раза"
}` : ''}

ТРЕБОВАНИЯ К ЗАДАЧАМ (tasks):
Создай РОВНО 5 задач с ПЛАВНЫМ НАРАСТАНИЕМ СЛОЖНОСТИ по теме "${dayTopic}" на языке ${languageId}.
Каждая следующая задача добавляет 1-2 новых действия к предыдущей.

ОБРАЗЕЦ ПРАВИЛЬНОЙ ГРАДАЦИИ (для темы "Словари" на ~14 день):
1. EASY: "Создай словарь с информацией о книге: название, автор, год. Выведи автора по ключу."
2. EASY: "Добавь к этому словарю ключ 'жанр' со значением, например, 'роман'."
3. MEDIUM: "Запроси у пользователя имя и город, сохрани в словарь, и выведи фразу: Имя: .., город: .."
4. HARD: "Есть словарь nums = {'a': 1, 'b': 3, 'c': 5}. Выведи сумму всех значений этого словаря."
5. CHALLENGE: "Создай пустой словарь, запроси у пользователя 2 предмета и их оценки, добавь их как ключ-значение, а потом выведи весь словарь."

${day === 1 ? 'ОБРАЗЕЦ ДЛЯ ДНЯ 1 (тема "Первая программа"):\n1. EASY: "Выведи на экран фразу: Привет, мир!"\n2. EASY: "Выведи своё имя на экран"\n3. MEDIUM: "Выведи две строки: своё имя и свой возраст"\n4. HARD: "Выведи фразу: Меня зовут [твоё имя] и мне [твой возраст] лет"\n5. CHALLENGE: "Выведи 3 строки: приветствие, своё имя и город"\n' : ''}
${day === 2 ? 'ОБРАЗЕЦ ДЛЯ ДНЯ 2 (тема "Переменные"):\n1. EASY: "Создай переменную с числом 10 и выведи её"\n2. EASY: "Создай две переменные с числами и выведи их"\n3. MEDIUM: "Создай переменную с твоим именем и выведи приветствие"\n4. HARD: "Создай две числовые переменные, сложи их и выведи результат"\n5. CHALLENGE: "Создай переменные с именем и возрастом, выведи фразу: Меня зовут [имя], мне [возраст] лет"\n' : ''}

СОЗДАЙ АНАЛОГИЧНЫЕ ЗАДАЧИ ДЛЯ ТЕМЫ "${dayTopic}" С УЧЁТОМ ДНЯ ${day}:

1. EASY #1 (id: "day${day}_task1"):
   - Базовое действие с "${dayTopic}"
   - Одна простая операция
   - Пример: создать/объявить + вывести

2. EASY #2 (id: "day${day}_task2"):
   - Базовое действие + одно дополнительное
   - Пример: создать + изменить/добавить

3. MEDIUM (id: "day${day}_task3"):
   - Ввод от пользователя + обработка + вывод
   - Комбинация 2-3 операций

4. HARD (id: "day${day}_task4"):
   - Работа с готовыми данными + вычисления/обработка
   - Может включать цикл или условие для обработки

5. CHALLENGE (id: "day${day}_task5"):
   - Создание с нуля + ввод от пользователя + обработка + вывод
   - Самая комплексная задача, но НЕ мини-проект

ФОРМАТ ОТВЕТА (только JSON, без markdown):
{
  "theory": "текст теории здесь",
  "recap": "контрольный вопрос здесь",
  ${day > 1 ? '"recapTask": {"id": "day' + day + '_recap", "difficulty": "easy", "prompt": "задание по предыдущему дню", "solutionHint": "подсказка"},' : ''}
  "tasks": [
    {"id": "day${day}_task1", "difficulty": "easy", "prompt": "конкретная задача", "solutionHint": "подсказка"},
    {"id": "day${day}_task2", "difficulty": "easy", "prompt": "конкретная задача", "solutionHint": "подсказка"},
    {"id": "day${day}_task3", "difficulty": "medium", "prompt": "конкретная задача", "solutionHint": "подсказка"},
    {"id": "day${day}_task4", "difficulty": "hard", "prompt": "конкретная задача", "solutionHint": "подсказка"},
    {"id": "day${day}_task5", "difficulty": "challenge", "prompt": "конкретная задача", "solutionHint": "подсказка"}
  ]
}

⚠️ КРИТИЧЕСКИ ВАЖНО:
- НЕ отклоняйся от темы "${dayTopic}"
- Все задачи ТОЛЬКО по этой теме
- Следуй ОБРАЗЦУ градации сложности выше
- Каждая задача на 1-2 действия сложнее предыдущей
- Задачи должны быть КОНКРЕТНЫМИ и ПРАКТИЧНЫМИ
- Формулировки простые и понятные, как в примере
- EASY #1: создать + вывести (1 действие)
- EASY #2: создать + изменить (2 действия)
- MEDIUM: ввод + обработка + вывод (3 действия)
- HARD: работа с данными + вычисления/цикл (3-4 действия)
- CHALLENGE: создание + ввод + обработка + вывод (4-5 действий)
- НЕТ сложных алгоритмов, оптимизаций, мини-проектов
- Задачи как в примере: простые, понятные, практичные
- Верни ТОЛЬКО валидный JSON без комментариев`;

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
    const parsed = JSON.parse(sanitized) as GeneratedContent;
    if (!parsed.tasks || parsed.tasks.length === 0) {
      return fallbackResponse;
    }
    return parsed;
  } catch (error) {
    console.warn('Ошибка парсинга ответа AI', error, content);
    return fallbackResponse;
  }
};

export async function POST(request: Request) {
  const body = (await request.json()) as ExtendedRequestBody;

  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    console.warn('HF_API_KEY не задан. Возвращаем fallback.');
    return NextResponse.json(fallbackResponse, { status: 200 });
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
        max_tokens: 2000
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

    const parsedResponse = parseAiResponse(String(content));

    // Сохраняем в базу данных
    try {
      saveGeneratedContent({
        day: body.day,
        languageId: body.languageId,
        topic: body.dayTopic ?? 'Тема дня',
        theory: parsedResponse.theory,
        recap: parsedResponse.recap,
        recapTask: parsedResponse.recapTask,
        tasks: parsedResponse.tasks
      });
      console.log(`✅ Контент для дня ${body.day} (${body.languageId}) сохранён в БД`);
    } catch (dbError) {
      console.error('Ошибка сохранения в БД:', dbError);
      // Продолжаем работу даже если не удалось сохранить
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Ошибка при обращении к AI API', error);
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

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

