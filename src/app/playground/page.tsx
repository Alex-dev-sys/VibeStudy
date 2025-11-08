'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { LANGUAGES } from '@/lib/languages';
import { useProgressStore } from '@/store/progress-store';

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
  const [editorLoading, setEditorLoading] = useState(true);
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

    // Симуляция выполнения кода
    // В реальном приложении здесь был бы API вызов к серверу для выполнения кода
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
    // Monaco Editor has built-in formatting
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setEditorLoading(false);
  };

  return (
    <main className="relative flex min-h-screen flex-col gap-4 px-3 py-6 sm:gap-6 sm:px-4 sm:py-8 md:gap-8 md:px-8 md:py-10 lg:px-14">
      <div className="absolute inset-0 -z-10 bg-gradient-accent opacity-60" aria-hidden />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">🎨 Playground</h1>
            <p className="mt-2 text-sm text-white/70">
              Экспериментируй с кодом, тестируй идеи и учись на практике
            </p>
          </div>
          <Link href="/learn">
            <Button variant="secondary" size="md">
              ← Вернуться к обучению
            </Button>
          </Link>
        </div>

        {/* Language Selector */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="text-lg">Выбери язык программирования</CardTitle>
            <div className="mt-4 flex flex-wrap gap-2">
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
          </CardHeader>
        </Card>

        {/* Editor and Output */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Code Editor */}
          <Card className="border-white/10 bg-black/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Редактор кода ({currentLanguage?.label})
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleFormat}>
                    ✨ Форматировать
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClear}>
                    🗑️ Очистить
                  </Button>
                </div>
              </div>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="overflow-hidden rounded-xl border border-white/10">
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
              <div className="mt-4 flex gap-2">
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
            </div>
          </Card>

          {/* Output */}
          <Card className="border-white/10 bg-black/40">
            <CardHeader>
              <CardTitle className="text-lg">Вывод программы</CardTitle>
              <CardDescription>
                Результат выполнения твоего кода появится здесь
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <div className="min-h-[500px] overflow-auto rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-sm text-white">
                {output || (
                  <div className="flex h-full items-center justify-center text-white/40">
                    <div className="text-center">
                      <div className="mb-3 text-4xl">💻</div>
                      <p>Нажми "Запустить код" чтобы увидеть результат</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Tips */}
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg">💡 Советы по использованию Playground</CardTitle>
            <div className="mt-4 space-y-2 text-sm text-white/70">
              <p>• <strong>Экспериментируй:</strong> Пробуй разные подходы к решению задач</p>
              <p>• <strong>Тестируй идеи:</strong> Проверяй гипотезы перед применением в задачах</p>
              <p>• <strong>Учись на ошибках:</strong> Не бойся ошибок — они помогают учиться</p>
              <p>• <strong>Сохраняй код:</strong> Копируй интересные решения для дальнейшего использования</p>
              <p>• <strong>Форматирование:</strong> Используй кнопку "✨ Форматировать" для улучшения читаемости кода</p>
            </div>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}

