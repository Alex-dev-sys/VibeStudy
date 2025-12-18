'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskList } from './TaskList';
import { TheoryBlock } from './TheoryBlock';
import { useTaskGenerator } from '@/hooks/useTaskGenerator';
import type { CurriculumDay } from '@/types';
import { LANGUAGES } from '@/lib/content/languages';
import { useProgressStore } from '@/store/progress-store';
import { getDayTopic } from '@/lib/content/curriculum';
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
  const completedDays = useProgressStore((state) => state.record.completedDays);
  const completedTasks = useProgressStore((state) => state.dayStates[day.day]?.completedTasks ?? []);
  const language = useMemo(() => LANGUAGES.find((item) => item.id === languageId)!, [languageId]);
  const dayTopic = getDayTopic(day.day, languageId);
  const isDayCompleted = completedDays.includes(day.day);

  const tasks = useMemo(() => taskSet?.tasks ?? [], [taskSet]);
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
  const requiredTaskIds = useMemo(() => {
    const ids = tasks.map((task) => task.id);
    if (recapTask && day.day > 1) {
      ids.push(recapTask.id);
    }
    return ids;
  }, [tasks, recapTask, day.day]);
  const allTasksCompleted = requiredTaskIds.length > 0 && requiredTaskIds.every((id) => completedTasks.includes(id));
  const finishDisabled = loading || !hasGenerated || !allTasksCompleted;
  const generationButtonLabel = loading
    ? 'Генерируем…'
    : isPending
      ? 'Сгенерировать теорию и задания'
      : '↻ Обновить день';
  const generationButtonVariant = isPending ? 'primary' : 'secondary';
  const finishButtonTitle = isPending
    ? 'Сначала сгенерируйте теорию и задания'
    : !hasGenerated
      ? 'Сначала получите контент для этого дня'
      : !allTasksCompleted
        ? 'Выполните все задания и контрольный вопрос, чтобы завершить день'
        : undefined;

  return (
    <motion.section
      key={day.day}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full max-w-full flex-col gap-6 overflow-hidden"
    >
      {/* Заголовок дня */}
      <Card className="relative overflow-hidden glow-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,0,148,0.18),transparent_62%)]" />
        <CardHeader className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-base text-white/95 sm:text-lg md:text-xl">
                <span className="text-white/70">День {day.day}</span> · {dayTopic.topic}
                {isDayCompleted && (
                  <Badge tone="accent" className="ml-2 text-xs">✓ Завершен</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs text-white/70 sm:text-sm">
                {isDayCompleted ? 'Режим просмотра — день уже завершен' : dayTopic.description}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!isDayCompleted && (
                <Button
                  variant={generationButtonVariant}
                  size="md"
                  onClick={isPending ? requestInitialGeneration : regenerate}
                  disabled={loading}
                  className="w-full text-sm sm:w-auto touch-target"
                >
                  {generationButtonLabel}
                </Button>
              )}
              <Badge tone="accent" className="text-xs text-white sm:text-sm">Язык: {language.label}</Badge>
            </div>
          </div>
          {hasGenerated && taskSet?.recap && !isDayCompleted && (
            <p className="mt-3 text-xs text-white/70 sm:text-sm">❓ Контрольный вопрос: {taskSet.recap}</p>
          )}
          {!isDayCompleted && (
            <p className="mt-2 text-[10px] text-white/55 sm:text-xs">{generationStatus}</p>
          )}
        </CardHeader>
        {!isDayCompleted && (
          <div className="flex flex-col gap-3 px-4 pb-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Button
              variant="primary"
              size="lg"
              onClick={() => markDayComplete(day.day)}
              disabled={finishDisabled}
              title={finishButtonTitle}
              className="w-full sm:w-auto touch-target disabled:cursor-not-allowed disabled:opacity-70"
            >
              Завершить день
            </Button>
          </div>
        )}
      </Card>

      {error && (
        <div className="rounded-2xl border border-rose-400/35 bg-rose-400/15 p-4 text-sm text-white/90 shadow-[0_20px_45px_rgba(12,6,28,0.35)]">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-3xl border border-white/12 bg-[rgba(255,255,255,0.2)] p-6 text-center text-sm text-white/70 shadow-[0_28px_70px_rgba(12,6,28,0.45)]">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#ff0094] border-t-transparent" />
          Генерируем теорию и задания для этого дня...
        </div>
      )}

      {!loading && !hasGenerated && (
        <Card className="relative border border-dashed border-white/15 bg-[rgba(255,255,255,0.18)] glow-border">
          <CardHeader className="space-y-3">
            <CardTitle className="text-base text-white/90 sm:text-lg">Готовы начать изучение дня {day.day}?</CardTitle>
            <CardDescription className="text-xs text-white/70 sm:text-sm">
              Нажмите «Сгенерировать теорию», чтобы получить пояснения, контрольный вопрос и практику точно по теме «{dayTopic.topic}».
              Контент подберётся индивидуально и не смешается с другими днями.
            </CardDescription>
            <div className="flex flex-wrap gap-2 text-[11px] text-white/60 sm:text-xs">
              <span className="rounded-full border border-white/15 px-3 py-1">Тема: {dayTopic.topic}</span>
              <span className="rounded-full border border-white/12 px-3 py-1">День {day.day} из 90</span>
            </div>
          </CardHeader>
        </Card>
      )}

      {hasGenerated && (
        <>
          {/* Контрольный вопрос - размещаем ПЕРЕД теорией для лучшей видимости */}
          {taskSet?.recap && <RecapQuestionCard day={day.day} question={taskSet.recap} hasPreviousDay={day.day > 1} />}

          {/* Блок теории */}
          <TheoryBlock theory={theory} dayNumber={day.day} topic={dayTopic.topic} languageId={languageId} />

          {/* Визуальный разделитель между теорией и практикой */}
          <div className="relative flex items-center justify-center py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-white/20 to-transparent" style={{ borderImage: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent) 1' }} />
            </div>
            <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-medium text-white/70">Практика</span>
              <span className="text-lg">💪</span>
            </div>
          </div>

          {/* Контрольное задание по предыдущему дню */}
          {recapTask && day.day > 1 && (
            <Card className="border border-amber-300/40 bg-amber-200/12 glow-border">
              <CardHeader>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300/30 text-xl sm:h-10 sm:w-10 sm:text-2xl">🔄</span>
                  <div>
                    <CardTitle className="text-sm text-white/90 sm:text-base">Контрольное задание</CardTitle>
                    <CardDescription className="text-xs text-white/75 sm:text-sm">Повторение материала предыдущего дня — не забывай изученное!</CardDescription>
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
                  isViewMode={isDayCompleted}
                />
              </div>
            </Card>
          )}

          {/* Список задач */}
          <Card className="bg-[rgba(255,255,255,0.18)] glow-border">
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
                  isViewMode={isDayCompleted}
                />
              {!allTasksCompleted && !isDayCompleted && (
                <p className="mt-3 text-[11px] text-white/40 sm:text-xs">
                  Выполните все задания (включая контрольный вопрос), чтобы закрыть этот день.
                </p>
              )}
            </div>
          </Card> 
        </>
      )}
    </motion.section>
  );
}
