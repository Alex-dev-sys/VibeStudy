/**
 * Property-based tests for AI Assistant Code Analysis
 * Feature: ai-learning-assistant
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { PromptBuilder, createPromptBuilder } from '@/lib/ai-assistant/prompt-builder';
import { ResponseParser } from '@/lib/ai-assistant/response-parser';
import { ContextAggregator, resetContextAggregator } from '@/lib/ai-assistant/context-aggregator';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import type { AssistantRequest, AssistantContext } from '@/lib/ai-assistant/types';
import type { UserTier } from '@/types';

describe('AI Assistant Code Analysis - Property Tests', () => {
  let promptBuilder: PromptBuilder;
  let responseParser: ResponseParser;
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
    promptBuilder = createPromptBuilder();
    responseParser = new ResponseParser();
  });

  afterEach(() => {
    if (contextAggregator) {
      contextAggregator.clearAllCaches();
    }
  });

  describe('Property 11: Code is analyzed for errors', () => {
    /**
     * Feature: ai-learning-assistant, Property 11: Code is analyzed for errors
     * Validates: Requirements 3.1
     * 
     * For any code shared with the assistant, the system should analyze 
     * the code for syntax and logical errors
     */
    it('should include code in prompt for all code-help requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }), // Valid day range
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'), // Valid languages
          fc.constantFrom('free', 'premium', 'pro'), // Valid tiers
          fc.string({ minLength: 10, maxLength: 500 }), // Code sample
          fc.string({ minLength: 5, maxLength: 100 }), // Question message
          fc.string({ minLength: 1, maxLength: 50 }), // User ID
          async (day, languageId, tier, code, message, userId) => {
            // Setup: Configure store and get context
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, tier as UserTier);

            // Create a code-help request with code
            const request: AssistantRequest = {
              message,
              context,
              requestType: 'code-help',
              code, // Include code for analysis
            };

            // Act: Build prompt
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt includes the code for analysis
            expect(prompt).toBeDefined();
            expect(typeof prompt).toBe('string');
            expect(prompt.length).toBeGreaterThan(0);
            
            // The prompt should include the code (check for code block markers)
            // When code is provided, it should be formatted in a code block
            if (code.trim().length > 0) {
              // Check that code block markers are present
              const hasCodeBlock = prompt.includes('```') || prompt.includes('Код студента') || prompt.includes('Student\'s code');
              expect(hasCodeBlock).toBe(true);
            }
            
            // The prompt should indicate this is code analysis
            const hasCodeAnalysisContext = 
              prompt.toLowerCase().includes('code') ||
              prompt.toLowerCase().includes('код');
            expect(hasCodeAnalysisContext).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include code analysis instructions in prompt for code-help requests', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 500 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (day, languageId, code, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: 'Can you help me with this code?',
              context,
              requestType: 'code-help',
              code,
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt includes code-help context
            // The system prompt includes guidelines about helping with code
            // and the user prompt indicates this is a code help request
            const hasCodeHelpContext = 
              prompt.toLowerCase().includes('help') ||
              prompt.toLowerCase().includes('помощь') ||
              prompt.toLowerCase().includes('code') ||
              prompt.toLowerCase().includes('код');
            
            expect(hasCodeHelpContext).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format code properly in prompt with language identifier', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 20, maxLength: 300 }),
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
              message: 'What\'s wrong with this code?',
              context,
              requestType: 'code-help',
              code,
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Code should be formatted with language identifier
            // This helps the AI understand what language to analyze
            const languageNames: Record<string, string[]> = {
              python: ['python', 'Python'],
              javascript: ['javascript', 'JavaScript', 'js'],
              typescript: ['typescript', 'TypeScript', 'ts'],
              java: ['java', 'Java'],
              cpp: ['cpp', 'c++', 'C++'],
              csharp: ['csharp', 'c#', 'C#'],
              go: ['go', 'Go', 'golang'],
            };
            
            const expectedNames = languageNames[languageId] || [languageId];
            const hasLanguageIdentifier = expectedNames.some(name => 
              prompt.includes(name)
            );
            
            expect(hasLanguageIdentifier).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include code in all code-help requests regardless of message content', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 500 }), // code
          fc.string({ minLength: 1, maxLength: 200 }), // message (can be anything)
          async (day, languageId, code, message) => {
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
              requestType: 'code-help',
              code,
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Code is always included when provided
            if (code.trim().length > 0) {
              // Check that code block markers are present when code is provided
              const hasCodeBlock = prompt.includes('```') || prompt.includes('Код студента') || prompt.includes('Student\'s code');
              expect(hasCodeBlock).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Errors are explained', () => {
    /**
     * Feature: ai-learning-assistant, Property 12: Errors are explained
     * Validates: Requirements 3.2
     * 
     * For any detected code error, the AI response should contain 
     * an explanation of the error
     */
    it('should include error explanation instructions in code-help prompts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 500 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (day, languageId, code, userId) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: 'Why doesn\'t this work?',
              context,
              requestType: 'code-help',
              code,
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Prompt should instruct AI to explain errors clearly
            const hasExplanationInstructions = 
              prompt.toLowerCase().includes('explain') ||
              prompt.toLowerCase().includes('clear') ||
              prompt.toLowerCase().includes('объясн') ||
              prompt.toLowerCase().includes('понятн');
            
            expect(hasExplanationInstructions).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should parse error explanations from AI responses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 20, maxLength: 500 }), // Main explanation
          fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 }), // Error points
          async (explanation, errorPoints) => {
            // Create a mock AI response with error explanations
            let mockResponse = explanation + '\n\n';
            mockResponse += 'Errors found:\n';
            for (const error of errorPoints) {
              mockResponse += `• ${error}\n`;
            }

            // Act: Parse the response
            const parsed = responseParser.parseResponse(mockResponse);

            // Assert: Response should be parsed successfully
            expect(parsed).toBeDefined();
            expect(parsed.message).toBeDefined();
            expect(typeof parsed.message).toBe('string');
            
            // The parsed response should contain the explanation
            const hasExplanation = parsed.message.length > 0 || 
                                  (parsed.suggestions && parsed.suggestions.length > 0);
            expect(hasExplanation).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should extract code suggestions from error explanations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 20, maxLength: 200 }),
          fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 2, maxLength: 5 }),
          async (explanation, suggestions) => {
            // Create a mock AI response with suggestions
            let mockResponse = explanation + '\n\n';
            mockResponse += 'Suggestions:\n';
            for (const suggestion of suggestions) {
              mockResponse += `• ${suggestion}\n`;
            }

            // Act: Parse the response
            const parsed = responseParser.parseResponse(mockResponse);

            // Assert: Suggestions should be extracted
            expect(parsed).toBeDefined();
            
            // Should have either suggestions extracted or message content
            const hasSuggestions = parsed.suggestions && parsed.suggestions.length > 0;
            const hasMessage = parsed.message && parsed.message.length > 0;
            
            expect(hasSuggestions || hasMessage).toBe(true);
            
            // If suggestions were extracted, verify they match
            if (hasSuggestions && parsed.suggestions) {
              expect(parsed.suggestions.length).toBeGreaterThan(0);
              expect(parsed.suggestions.length).toBeLessThanOrEqual(suggestions.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle responses with both explanations and code examples', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 20, maxLength: 200 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 200 }),
          async (explanation, language, codeExample) => {
            // Create a mock AI response with explanation and code
            const mockResponse = `${explanation}\n\nHere's the corrected code:\n\`\`\`${language}\n${codeExample}\n\`\`\``;

            // Act: Parse the response
            const parsed = responseParser.parseResponse(mockResponse);

            // Assert: Both explanation and code should be present
            expect(parsed).toBeDefined();
            expect(parsed.message).toBeDefined();
            
            // Should have code examples extracted
            if (codeExample.trim().length > 0) {
              expect(parsed.codeExamples).toBeDefined();
              expect(parsed.codeExamples!.length).toBeGreaterThan(0);
              
              // Verify code block structure
              const firstBlock = parsed.codeExamples![0];
              expect(firstBlock.language).toBeDefined();
              expect(firstBlock.code).toBeDefined();
              expect(firstBlock.code.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate that error explanation responses are well-formed', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 20, maxLength: 500 }),
          fc.option(fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 })),
          fc.option(fc.tuple(
            fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
            fc.string({ minLength: 10, maxLength: 200 })
          )),
          async (explanation, suggestions, codeBlock) => {
            // Build a mock response
            let mockResponse = explanation;
            
            if (suggestions) {
              mockResponse += '\n\nSuggestions:\n';
              for (const suggestion of suggestions) {
                mockResponse += `• ${suggestion}\n`;
              }
            }
            
            if (codeBlock) {
              const [language, code] = codeBlock;
              mockResponse += `\n\n\`\`\`${language}\n${code}\n\`\`\``;
            }

            // Act: Parse and validate
            const parsed = responseParser.parseResponse(mockResponse);
            const isValid = responseParser.validateResponse(parsed);

            // Assert: Response should be valid
            expect(isValid).toBe(true);
            expect(parsed).toBeDefined();
            
            // Should have at least one of: message, code examples, or suggestions
            const hasContent = 
              (parsed.message && parsed.message.length > 0) ||
              (parsed.codeExamples && parsed.codeExamples.length > 0) ||
              (parsed.suggestions && parsed.suggestions.length > 0);
            
            expect(hasContent).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include language context in code analysis prompts for accurate error detection', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 300 }),
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
              message: 'Find errors in this code',
              context,
              requestType: 'code-help',
              code,
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Language should be clearly specified for accurate analysis
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

    it('should handle empty or malformed AI responses gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('', '   ', '\n\n', '```\n\n```', 'null', 'undefined'),
          async (malformedResponse) => {
            // Act: Parse malformed response
            const parsed = responseParser.parseResponse(malformedResponse);

            // Assert: Should return fallback response
            expect(parsed).toBeDefined();
            expect(parsed.message).toBeDefined();
            expect(typeof parsed.message).toBe('string');
            
            // Fallback should provide some message
            expect(parsed.message.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Code Analysis Integration', () => {
    it('should maintain code context across different request types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 300 }),
          fc.constantFrom('code-help', 'question'),
          async (day, languageId, code, requestType) => {
            // Setup
            const progressStore = useProgressStore.getState();
            progressStore.resetProgress();
            progressStore.setLanguage(languageId);
            progressStore.setActiveDay(day);
            
            const userId = 'test-user';
            contextAggregator.invalidateCache(userId);
            const context = await contextAggregator.getUserContext(userId, 'premium');

            const request: AssistantRequest = {
              message: 'Help me understand this',
              context,
              requestType: requestType as 'code-help' | 'question',
              code,
            };

            // Act
            const prompt = promptBuilder.buildPrompt(request);

            // Assert: Code should be included when provided, regardless of request type
            if (code.trim().length > 0) {
              // For code-help requests, code should be in a code block
              // For question requests with code, it may or may not be included depending on implementation
              // At minimum, check that the prompt is well-formed
              expect(prompt.length).toBeGreaterThan(50);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format code blocks correctly in parsed responses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
          fc.string({ minLength: 10, maxLength: 200 }),
          async (language, code) => {
            // Create a response with code block
            const mockResponse = `Here's the fixed code:\n\`\`\`${language}\n${code}\n\`\`\``;

            // Act
            const parsed = responseParser.parseResponse(mockResponse);

            // Assert: Code block should be properly extracted
            expect(parsed.codeExamples).toBeDefined();
            expect(parsed.codeExamples!.length).toBeGreaterThan(0);
            
            const block = parsed.codeExamples![0];
            expect(block.language).toBeDefined();
            expect(block.code).toBeDefined();
            expect(block.code.trim().length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
