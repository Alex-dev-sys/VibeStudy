'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/Button';
import { LANGUAGES } from '@/lib/languages';
import { useProgressStore } from '@/store/progress-store';
import { usePlaygroundStore } from '@/store/playground-store';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { MagicCard } from '@/components/ui/magic-card';
import { Console } from '@/components/playground/Console';
import { SaveSnippetModal } from '@/components/playground/SaveSnippetModal';
import { SnippetsList } from '@/components/playground/SnippetsList';
import { getConsoleInterceptor } from '@/lib/playground/console-interceptor';
import type { CodeSnippet } from '@/store/playground-store';

const CODE_TEMPLATES: Record<string, string> = {
  python: `# Python Playground
# Пиши свой код здесь!

def hello():
    print("Привет из Playground!")

hello()
`,
  javascript: `// JavaScript Playground
// Пиши свой код здесь!

function hello() {
    console.log("Привет из Playground!");
}

hello();
`,
  typescript: `// TypeScript Playground
// Пиши свой код здесь!

function hello(): void {
    console.log("Привет из Playground!");
}

hello();
`,
  java: `// Java Playground
// Пиши свой код здесь!

public class Main {
    public static void main(String[] args) {
        System.out.println("Привет из Playground!");
    }
}
`,
  cpp: `// C++ Playground
// Пиши свой код здесь!

#include <iostream>
using namespace std;

int main() {
    cout << "Привет из Playground!" << endl;
    return 0;
}
`,
  csharp: `// C# Playground
// Пиши свой код здесь!

using System;

class Program {
    static void Main() {
        Console.WriteLine("Привет из Playground!");
    }
}
`,
  go: `// Go Playground
// Пиши свой код здесь!

package main

import "fmt"

func main() {
    fmt.Println("Привет из Playground!")
}
`
};

export default function PlaygroundPage() {
  const defaultLanguage = useProgressStore((state) => state.languageId);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [code, setCode] = useState(CODE_TEMPLATES[defaultLanguage] || CODE_TEMPLATES.python);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [editorError, setEditorError] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const editorRef = useRef<any>(null);
  
  const { consoleOutput, clearConsole, addConsoleMessage } = usePlaygroundStore();
  const currentLanguage = LANGUAGES.find((lang) => lang.id === selectedLanguage);
  
  const handleLoadSnippet = (snippet: CodeSnippet) => {
    setCode(snippet.code);
    setSelectedLanguage(snippet.language);
    setShowSnippets(false);
  };
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      const interceptor = getConsoleInterceptor();
      interceptor.stop();
    };
  }, []);

  const handleLanguageChange = (langId: string) => {
    setSelectedLanguage(langId);
    setCode(CODE_TEMPLATES[langId] || '// Начни писать код...');
    setOutput('');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('⏳ Выполнение кода...\n\n');
    
    // Clear console and start intercepting
    clearConsole();
    const interceptor = getConsoleInterceptor();
    interceptor.clear();
    interceptor.start();

    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOutput(data.output);
        
        // Add output to console
        if (data.output) {
          addConsoleMessage({
            type: 'log',
            message: data.output
          });
        }
      } else {
        setOutput(`❌ Ошибка выполнения:\n${data.error}\n\n${data.details || ''}`);
        
        // Add error to console
        addConsoleMessage({
          type: 'error',
          message: data.error,
          stack: data.details
        });
      }
      
      // Capture any console messages from interceptor
      const messages = interceptor.getMessages();
      messages.forEach((msg) => {
        addConsoleMessage(msg);
      });
    } catch (error) {
      const errorMessage = `❌ Не удалось выполнить код\n\n` +
          `Проверь подключение к интернету и попробуй снова.\n` +
          `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
      
      setOutput(errorMessage);
      
      addConsoleMessage({
        type: 'error',
        message: errorMessage
      });
    } finally {
      interceptor.stop();
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setCode(CODE_TEMPLATES[selectedLanguage] || '');
    setOutput('');
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <GradientBackdrop blur className="-z-20" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <span>🎨</span>
              <span>Экспериментируй и прокачивай навык кодинга</span>
            </div>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              <AnimatedGradientText className="px-1">Playground</AnimatedGradientText>
            </h1>
            <p className="max-w-2xl text-sm text-white/70 sm:text-base">
              Экспериментируй с идеями, проверяй гипотезы и тренируйся перед задачами. Мы сохраним твой темп и подскажем,
              что улучшить.
            </p>
          </div>
          <Link href="/learn">
            <Button variant="secondary" size="md" className="border-white/30 text-white">
              ← Вернуться к обучению
            </Button>
          </Link>
        </div>

        <MagicCard innerClassName="rounded-[26px] p-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white">Выбери язык программирования</h2>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <Button
                  key={lang.id}
                  variant={selectedLanguage === lang.id ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleLanguageChange(lang.id)}
                >
                  {lang.label}
                </Button>
              ))}
            </div>
          </div>
        </MagicCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <MagicCard innerClassName="rounded-[28px] p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">
                Редактор кода ({currentLanguage?.label})
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsSaveModalOpen(true)}>
                  💾 Сохранить
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSnippets(!showSnippets)}>
                  📂 Сниппеты
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    // Export current code
                    const extensions: Record<string, string> = {
                      python: 'py',
                      javascript: 'js',
                      typescript: 'ts',
                      java: 'java',
                      cpp: 'cpp',
                      csharp: 'cs',
                      go: 'go'
                    };
                    
                    const extension = extensions[selectedLanguage] || 'txt';
                    const filename = `playground_${Date.now()}.${extension}`;
                    
                    const blob = new Blob([code], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  disabled={!code.trim()}
                >
                  📥 Экспорт
                </Button>
                <Button variant="ghost" size="sm" onClick={handleFormat}>
                  ✨ Форматировать
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  🗑️ Очистить
                </Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              {editorError ? (
                <div className="flex h-[500px] flex-col items-center justify-center gap-4 bg-black/60 p-6">
                  <span className="text-4xl">⚠️</span>
                  <p className="text-center text-sm text-white/70">
                    Не удалось загрузить редактор кода.
                    <br />
                    Используйте текстовое поле ниже:
                  </p>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Напишите код на ${currentLanguage?.label}...`}
                    className="h-80 w-full resize-none rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-sm text-white placeholder-white/40 focus:border-accent/50 focus:outline-none"
                  />
                </div>
              ) : (
                <Editor
                  height="500px"
                  language={currentLanguage?.monacoLanguage || 'python'}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorDidMount}
                  loading={
                    <div className="flex h-[500px] items-center justify-center bg-black/60">
                      <div className="text-center">
                        <div className="mb-3 text-2xl">⏳</div>
                        <p className="text-sm text-white/60">Загрузка редактора...</p>
                      </div>
                    </div>
                  }
                  options={{
                    fontSize: 14,
                    fontLigatures: true,
                    automaticLayout: true,
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderWhitespace: 'selection',
                    bracketPairColorization: { enabled: true }
                  }}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleRun}
                disabled={isRunning || !code.trim()}
                className="flex-1"
              >
                {isRunning ? '⏳ Выполнение...' : '▶️ Запустить код'}
              </Button>
            </div>
          </MagicCard>

          <MagicCard innerClassName="rounded-[28px] p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Консоль</h2>
              <p className="text-sm text-white/60">
                Результат выполнения и логи твоего кода
              </p>
            </div>
            <div className="h-[500px]">
              <Console messages={consoleOutput} onClear={clearConsole} />
            </div>
          </MagicCard>
        </div>

        {showSnippets && (
          <MagicCard innerClassName="rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">📂 Сохранённые сниппеты</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSnippets(false)}>
                ✕ Закрыть
              </Button>
            </div>
            <div className="mt-4">
              <SnippetsList onLoadSnippet={handleLoadSnippet} />
            </div>
          </MagicCard>
        )}

        <MagicCard innerClassName="rounded-[28px] p-6">
          <h2 className="text-lg font-semibold text-white">💡 Советы по использованию Playground</h2>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <p>• <strong>Экспериментируй:</strong> Пробуй разные подходы к решению задач</p>
            <p>• <strong>Тестируй идеи:</strong> Проверяй гипотезы перед применением в задачах</p>
            <p>• <strong>Учись на ошибках:</strong> Не бойся ошибок — они помогают учиться</p>
            <p>• <strong>Сохраняй сниппеты:</strong> Используй кнопку «💾 Сохранить» для быстрого доступа к коду</p>
            <p>• <strong>Форматирование:</strong> Используй кнопку «✨ Форматировать» для улучшения читаемости кода</p>
          </div>
        </MagicCard>
      </div>
      
      <SaveSnippetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        code={code}
        language={selectedLanguage}
      />
    </main>
  );
}
