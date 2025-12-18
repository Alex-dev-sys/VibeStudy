'use client';

/**
 * CodeBlock Component
 * Renders code blocks with syntax highlighting and copy functionality
 */

import React, { useEffect, useRef, useState } from 'react';
// Temporarily disabled Prism.js due to build issues
// import Prism from 'prismjs';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/lib/ui/toast';

// Import Prism themes and languages
// import 'prismjs/themes/prism-tomorrow.css';
// import 'prismjs/components/prism-python';
// import 'prismjs/components/prism-javascript';
// import 'prismjs/components/prism-typescript';
// import 'prismjs/components/prism-java';
// import 'prismjs/components/prism-cpp';
// import 'prismjs/components/prism-csharp';
// import 'prismjs/components/prism-go';

/**
 * Props for CodeBlock component
 */
interface CodeBlockProps {
  code: string;
  language: string;
  locale?: 'ru' | 'en';
}

/**
 * Map language IDs to Prism language identifiers
 */
const LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  java: 'java',
  cpp: 'cpp',
  'c++': 'cpp',
  csharp: 'csharp',
  'c#': 'csharp',
  go: 'go',
};

/**
 * Get display name for language
 */
const getLanguageLabel = (language: string): string => {
  const labels: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    js: 'JavaScript',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    java: 'Java',
    cpp: 'C++',
    'c++': 'C++',
    csharp: 'C#',
    'c#': 'C#',
    go: 'Go',
  };
  return labels[language.toLowerCase()] || language;
};

/**
 * Get color for language badge
 */
const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    python: '#ffd166',
    javascript: '#f9a03f',
    js: '#f9a03f',
    typescript: '#3178c6',
    ts: '#3178c6',
    java: '#f06543',
    cpp: '#5e81ac',
    'c++': '#5e81ac',
    csharp: '#9b5de5',
    'c#': '#9b5de5',
    go: '#00add8',
  };
  return colors[language.toLowerCase()] || '#6b7280';
};

/**
 * CodeBlock component
 */
export function CodeBlock({ code, language, locale = 'ru' }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  // Normalize language identifier
  const normalizedLanguage = LANGUAGE_MAP[language.toLowerCase()] || 'javascript';
  const languageLabel = getLanguageLabel(language);
  const languageColor = getLanguageColor(language);

  // Apply syntax highlighting
  useEffect(() => {
    // Temporarily disabled Prism.js highlighting due to build issues
    // if (codeRef.current && typeof window !== 'undefined') {
    //   try {
    //     Prism.highlightElement(codeRef.current);
    //   } catch (error) {
    //     // Silently fail if Prism highlighting fails (e.g., in test environment)
    //     console.debug('Prism highlighting failed:', error);
    //   }
    // }
  }, [code, normalizedLanguage]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      
      toast.success(
        locale === 'ru' ? 'Код скопирован!' : 'Code copied!',
        locale === 'ru' ? 'Код добавлен в буфер обмена' : 'Code added to clipboard'
      );

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast.error(
        locale === 'ru' ? 'Ошибка копирования' : 'Copy failed',
        locale === 'ru' ? 'Не удалось скопировать код' : 'Failed to copy code'
      );
    }
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden bg-[#1e1e1e] border border-gray-800">
      {/* Header with language badge and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2a2a2a] border-b border-gray-800">
        <div
          className="text-xs font-semibold px-2 py-1 rounded"
          style={{
            backgroundColor: `${languageColor}20`,
            color: languageColor,
          }}
        >
          {languageLabel}
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-700"
          aria-label={locale === 'ru' ? 'Копировать код' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{locale === 'ru' ? 'Скопировано' : 'Copied'}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{locale === 'ru' ? 'Копировать' : 'Copy'}</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        <pre className="!m-0 !p-4 !bg-transparent">
          <code
            ref={codeRef}
            className={`language-${normalizedLanguage} !text-sm`}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
