/**
 * Property-based tests for AI Assistant Prompt Builder
 * Feature: ai-learning-assistant
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PromptBuilder, createPromptBuilder } from '@/lib/ai-assistant/prompt-builder';
import { ContextAggregator, resetContextAggregator } from '@/lib/ai-assistant/context-aggregator';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import type { AssistantRequest, AssistantContext } from '@/lib/ai-assistant/types';
import type { UserTier } from '@/types';

describe('AI Assistant Prompt Builder - Property Tests', () => {
  let promptBuilder: PromptBuilder;
  let contextAggregator: ContextAggregator;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset stores to default state
    useProgressStore.getState().resetProgress();
    useAchievementsStore.getState().resetAchievements();
    
    // Create fresh instances
    resetContextAggregator();
    contextAggregator = new ContextAggregator();
    promptBuilder = createPromptBuilder('en');
  });

  afterEach(() => {
    if (contextAggregator) {
      contextAggregator.clearAllCaches();
    }
  });

  describe('Property 8: Theory questions use curriculum', () => {
    /**
     * Feature: ai-learning-assistant, Property 8: Theory questions use curriculum
     * Validates: Requirements 2.4, 6.2
     * 
     * For any theory question, the AI prompt should include relevant 
     * curriculum content for the current day
     */
    it('should include day theory in prompt for all theory questions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }), // Valid day range
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // Valid languages
          fc.constantFrom('free', 'premium', 'pro'), // Valid tiers
          fc.string({ minLength: 5, maxLength: 100 }), // Question message
          fc.string({ minLength: 1, maxLength: 50 }), // User ID
          async (day, languageId, tier, message, userId) => {
            // Setup: Configure store and get context
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Create a theory question request
            const request: AssistantRequest = {
              message,
              context,
              requestType: 'question',
            };

            // Act: Build prompt
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt includes day theory from curriculum
            expect(prompt).toBeDefined();
            expect(typeof prompt).toBe('string');
            expect(prompt.length).toBeGreaterThan(0);
            
            // The prompt should include the day theory content
            if (context.dayTheory && context.dayTheory.length > 0) {
              // Check that some portion of the theory is in the prompt
              // (it might be truncated, so we check for a substring)
              const theorySnippet = context.dayTheory.substring(0, 50);
              expect(prompt.toLowerCase()).toContain(theorySnippet.toLowerCase().substring(0, 20));
            }
            
            // The prompt should reference the current day
            expect(prompt).toContain(day.toString());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include curriculum content in system prompt for all days', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (day, languageId, tier, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            const request: AssistantRequest = {
              message: 'Explain today\'s topic',
              context,
              requestType: 'question',
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: System prompt includes day number and topic
            expect(prompt).toContain(`Day ${day}`);
            
            // Should include language name
            const languageNames: Record<string, string> = {
              python: 'Python',
              javascript: 'JavaScript',
              typescript: 'TypeScript',
              java: 'Java',
              cpp: 'C++',
              csharp: 'C#',
              go: 'Go',
            };
            expect(prompt).toContain(languageNames[languageId]);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include day material section for question requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 5, maxLength: 100 }),
          async (day, languageId, message) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            const userId = 'test-user';
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message,
              context,
              requestType: 'question',
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt includes material section
            // The English template uses "Current day material:"
            // The Russian template uses "Материал текущего дня:"
            const hasMaterialSection = 
              prompt.includes('Current day material:') || 
              prompt.includes('Материал текущего дня:');
            
            expect(hasMaterialSection).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Examples match curriculum level', () => {
    /**
     * Feature: ai-learning-assistant, Property 10: Examples match curriculum level
     * Validates: Requirements 6.5
     * 
     * For any AI response with examples, the complexity should align 
     * with the current day number (early days = simpler examples)
     */
    it('should reference day number in system prompt for complexity adaptation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (day, languageId, tier, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            const request: AssistantRequest = {
              message: 'Give me an example',
              context,
              requestType: 'question',
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: System prompt explicitly mentions adapting to day level
            // The guidelines should include "Adapt complexity to the student's level (Day X)"
            const hasLevelAdaptation = 
              prompt.includes(`Day ${day}`) &&
              (prompt.includes('Adapt complexity') || prompt.includes('Адаптируй сложность'));
            
            expect(hasLevelAdaptation).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include day context for all request types to enable level-appropriate responses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.constantFrom('question', 'code-help', 'advice', 'general'),
          fc.string({ minLength: 5, maxLength: 100 }),
          async (day, languageId, requestType, message) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            const userId = 'test-user';
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message,
              context,
              requestType: requestType as 'question' | 'code-help' | 'advice' | 'general',
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: All prompts include day number for level adaptation
            expect(prompt).toContain(day.toString());
            
            // System prompt should be present with day context
            expect(prompt).toContain('Day');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide different topic context based on day range', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (languageId, userId) => {
            // Test different day ranges
            const dayRanges = [
              { day: 5, expectedTopics: ['Basic', 'Основы'] },
              { day: 20, expectedTopics: ['Data Structure', 'Структуры данных'] },
              { day: 45, expectedTopics: ['Algorithm', 'Алгоритм'] },
              { day: 75, expectedTopics: ['Advanced', 'Продвинут'] },
            ];

            for (const { day, expectedTopics } of dayRanges) {
              // Setup
              const progressStore = useProgressStore.getState();
              progressStore.resetProgress();
              progressStore.setLanguage(languageId);
              progressStore.setActiveDay(day);
              
              contextAggregator.invalidateCache(userId);
              const context = await contextAggregator.getUserContext(userId, 'premium');

              const request: AssistantRequest = {
                message: 'What should I learn?',
                context,
                requestType: 'question',
              };

              // Act
              const prompt = promptBuilder.buildPrompt(request);

              // Assert: Topic should match the day range
              const hasExpectedTopic = expectedTopics.some(topic => 
                prompt.toLowerCase().includes(topic.toLowerCase())
              );
              
              expect(hasExpectedTopic).toBe(true);
            }
          }
        ),
        { numRuns: 25 } // Fewer runs since we test multiple ranges per iteration
      );
    });

    it('should include completed days count to inform complexity level', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.array(fc.integer({ min: 1, max: 90 }), { minLength: 0, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (currentDay, languageId, completedDays, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            const achievementsStore = useAchievementsStore.getState();
            progressStore.resetProgress();
            achievementsStore.resetAchievements();
            
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(currentDay);
            
            const uniqueCompletedDays = Array.from(new Set(completedDays));
            for (const day of uniqueCompletedDays) {
              progressStore.setActiveDay(day);
              progressStore.markDayComplete(day);
            }
            progressStore.setActiveDay(currentDay);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: 'Help me understand this',
              context,
              requestType: 'question',
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt includes completed days count
            expect(prompt).toContain(uniqueCompletedDays.length.toString());
            
            // System prompt should reference completed days
            const hasCompletedDaysRef = 
              prompt.includes('Completed days:') || 
              prompt.includes('Завершено дней:');
            
            expect(hasCompletedDaysRef).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Prompt Structure Validation', () => {
    it('should always produce non-empty prompts for valid requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.constantFrom('question', 'code-help', 'advice', 'general'),
          fc.string({ minLength: 1, maxLength: 200 }),
          async (day, languageId, requestType, message) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            const userId = 'test-user';
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message,
              context,
              requestType: requestType as 'question' | 'code-help' | 'advice' | 'general',
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt is non-empty and well-formed
            expect(prompt).toBeDefined();
            expect(typeof prompt).toBe('string');
            expect(prompt.length).toBeGreaterThan(50); // Should have substantial content
            
            // Should contain the user's message (or at least a meaningful portion)
            // Skip very short or special-character-only messages
            const trimmedMessage = message.trim();
            if (trimmedMessage.length >= 3 && /[a-zA-Z0-9]/.test(trimmedMessage)) {
              const messageSnippet = trimmedMessage.substring(0, Math.min(20, trimmedMessage.length));
              expect(prompt.toLowerCase()).toContain(messageSnippet.toLowerCase());
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect max prompt length for all inputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 1, maxLength: 5000 }), // Very long message
          async (day, languageId, message) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            const userId = 'test-user';
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message,
              context,
              requestType: 'question',
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt respects max length (default 4000)
            expect(prompt.length).toBeLessThanOrEqual(4100); // Small buffer for truncation message
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 14: No complete solutions given', () => {
    /**
     * Feature: ai-learning-assistant, Property 14: No complete solutions given
     * Validates: Requirements 3.4, 6.3
     * 
     * For any task-related question, the AI prompt should include instructions
     * to prevent giving complete solutions to learning tasks
     */
    it('should include solution prevention guidelines in system prompt for all requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.constantFrom('question', 'code-help', 'advice', 'general'),
          fc.string({ minLength: 5, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (day, languageId, requestType, message, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message,
              context,
              requestType: requestType as 'question' | 'code-help' | 'advice' | 'general',
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: System prompt includes guidelines about not giving complete solutions
            // The English template should contain "without giving complete solutions"
            // The Russian template should contain "не давая готовых решений"
            const hasSolutionPrevention = 
              prompt.includes('without giving complete solutions') ||
              prompt.includes('не давая готовых решений') ||
              prompt.includes('without directly giving complete solutions') ||
              prompt.includes('не давай готовых решений');
            
            expect(hasSolutionPrevention).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include guidance about guiding learning in system prompt', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.constantFrom('free', 'premium', 'pro'),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (day, languageId, tier, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            const request: AssistantRequest = {
              message: 'How do I solve this task?',
              context,
              requestType: 'question',
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: System prompt emphasizes guiding learning, not solving problems
            // English: "Your goal is to guide learning, not to solve problems for the student"
            // Russian: "Твоя цель - направлять обучение, а не решать задачи за студента"
            const hasGuidanceGoal = 
              prompt.includes('guide learning') ||
              prompt.includes('направлять обучение') ||
              (prompt.includes('goal') && prompt.includes('not to solve')) ||
              (prompt.includes('цель') && prompt.includes('не решать'));
            
            expect(hasGuidanceGoal).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include solution prevention for task-specific requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 1, maxLength: 50 }), // taskId
          fc.string({ minLength: 5, maxLength: 200 }), // message
          async (day, languageId, taskId, message) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            const userId = 'test-user';
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            // Create a request with task context
            const request: AssistantRequest = {
              message,
              context,
              requestType: 'code-help',
              taskId, // Include task ID to indicate task-specific help
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt includes solution prevention guidelines
            const hasSolutionPrevention = 
              prompt.includes('without giving complete solutions') ||
              prompt.includes('не давая готовых решений') ||
              prompt.includes('guide learning') ||
              prompt.includes('направлять обучение');
            
            expect(hasSolutionPrevention).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain solution prevention across different locales', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.constantFrom('ru', 'en'),
          async (day, languageId, locale) => {
            // Setup with specific locale
            const localePromptBuilder = createPromptBuilder(locale);
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            const userId = 'test-user';
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: locale === 'ru' ? 'Как решить эту задачу?' : 'How do I solve this task?',
              context,
              requestType: 'question',
            };

            // Act
            const prompt = localePromptBuilder.buildPrompt(request);

            // Assert: Both locales include solution prevention
            if (locale === 'ru') {
              const hasRussianPrevention = 
                prompt.includes('не давая готовых решений') ||
                prompt.includes('не решать задачи за студента');
              expect(hasRussianPrevention).toBe(true);
            } else {
              const hasEnglishPrevention = 
                prompt.includes('without giving complete solutions') ||
                prompt.includes('not to solve problems for the student');
              expect(hasEnglishPrevention).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include hint-giving guidance for code-help requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 500 }), // code sample
          async (day, languageId, code) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            const userId = 'test-user';
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: 'Can you help me fix this code?',
              context,
              requestType: 'code-help',
              code, // Include code to trigger code-help template
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt includes solution prevention even for code help
            const hasSolutionPrevention = 
              prompt.includes('without giving complete solutions') ||
              prompt.includes('не давая готовых решений') ||
              prompt.includes('guide learning') ||
              prompt.includes('направлять обучение');
            
            expect(hasSolutionPrevention).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 15: Skill level is respected', () => {
    /**
     * Feature: ai-learning-assistant, Property 15: Skill level is respected
     * Validates: Requirements 3.5
     * 
     * For any code analysis, the AI prompt should include the user's 
     * current day and skill level
     */
    it('should include current day in all code analysis prompts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }), // Valid day range
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // Valid languages
          fc.string({ minLength: 10, maxLength: 500 }), // Code sample
          fc.string({ minLength: 5, maxLength: 200 }), // Message
          fc.string({ minLength: 1, maxLength: 50 }), // User ID
          async (day, languageId, code, message, userId) => {
            // Setup: Configure store and get context
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            // Create a code analysis request
            const request: AssistantRequest = {
              message,
              context,
              requestType: 'code-help',
              code,
            };

            // Act: Build prompt
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt includes the current day number
            expect(prompt).toBeDefined();
            expect(typeof prompt).toBe('string');
            expect(prompt.length).toBeGreaterThan(0);
            
            // The prompt should explicitly mention the day number
            expect(prompt).toContain(day.toString());
            
            // The prompt should reference "Day" to indicate skill level context
            expect(prompt).toMatch(/Day \d+/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include skill level adaptation guidance in code analysis prompts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 500 }), // Code sample
          fc.string({ minLength: 1, maxLength: 50 }), // User ID
          async (day, languageId, code, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: 'Can you help me fix this code?',
              context,
              requestType: 'code-help',
              code,
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: System prompt includes guidance about adapting to skill level
            // The prompt should mention adapting complexity to the student's level
            const hasSkillLevelAdaptation = 
              (prompt.includes('Adapt complexity') || prompt.includes('Адаптируй сложность')) &&
              prompt.includes(`Day ${day}`);
            
            expect(hasSkillLevelAdaptation).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include completed days count for skill level assessment', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.array(fc.integer({ min: 1, max: 90 }), { minLength: 0, maxLength: 30 }),
          fc.string({ minLength: 10, maxLength: 500 }), // Code sample
          fc.string({ minLength: 1, maxLength: 50 }), // User ID
          async (currentDay, languageId, completedDays, code, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            const achievementsStore = useAchievementsStore.getState();
            progressStore.resetProgress();
            achievementsStore.resetAchievements();
            
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(currentDay);
            
            // Mark days as completed
            const uniqueCompletedDays = Array.from(new Set(completedDays));
            for (const day of uniqueCompletedDays) {
              progressStore.setActiveDay(day);
              progressStore.markDayComplete(day);
            }
            progressStore.setActiveDay(currentDay);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: 'Help me understand this code',
              context,
              requestType: 'code-help',
              code,
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt includes completed days count for skill assessment
            expect(prompt).toContain(uniqueCompletedDays.length.toString());
            
            // Should reference completed days in system prompt
            const hasCompletedDaysRef = 
              prompt.includes('Completed days:') || 
              prompt.includes('Завершено дней:');
            
            expect(hasCompletedDaysRef).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should adapt explanation complexity based on day number', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 200 }), // Code sample
          fc.string({ minLength: 1, maxLength: 50 }), // User ID
          async (languageId, code, userId) => {
            // Test different day ranges to ensure skill level context is present
            const dayRanges = [
              { day: 3, range: 'early' },
              { day: 25, range: 'mid' },
              { day: 60, range: 'advanced' },
              { day: 85, range: 'expert' },
            ];

            for (const { day, range } of dayRanges) {
              // Setup
              const progressStore = useProgressStore.getState();
              progressStore.resetProgress();
              progressStore.setLanguage(languageId);
              progressStore.setActiveDay(day);
              
              contextAggregator.invalidateCache(userId);
              const context = await contextAggregator.getUserContext(userId, 'premium');

              const request: AssistantRequest = {
                message: 'Explain this code',
                context,
                requestType: 'code-help',
                code,
              };

              // Act
              const prompt = promptBuilder.buildPrompt(request);

              // Assert: Prompt includes day context for all ranges
              expect(prompt).toContain(`Day ${day}`);
              
              // System prompt should have skill level adaptation guidance
              const hasAdaptationGuidance = 
                prompt.includes('Adapt complexity') || 
                prompt.includes('Адаптируй сложность');
              
              expect(hasAdaptationGuidance).toBe(true);
            }
          }
        ),
        { numRuns: 25 } // Fewer runs since we test multiple ranges per iteration
      );
    });

    it('should include current streak for motivation and skill context', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.integer({ min: 0, max: 30 }), // Streak days
          fc.string({ minLength: 10, maxLength: 300 }), // Code sample
          fc.string({ minLength: 1, maxLength: 50 }), // User ID
          async (day, languageId, streakDays, code, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            const achievementsStore = useAchievementsStore.getState();
            progressStore.resetProgress();
            achievementsStore.resetAchievements();
            
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            // Set up streak
            if (streakDays > 0) {
              achievementsStore.updateStats({ currentStreak: streakDays });
            }
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: 'Review my code',
              context,
              requestType: 'code-help',
              code,
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt includes streak information
            expect(prompt).toContain(streakDays.toString());
            
            // Should reference streak in system prompt
            const hasStreakRef = 
              prompt.includes('streak:') || 
              prompt.includes('серия:');
            
            expect(hasStreakRef).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain skill level context across different code analysis types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 500 }), // Code sample
          fc.constantFrom(
            'Can you help me fix this?',
            'What does this code do?',
            'Is this code correct?',
            'How can I improve this?',
            'Why is this not working?'
          ),
          fc.string({ minLength: 1, maxLength: 50 }), // User ID
          async (day, languageId, code, message, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message,
              context,
              requestType: 'code-help',
              code,
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: All code analysis requests include skill level context
            expect(prompt).toContain(`Day ${day}`);
            
            // Should have adaptation guidance
            const hasAdaptation = 
              prompt.includes('Adapt complexity') || 
              prompt.includes('Адаптируй сложность');
            
            expect(hasAdaptation).toBe(true);
            
            // Should include the code being analyzed (if it has meaningful content)
            // Skip checking for code snippets that are only whitespace or special chars
            const trimmedCode = code.trim();
            if (trimmedCode.length >= 3 && /[a-zA-Z0-9]/.test(trimmedCode)) {
              const codeSnippet = trimmedCode.substring(0, Math.min(30, trimmedCode.length));
              expect(prompt.toLowerCase()).toContain(codeSnippet.toLowerCase());
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Locale Support', () => {
    it('should generate prompts in Russian when locale is ru', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          async (day, languageId) => {
            // Setup with Russian locale
            const ruPromptBuilder = createPromptBuilder('ru');
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            const userId = 'test-user';
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: 'Помоги мне',
              context,
              requestType: 'question',
            };

            // Act
            const prompt = ruPromptBuilder.buildPrompt(request);

            // Assert: Prompt contains Russian text
            const russianKeywords = ['Студент', 'дне', 'Твоя роль', 'Правила'];
            const hasRussianContent = russianKeywords.some(keyword => 
              prompt.includes(keyword)
            );
            
            expect(hasRussianContent).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate prompts in English when locale is en', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          async (day, languageId) => {
            // Setup with English locale
            const enPromptBuilder = createPromptBuilder('en');
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            const userId = 'test-user';
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: 'Help me',
              context,
              requestType: 'question',
            };

            // Act
            const prompt = enPromptBuilder.buildPrompt(request);

            // Assert: Prompt contains English text
            const englishKeywords = ['Student', 'Day', 'Your role', 'Guidelines'];
            const hasEnglishContent = englishKeywords.some(keyword => 
              prompt.includes(keyword)
            );
            
            expect(hasEnglishContent).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
