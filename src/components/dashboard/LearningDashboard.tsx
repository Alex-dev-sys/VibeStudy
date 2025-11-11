'use client';

import { useMemo } from 'react';
import { Toaster } from 'sonner';
import { buildCurriculum } from '@/lib/curriculum';
import { useProgressStore } from '@/store/progress-store';
import { ProgressOverview } from './ProgressOverview';
import { LanguageSelector } from './LanguageSelector';
import { DayTimeline } from './DayTimeline';
import { DayCard } from './DayCard';
import { AdaptiveRecommendationsPanel } from './AdaptiveRecommendationsPanel';

export default function LearningDashboard() {
  const { activeDay, languageId } = useProgressStore((state) => ({
    activeDay: state.activeDay,
    languageId: state.languageId
  }));

  const curriculum = useMemo(() => buildCurriculum(languageId), [languageId]);
  const currentDay = curriculum.find((day) => day.day === activeDay) ?? curriculum[0];
  const previousDay = curriculum.find((day) => day.day === activeDay - 1);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 overflow-hidden px-0 sm:gap-6 md:gap-8">
      <Toaster richColors position="top-right" />
      <ProgressOverview />
      <LanguageSelector />
      <DayTimeline />
      <DayCard day={currentDay} previousDay={previousDay} languageId={languageId} />
      
      {/* Панель адаптивных рекомендаций */}
      <AdaptiveRecommendationsPanel currentDay={activeDay} languageId={languageId} />
    </div>
  );
}

