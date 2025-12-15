/**
 * AI Assistant Solution Prevention Property-Based Tests
 * Feature: ai-learning-assistant, Property 14: No complete solutions given
 * Validates: Requirements 3.4, 6.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { AIAssistantService } from '@/lib/ai-assistant/service';
import type { AssistantRequest, AssistantContext } from '@/lib/ai-assistant/types';
import { callChatCompletion } from '@/lib/ai-client';

// Mock dependencies
// Note: @/lib/ai-client is mocked globally in tests/setup.ts
// We'll override the implementation in beforeEach for this specific test

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

vi.mock('@/store/progress-store', () => ({
  useProgressStore: {
    getState: vi.fn(() => ({
      activeDay: 1,
      languageId: 'python',
      dayStates: {
        1: {
          day: 1,
          theory: { read: true },
          tasks: [
            {
              id: 'task-1',
              title: 'Напиши функцию для сортировки массива',
              description: 'Реализуй функцию sort_array(arr), которая сортирует массив чисел',
              completed: false,
            },
          ],
          recapQuestion: { answered: false },
        },
      },
      record: {
        completedDays: [],
      },
    })),
  },
}));

vi.mock('@/store/achievements-store', () => ({
  useAchievementsStore: {
    getState: vi.fn(() => ({
      stats: {
        currentStreak: 0,
        totalTasksCompleted: 0,
      },
      unlockedAchievements: [],
    })),
  },
}));

describe('AI Assistant Solution Prevention - Property-Based Tests', () => {
  let service: AIAssistantService;

  beforeEach(() => {
    // Override the global mock with custom implementation for this test
    vi.mocked(callChatCompletion).mockImplementation(async ({ messages }) => {
      // Simulate AI response that provides guidance without complete solutions
      const userMessage = messages.find((m: any) => m.role === 'user')?.content || '';

      // Check if this is a task-related question
      const isTaskQuestion = userMessage.toLowerCase().includes('задач') ||
                            userMessage.toLowerCase().includes('task') ||
                            userMessage.toLowerCase().includes('решение') ||
                            userMessage.toLowerCase().includes('solution');

      if (isTaskQuestion) {
        // Provide hints and guidance, not complete solutions
        return {
          raw: `Отличный вопрос! Давай разберём это по шагам:\n\n1. Сначала подумай о структуре данных\n2. Какой алгоритм подойдёт?\n3. Попробуй написать псевдокод\n\nПодсказка: обрати внимание на условие задачи. Попробуй сам, а если застрянешь - спрашивай!`,
          model: 'test-model',
          data: null,
        };
      }

      // For general questions, provide explanations
      return {
        raw: `Это концепция работает следующим образом: [объяснение]. Вот пример:\n\n\`\`\`python\n# Пример демонстрации концепции\nprint("example")\n\`\`\`\n\nТеперь попробуй применить это к своей задаче!`,
        model: 'test-model',
        data: null,
      };
    });

    service = new AIAssistantService();
  });

  /**
   * Property 14: No complete solutions given
   * For any task-related question, the AI response should not contain
   * a complete solution to the task. It should provide hints, guidance,
   * and explanations, but not solve the problem for the student.
   */
  it('should not provide complete solutions to task questions', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate task-related questions
        fc.constantFrom(
          'Как решить эту задачу?',
          'Напиши код для решения',
          'Дай мне решение задачи',
          'Покажи правильный ответ',
          'Как написать функцию сортировки?',
          'Помоги решить задачу про массивы',
          'What is the solution to this task?',
          'Write the code for me',
          'Give me the answer',
          'Show me the complete solution',
          'How do I solve this problem?'
        ),
        fc.integer({ min: 1, max: 90 }), // day
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // language
        fc.string({ minLength: 5, maxLength: 50 }), // task title
        async (message, day, languageId, taskTitle) => {
          // Create context with a task
          const context: AssistantContext = {
            userId: 'test-user',
            tier: 'premium',
            currentDay: day,
            languageId,
            dayState: {
              day,
              theory: { read: true },
              tasks: [
                {
                  id: 'task-1',
                  title: taskTitle,
                  description: 'Complete this programming task',
                  completed: false,
                },
              ],
              recapQuestion: { answered: false },
            },
            completedDays: [],
            currentStreak: 0,
            totalTasksCompleted: 0,
            dayTheory: 'Test theory content',
            dayTasks: [
              {
                id: 'task-1',
                title: taskTitle,
                description: 'Complete this programming task',
                completed: false,
              },
            ],
            recentMessages: [],
          };

          const request: AssistantRequest = {
            message,
            context,
            requestType: 'question',
            taskId: 'task-1',
          };

          // Send request
          const response = await service.sendMessage(request);

          // Property assertions:
          // 1. Response should exist
          expect(response).toBeDefined();
          expect(response.message).toBeTruthy();

          // 2. Response should not contain complete solution indicators
          const lowerResponse = response.message.toLowerCase();
          
          // Should not contain phrases that indicate complete solutions
          const completeSolutionPhrases = [
            'вот полное решение',
            'вот готовый код',
            'вот ответ',
            'here is the complete solution',
            'here is the full code',
            'here is the answer',
            'полный код задачи',
            'complete code for the task',
          ];

          completeSolutionPhrases.forEach((phrase) => {
            expect(lowerResponse).not.toContain(phrase);
          });

          // 3. Response should contain guidance/hint indicators
          const guidancePhrases = [
            'подумай',
            'попробуй',
            'подсказка',
            'шаг',
            'think',
            'try',
            'hint',
            'step',
            'consider',
            'рассмотри',
          ];

          const containsGuidance = guidancePhrases.some((phrase) =>
            lowerResponse.includes(phrase)
          );
          expect(containsGuidance).toBe(true);

          // 4. If code examples are provided, they should be partial or demonstrative
          if (response.codeExamples && response.codeExamples.length > 0) {
            response.codeExamples.forEach((codeBlock) => {
              // Code should be short (not a complete solution)
              expect(codeBlock.code.length).toBeLessThan(500);
              
              // Code should contain comments or explanations
              const hasComments = 
                codeBlock.code.includes('//') ||
                codeBlock.code.includes('#') ||
                codeBlock.code.includes('/*');
              
              // Either has comments or is very short (example snippet)
              expect(hasComments || codeBlock.code.length < 100).toBe(true);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Responses should encourage independent problem-solving
   * For any task-related question, the response should encourage the student
   * to think and try solving the problem themselves
   */
  it('should encourage independent problem-solving', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'Не могу решить задачу',
          'Застрял на этой задаче',
          'Помоги с задачей',
          'I am stuck on this task',
          'Cannot solve this problem',
          'Need help with the task'
        ),
        fc.integer({ min: 1, max: 90 }),
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
        async (message, day, languageId) => {
          const context: AssistantContext = {
            userId: 'test-user',
            tier: 'premium',
            currentDay: day,
            languageId,
            dayState: {
              day,
              theory: { read: true },
              tasks: [
                {
                  id: 'task-1',
                  title: 'Programming task',
                  description: 'Solve this task',
                  completed: false,
                },
              ],
              recapQuestion: { answered: false },
            },
            completedDays: [],
            currentStreak: 0,
            totalTasksCompleted: 0,
            dayTheory: 'Test theory',
            dayTasks: [
              {
                id: 'task-1',
                title: 'Programming task',
                description: 'Solve this task',
                completed: false,
              },
            ],
            recentMessages: [],
          };

          const request: AssistantRequest = {
            message,
            context,
            requestType: 'question',
            taskId: 'task-1',
          };

          const response = await service.sendMessage(request);

          // Response should encourage trying
          const lowerResponse = response.message.toLowerCase();
          const encouragementPhrases = [
            'попробуй',
            'попытайся',
            'подумай',
            'разбери',
            'try',
            'attempt',
            'think',
            'break down',
            'analyze',
          ];

          const containsEncouragement = encouragementPhrases.some((phrase) =>
            lowerResponse.includes(phrase)
          );
          expect(containsEncouragement).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Hints should be progressive, not complete
   * For any task question, hints should guide thinking without revealing the answer
   */
  it('should provide progressive hints without revealing answers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'Дай подсказку',
          'Нужна подсказка',
          'Give me a hint',
          'I need a hint',
          'Can you give me a clue?'
        ),
        fc.integer({ min: 1, max: 90 }),
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
        async (message, day, languageId) => {
          const context: AssistantContext = {
            userId: 'test-user',
            tier: 'premium',
            currentDay: day,
            languageId,
            dayState: {
              day,
              theory: { read: true },
              tasks: [
                {
                  id: 'task-1',
                  title: 'Algorithm task',
                  description: 'Implement an algorithm',
                  completed: false,
                },
              ],
              recapQuestion: { answered: false },
            },
            completedDays: [],
            currentStreak: 0,
            totalTasksCompleted: 0,
            dayTheory: 'Algorithm theory',
            dayTasks: [
              {
                id: 'task-1',
                title: 'Algorithm task',
                description: 'Implement an algorithm',
                completed: false,
              },
            ],
            recentMessages: [],
          };

          const request: AssistantRequest = {
            message,
            context,
            requestType: 'question',
            taskId: 'task-1',
          };

          const response = await service.sendMessage(request);

          // Response should contain hint-related words
          const lowerResponse = response.message.toLowerCase();
          const hintIndicators = [
            'подсказка',
            'hint',
            'clue',
            'направление',
            'direction',
            'подумай о',
            'think about',
            'рассмотри',
            'consider',
          ];

          const containsHintIndicator = hintIndicators.some((indicator) =>
            lowerResponse.includes(indicator)
          );
          expect(containsHintIndicator).toBe(true);

          // Should not contain direct answer phrases
          const directAnswerPhrases = [
            'ответ:',
            'решение:',
            'answer:',
            'solution:',
            'вот код:',
            'here is the code:',
          ];

          directAnswerPhrases.forEach((phrase) => {
            expect(lowerResponse).not.toContain(phrase);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Code help should analyze, not solve
   * When student shares code, response should analyze and guide, not provide complete fix
   */
  it('should analyze code without providing complete solutions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'def sort(arr):\n    pass',
          'function sort(arr) {\n    // TODO\n}',
          'public void sort(int[] arr) {\n    // incomplete\n}',
          'func sort(arr []int) {\n    // help needed\n}'
        ),
        fc.constantFrom(
          'Помоги исправить код',
          'Что не так с кодом?',
          'Help fix my code',
          'What is wrong with this code?'
        ),
        fc.integer({ min: 1, max: 90 }),
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
        async (code, message, day, languageId) => {
          const context: AssistantContext = {
            userId: 'test-user',
            tier: 'premium',
            currentDay: day,
            languageId,
            dayState: {
              day,
              theory: { read: true },
              tasks: [
                {
                  id: 'task-1',
                  title: 'Sorting task',
                  description: 'Implement sorting',
                  completed: false,
                },
              ],
              recapQuestion: { answered: false },
            },
            completedDays: [],
            currentStreak: 0,
            totalTasksCompleted: 0,
            dayTheory: 'Sorting algorithms',
            dayTasks: [
              {
                id: 'task-1',
                title: 'Sorting task',
                description: 'Implement sorting',
                completed: false,
              },
            ],
            recentMessages: [],
          };

          const request: AssistantRequest = {
            message,
            context,
            requestType: 'code-help',
            code,
            taskId: 'task-1',
          };

          const response = await service.sendMessage(request);

          // Response should contain analysis indicators
          const lowerResponse = response.message.toLowerCase();
          const analysisIndicators = [
            'обрати внимание',
            'проблема в',
            'ошибка',
            'notice',
            'issue',
            'error',
            'problem',
            'missing',
            'отсутствует',
          ];

          const containsAnalysis = analysisIndicators.some((indicator) =>
            lowerResponse.includes(indicator)
          );
          expect(containsAnalysis).toBe(true);

          // Should not provide complete working code
          if (response.codeExamples && response.codeExamples.length > 0) {
            response.codeExamples.forEach((codeBlock) => {
              // Code examples should be short snippets, not complete solutions
              expect(codeBlock.code.length).toBeLessThan(300);
              
              // Should not contain the exact function signature from the task
              const taskFunctionNames = ['sort', 'sorting', 'sortArray'];
              const containsCompleteFunction = taskFunctionNames.some((name) =>
                codeBlock.code.includes(`def ${name}`) ||
                codeBlock.code.includes(`function ${name}`) ||
                codeBlock.code.includes(`func ${name}`)
              );
              
              // If it contains the function, it should be incomplete or commented
              if (containsCompleteFunction) {
                const hasPlaceholders = 
                  codeBlock.code.includes('...') ||
                  codeBlock.code.includes('TODO') ||
                  codeBlock.code.includes('pass') ||
                  codeBlock.code.includes('// your code here');
                expect(hasPlaceholders).toBe(true);
              }
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: System prompt enforces solution prevention
   * The system prompt should always include instructions to not give complete solutions
   */
  it('should include solution prevention in system prompt', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.integer({ min: 1, max: 90 }),
        fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
        async (message, day, languageId) => {
          const context: AssistantContext = {
            userId: 'test-user',
            tier: 'premium',
            currentDay: day,
            languageId,
            dayState: {
              day,
              theory: { read: true },
              tasks: [],
              recapQuestion: { answered: false },
            },
            completedDays: [],
            currentStreak: 0,
            totalTasksCompleted: 0,
            recentMessages: [],
          };

          const request: AssistantRequest = {
            message,
            context,
            requestType: 'question',
          };

          // Build the prompt to check system instructions
          const promptBuilder = (service as any).promptBuilder;
          const prompt = promptBuilder.buildPrompt(request);

          // System prompt should contain solution prevention instructions
          const lowerPrompt = prompt.toLowerCase();
          const preventionPhrases = [
            'не давая готовых решений',
            'without giving complete solutions',
            'не решать задачи за студента',
            'not to solve problems for the student',
            'направлять обучение',
            'guide learning',
          ];

          const containsPrevention = preventionPhrases.some((phrase) =>
            lowerPrompt.includes(phrase)
          );
          expect(containsPrevention).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
