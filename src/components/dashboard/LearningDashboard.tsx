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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 overflow-hidden px-4 sm:gap-8 sm:px-6 md:gap-10 lg:gap-12 lg:px-8">
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

