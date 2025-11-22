/**
 * Property-based tests for AI Assistant Response Parser
 * Feature: ai-learning-assistant
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ResponseParser, parseAIResponse } from '@/lib/ai-assistant/response-parser';
import { AssistantResponse, CodeBlock } from '@/lib/ai-assistant/types';

/**
 * Arbitrary generator for programming language identifiers
 */
const languageArbitrary = fc.constantFrom(
  'python',
  'javascript',
  'typescript',
  'java',
  'cpp',
  'csharp',
  'go',
  'js',
  'ts',
  'py',
  'c++',
  'cs',
  'c#',
  'plaintext'
);

/**
 * Arbitrary generator for code content
 * Filters out empty/whitespace-only strings since the parser filters these out
 */
const codeContentArbitrary = fc.string({ minLength: 1, maxLength: 500 }).filter(
  // Ensure code doesn't contain triple backticks which would break the markdown
  // Also ensure code is not just whitespace (parser filters these out)
  (str) => !str.includes('```') && str.trim().length > 0
);

/**
 * Arbitrary generator for a single code block in markdown format
 */
const markdownCodeBlockArbitrary = fc.tuple(
  languageArbitrary,
  codeContentArbitrary
).map(([lang, code]) => `\`\`\`${lang}\n${code}\n\`\`\``);

/**
 * Arbitrary generator for text without code blocks
 */
const plainTextArbitrary = fc.string({ minLength: 1, maxLength: 500 }).filter(
  (str) => !str.includes('```')
);

/**
 * Arbitrary generator for AI response with code blocks
 */
const responseWithCodeBlocksArbitrary = fc.tuple(
  fc.array(markdownCodeBlockArbitrary, { minLength: 1, maxLength: 5 }),
  fc.option(plainTextArbitrary)
).map(([codeBlocks, text]) => {
  // Interleave text and code blocks
  if (text) {
    return `${text}\n\n${codeBlocks.join('\n\n')}`;
  }
  return codeBlocks.join('\n\n');
});

describe('AI Assistant Response Parser - Property Tests', () => {
  /**
   * Feature: ai-learning-assistant, Property 23: Code blocks have syntax highlighting
   * Validates: Requirements 5.4
   * 
   * For any message containing code blocks, syntax highlighting should be applied based on the language.
   * This test verifies that the ResponseParser correctly extracts code blocks with their language identifiers.
   */
  it('Property 23: Code blocks are extracted with language identifiers', () => {
    fc.assert(
      fc.property(
        languageArbitrary,
        codeContentArbitrary,
        (language: string, code: string) => {
          // Create a response with a code block
          const rawResponse = `Here's an example:\n\`\`\`${language}\n${code}\n\`\`\`\nHope this helps!`;
          
          // Parse the response
          const parser = new ResponseParser();
          const parsed = parser.parseResponse(rawResponse);
          
          // Verify that code blocks were extracted
          expect(parsed.codeExamples).toBeDefined();
          expect(parsed.codeExamples).not.toBeUndefined();
          expect(Array.isArray(parsed.codeExamples)).toBe(true);
          expect(parsed.codeExamples!.length).toBeGreaterThan(0);
          
          // Verify that the first code block has the correct structure
          const firstBlock = parsed.codeExamples![0];
          expect(firstBlock).toHaveProperty('language');
          expect(firstBlock).toHaveProperty('code');
          
          // Verify that language is a non-empty string
          expect(typeof firstBlock.language).toBe('string');
          expect(firstBlock.language.length).toBeGreaterThan(0);
          
          // Verify that code content is preserved (after trimming)
          // Note: The parser trims whitespace from code blocks for cleaner display
          expect(typeof firstBlock.code).toBe('string');
          expect(firstBlock.code).toBe(code.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Multiple code blocks are all extracted', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(languageArbitrary, codeContentArbitrary),
          { minLength: 1, maxLength: 5 }
        ),
        (codeBlockPairs) => {
          // Create a response with multiple code blocks
          const codeBlocks = codeBlockPairs.map(
            ([lang, code]) => `\`\`\`${lang}\n${code}\n\`\`\``
          );
          const rawResponse = `Here are some examples:\n\n${codeBlocks.join('\n\n')}\n\nHope this helps!`;
          
          // Parse the response
          const parser = new ResponseParser();
          const parsed = parser.parseResponse(rawResponse);
          
          // Verify that all code blocks were extracted
          expect(parsed.codeExamples).toBeDefined();
          expect(parsed.codeExamples!.length).toBe(codeBlockPairs.length);
          
          // Verify each code block
          codeBlockPairs.forEach(([expectedLang, expectedCode], index) => {
            const block = parsed.codeExamples![index];
            // Code is trimmed by the parser
            expect(block.code).toBe(expectedCode.trim());
            // Language should be normalized but recognizable
            expect(typeof block.language).toBe('string');
            expect(block.language.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Code blocks without language default to plaintext', () => {
    fc.assert(
      fc.property(codeContentArbitrary, (code: string) => {
        // Create a code block without language specifier
        const rawResponse = `Here's an example:\n\`\`\`\n${code}\n\`\`\`\nHope this helps!`;
        
        // Parse the response
        const parser = new ResponseParser();
        const parsed = parser.parseResponse(rawResponse);
        
        // Verify that code block was extracted
        expect(parsed.codeExamples).toBeDefined();
        expect(parsed.codeExamples!.length).toBeGreaterThan(0);
        
        // Verify that language defaults to plaintext
        const firstBlock = parsed.codeExamples![0];
        expect(firstBlock.language).toBe('plaintext');
        // Code is trimmed by the parser
        expect(firstBlock.code).toBe(code.trim());
      }),
      { numRuns: 100 }
    );
  });

  it('Property: Language identifiers are normalized', () => {
    // Test that common language aliases are normalized
    const languageAliases: [string, string][] = [
      ['js', 'javascript'],
      ['ts', 'typescript'],
      ['py', 'python'],
      ['cpp', 'cpp'],
      ['c++', 'cpp'],
      ['cs', 'csharp'],
      ['c#', 'csharp'],
    ];

    languageAliases.forEach(([alias, expected]) => {
      const code = 'console.log("test");';
      const rawResponse = `\`\`\`${alias}\n${code}\n\`\`\``;
      
      const parser = new ResponseParser();
      const parsed = parser.parseResponse(rawResponse);
      
      // Verify code block was extracted
      expect(parsed.codeExamples).toBeDefined();
      expect(parsed.codeExamples!.length).toBeGreaterThan(0);
      expect(parsed.codeExamples![0].language).toBe(expected);
    });
  });

  it('Property: Empty code blocks are filtered out', () => {
    fc.assert(
      fc.property(languageArbitrary, (language: string) => {
        // Create a response with an empty code block
        const rawResponse = `Here's an example:\n\`\`\`${language}\n\n\`\`\`\nNothing there!`;
        
        // Parse the response
        const parser = new ResponseParser();
        const parsed = parser.parseResponse(rawResponse);
        
        // Verify that empty code blocks are not included
        if (parsed.codeExamples) {
          expect(parsed.codeExamples.length).toBe(0);
        } else {
          expect(parsed.codeExamples).toBeUndefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property: Responses without code blocks have undefined codeExamples', () => {
    fc.assert(
      fc.property(plainTextArbitrary, (text: string) => {
        // Create a response without code blocks
        const rawResponse = text;
        
        // Parse the response
        const parser = new ResponseParser();
        const parsed = parser.parseResponse(rawResponse);
        
        // Verify that codeExamples is undefined when no code blocks present
        expect(parsed.codeExamples).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('Property: Code block extraction preserves whitespace and formatting', () => {
    fc.assert(
      fc.property(
        languageArbitrary,
        fc.string({ minLength: 1, maxLength: 200 }).filter(
          (str) => !str.includes('```') && str.trim().length > 0
        ),
        (language: string, code: string) => {
          // Create a response with code that has specific whitespace
          const rawResponse = `\`\`\`${language}\n${code}\n\`\`\``;
          
          // Parse the response
          const parser = new ResponseParser();
          const parsed = parser.parseResponse(rawResponse);
          
          // Verify that whitespace is preserved (after trim)
          expect(parsed.codeExamples).toBeDefined();
          expect(parsed.codeExamples![0].code).toBe(code.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Parser handles malformed responses gracefully', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 500 }),
        (randomText: string) => {
          // Parse potentially malformed response
          const parser = new ResponseParser();
          const parsed = parser.parseResponse(randomText);
          
          // Verify that parser always returns a valid response
          expect(parsed).toBeDefined();
          expect(parsed).toHaveProperty('message');
          expect(typeof parsed.message).toBe('string');
          
          // Response should be valid according to validator
          // Note: Empty/whitespace-only responses will have fallback message
          const isValid = parser.validateResponse(parsed);
          expect(isValid).toBe(true);
          
          // If input was empty or whitespace-only, should have fallback message
          if (randomText.trim().length === 0) {
            expect(parsed.message.length).toBeGreaterThan(0);
            // Fallback message should be the error message or the original (empty) text
            expect(parsed.message).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Parsed response can be formatted back to display format', () => {
    fc.assert(
      fc.property(responseWithCodeBlocksArbitrary, (rawResponse: string) => {
        // Parse the response
        const parser = new ResponseParser();
        const parsed = parser.parseResponse(rawResponse);
        
        // Format back to display
        const formatted = parser.formatForDisplay(parsed);
        
        // Verify that formatted output is a string
        expect(typeof formatted).toBe('string');
        
        // Formatted output should have content (either message or fallback)
        expect(formatted.length).toBeGreaterThan(0);
        
        // If there were code blocks extracted, they should appear in formatted output
        if (parsed.codeExamples && parsed.codeExamples.length > 0) {
          parsed.codeExamples.forEach((block) => {
            // Code should be present in the formatted output
            expect(formatted).toContain(block.code);
          });
        }
      }),
      { numRuns: 100 }
    );
  });
});
