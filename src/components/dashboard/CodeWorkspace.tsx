'use client';

import Editor from '@monaco-editor/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CodeWorkspaceProps {
  languageId: string;
  monacoLanguage: string;
  value: string;
  onChange: (value: string) => void;
}

interface PistonLanguage {
  runtime: string;
  version?: string;
}

const pistonMap: Record<string, PistonLanguage> = {
  python: { runtime: 'python', version: '3.10.0' },
  javascript: { runtime: 'javascript', version: '18.15.0' },
  typescript: { runtime: 'typescript', version: '5.0.0' },
  java: { runtime: 'java', version: '15.0.2' },
  cpp: { runtime: 'cpp', version: '10.2.0' },
  go: { runtime: 'go', version: '1.20.2' },
  csharp: { runtime: 'csharp', version: '6.12.0' }
};

export function CodeWorkspace({ languageId, monacoLanguage, value, onChange }: CodeWorkspaceProps) {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const isExecutable = useMemo(() => Boolean(pistonMap[languageId]), [languageId]);

  const handleRun = useCallback(async () => {
    if (!isExecutable) {
      setOutput('Для выбранного языка пока нет поддержки удалённого запуска.');
      return;
    }

    const runtime = pistonMap[languageId];
    setIsRunning(true);
    setOutput('Запуск...');
    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: runtime.runtime,
          version: runtime.version,
          files: [{ name: `main.${monacoLanguage}`, content: value }]
        })
      });

      if (!response.ok) {
        throw new Error('Сервис исполнения кода временно недоступен.');
      }

      const data = await response.json();
      const result = data?.run?.output ?? 'Код выполнен.';
      setOutput(result);
    } catch (error) {
      setOutput(error instanceof Error ? error.message : 'Неизвестная ошибка.');
    } finally {
      setIsRunning(false);
    }
  }, [isExecutable, languageId, monacoLanguage, value]);

  return (
    <section className="glass-panel flex flex-col gap-4 rounded-3xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white/70">Интерактивный редактор</p>
          <p className="text-xs text-white/50">Подсветка и автодополнение для языка {languageId}</p>
        </div>
        <div className="flex items-center gap-2">
          {isExecutable ? <Badge tone="accent">Запуск поддерживается</Badge> : <Badge tone="soft">Только редактирование</Badge>}
          <Button size="sm" variant="primary" onClick={handleRun} disabled={isRunning}>
            {isRunning ? 'Выполняем...' : 'Запустить код'}
          </Button>
        </div>
      </div>
      <div className="min-h-[280px] overflow-hidden rounded-2xl border border-white/10">
        <Editor
          height="320px"
          language={monacoLanguage}
          theme="vs-dark"
          value={value}
          onChange={(val) => onChange(val ?? '')}
          options={{
            fontSize: 14,
            fontLigatures: true,
            automaticLayout: true,
            minimap: { enabled: false }
          }}
        />
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
        <p className="mb-2 text-xs font-semibold text-white/60 uppercase tracking-wide">Результат</p>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-sm text-emerald-200">{output}</pre>
      </div>
    </section>
  );
}

