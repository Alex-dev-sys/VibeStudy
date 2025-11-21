'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTaskGenerator } from '@/hooks/useTaskGenerator';
import { useProgressStore } from '@/store/progress-store';
import { getDayTopic } from '@/lib/curriculum';
import { LANGUAGES } from '@/lib/languages';
import type { CurriculumDay } from '@/types';
import { EmptyState } from './EmptyState';
import { ContentState } from './ContentState';
import { LoadingState } from './LoadingState';

interface SimplifiedDayCardProps {
  day: CurriculumDay;
  previousDay?: CurriculumDay;
  languageId: string;
}

export function SimplifiedDayCard({ day, previousDay, languageId }: SimplifiedDayCardProps) {
  const {
    taskSet,
    loading,
    contentSource,
    requestInitialGeneration,
    regenerateTask,
    regeneratingTaskId
  } = useTaskGenerator({ 
    currentDay: day, 
    previousDay, 
    languageId, 
    autoLoad: true 
  });

  const language = useMemo(
    () => LANGUAGES.find((item) => item.id === languageId)!,
    [languageId]
  );

  const isPending = contentSource === 'pending';
  const hasContent = !isPending && !!taskSet;

  // Simplified state machine - only 3 states
  if (loading) {
    return <LoadingState />;
  }

  if (isPending) {
    return (
      <EmptyState 
        day={day.day} 
        onStart={requestInitialGeneration}
      />
    );
  }

  return (
    <ContentState
      day={day}
      taskSet={taskSet!}
      language={language}
      onRegenerateTask={regenerateTask}
      regeneratingTaskId={regeneratingTaskId}
    />
  );
}
