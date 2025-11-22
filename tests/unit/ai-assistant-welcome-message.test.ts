/**
 * AI Assistant Welcome Message Tests
 * Tests for welcome message generation functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AIAssistantService } from '@/lib/ai-assistant/service';
import type { AssistantContext } from '@/lib/ai-assistant/types';

describe('AI Assistant Welcome Message', () => {
  let service: AIAssistantService;

  beforeEach(() => {
    service = new AIAssistantService({ locale: 'ru' });
  });

  describe('generateWelcomeMessage', () => {
    it('should include current day in welcome message', () => {
      const context: AssistantContext = {
        userId: 'test-user',
        tier: 'free',
        currentDay: 15,
        languageId: 'python',
        completedDays: [1, 2, 3],
        currentStreak: 3,
        totalTasksCompleted: 10,
        recentMessages: [],
      };

      const message = service.generateWelcomeMessage(context);

      expect(message).toContain('День 15');
    });

    it('should include programming language in welcome message', () => {
      const context: AssistantContext = {
        userId: 'test-user',
        tier: 'free',
        currentDay: 5,
        languageId: 'javascript',
        completedDays: [1, 2],
        currentStreak: 2,
        totalTasksCompleted: 5,
        recentMessages: [],
      };

      const message = service.generateWelcomeMessage(context);

      expect(message).toContain('JavaScript');
    });

    it('should include streak information when streak > 0', () => {
      const context: AssistantContext = {
        userId: 'test-user',
        tier: 'free',
        currentDay: 10,
        languageId: 'python',
        completedDays: [1, 2, 3, 4, 5],
        currentStreak: 5,
        totalTasksCompleted: 15,
        recentMessages: [],
      };

      const message = service.generateWelcomeMessage(context);

      expect(message).toContain('5');
      expect(message).toContain('🔥');
    });

    it('should show motivational message when streak is 0', () => {
      const context: AssistantContext = {
        userId: 'test-user',
        tier: 'free',
        currentDay: 1,
        languageId: 'python',
        completedDays: [],
        currentStreak: 0,
        totalTasksCompleted: 0,
        recentMessages: [],
      };

      const message = service.generateWelcomeMessage(context);

      expect(message).toContain('Давай начнём');
    });

    it('should include quick tips for using the assistant', () => {
      const context: AssistantContext = {
        userId: 'test-user',
        tier: 'free',
        currentDay: 5,
        languageId: 'python',
        completedDays: [1, 2],
        currentStreak: 2,
        totalTasksCompleted: 5,
        recentMessages: [],
      };

      const message = service.generateWelcomeMessage(context);

      expect(message).toContain('Объяснить');
      expect(message).toContain('Разобраться с кодом');
      expect(message).toContain('подсказку');
      expect(message).toContain('учиться');
    });

    it('should generate English welcome message when locale is en', () => {
      const serviceEn = new AIAssistantService({ locale: 'en' });
      const context: AssistantContext = {
        userId: 'test-user',
        tier: 'free',
        currentDay: 5,
        languageId: 'python',
        completedDays: [1, 2],
        currentStreak: 2,
        totalTasksCompleted: 5,
        recentMessages: [],
      };

      const message = serviceEn.generateWelcomeMessage(context);

      expect(message).toContain('Day 5');
      expect(message).toContain('Python');
      expect(message).toContain('Explain');
      expect(message).toContain('Debug');
    });

    it('should handle different programming languages correctly', () => {
      const languages = ['python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'];
      const expectedNames = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go'];

      languages.forEach((lang, index) => {
        const context: AssistantContext = {
          userId: 'test-user',
          tier: 'free',
          currentDay: 1,
          languageId: lang,
          completedDays: [],
          currentStreak: 0,
          totalTasksCompleted: 0,
          recentMessages: [],
        };

        const message = service.generateWelcomeMessage(context);
        expect(message).toContain(expectedNames[index]);
      });
    });

    it('should use correct Russian plural forms for days', () => {
      const testCases = [
        { streak: 1, expected: 'день' },
        { streak: 2, expected: 'дня' },
        { streak: 5, expected: 'дней' },
        { streak: 11, expected: 'дней' },
        { streak: 21, expected: 'день' },
        { streak: 22, expected: 'дня' },
        { streak: 25, expected: 'дней' },
      ];

      testCases.forEach(({ streak, expected }) => {
        const context: AssistantContext = {
          userId: 'test-user',
          tier: 'free',
          currentDay: 10,
          languageId: 'python',
          completedDays: [],
          currentStreak: streak,
          totalTasksCompleted: 0,
          recentMessages: [],
        };

        const message = service.generateWelcomeMessage(context);
        if (streak > 0) {
          expect(message).toContain(expected);
        }
      });
    });
  });
});
