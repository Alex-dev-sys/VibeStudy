'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { TaskList } from './TaskList';
import { TheoryBlock } from './TheoryBlock';
import { useTaskGenerator } from '@/hooks/useTaskGenerator';
import type { CurriculumDay } from '@/types';
import { LANGUAGES } from '@/lib/languages';
import { useProgressStore } from '@/store/progress-store';
import { getDayTopic } from '@/lib/curriculum';
import { RecapQuestionCard } from './RecapQuestionCard';

interface DayCardProps {
  day: CurriculumDay;
  previousDay?: CurriculumDay;
  languageId: string;
}

export function DayCard({ day, previousDay, languageId }: DayCardProps) {
  const {
    taskSet,
    loading,
    error,
    regenerate,
    contentSource,
    regenerateTask,
    regeneratingTaskId,
    requestInitialGeneration
  } = useTaskGenerator({ currentDay: day, previousDay, languageId, autoLoad: false });
  const markDayComplete = useProgressStore((state) => state.markDayComplete);
  const language = useMemo(() => LANGUAGES.find((item) => item.id === languageId)!, [languageId]);
  const dayTopic = getDayTopic(day.day);

  const tasks = taskSet?.tasks ?? [];
  const theory = taskSet?.theory ?? day.theory;
  const recapTask = taskSet?.recapTask;
  const generationStatus = useMemo(() => {
    if (loading) {
      return 'Подбираем персональные задания и теорию под выбранную тему...';
    }
    switch (contentSource) {
      case 'ai':
        return 'Контент подготовлен ИИ под текущий день.';
      case 'database':
        return 'Используем ранее сохранённый набор заданий.';
      case 'fallback':
        return 'Показываем стандартный набор заданий.';
      default:
        return 'Нажмите «Сгенерировать теорию», чтобы получить персональный набор под эту тему.';
    }
  }, [contentSource, loading]);
  const isPending = contentSource === 'pending';
  const hasGenerated = !isPending && !!taskSet;
  const generationButtonLabel = loading
    ? 'Генерируем…'
    : isPending
      ? 'Сгенерировать теорию и задания'
      : '↻ Обновить день';
  const generationButtonVariant = isPending ? 'primary' : 'secondary';

  return (
    <motion.section
      key={day.day}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full max-w-full flex-col gap-6 overflow-hidden"
    >
      {/* Заголовок дня */}
      <Card className="relative overflow-hidden border border-white/10 bg-black/40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-transparent" />
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-base sm:text-lg md:text-xl">
                <span className="text-white/60">День {day.day}</span> · {dayTopic.topic}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{dayTopic.description}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={generationButtonVariant}
                size="md"
                onClick={isPending ? requestInitialGeneration : regenerate}
                disabled={loading}
                className="w-full text-xs sm:w-auto sm:text-sm"
              >
                {generationButtonLabel}
              </Button>
              <Badge tone="accent" className="text-xs sm:text-sm">Язык: {language.label}</Badge>
            </div>
          </div>
          {hasGenerated && taskSet?.recap && (
            <p className="mt-3 text-xs text-white/60 sm:text-sm">❓ Контрольный вопрос: {taskSet.recap}</p>
          )}
          <p className="mt-2 text-[10px] text-white/40 sm:text-xs">{generationStatus}</p>
        </CardHeader>
        <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6">
          <Button variant="primary" size="md" onClick={() => markDayComplete(day.day)} className="w-full text-xs sm:w-auto sm:text-sm">
            Завершить день
          </Button>
        </div>
      </Card>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-center text-sm text-white/60 shadow-lg shadow-accent/10">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Генерируем теорию и задания для этого дня...
        </div>
      )}

      {!loading && !hasGenerated && (
        <Card className="border border-dashed border-white/15 bg-gradient-to-br from-white/5 via-black/40 to-black/60">
          <CardHeader className="space-y-3">
            <CardTitle className="text-base sm:text-lg">Готовы начать изучение дня {day.day}?</CardTitle>
            <CardDescription className="text-xs text-white/60 sm:text-sm">
              Нажмите «Сгенерировать теорию», чтобы получить пояснения, контрольный вопрос и практику точно по теме «{dayTopic.topic}».
              Контент подберётся индивидуально и не смешается с другими днями.
            </CardDescription>
            <div className="flex flex-wrap gap-2 text-[11px] text-white/40 sm:text-xs">
              <span className="rounded-full border border-white/15 px-3 py-1">Тема: {dayTopic.topic}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">День {day.day} из 90</span>
            </div>
          </CardHeader>
        </Card>
      )}

      {hasGenerated && (
        <>
          {/* Блок теории */}
          <TheoryBlock theory={theory} dayNumber={day.day} topic={dayTopic.topic} />

          {/* Контрольный вопрос */}
          {taskSet?.recap && <RecapQuestionCard day={day.day} question={taskSet.recap} hasPreviousDay={day.day > 1} />}

          {/* Контрольное задание по предыдущему дню */}
          {recapTask && day.day > 1 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-xl sm:h-10 sm:w-10 sm:text-2xl">🔄</span>
                  <div>
                    <CardTitle className="text-sm sm:text-base">Контрольное задание</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Повторение материала предыдущего дня — не забывай изученное!</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <TaskList
                  day={day.day}
                  tasks={[recapTask]}
                  languageId={language.id}
                  monacoLanguage={language.monacoLanguage}
                  topic={dayTopic.topic}
                  isLoading={loading}
                />
              </div>
            </Card>
          )}

          {/* Список задач */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Задачи дня ({tasks.length})</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Нажми на любую задачу, чтобы открыть редактор и начать решение</CardDescription>
            </CardHeader>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <TaskList
                day={day.day}
                tasks={tasks}
                languageId={language.id}
                monacoLanguage={language.monacoLanguage}
                topic={dayTopic.topic}
                isLoading={loading}
                onRegenerateTask={regenerateTask}
                regeneratingTaskId={regeneratingTaskId}
              />
            </div>
          </Card> 
        </>
      )}
    </motion.section>
  );
}
