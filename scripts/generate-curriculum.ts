/**
 * Curriculum Generation Script
 * Generates complete curriculum content for all 90 days using AI
 *
 * Usage:
 * npm run generate:curriculum -- --language=python --days=3-10
 * npm run generate:curriculum -- --language=javascript --all
 */

import fs from 'fs/promises';
import path from 'path';
import type { EnhancedDayContent, DayTaskWithTests } from '../src/types/curriculum';

interface GenerationConfig {
  languageId: string;
  startDay: number;
  endDay: number;
  outputDir: string;
  useAI: boolean;
}

/**
 * Main generation function
 */
async function generateCurriculum(config: GenerationConfig) {
  console.log(`🚀 Generating curriculum for ${config.languageId}...`);
  console.log(`📅 Days: ${config.startDay} - ${config.endDay}`);

  const generatedContent: Record<number, EnhancedDayContent> = {};

  for (let day = config.startDay; day <= config.endDay; day++) {
    console.log(`\n📝 Generating Day ${day}...`);

    try {
      const content = config.useAI
        ? await generateWithAI(day, config.languageId)
        : generateTemplate(day, config.languageId);

      generatedContent[day] = content;

      console.log(`✅ Day ${day} generated successfully`);
    } catch (error) {
      console.error(`❌ Error generating Day ${day}:`, error);
      throw error;
    }
  }

  // Save to file
  await saveContent(generatedContent, config);

  console.log(`\n✨ Generation complete!`);
  console.log(`📁 Saved to: ${config.outputDir}`);
}

/**
 * Generate content using AI
 */
async function generateWithAI(
  day: number,
  languageId: string
): Promise<EnhancedDayContent> {
  // Load themes for this language
  const themes = await loadThemes(languageId);
  const dayTheme = themes.find(t => t.day === day);

  if (!dayTheme) {
    throw new Error(`No theme found for day ${day} in ${languageId}`);
  }

  console.log(`   Topic: ${dayTheme.topic}`);

  // Call AI API to generate content
  const prompt = buildGenerationPrompt(day, languageId, dayTheme);

  // Here you would call your AI service
  // For now, return a template
  return generateTemplateWithTopic(day, languageId, dayTheme.topic, dayTheme.category);
}

/**
 * Generate template content (fallback)
 */
function generateTemplate(
  day: number,
  languageId: string
): EnhancedDayContent {
  return {
    day,
    topic: `День ${day}: Тема для ${languageId}`,
    theory: `Теоретический материал для дня ${day}. Изучаем важные концепции программирования на ${languageId}.`,
    recap: `Что нового ты узнал на дне ${day}?`,
    tasks: generateTemplateTasks(day, languageId),
    difficulty: Math.min(5, Math.floor(day / 18) + 1),
    category: 'basics',
    practiceType: 'coding',
    estimatedMinutes: 60
  };
}

/**
 * Generate template content with specific topic
 */
function generateTemplateWithTopic(
  day: number,
  languageId: string,
  topic: string,
  category: string
): EnhancedDayContent {
  const difficulty = Math.min(5, Math.floor(day / 18) + 1);

  return {
    day,
    topic,
    theory: generateTheory(topic, languageId, difficulty),
    theoryExamples: generateTheoryExamples(topic, languageId),
    recap: `Объясни своими словами: что такое ${topic} и как это используется в ${languageId}?`,
    recapQuestions: generateRecapQuestions(topic),
    tasks: generateTopicTasks(day, topic, languageId, difficulty),
    difficulty,
    category,
    practiceType: difficulty <= 2 ? 'coding' : day % 10 === 0 ? 'project' : 'coding',
    estimatedMinutes: difficulty * 15 + 30,
    resources: generateResources(topic, languageId)
  };
}

/**
 * Generate theory content
 */
function generateTheory(topic: string, languageId: string, difficulty: number): string {
  return `# ${topic}

## Введение

Сегодня мы изучим **${topic}** в ${languageId}. Это ${difficulty <= 2 ? 'базовая' : difficulty <= 4 ? 'важная' : 'продвинутая'} концепция, которая ${difficulty <= 2 ? 'используется постоянно' : 'пригодится в реальных проектах'}.

## Что это такое?

${topic} - это...

## Зачем это нужно?

В реальной разработке ${topic} используется для:
- ...
- ...

## Как это работает?

### Базовый синтаксис

\`\`\`${languageId}
// Пример кода
\`\`\`

### Важные детали

- ...
- ...

## Практические советы

💡 **Совет**: ...

⚠️ **Частая ошибка**: ...

## Резюме

Сегодня ты узнал про ${topic}. Основные моменты:
1. ...
2. ...
3. ...
`;
}

/**
 * Generate theory examples
 */
function generateTheoryExamples(topic: string, languageId: string) {
  return [
    {
      title: `Простой пример: ${topic}`,
      code: `// Базовый пример ${topic}`,
      explanation: `Здесь мы демонстрируем основное использование ${topic}.`
    },
    {
      title: `Практическое применение`,
      code: `// Реальный пример`,
      explanation: `Такой код часто встречается в реальных проектах.`
    }
  ];
}

/**
 * Generate recap questions
 */
function generateRecapQuestions(topic: string) {
  return [
    {
      id: `recap-${topic}-q1`,
      type: 'text' as const,
      question: `Что такое ${topic}?`,
      points: 10
    },
    {
      id: `recap-${topic}-q2`,
      type: 'quiz' as const,
      question: `Для чего используется ${topic}?`,
      options: [
        'Правильный ответ',
        'Неправильный ответ 1',
        'Неправильный ответ 2',
        'Неправильный ответ 3'
      ],
      correctAnswer: 0,
      points: 10
    }
  ];
}

/**
 * Generate tasks for a specific topic
 */
function generateTopicTasks(
  day: number,
  topic: string,
  languageId: string,
  difficulty: number
): DayTaskWithTests[] {
  const tasks: DayTaskWithTests[] = [];

  // Easy tasks (2)
  for (let i = 1; i <= 2; i++) {
    tasks.push({
      id: `day${day}-task${i}`,
      difficulty: 'easy',
      prompt: `Базовая задача ${i} на тему "${topic}". ${getTaskPrompt(topic, 'easy', i, languageId)}`,
      solutionHint: `Используй основной синтаксис ${topic}, который мы изучили в теории.`,
      tests: generateTests(topic, 'easy', languageId),
      concepts: [topic.toLowerCase()],
      estimatedMinutes: 10
    });
  }

  // Medium tasks (2)
  for (let i = 3; i <= 4; i++) {
    tasks.push({
      id: `day${day}-task${i}`,
      difficulty: 'medium',
      prompt: `Средняя задача ${i - 2} на тему "${topic}". ${getTaskPrompt(topic, 'medium', i - 2, languageId)}`,
      solutionHint: `Комбинируй ${topic} с другими концепциями, которые ты уже знаешь.`,
      tests: generateTests(topic, 'medium', languageId),
      concepts: [topic.toLowerCase(), 'логика'],
      estimatedMinutes: 15
    });
  }

  // Hard task (1)
  tasks.push({
    id: `day${day}-task5`,
    difficulty: 'hard',
    prompt: `Сложная задача на тему "${topic}". ${getTaskPrompt(topic, 'hard', 1, languageId)}`,
    solutionHint: `Эта задача требует творческого подхода. Подумай, как применить ${topic} нестандартно.`,
    tests: generateTests(topic, 'hard', languageId),
    concepts: [topic.toLowerCase(), 'алгоритмы', 'оптимизация'],
    estimatedMinutes: 25
  });

  return tasks;
}

/**
 * Get task prompt based on topic and difficulty
 */
function getTaskPrompt(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  index: number,
  languageId: string
): string {
  // This would be more sophisticated in production
  return `Реализуй функцию, которая демонстрирует использование ${topic}.`;
}

/**
 * Generate test cases
 */
function generateTests(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  languageId: string
) {
  const testCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;

  return Array.from({ length: testCount }, (_, i) => ({
    input: `test_input_${i}`,
    expected: `expected_output_${i}`,
    description: `Тест ${i + 1}`,
    hidden: i >= testCount - 1 // Last test is hidden
  }));
}

/**
 * Generate template tasks
 */
function generateTemplateTasks(day: number, languageId: string): DayTaskWithTests[] {
  return [
    {
      id: `day${day}-task1`,
      difficulty: 'easy',
      prompt: `Задача 1 для дня ${day}`,
      solutionHint: 'Подсказка для задачи 1',
      estimatedMinutes: 10
    },
    {
      id: `day${day}-task2`,
      difficulty: 'easy',
      prompt: `Задача 2 для дня ${day}`,
      estimatedMinutes: 10
    },
    {
      id: `day${day}-task3`,
      difficulty: 'medium',
      prompt: `Задача 3 для дня ${day}`,
      estimatedMinutes: 15
    },
    {
      id: `day${day}-task4`,
      difficulty: 'medium',
      prompt: `Задача 4 для дня ${day}`,
      estimatedMinutes: 15
    },
    {
      id: `day${day}-task5`,
      difficulty: 'hard',
      prompt: `Задача 5 для дня ${day}`,
      estimatedMinutes: 20
    }
  ];
}

/**
 * Generate resources
 */
function generateResources(topic: string, languageId: string) {
  return [
    {
      title: `Официальная документация: ${topic}`,
      url: `https://docs.${languageId}.org/${topic.toLowerCase()}`,
      type: 'documentation' as const
    }
  ];
}

/**
 * Load themes for language
 */
async function loadThemes(languageId: string) {
  const themePath = path.join(
    __dirname,
    '..',
    'src',
    'data',
    'themes',
    `${languageId}.ts`
  );

  try {
    const module = await import(themePath);
    const themesKey = `${languageId}Themes`;
    return module[themesKey] || [];
  } catch (error) {
    console.warn(`Could not load themes for ${languageId}`);
    return [];
  }
}

/**
 * Build AI generation prompt
 */
function buildGenerationPrompt(day: number, languageId: string, theme: any): string {
  return `Generate complete lesson content for Day ${day} of ${languageId} course on topic: ${theme.topic}`;
}

/**
 * Save generated content to file
 */
async function saveContent(
  content: Record<number, EnhancedDayContent>,
  config: GenerationConfig
) {
  const outputPath = path.join(
    config.outputDir,
    `curriculum-${config.languageId}-days-${config.startDay}-${config.endDay}.json`
  );

  await fs.mkdir(config.outputDir, { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(content, null, 2), 'utf-8');

  console.log(`💾 Saved to: ${outputPath}`);
}

/**
 * Parse command line arguments
 */
function parseArgs(): GenerationConfig {
  const args = process.argv.slice(2);

  let languageId = 'python';
  let startDay = 3;
  let endDay = 10;
  let useAI = false;

  for (const arg of args) {
    if (arg.startsWith('--language=')) {
      languageId = arg.split('=')[1];
    } else if (arg.startsWith('--days=')) {
      const range = arg.split('=')[1];
      if (range === 'all') {
        startDay = 1;
        endDay = 90;
      } else {
        const [start, end] = range.split('-').map(Number);
        startDay = start;
        endDay = end;
      }
    } else if (arg === '--ai') {
      useAI = true;
    }
  }

  return {
    languageId,
    startDay,
    endDay,
    outputDir: path.join(__dirname, '..', 'generated-curriculum'),
    useAI
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    const config = parseArgs();
    await generateCurriculum(config);
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main();
