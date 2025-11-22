/**
 * Unit tests for CodeBlock component
 * Feature: ai-learning-assistant
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { CodeBlock } from '@/components/ai-assistant/CodeBlock';

/**
 * Mock Prism.js
 */
vi.mock('prismjs', () => ({
  default: {
    highlightElement: vi.fn(),
  },
}));

vi.mock('prismjs/themes/prism-tomorrow.css', () => ({}));
vi.mock('prismjs/components/prism-python', () => ({}));
vi.mock('prismjs/components/prism-javascript', () => ({}));
vi.mock('prismjs/components/prism-typescript', () => ({}));
vi.mock('prismjs/components/prism-java', () => ({}));
vi.mock('prismjs/components/prism-cpp', () => ({}));
vi.mock('prismjs/components/prism-csharp', () => ({}));
vi.mock('prismjs/components/prism-go', () => ({}));

/**
 * Mock clipboard API
 */
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
    },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CodeBlock Component - Unit Tests', () => {
  /**
   * Test that CodeBlock renders with correct structure
   */
  it('should render code block with language badge', () => {
    const code = 'print("Hello, World!")';
    const language = 'python';
    
    const { container } = render(
      <CodeBlock code={code} language={language} locale="en" />
    );
    
    // Check that the code is rendered
    expect(container.textContent).toContain(code);
    
    // Check that language badge is present
    expect(container.textContent).toContain('Python');
  });

  /**
   * Test that all supported languages are handled
   */
  it('should support all 7 platform languages', () => {
    const languages = [
      { id: 'python', label: 'Python' },
      { id: 'javascript', label: 'JavaScript' },
      { id: 'typescript', label: 'TypeScript' },
      { id: 'java', label: 'Java' },
      { id: 'cpp', label: 'C++' },
      { id: 'csharp', label: 'C#' },
      { id: 'go', label: 'Go' },
    ];
    
    languages.forEach(({ id, label }) => {
      const { container, unmount } = render(
        <CodeBlock code="test code" language={id} locale="en" />
      );
      
      // Check that language label is displayed
      expect(container.textContent).toContain(label);
      
      unmount();
    });
  });

  /**
   * Test that copy button is present
   */
  it('should render copy button', () => {
    const { container } = render(
      <CodeBlock code="test code" language="python" locale="en" />
    );
    
    // Check for copy button text
    expect(container.textContent).toContain('Copy');
  });

  /**
   * Test localization support
   */
  it('should support Russian and English locales', () => {
    // Test Russian
    const { container: ruContainer, unmount: ruUnmount } = render(
      <CodeBlock code="test" language="python" locale="ru" />
    );
    expect(ruContainer.textContent).toContain('Копировать');
    ruUnmount();
    
    // Test English
    const { container: enContainer, unmount: enUnmount } = render(
      <CodeBlock code="test" language="python" locale="en" />
    );
    expect(enContainer.textContent).toContain('Copy');
    enUnmount();
  });

  /**
   * Test that code block has proper styling classes
   */
  it('should have dark theme styling', () => {
    const { container } = render(
      <CodeBlock code="test" language="python" locale="en" />
    );
    
    // Check for dark background classes
    const codeBlock = container.querySelector('.bg-\\[\\#1e1e1e\\]');
    expect(codeBlock).toBeTruthy();
  });

  /**
   * Test language normalization
   */
  it('should normalize language identifiers', () => {
    const testCases = [
      { input: 'js', expected: 'JavaScript' },
      { input: 'ts', expected: 'TypeScript' },
      { input: 'c++', expected: 'C++' },
      { input: 'c#', expected: 'C#' },
    ];
    
    testCases.forEach(({ input, expected }) => {
      const { container, unmount } = render(
        <CodeBlock code="test" language={input} locale="en" />
      );
      
      expect(container.textContent).toContain(expected);
      unmount();
    });
  });
});
