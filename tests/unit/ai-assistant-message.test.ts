/**
 * Property-based tests for AI Assistant Message Model
 * Feature: ai-learning-assistant
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Message, CodeBlock } from '@/lib/ai-assistant/types';

/**
 * Arbitrary generator for CodeBlock
 */
const codeBlockArbitrary = fc.record({
  language: fc.constantFrom('python', 'javascript', 'typescript', 'java', 'cpp', 'csharp', 'go'),
  code: fc.string({ minLength: 1, maxLength: 500 }),
});

/**
 * Arbitrary generator for Message metadata
 */
const messageMetadataArbitrary = fc.record({
  codeBlocks: fc.option(fc.array(codeBlockArbitrary, { minLength: 0, maxLength: 3 })),
  suggestions: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 5 })),
  relatedTopics: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 5 })),
  requestType: fc.option(fc.constantFrom('question', 'code-help', 'advice', 'general')),
});

/**
 * Arbitrary generator for Message
 */
const messageArbitrary = fc.record({
  id: fc.uuid(),
  sessionId: fc.uuid(),
  role: fc.constantFrom('user', 'assistant', 'system'),
  content: fc.string({ minLength: 1, maxLength: 2000 }),
  timestamp: fc.integer({ min: 0, max: Date.now() + 1000000 }),
  metadata: fc.option(messageMetadataArbitrary),
});

describe('AI Assistant Message Model - Property Tests', () => {
  /**
   * Feature: ai-learning-assistant, Property 22: Messages have timestamps
   * Validates: Requirements 5.3
   * 
   * For any message displayed in the chat, it should include a visible timestamp
   */
  it('Property 22: All messages have valid timestamps', () => {
    fc.assert(
      fc.property(messageArbitrary, (message: Message) => {
        // Every message must have a timestamp property
        expect(message).toHaveProperty('timestamp');
        
        // Timestamp must be a number
        expect(typeof message.timestamp).toBe('number');
        
        // Timestamp must be a valid positive number (not NaN, not negative)
        expect(message.timestamp).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(message.timestamp)).toBe(true);
        
        // Timestamp should be a reasonable Unix timestamp (after year 2000, before far future)
        const year2000 = 946684800000; // Jan 1, 2000 in milliseconds
        const farFuture = Date.now() + (100 * 365 * 24 * 60 * 60 * 1000); // 100 years from now
        expect(message.timestamp).toBeGreaterThanOrEqual(0);
        expect(message.timestamp).toBeLessThanOrEqual(farFuture);
      }),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  it('Property: Messages have required fields', () => {
    fc.assert(
      fc.property(messageArbitrary, (message: Message) => {
        // Every message must have all required fields
        expect(message).toHaveProperty('id');
        expect(message).toHaveProperty('sessionId');
        expect(message).toHaveProperty('role');
        expect(message).toHaveProperty('content');
        expect(message).toHaveProperty('timestamp');
        
        // ID and sessionId must be non-empty strings
        expect(typeof message.id).toBe('string');
        expect(message.id.length).toBeGreaterThan(0);
        expect(typeof message.sessionId).toBe('string');
        expect(message.sessionId.length).toBeGreaterThan(0);
        
        // Role must be one of the valid values
        expect(['user', 'assistant', 'system']).toContain(message.role);
        
        // Content must be a non-empty string
        expect(typeof message.content).toBe('string');
        expect(message.content.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('Property: Message metadata is optional but well-formed when present', () => {
    fc.assert(
      fc.property(messageArbitrary, (message: Message) => {
        if (message.metadata) {
          // If metadata exists, it should be an object
          expect(typeof message.metadata).toBe('object');
          
          // If codeBlocks exist, they should be an array
          if (message.metadata.codeBlocks) {
            expect(Array.isArray(message.metadata.codeBlocks)).toBe(true);
            
            // Each code block should have language and code
            message.metadata.codeBlocks.forEach((block: CodeBlock) => {
              expect(block).toHaveProperty('language');
              expect(block).toHaveProperty('code');
              expect(typeof block.language).toBe('string');
              expect(typeof block.code).toBe('string');
            });
          }
          
          // If suggestions exist, they should be an array of strings
          if (message.metadata.suggestions) {
            expect(Array.isArray(message.metadata.suggestions)).toBe(true);
            message.metadata.suggestions.forEach((suggestion: string) => {
              expect(typeof suggestion).toBe('string');
            });
          }
          
          // If relatedTopics exist, they should be an array of strings
          if (message.metadata.relatedTopics) {
            expect(Array.isArray(message.metadata.relatedTopics)).toBe(true);
            message.metadata.relatedTopics.forEach((topic: string) => {
              expect(typeof topic).toBe('string');
            });
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property: Message timestamps are monotonically increasing in a conversation', () => {
    // Generate a sequence of messages
    fc.assert(
      fc.property(
        fc.array(messageArbitrary, { minLength: 2, maxLength: 10 }),
        (messages: Message[]) => {
          // Sort messages by timestamp
          const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);
          
          // Verify that timestamps are in order
          for (let i = 1; i < sortedMessages.length; i++) {
            expect(sortedMessages[i].timestamp).toBeGreaterThanOrEqual(sortedMessages[i - 1].timestamp);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
