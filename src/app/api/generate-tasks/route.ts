import { NextResponse } from 'next/server';
import { saveGeneratedContent } from '@/lib/db';
import { callChatCompletion, extractMessageContent, isAiConfigured } from '@/lib/ai-client';
import { taskGenerationSchema } from '@/lib/validation/schemas';
import { rateLimiter, RATE_LIMITS, getRateLimitIdentifier } from '@/lib/rate-limit';
import { logWarn, logError } from '@/lib/logger';

interface RequestBody {
  day: number;
  languageId: string;
  theorySummary: string;
  previousDaySummary?: string;
  locale?: 'ru' | 'en';
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

interface PromptParams {
  day: number;
  languageId: string;
  dayTopic?: string;
  dayDescription?: string;
  previousDaySummary?: string;
}

const buildPrompt = ({ day, languageId, dayTopic, dayDescription, previousDaySummary, locale = 'ru' }: ExtendedRequestBody) => {
  const params: PromptParams = { day, languageId, dayTopic, dayDescription, previousDaySummary };
  if (locale === 'en') {
    return buildEnglishPrompt(params);
  }
  return buildRussianPrompt(params);
};

const buildRussianPrompt = ({ day, languageId, dayTopic, dayDescription, previousDaySummary }: PromptParams) => `Ты — опытный преподаватель программирования. Создай учебный материал для дня ${day} из 90-дневного курса.

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

const buildEnglishPrompt = ({ day, languageId, dayTopic, dayDescription, previousDaySummary }: PromptParams) => `You are an experienced programming instructor. Create educational material for day ${day} of a 90-day course.

═══════════════════════════════════════
DAY ${day} of 90
TOPIC: ${dayTopic}
DETAILS: ${dayDescription}
LANGUAGE: ${languageId}
PREVIOUS TOPIC: ${previousDaySummary ?? 'First day of the course'}
STUDENT LEVEL: ${day <= 10 ? 'ABSOLUTE BEGINNER (knows nothing)' : day <= 30 ? 'BEGINNER (knows only basics)' : day <= 60 ? 'INTERMEDIATE' : 'ADVANCED'}
═══════════════════════════════════════

⚠️ CONSIDER LEARNING PROGRESS:
${day === 1 ? '- This is the FIRST day! Student knows NOTHING about programming\n- DO NOT use terms that haven\'t been studied yet\n- Only the most basic concepts of "${dayTopic}"' : ''}
${day <= 10 ? '- Days 1-10: only BASIC syntax, NO complex constructs\n- Student is just starting, doesn\'t know loops, functions, classes' : ''}
${day <= 30 ? '- Days 11-30: can use basic constructs from previous days' : ''}
- Tasks STRICTLY on topic "${dayTopic}", no jumping ahead
- If topic is "Variables" — DO NOT use functions, loops, lists
- If topic is "Loops" — can use variables, but NOT functions, classes

TASK:
Create JSON with fields theory, recap, and tasks (array of 5 tasks).

THEORY REQUIREMENTS (theory):
Create DETAILED and STRUCTURED theory on topic "${dayTopic}" for language ${languageId}.

THEORY FORMAT (must follow this structure):

1. INTRODUCTION (2-3 sentences):
   - What is "${dayTopic}"
   - Why it's needed
   - Where it's used

2. KEY CONCEPTS:
   - List key concepts of the topic
   - Give brief explanation for each
   - Example: if topic is "Variables", describe data types (int, float, str, bool)

3. CODE EXAMPLES (3-5 examples):
   - Each example with comments
   - Examples from simple to complex
   - All code in ${languageId}
   - Format: description first, then code

4. IMPORTANT NOTES:
   - 1-2 important points to remember
   - Common beginner mistakes

SAMPLE GOOD THEORY (for topic "Variables and Data Types" in Python):

"Python is a popular programming language suitable for beginners and professionals. Programs are written as plain text, then the Python interpreter executes them line by line.

Data types:
• int: integer number, e.g. 5, -3, 100
• float: decimal number, e.g. 3.14, -0.5
• str: string, e.g. 'Hello!', 'Python'
• bool: boolean value True or False

Variables:
A variable is a name for storing a value:

x = 10       # int
y = 3.5      # float
name = 'John'  # str
flag = True    # bool

Input and Output:
To output something, use the print function:

print('Hello, Python!')

To get keyboard input, use the input function:

user_input = input('Enter a number: ')

All input is returned as a string. To convert input to a number:

num = int(input('Enter an integer: '))

Important: Variable names should be clear. Use snake_case for ${languageId}."

CREATE SIMILAR DETAILED THEORY for topic "${dayTopic}"

RECAP QUESTION REQUIREMENTS (recap):
- Question about previous day's topic: "${previousDaySummary ?? 'motivation to learn'}"
- Should test understanding of the concept

${day > 1 ? `RECAP TASK FROM PREVIOUS DAY (recapTask):
Create ONE additional task to review previous day's material.

Recap task requirements:
- Topic: "${previousDaySummary ?? 'previous day'}"
- Difficulty: EASY or MEDIUM (not complex, for reinforcement)
- Task should test understanding of MAIN concept from previous day
- id: "day${day}_recap"
- difficulty: "easy" or "medium"
- prompt: specific task on previous day's topic
- solutionHint: brief hint

Example for day 2 (previous day "First Program"):
{
  "id": "day2_recap",
  "difficulty": "easy",
  "prompt": "Write a program that outputs 3 lines: greeting, your name, and your city",
  "solutionHint": "Use print() three times"
}` : ''}

TASK REQUIREMENTS (tasks):
Create EXACTLY 5 tasks with GRADUAL DIFFICULTY INCREASE on topic "${dayTopic}" in language ${languageId}.
Each next task adds 1-2 new actions to the previous one.

SAMPLE CORRECT GRADATION (for topic "Dictionaries" on ~day 14):
1. EASY: "Create a dictionary with book info: title, author, year. Print author by key."
2. EASY: "Add a 'genre' key with value, e.g., 'novel', to this dictionary."
3. MEDIUM: "Ask user for name and city, save to dictionary, and print phrase: Name: .., city: .."
4. HARD: "Given dictionary nums = {'a': 1, 'b': 3, 'c': 5}. Print sum of all values in this dictionary."
5. CHALLENGE: "Create empty dictionary, ask user for 2 items and their scores, add them as key-value, then print entire dictionary."

${day === 1 ? 'SAMPLE FOR DAY 1 (topic "First Program"):\n1. EASY: "Print the phrase: Hello, world!"\n2. EASY: "Print your name to the screen"\n3. MEDIUM: "Print two lines: your name and your age"\n4. HARD: "Print the phrase: My name is [your name] and I am [your age] years old"\n5. CHALLENGE: "Print 3 lines: greeting, your name, and city"\n' : ''}
${day === 2 ? 'SAMPLE FOR DAY 2 (topic "Variables"):\n1. EASY: "Create a variable with number 10 and print it"\n2. EASY: "Create two variables with numbers and print them"\n3. MEDIUM: "Create a variable with your name and print a greeting"\n4. HARD: "Create two numeric variables, add them and print result"\n5. CHALLENGE: "Create variables with name and age, print phrase: My name is [name], I am [age] years old"\n' : ''}

CREATE SIMILAR TASKS FOR TOPIC "${dayTopic}" CONSIDERING DAY ${day}:

1. EASY #1 (id: "day${day}_task1"):
   - Basic action with "${dayTopic}"
   - One simple operation
   - Example: create/declare + print

2. EASY #2 (id: "day${day}_task2"):
   - Basic action + one additional
   - Example: create + modify/add

3. MEDIUM (id: "day${day}_task3"):
   - User input + processing + output
   - Combination of 2-3 operations

4. HARD (id: "day${day}_task4"):
   - Work with given data + calculations/processing
   - May include loop or condition for processing

5. CHALLENGE (id: "day${day}_task5"):
   - Create from scratch + user input + processing + output
   - Most complex task, but NOT a mini-project

RESPONSE FORMAT (JSON only, no markdown):
{
  "theory": "theory text here",
  "recap": "recap question here",
  ${day > 1 ? '"recapTask": {"id": "day' + day + '_recap", "difficulty": "easy", "prompt": "task from previous day", "solutionHint": "hint"},' : ''}
  "tasks": [
    {"id": "day${day}_task1", "difficulty": "easy", "prompt": "specific task", "solutionHint": "hint"},
    {"id": "day${day}_task2", "difficulty": "easy", "prompt": "specific task", "solutionHint": "hint"},
    {"id": "day${day}_task3", "difficulty": "medium", "prompt": "specific task", "solutionHint": "hint"},
    {"id": "day${day}_task4", "difficulty": "hard", "prompt": "specific task", "solutionHint": "hint"},
    {"id": "day${day}_task5", "difficulty": "challenge", "prompt": "specific task", "solutionHint": "hint"}
  ]
}

⚠️ CRITICALLY IMPORTANT:
- DO NOT deviate from topic "${dayTopic}"
- All tasks ONLY on this topic
- Follow SAMPLE gradation above
- Each task 1-2 actions more complex than previous
- Tasks should be SPECIFIC and PRACTICAL
- Simple and clear wording, like in example
- EASY #1: create + print (1 action)
- EASY #2: create + modify (2 actions)
- MEDIUM: input + processing + output (3 actions)
- HARD: work with data + calculations/loop (3-4 actions)
- CHALLENGE: create + input + processing + output (4-5 actions)
- NO complex algorithms, optimizations, mini-projects
- Tasks like in example: simple, clear, practical
- Return ONLY valid JSON without comments
- ALL TEXT IN ENGLISH (theory, tasks, hints)`;

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

const validateContent = (content: GeneratedContent): { valid: boolean; reason?: string } => {
  // Check if theory exists and has minimum length
  if (!content.theory || content.theory.length < 100) {
    return { valid: false, reason: 'Theory too short or missing' };
  }
  
  // Check if tasks exist and have correct count
  if (!content.tasks || content.tasks.length !== 5) {
    return { valid: false, reason: 'Invalid tasks count' };
  }
  
  // Check if each task has required fields
  for (const task of content.tasks) {
    if (!task.id || !task.difficulty || !task.prompt) {
      return { valid: false, reason: 'Task missing required fields' };
    }
  }
  
  // Check if recap exists
  if (!content.recap) {
    return { valid: false, reason: 'Recap missing' };
  }
  
  return { valid: true };
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
    const parsed = JSON.parse(sanitized) as GeneratedContent;
    
    // Validate content completeness
    const validation = validateContent(parsed);
    if (!validation.valid) {
      console.warn('Content validation failed:', validation.reason);
      return fallbackResponse;
    }
    
    return parsed;
  } catch (error) {
    console.warn('Ошибка парсинга ответа AI', error, content);
    return fallbackResponse;
  }
};

export async function POST(request: Request) {
  // Rate limiting
  const identifier = getRateLimitIdentifier(request);
  const rateLimit = RATE_LIMITS.AI_GENERATION;
  if (!rateLimiter.check(identifier, rateLimit.limit, rateLimit.windowMs)) {
    const remaining = rateLimiter.getRemaining(identifier, rateLimit.limit);
    const resetTime = rateLimiter.getResetTime(identifier);
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'Retry-After': resetTime ? Math.ceil((resetTime - Date.now()) / 1000).toString() : '60'
        }
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

  if (!isAiConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      logWarn('HF_TOKEN not configured, returning fallback', { component: 'api', action: 'generate-tasks' });
    }
    return NextResponse.json({ ...fallbackResponse, isFallback: true }, { status: 200 });
  }

  try {
    const prompt = buildPrompt(body);

    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI request timeout')), 60000) // 60 seconds
    );

    const systemMessage = body.locale === 'en'
      ? 'You are an educational platform methodologist. Generate structured assignments, respond strictly in JSON. All content must be in English. IMPORTANT: Include detailed theory with code examples and task descriptions.'
      : 'Ты — методист образовательной платформы. Генерируй структурированные задания, отвечай строго в JSON. ВАЖНО: Включай подробную теорию с примерами кода и описаниями заданий.';

    let parsedResponse: GeneratedContent = fallbackResponse;
    let isFallback = true;
    const MAX_RETRIES = 2;

    // Retry logic for incomplete content
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { data, raw } = await Promise.race([
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
            temperature: 0.8,
            maxTokens: 1500
          }),
          timeoutPromise
        ]) as any;

        const content = raw || extractMessageContent(data);
        
        logWarn(`AI Response attempt ${attempt}`, {
          component: 'api',
          action: 'generate-tasks',
          metadata: { preview: String(content).slice(0, 100) }
        });

        parsedResponse = parseAiResponse(String(content));
        isFallback = parsedResponse.tasks?.[0]?.id?.startsWith('fallback-') ?? false;
        
        logWarn(`Attempt ${attempt} result`, {
          component: 'api',
          action: 'generate-tasks',
          metadata: { isFallback, tasksCount: parsedResponse.tasks?.length }
        });

        // If we got valid content, break the retry loop
        if (!isFallback) {
          break;
        }

        // If this was the last attempt, log failure
        if (attempt === MAX_RETRIES) {
          logWarn('All retry attempts failed, using fallback content', {
            component: 'api',
            action: 'generate-tasks',
            metadata: { day: body.day, languageId: body.languageId }
          });
        } else {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (attemptError) {
        logError(`Attempt ${attempt} failed`, attemptError as Error, {
          component: 'api',
          action: 'generate-tasks',
          metadata: { day: body.day, attempt }
        });
        if (attempt === MAX_RETRIES) {
          throw attemptError;
        }
      }
    }

    // Сохраняем в базу данных
    if (!isFallback) {
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
      } catch (dbError) {
        logError('Failed to save generated content to DB', dbError as Error, {
          component: 'api',
          action: 'generate-tasks',
          metadata: { day: body.day, languageId: body.languageId }
        });
        // Продолжаем работу даже если не удалось сохранить
      }
    }

    return NextResponse.json({ ...parsedResponse, isFallback });
  } catch (error) {
    logError('Error calling AI API', error as Error, {
      component: 'api',
      action: 'generate-tasks',
      metadata: { day: body.day, languageId: body.languageId }
    });
    return NextResponse.json({ ...fallbackResponse, isFallback: true }, { status: 200 });
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

