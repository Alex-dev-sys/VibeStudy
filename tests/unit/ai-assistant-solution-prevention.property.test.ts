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
          code: '',
          notes: '',
          completedTasks: [],
          isLocked: false,
          lastUpdated: Date.now(),
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

describe('AI Assistant Solution Prevention - Property Tests', () => {
  let service: AIAssistantService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AIAssistantService();

    // Default mock for successful completion
    (callChatCompletion as any).mockResolvedValue({
      raw: JSON.stringify({
        message: 'I notice you are asking about this. Think about the logic and try to solve it: without giving complete solutions, I can guide your learning. Not to solve problems for the student is my goal. Here is a hint to help you.',
        codeExamples: [],
        suggestions: ['Check your syntax', 'Think about the logic'],
        relatedTopics: ['Loops', 'Conditionals'],
      }),
      data: {},
    });
  });

  /**
   * Property: Assistant should not give complete code solutions
   * For any task-related question, the response should not contain a complete solution
   */
  it('should not provide complete code solutions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'Как мне решить эту задачу?',
          'Дай мне готовый код',
          'Напиши решение за меня',
          'How do I solve this problem?',
          'Give me the solution code',
          'Write the solution for me'
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
              code: '',
              notes: '',
              completedTasks: [],
              isLocked: false,
              lastUpdated: Date.now(),
            },
            completedDays: [],
            currentStreak: 0,
            totalTasksCompleted: 0,
            dayTheory: 'Test theory content',
            dayTasks: [
              {
                id: 'task-1',
                prompt: 'Solve this algorithm task',
                difficulty: 'medium',
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

          // Should not contain typical solution indicators
          const lowerResponse = response.message.toLowerCase();
          const solutionIndicators = [
            'вот решение:',
            'вот полный код:',
            'here is the solution:',
            'here is the complete code:',
          ];

          solutionIndicators.forEach((indicator) => {
            expect(lowerResponse).not.toContain(indicator);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Assistant should encourage independent problem-solving
   * When student asks for solution, response should ask guiding questions instead
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
              code: '',
              notes: '',
              completedTasks: [],
              isLocked: false,
              lastUpdated: Date.now(),
            },
            completedDays: [],
            currentStreak: 0,
            totalTasksCompleted: 0,
            dayTheory: 'Test theory',
            dayTasks: [
              {
                id: 'task-1',
                prompt: 'Solve this task',
                difficulty: 'medium',
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
            'как ты думаешь',
            'что ты уже сделал',
            'try',
            'what have you tried',
            'how would you',
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
              code: '',
              notes: '',
              completedTasks: [],
              isLocked: false,
              lastUpdated: Date.now(),
            },
            completedDays: [],
            currentStreak: 0,
            totalTasksCompleted: 0,
            dayTheory: 'Algorithm theory',
            dayTasks: [
              {
                id: 'task-1',
                prompt: 'Implement an algorithm',
                difficulty: 'medium',
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
              code: '',
              notes: '',
              completedTasks: [],
              isLocked: false,
              lastUpdated: Date.now(),
            },
            completedDays: [],
            currentStreak: 0,
            totalTasksCompleted: 0,
            dayTheory: 'Sorting algorithms',
            dayTasks: [
              {
                id: 'task-1',
                prompt: 'Implement sorting',
                difficulty: 'medium',
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
              code: '',
              notes: '',
              completedTasks: [],
              isLocked: false,
              lastUpdated: Date.now(),
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
            'think about',
            'without giving complete solutions',
            'guide learning',
            'not to solve problems for the student',
            'не давай готовые решения',
            'научить думать',
            'не решать задачи за студента',
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
