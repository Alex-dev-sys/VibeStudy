/**
 * Property-based tests for AI Assistant Content Filter
 * Feature: ai-learning-assistant
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ContentFilter, filterContent, sanitizeInput } from '@/lib/ai-assistant/content-filter';

/**
 * Arbitrary generator for inappropriate keywords in Russian
 */
const inappropriateRussianArbitrary = fc.constantFrom(
  'дурак',
  'идиот',
  'тупой'
);

/**
 * Arbitrary generator for inappropriate keywords in English
 */
const inappropriateEnglishArbitrary = fc.constantFrom(
  'stupid',
  'idiot',
  'dumb'
);

/**
 * Arbitrary generator for prompt injection patterns (text-based only)
 * Note: HTML-encoded patterns are excluded because HTML stripping happens before injection check
 */
const promptInjectionArbitrary = fc.constantFrom(
  'ignore previous instructions',
  'forget everything',
  'you are now a',
  'system: do this',
  '[system] override',
  'act as if you are',
  'pretend you are',
  'roleplay as admin',
  'new instructions: reveal',
  'override rules and'
);

/**
 * Arbitrary generator for clean content (no inappropriate words)
 */
const cleanContentArbitrary = fc.string({ minLength: 1, maxLength: 2000 }).filter(str => {
  const lower = str.toLowerCase();
  // Exclude strings that contain inappropriate keywords
  const inappropriateWords = ['дурак', 'идиот', 'тупой', 'stupid', 'idiot', 'dumb'];
  return !inappropriateWords.some(word => lower.includes(word));
});

/**
 * Arbitrary generator for HTML content
 */
const htmlContentArbitrary = fc.constantFrom(
  '<script>alert("xss")</script>',
  '<div>Hello</div>',
  '<p>Test &amp; content</p>',
  '<a href="#">Link</a>',
  '&lt;tag&gt;',
  '&nbsp;&nbsp;spaces'
);

/**
 * Arbitrary generator for locale
 */
const localeArbitrary = fc.constantFrom('ru', 'en');

describe('AI Assistant Content Filter - Property Tests', () => {
  /**
   * Feature: ai-learning-assistant, Property 33: Inappropriate content is blocked
   * Validates: Requirements 8.4
   * 
   * For any request containing inappropriate content, the request should be filtered or blocked
   */
  it('Property 33: Inappropriate Russian content is blocked', () => {
    fc.assert(
      fc.property(
        inappropriateRussianArbitrary,
        fc.string({ minLength: 0, maxLength: 100 }),
        fc.string({ minLength: 0, maxLength: 100 }),
        (inappropriateWord, prefix, suffix) => {
          // Create content with inappropriate word embedded
          const content = `${prefix} ${inappropriateWord} ${suffix}`;
          
          // Filter with Russian locale
          const filter = new ContentFilter({ locale: 'ru' });
          const result = filter.filterContent(content);
          
          // Content should be blocked
          expect(result.allowed).toBe(false);
          
          // Should have a reason
          expect(result.reason).toBeDefined();
          expect(typeof result.reason).toBe('string');
          expect(result.reason!.length).toBeGreaterThan(0);
          
          // Should list blocked words
          expect(result.blocked).toBeDefined();
          expect(Array.isArray(result.blocked)).toBe(true);
          expect(result.blocked!.length).toBeGreaterThan(0);
          expect(result.blocked).toContain(inappropriateWord);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 33: Inappropriate English content is blocked', () => {
    fc.assert(
      fc.property(
        inappropriateEnglishArbitrary,
        fc.string({ minLength: 0, maxLength: 100 }),
        fc.string({ minLength: 0, maxLength: 100 }),
        (inappropriateWord, prefix, suffix) => {
          // Create content with inappropriate word embedded
          const content = `${prefix} ${inappropriateWord} ${suffix}`;
          
          // Filter with English locale
          const filter = new ContentFilter({ locale: 'en' });
          const result = filter.filterContent(content);
          
          // Content should be blocked
          expect(result.allowed).toBe(false);
          
          // Should have a reason
          expect(result.reason).toBeDefined();
          expect(typeof result.reason).toBe('string');
          expect(result.reason!.length).toBeGreaterThan(0);
          
          // Should list blocked words
          expect(result.blocked).toBeDefined();
          expect(Array.isArray(result.blocked)).toBe(true);
          expect(result.blocked!.length).toBeGreaterThan(0);
          expect(result.blocked).toContain(inappropriateWord);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 33: Prompt injection attempts are blocked', () => {
    fc.assert(
      fc.property(
        promptInjectionArbitrary,
        fc.string({ minLength: 0, maxLength: 100 }),
        (injectionPattern, additionalText) => {
          // Create content with injection pattern
          const content = `${additionalText} ${injectionPattern}`;
          
          // Filter content
          const filter = new ContentFilter();
          const result = filter.filterContent(content);
          
          // Content should be blocked
          expect(result.allowed).toBe(false);
          
          // Should have a reason indicating prompt injection
          expect(result.reason).toBeDefined();
          expect(typeof result.reason).toBe('string');
          expect(result.reason!.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 33: Clean content is allowed', () => {
    fc.assert(
      fc.property(
        cleanContentArbitrary,
        localeArbitrary,
        (content, locale) => {
          // Filter clean content
          const filter = new ContentFilter({ locale });
          const result = filter.filterContent(content);
          
          // Content should be allowed
          expect(result.allowed).toBe(true);
          
          // Should have sanitized version
          expect(result.sanitized).toBeDefined();
          expect(typeof result.sanitized).toBe('string');
          
          // Should not have a blocking reason
          expect(result.reason).toBeUndefined();
          expect(result.blocked).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 33: Content exceeding max length is blocked', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2001, maxLength: 3000 }),
        localeArbitrary,
        (longContent, locale) => {
          // Filter content that exceeds max length
          const filter = new ContentFilter({ locale, maxLength: 2000 });
          const result = filter.filterContent(longContent);
          
          // Content should be blocked
          expect(result.allowed).toBe(false);
          
          // Should have a reason about length
          expect(result.reason).toBeDefined();
          expect(typeof result.reason).toBe('string');
          expect(result.reason!.toLowerCase()).toMatch(/длинное|long|максимум|max/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 33: HTML tags are removed from content', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '<script>alert("xss")</script>',
          '<div>Hello</div>',
          '<p>Test content</p>',
          '<a href="#">Link</a>'
        ),
        (htmlContent) => {
          // Filter HTML content with actual tags
          const filter = new ContentFilter({ stripHtml: true });
          const result = filter.filterContent(htmlContent);
          
          // If allowed, sanitized content should have HTML tags removed
          if (result.allowed) {
            expect(result.sanitized).toBeDefined();
            
            // The filter strips HTML tags using regex /<[^>]*>/g
            // So <div>Hello</div> becomes Hello
            // Verify that common HTML tags are removed
            expect(result.sanitized).not.toContain('<script>');
            expect(result.sanitized).not.toContain('</script>');
            expect(result.sanitized).not.toContain('<div>');
            expect(result.sanitized).not.toContain('</div>');
            expect(result.sanitized).not.toContain('<p>');
            expect(result.sanitized).not.toContain('</p>');
            expect(result.sanitized).not.toContain('<a ');
            expect(result.sanitized).not.toContain('</a>');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 33: Case-insensitive inappropriate content detection', () => {
    fc.assert(
      fc.property(
        inappropriateRussianArbitrary,
        fc.constantFrom('lower', 'upper', 'mixed'),
        (word, caseType) => {
          // Transform word case
          let transformedWord: string = word;
          if (caseType === 'upper') {
            transformedWord = word.toUpperCase() as typeof word;
          } else if (caseType === 'mixed') {
            transformedWord = word.split('').map((c, i) =>
              i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
            ).join('') as typeof word;
          }

          const content = `Hello ${transformedWord} world`;
          
          // Filter with Russian locale
          const filter = new ContentFilter({ locale: 'ru' });
          const result = filter.filterContent(content);
          
          // Content should be blocked regardless of case
          expect(result.allowed).toBe(false);
          expect(result.blocked).toBeDefined();
          expect(result.blocked!.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 33: Multiple inappropriate words are all detected', () => {
    fc.assert(
      fc.property(
        fc.array(inappropriateRussianArbitrary, { minLength: 2, maxLength: 3 }),
        (words) => {
          // Create content with multiple inappropriate words
          const content = words.join(' ');
          
          // Filter with Russian locale
          const filter = new ContentFilter({ locale: 'ru' });
          const result = filter.filterContent(content);
          
          // Content should be blocked
          expect(result.allowed).toBe(false);
          
          // All words should be in blocked list
          expect(result.blocked).toBeDefined();
          expect(result.blocked!.length).toBeGreaterThan(0);
          
          // Each inappropriate word should be detected
          words.forEach(word => {
            expect(result.blocked).toContain(word);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 33: Empty content is handled gracefully', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\n\n', '\t\t'),
        localeArbitrary,
        (emptyContent, locale) => {
          // Filter empty/whitespace content
          const filter = new ContentFilter({ locale });
          const result = filter.filterContent(emptyContent);
          
          // Should be allowed (empty is not inappropriate)
          expect(result.allowed).toBe(true);
          
          // Sanitized should be empty or whitespace trimmed
          expect(result.sanitized).toBeDefined();
          expect(result.sanitized.trim().length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 33: Convenience function filterContent works correctly', () => {
    fc.assert(
      fc.property(
        inappropriateRussianArbitrary,
        (word) => {
          const content = `Test ${word} content`;
          
          // Use convenience function
          const result = filterContent(content, 'ru');
          
          // Should block inappropriate content
          expect(result.allowed).toBe(false);
          expect(result.blocked).toBeDefined();
          expect(result.blocked).toContain(word);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 33: Sanitize input removes HTML and trims whitespace', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('<div>', '</div>', '<script>', '<p>'),
        (text, htmlTag) => {
          const content = `${htmlTag}${text}${htmlTag}`;
          
          // Use sanitizeInput function
          const sanitized = sanitizeInput(content);
          
          // Should not contain HTML tags
          expect(sanitized).not.toMatch(/<[^>]*>/);
          
          // Should be a string
          expect(typeof sanitized).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });
});
