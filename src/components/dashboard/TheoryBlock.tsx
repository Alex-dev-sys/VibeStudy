'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface TheoryBlockProps {
  theory: string;
  dayNumber: number;
  topic: string;
}

export function TheoryBlock({ theory, dayNumber, topic }: TheoryBlockProps) {
  return (
    <Card className="border-accent/20">
      <CardHeader>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xl sm:h-10 sm:w-10 sm:text-2xl">📚</span>
          <div>
            <CardTitle className="text-sm sm:text-base">Теория дня {dayNumber}</CardTitle>
            <p className="text-xs text-white/60 sm:text-sm">{topic}</p>
          </div>
        </div>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4 sm:space-y-4 sm:px-6 sm:pb-6">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4 sm:rounded-2xl sm:p-6">
          <div className="prose prose-invert max-w-none">
            <div className="break-words text-xs leading-relaxed text-white/90 sm:text-sm" style={{ fontFamily: 'system-ui, sans-serif', wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
              {theory.split('\n').map((line, index) => {
                // Подсветка заголовков
                if (line.trim().endsWith(':') && line.trim().length < 50 && !line.includes('=')) {
                  return (
                    <p key={index} className="mt-3 mb-1.5 break-words text-xs font-semibold text-accent sm:mt-4 sm:mb-2 sm:text-sm">
                      {line}
                    </p>
                  );
                }
                // Подсветка кода
                if (line.trim().startsWith('#') || (line.includes('=') && line.trim().length < 100) || (line.includes('(') && line.includes(')'))) {
                  return (
                    <pre key={index} className="my-1 break-all rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300 sm:px-2 sm:py-1 sm:text-xs">
                      <code className="break-all whitespace-pre-wrap">{line}</code>
                    </pre>
                  );
                }
                // Обычный текст
                return line.trim() ? (
                  <p key={index} className="my-1.5 break-words sm:my-2">
                    {line}
                  </p>
                ) : (
                  <br key={index} />
                );
              })}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-2.5 sm:rounded-2xl sm:p-3">
          <p className="text-[10px] text-white/70 sm:text-xs">
            💡 <strong>Совет:</strong> Внимательно изучи теорию перед выполнением заданий. Все задачи можно решить, используя
            только материал из этой теории.
          </p>
        </div>
      </div>
    </Card>
  );
}

