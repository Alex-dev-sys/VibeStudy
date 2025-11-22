/**
 * Prompt Builder for AI Learning Assistant
 * Builds prompts for AI requests with context injection
 */

import { AssistantRequest, AssistantContext } from './types';

/**
 * Prompt templates for different request types
 */
interface PromptTemplates {
  system: {
    ru: string;
    en: string;
  };
  user: {
    question: { ru: string; en: string };
    codeHelp: { ru: string; en: string };
    advice: { ru: string; en: string };
    general: { ru: string; en: string };
  };
}

/**
 * Configuration for PromptBuilder
 */
interface PromptBuilderConfig {
  maxPromptLength: number;
  locale: 'ru' | 'en';
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PromptBuilderConfig = {
  maxPromptLength: 4000,
  locale: 'ru',
};

/**
 * Prompt templates
 */
const TEMPLATES: PromptTemplates = {
  system: {
    ru: `Ты AI-ассистент для обучения на платформе VibeStudy.
Твоя роль - помогать студентам изучать программирование на языке {languageId}.

Текущий контекст:
- Студент на дне {day} из 90
- Сегодняшняя тема: {topic}
- Уровень подписки: {tier}
- Завершено дней: {completedDays}
- Текущая серия: {streak} дней

Правила:
1. Будь ободряющим и поддерживающим
2. Объясняй концепции ясно, не давая готовых решений
3. Приводи примеры кода на {languageId}
4. Ссылайся на материал текущего дня, когда это уместно
5. Адаптируй сложность к уровню студента (День {day})
6. Держи ответы краткими, но полезными

Помни: Твоя цель - направлять обучение, а не решать задачи за студента.`,
    en: `You are an AI learning assistant for VibeStudy platform.
Your role is to help students learn {languageId} programming.

Current Context:
- Student is on Day {day} of 90
- Today's topic: {topic}
- Subscription tier: {tier}
- Completed days: {completedDays}
- Current streak: {streak} days

Guidelines:
1. Be encouraging and supportive
2. Explain concepts clearly without giving complete solutions
3. Provide code examples in {languageId}
4. Reference the current day's material when relevant
5. Adapt complexity to the student's level (Day {day})
6. Keep responses concise but helpful

Remember: Your goal is to guide learning, not to solve problems for the student.`,
  },
  user: {
    question: {
      ru: `Вопрос студента: {message}

{conversationHistory}

{dayTheory}`,
      en: `Student Question: {message}

{conversationHistory}

{dayTheory}`,
    },
    codeHelp: {
      ru: `Студент просит помощь с кодом: {message}

{code}

{conversationHistory}

{taskContext}`,
      en: `Student needs help with code: {message}

{code}

{conversationHistory}

{taskContext}`,
    },
    advice: {
      ru: `Студент просит совет по обучению: {message}

Прогресс студента:
- Завершено дней: {completedDays}
- Всего задач выполнено: {totalTasks}
- Текущая серия: {streak} дней

{conversationHistory}`,
      en: `Student requests learning advice: {message}

Student Progress:
- Completed days: {completedDays}
- Total tasks completed: {totalTasks}
- Current streak: {streak} days

{conversationHistory}`,
    },
    general: {
      ru: `Сообщение студента: {message}

{conversationHistory}`,
      en: `Student Message: {message}

{conversationHistory}`,
    },
  },
};

/**
 * PromptBuilder class
 * Builds prompts for AI requests with context injection
 */
export class PromptBuilder {
  private config: PromptBuilderConfig;

  constructor(config: Partial<PromptBuilderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set locale for prompt generation
   */
  setLocale(locale: 'ru' | 'en'): void {
    this.config.locale = locale;
  }

  /**
   * Build complete prompt for AI request
   */
  buildPrompt(request: AssistantRequest): string {
    const systemPrompt = this.buildSystemPrompt(request.context);
    const userPrompt = this.buildUserPrompt(request);

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Truncate if too long
    return this.truncatePrompt(fullPrompt);
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context: AssistantContext): string {
    const template = TEMPLATES.system[this.config.locale];
    const topic = this.getDayTopic(context.currentDay);

    return template
      .replace(/{languageId}/g, this.getLanguageName(context.languageId))
      .replace(/{day}/g, context.currentDay.toString())
      .replace(/{topic}/g, topic)
      .replace(/{tier}/g, context.tier)
      .replace(/{completedDays}/g, context.completedDays.length.toString())
      .replace(/{streak}/g, context.currentStreak.toString());
  }

  /**
   * Build user prompt based on request type
   */
  private buildUserPrompt(request: AssistantRequest): string {
    const { requestType, message, context, code, taskId } = request;

    let template: string;
    switch (requestType) {
      case 'question':
        template = TEMPLATES.user.question[this.config.locale];
        break;
      case 'code-help':
        template = TEMPLATES.user.codeHelp[this.config.locale];
        break;
      case 'advice':
        template = TEMPLATES.user.advice[this.config.locale];
        break;
      default:
        template = TEMPLATES.user.general[this.config.locale];
    }

    // Replace placeholders
    // Use a function to avoid special replacement patterns ($&, $1, etc.)
    let prompt = template.replace(/{message}/g, () => message);

    // Add conversation history
    const conversationHistory = this.formatConversationHistory(context.recentMessages);
    prompt = prompt.replace(/{conversationHistory}/g, conversationHistory);

    // Add code if provided
    if (code) {
      const codeBlock = `\n\nКод студента:\n\`\`\`${context.languageId}\n${code}\n\`\`\``;
      prompt = prompt.replace(/{code}/g, codeBlock);
    } else {
      prompt = prompt.replace(/{code}/g, '');
    }

    // Add day theory if available
    if (context.dayTheory) {
      const theorySection = this.config.locale === 'ru'
        ? `\n\nМатериал текущего дня:\n${this.truncateText(context.dayTheory, 500)}`
        : `\n\nCurrent day material:\n${this.truncateText(context.dayTheory, 500)}`;
      prompt = prompt.replace(/{dayTheory}/g, theorySection);
    } else {
      prompt = prompt.replace(/{dayTheory}/g, '');
    }

    // Add task context if provided
    if (taskId && context.dayTasks) {
      const task = context.dayTasks.find((t: any) => t.id === taskId);
      if (task) {
        const taskSection = this.config.locale === 'ru'
          ? `\n\nТекущая задача: ${task.title}\n${task.description}`
          : `\n\nCurrent Task: ${task.title}\n${task.description}`;
        prompt = prompt.replace(/{taskContext}/g, taskSection);
      } else {
        prompt = prompt.replace(/{taskContext}/g, '');
      }
    } else {
      prompt = prompt.replace(/{taskContext}/g, '');
    }

    // Add progress data for advice requests
    prompt = prompt.replace(/{completedDays}/g, context.completedDays.length.toString());
    prompt = prompt.replace(/{totalTasks}/g, context.totalTasksCompleted.toString());
    prompt = prompt.replace(/{streak}/g, context.currentStreak.toString());

    return prompt;
  }

  /**
   * Format conversation history for prompt
   */
  private formatConversationHistory(messages: any[]): string {
    if (!messages || messages.length === 0) {
      return '';
    }

    const header = this.config.locale === 'ru'
      ? '\n\nПредыдущий разговор:'
      : '\n\nPrevious Conversation:';

    const formattedMessages = messages
      .slice(-5) // Last 5 messages
      .map((msg) => {
        const role = msg.role === 'user' 
          ? (this.config.locale === 'ru' ? 'Студент' : 'Student')
          : (this.config.locale === 'ru' ? 'Ассистент' : 'Assistant');
        return `${role}: ${msg.content}`;
      })
      .join('\n');

    return `${header}\n${formattedMessages}`;
  }

  /**
   * Truncate prompt to max length
   */
  private truncatePrompt(prompt: string): string {
    if (prompt.length <= this.config.maxPromptLength) {
      return prompt;
    }

    // Truncate from the middle (keep system prompt and recent context)
    const systemEnd = prompt.indexOf('\n\n');
    const systemPrompt = prompt.substring(0, systemEnd);
    const userPrompt = prompt.substring(systemEnd);

    const availableLength = this.config.maxPromptLength - systemPrompt.length - 100;
    const truncatedUser = this.truncateText(userPrompt, availableLength);

    return `${systemPrompt}\n\n${truncatedUser}\n\n[...truncated for length]`;
  }

  /**
   * Truncate text to max length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Get human-readable language name
   */
  private getLanguageName(languageId: string): string {
    const names: Record<string, string> = {
      python: 'Python',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      java: 'Java',
      cpp: 'C++',
      csharp: 'C#',
      go: 'Go',
    };
    return names[languageId] || languageId;
  }

  /**
   * Get topic for a given day
   */
  private getDayTopic(day: number): string {
    // Simplified topic mapping - in real implementation, this would come from curriculum
    if (day <= 10) return this.config.locale === 'ru' ? 'Основы программирования' : 'Programming Basics';
    if (day <= 30) return this.config.locale === 'ru' ? 'Структуры данных' : 'Data Structures';
    if (day <= 60) return this.config.locale === 'ru' ? 'Алгоритмы' : 'Algorithms';
    return this.config.locale === 'ru' ? 'Продвинутые темы' : 'Advanced Topics';
  }
}

/**
 * Create a PromptBuilder instance with locale
 */
export function createPromptBuilder(locale: 'ru' | 'en' = 'ru'): PromptBuilder {
  return new PromptBuilder({ locale });
}
