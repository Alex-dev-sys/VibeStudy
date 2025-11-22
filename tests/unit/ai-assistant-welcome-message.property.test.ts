/**
 * AI Assistant Welcome Message Property-Based Tests
 * Feature: ai-learning-assistant, Property 5: Welcome message includes context
 * Validates: Requirements 1.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { AIAssistantService } from '@/lib/ai-assistant/service';
import type { AssistantContext } from '@/lib/ai-assistant/types';

describe('AI Assistant Welcome Message - Property Tests', () => {
  // Feature: ai-learning-assistant, Property 5: Welcome message includes context
  it('should always include current day and programming language in welcome message', () => {
    // Define valid programming languages
    const validLanguages = ['python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'];
    const languageNames: Record<string, string> = {
      python: 'Python',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      java: 'Java',
      cpp: 'C++',
      csharp: 'C#',
      go: 'Go',
    };

    // Define valid locales
    const validLocales = ['ru', 'en'] as const;

    // Property: For any valid user context (day 1-90, valid language, any locale),
    // the welcome message should include both the day number and the language name
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 90 }), // currentDay
        fc.constantFrom(...validLanguages), // languageId
        fc.constantFrom(...validLocales), // locale
        fc.integer({ min: 0, max: 90 }), // currentStreak
        fc.array(fc.integer({ min: 1, max: 90 }), { maxLength: 90 }), // completedDays
        fc.integer({ min: 0, max: 1000 }), // totalTasksCompleted
        (currentDay, languageId, locale, currentStreak, completedDays, totalTasksCompleted) => {
          // Create service with the specified locale
          const service = new AIAssistantService({ locale });

          // Create context
          const context: AssistantContext = {
            userId: 'test-user',
            tier: 'free',
            currentDay,
            languageId,
            completedDays,
            currentStreak,
            totalTasksCompleted,
            recentMessages: [],
          };

          // Generate welcome message
          const message = service.generateWelcomeMessage(context);

          // Property assertions:
          // 1. Message should contain the day number
          const dayPattern = locale === 'ru' ? `День ${currentDay}` : `Day ${currentDay}`;
          expect(message).toContain(dayPattern);

          // 2. Message should contain the language name
          const expectedLanguageName = languageNames[languageId];
          expect(message).toContain(expectedLanguageName);

          // 3. Message should not be empty
          expect(message.length).toBeGreaterThan(0);

          // 4. Message should contain greeting
          const greetingPattern = locale === 'ru' ? 'Привет' : 'Hi';
          expect(message).toContain(greetingPattern);

          // 5. If streak > 0, message should mention streak
          if (currentStreak > 0) {
            expect(message).toContain(currentStreak.toString());
            expect(message).toContain('🔥');
          }

          // 6. Message should contain help options
          if (locale === 'ru') {
            expect(message).toContain('помочь');
          } else {
            expect(message).toContain('help');
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  // Additional property: Welcome message structure is consistent across locales
  it('should maintain consistent structure across different locales', () => {
    const validLanguages = ['python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'];

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 90 }),
        fc.constantFrom(...validLanguages),
        fc.integer({ min: 0, max: 90 }),
        (currentDay, languageId, currentStreak) => {
          const context: AssistantContext = {
            userId: 'test-user',
            tier: 'free',
            currentDay,
            languageId,
            completedDays: [],
            currentStreak,
            totalTasksCompleted: 0,
            recentMessages: [],
          };

          // Generate messages in both locales
          const serviceRu = new AIAssistantService({ locale: 'ru' });
          const serviceEn = new AIAssistantService({ locale: 'en' });

          const messageRu = serviceRu.generateWelcomeMessage(context);
          const messageEn = serviceEn.generateWelcomeMessage(context);

          // Both messages should be non-empty
          expect(messageRu.length).toBeGreaterThan(0);
          expect(messageEn.length).toBeGreaterThan(0);

          // Both should contain the day number
          expect(messageRu).toContain(currentDay.toString());
          expect(messageEn).toContain(currentDay.toString());

          // Both should contain emoji
          expect(messageRu).toMatch(/[\u{1F300}-\u{1F9FF}]/u);
          expect(messageEn).toMatch(/[\u{1F300}-\u{1F9FF}]/u);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Welcome message handles edge cases correctly
  it('should handle edge cases (day 1, day 90, streak 0, high streak)', () => {
    const validLanguages = ['python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'];
    const languageNames: Record<string, string> = {
      python: 'Python',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      java: 'Java',
      cpp: 'C++',
      csharp: 'C#',
      go: 'Go',
    };

    fc.assert(
      fc.property(
        fc.constantFrom(1, 90), // Edge days
        fc.constantFrom(...validLanguages),
        fc.constantFrom(0, 1, 89, 90), // Edge streaks
        (currentDay, languageId, currentStreak) => {
          const service = new AIAssistantService({ locale: 'ru' });

          const context: AssistantContext = {
            userId: 'test-user',
            tier: 'free',
            currentDay,
            languageId,
            completedDays: [],
            currentStreak,
            totalTasksCompleted: 0,
            recentMessages: [],
          };

          const message = service.generateWelcomeMessage(context);

          // Should always include day and language
          expect(message).toContain(`День ${currentDay}`);
          expect(message).toContain(languageNames[languageId]);

          // Should handle zero streak gracefully
          if (currentStreak === 0) {
            expect(message).toContain('Давай начнём');
          } else {
            expect(message).toContain(currentStreak.toString());
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
