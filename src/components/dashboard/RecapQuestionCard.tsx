'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useProgressStore } from '@/store/progress-store';

interface RecapQuestionCardProps {
  day: number;
  question: string;
  hasPreviousDay: boolean;
}

const MAX_LENGTH = 600;

export function RecapQuestionCard({ day, question, hasPreviousDay }: RecapQuestionCardProps) {
  const { answer, updateAnswer } = useProgressStore((state) => ({
    answer: state.dayStates[day]?.recapAnswer ?? '',
    updateAnswer: state.updateRecapAnswer
  }));

  const remaining = useMemo(() => Math.max(0, MAX_LENGTH - answer.length), [answer]);
  const badgeLabel = hasPreviousDay ? 'По предыдущему дню' : 'Разогрев';

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base sm:text-lg">Контрольный вопрос</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Ответ сохраняется локально в прогрессе дня. Используй заметки, чтобы вернуться к нему позже.
          </CardDescription>
        </div>
        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-wide text-amber-200 sm:text-xs">
          {badgeLabel}
        </span>
      </CardHeader>
      <div className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
        <p className="text-xs text-white/80 sm:text-sm">{question}</p>
        <div className="space-y-2">
          <textarea
            value={answer}
            onChange={(event) => updateAnswer(day, event.target.value.slice(0, MAX_LENGTH))}
            placeholder="Запиши короткий вывод или пример, который отвечает на вопрос."
            rows={4}
            className="w-full resize-none rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-amber-400/60 focus:outline-none"
          />
          <div className="flex items-center justify-between text-[11px] text-white/50 sm:text-xs">
            <span>Ответ останется только у тебя.</span>
            <span>{remaining} символов</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

