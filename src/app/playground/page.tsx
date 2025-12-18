'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LazyMonacoEditor } from '@/lib/performance/lazy-components';
import { Button } from '@/components/ui/button';
import { LANGUAGES } from '@/lib/content/languages';
import { useProgressStore } from '@/store/progress-store';
import { usePlaygroundStore } from '@/store/playground-store';
import { useTranslations, useLocaleStore } from '@/store/locale-store';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { MagicCard } from '@/components/ui/magic-card';
import { Console } from '@/components/playground/Console';
import { SaveSnippetModal } from '@/components/playground/SaveSnippetModal';
import { SnippetsList } from '@/components/playground/SnippetsList';
import { getConsoleInterceptor } from '@/lib/playground/console-interceptor';
import type { CodeSnippet } from '@/store/playground-store';
import { Code2, Play, Download, FileCode, RotateCcw, Sparkles, Save, FolderOpen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const getCodeTemplates = (locale: 'ru' | 'en'): Record<string, string> => {
  const greeting = locale === 'ru' ? 'Привет из Playground!' : 'Hello from Playground!';
  const comment = locale === 'ru' ? 'Пиши свой код здесь!' : 'Write your code here!';

  return {
    python: `# Python Playground
# ${comment}

def hello():
    print("${greeting}")

hello()
`,
    javascript: `// JavaScript Playground
// ${comment}

function hello() {
    console.log("${greeting}");
}

hello();
`,
    typescript: `// TypeScript Playground
// ${comment}

function hello(): void {
    console.log("${greeting}");
}

hello();
`,
    java: `// Java Playground
// ${comment}

public class Main {
    public static void main(String[] args) {
        System.out.println("${greeting}");
    }
}
`,
    cpp: `// C++ Playground
// ${comment}

#include <iostream>
using namespace std;

int main() {
    cout << "${greeting}" << endl;
    return 0;
}
`,
    csharp: `// C# Playground
// ${comment}

using System;

class Program {
    static void Main() {
        Console.WriteLine("${greeting}");
    }
}
`,
    go: `// Go Playground
// ${comment}

package main

import "fmt"

func main() {
    fmt.Println("${greeting}")
}
`
  };
};

export default function PlaygroundPage() {
  const t = useTranslations();
  const { locale } = useLocaleStore();
  const defaultLanguage = useProgressStore((state) => state.languageId);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const CODE_TEMPLATES = getCodeTemplates(locale);
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
    const templates = getCodeTemplates(locale);
    setCode(templates[langId] || `// ${t.editor.placeholder}`);
    setOutput('');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(`⏳ ${t.editor.running}\n\n`);

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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

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
        setOutput(`❌ ${t.feedback.error}:\n${data.error}\n\n${data.details || ''}`);

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
      const errorMessage = `❌ ${t.errors.codeCheckFailed}\n\n` +
        `${t.errors.networkError}\n` +
        `${t.feedback.error}: ${error instanceof Error ? error.message : t.errors.generic}`;

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
    const templates = getCodeTemplates(locale);
    setCode(templates[selectedLanguage] || '');
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
    <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/70">
              <span>🎨</span>
              <span>{t.playground.subtitle}</span>
            </div>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              <AnimatedGradientText className="px-1">{t.playground.title}</AnimatedGradientText>
            </h1>
            <p className="max-w-2xl text-sm text-white/70 sm:text-base">
              {t.playground.subtitle}
            </p>
          </div>
          <Link href="/learn">
            <Button variant="secondary" size="md" className="border-white/30 text-white">
              ← {t.profile.backToLearning}
            </Button>
          </Link>
        </div>

        <MagicCard className="border-0 bg-white/5" innerClassName="rounded-[26px] p-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white">{t.playground.selectLanguage}</h2>
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

        <div className="grid gap-6 lg:grid-cols-2 lg:h-[600px]">
          {/* Code Editor Window */}
          <div className="flex flex-col h-full rounded-xl bg-[#1e1e1e] shadow-2xl overflow-hidden ring-1 ring-white/5 font-sans">
            {/* Window Header */}
            <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                  <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex items-center gap-2 text-gray-400 ml-2 px-2 py-0.5 rounded bg-black/20 border border-white/5">
                  <Code2 className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-medium">main.{currentLanguage?.id === 'csharp' ? 'cs' : currentLanguage?.id === 'javascript' ? 'js' : currentLanguage?.id === 'typescript' ? 'ts' : currentLanguage?.id || 'txt'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRun}
                  disabled={isRunning || !code.trim()}
                  className={cn(
                    "h-7 px-3 text-xs font-medium gap-1.5 transition-all",
                    isRunning
                      ? "text-yellow-400 bg-yellow-400/10"
                      : "text-green-400 bg-green-400/10 hover:bg-green-400/20 hover:text-green-300"
                  )}
                >
                  {isRunning ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      {t.editor.running}
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-current" />
                      {t.editor.runCode}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-[#333333] border-b border-white/5 overflow-x-auto shrink-0 no-scrollbar">
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
                title={t.editor.saveCode}
              >
                <Save className="h-3.5 w-3.5" />
                <span>{t.editor.saveCode}</span>
              </button>
              <button
                onClick={() => setShowSnippets(!showSnippets)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
                title={t.playground.snippets}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span>{t.playground.snippets}</span>
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={handleFormat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
                title={t.editor.formatCode}
              >
                <Sparkles className="h-3.5 w-3.5 text-yellow-400/80" />
                <span>Format</span>
              </button>
              <button
                onClick={() => {
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors whitespace-nowrap disabled:opacity-50"
                title={t.playground.export}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-300/80 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors whitespace-nowrap ml-auto"
                title={t.editor.clearCode}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative min-h-0 bg-[#1e1e1e]">
              {editorError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 p-6 z-10">
                  <span className="text-4xl">⚠️</span>
                  <p className="text-center text-sm text-white/70">
                    {t.editor.editorLoadError}
                    <br />
                    {t.editor.useTextarea}
                  </p>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`${t.editor.placeholder} ${currentLanguage?.label}...`}
                    className="h-full w-full resize-none rounded-lg bg-black/40 p-3 font-mono text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
              ) : (
                <LazyMonacoEditor
                  height="100%"
                  language={currentLanguage?.monacoLanguage || 'python'}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorDidMount}
                  loading={
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
                      <div className="text-center">
                        <div className="mb-3 text-2xl animate-bounce">⏳</div>
                        <p className="text-xs text-gray-500 font-mono">{t.editor.loading}</p>
                      </div>
                    </div>
                  }
                  options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    fontLigatures: true,
                    automaticLayout: true,
                    minimap: { enabled: false }, // Disable minimap for cleaner look
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderWhitespace: 'selection',
                    bracketPairColorization: { enabled: true },
                    padding: { top: 16, bottom: 16 },
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      useShadows: false,
                      verticalScrollbarSize: 10,
                      horizontalScrollbarSize: 10
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Console Window */}
          <div className="h-[500px] lg:h-full">
            <Console messages={consoleOutput} onClear={clearConsole} />
          </div>
        </div>

        {showSnippets && (
          <MagicCard className="border-0 bg-white/5" innerClassName="rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">📂 {t.playground.savedSnippets}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSnippets(false)}>
                ✕ {t.common.close}
              </Button>
            </div>
            <div className="mt-4">
              <SnippetsList onLoadSnippet={handleLoadSnippet} />
            </div>
          </MagicCard>
        )}

        <MagicCard className="border-0 bg-white/5" innerClassName="rounded-[28px] p-6">
          <h2 className="text-lg font-semibold text-white">{t.playground.tips.title}</h2>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            <p>• {t.playground.tips.experiment}</p>
            <p>• {t.playground.tips.test}</p>
            <p>• {t.playground.tips.learn}</p>
            <p>• {t.playground.tips.save}</p>
            <p>• {t.playground.tips.formatting}</p>
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
