'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/Button';
import { LANGUAGES } from '@/lib/languages';
import { useProgressStore } from '@/store/progress-store';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { MagicCard } from '@/components/ui/magic-card';

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
  const editorRef = useRef<any>(null);

  const currentLanguage = LANGUAGES.find((lang) => lang.id === selectedLanguage);

  const handleLanguageChange = (langId: string) => {
    setSelectedLanguage(langId);
    setCode(CODE_TEMPLATES[langId] || '// Начни писать код...');
    setOutput('');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('⏳ Выполнение кода...\n\n');

    setTimeout(() => {
      setOutput(
        `✅ Код выполнен успешно!\n\n` +
          `📝 Примечание: Это демо-режим Playground.\n` +
          `В полной версии здесь будет реальное выполнение кода через безопасную песочницу.\n\n` +
          `Твой код:\n${code.split('\n').slice(0, 5).join('\n')}${code.split('\n').length > 5 ? '\n...' : ''}`
      );
      setIsRunning(false);
    }, 1500);
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
              <div className="flex gap-2">
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
              <h2 className="text-lg font-semibold text-white">Вывод программы</h2>
              <p className="text-sm text-white/60">
                Результат выполнения твоего кода появится здесь
              </p>
            </div>
            <div className="min-h-[500px] flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-sm text-white">
              {output || (
                <div className="flex h-full items-center justify-center text-white/40">
                  <div className="text-center">
                    <div className="mb-3 text-4xl">💻</div>
                    <p>Нажми «Запустить код», чтобы увидеть результат</p>
                  </div>
                </div>
              )}
            </div>
          </MagicCard>
        </div>

        <MagicCard innerClassName="rounded-[28px] p-6">
          <h2 className="text-lg font-semibold text-white">💡 Советы по использованию Playground</h2>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <p>• <strong>Экспериментируй:</strong> Пробуй разные подходы к решению задач</p>
            <p>• <strong>Тестируй идеи:</strong> Проверяй гипотезы перед применением в задачах</p>
            <p>• <strong>Учись на ошибках:</strong> Не бойся ошибок — они помогают учиться</p>
            <p>• <strong>Сохраняй код:</strong> Копируй интересные решения для дальнейшего использования</p>
            <p>• <strong>Форматирование:</strong> Используй кнопку «✨ Форматировать» для улучшения читаемости кода</p>
          </div>
        </MagicCard>
      </div>
    </main>
  );
}
