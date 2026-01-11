'use client';

import { useMemo } from 'react';
import { Toaster } from 'sonner';
import { buildCurriculum } from '@/lib/content/curriculum';
import { useProgressStore } from '@/store/progress-store';
import { ProgressOverview } from './ProgressOverview';
import { LanguageSelector } from './LanguageSelector';
import { PathSelector } from './PathSelector';
import { DayTimeline } from './DayTimeline';
import { SimplifiedDayCard } from './SimplifiedDayCard';
import { getPathById } from '@/data/paths';

export default function LearningDashboard() {
  const { activeDay, languageId, activePathId } = useProgressStore((state) => ({
    activeDay: state.activeDay,
    languageId: state.languageId,
    activePathId: state.activePathId
  }));

  // Get path info for duration
  const activePath = activePathId ? getPathById(activePathId) : null;
  const maxDays = activePath?.duration ?? 90;

  const curriculum = useMemo(() => buildCurriculum(languageId, activePathId || undefined), [languageId, activePathId]);
  const currentDay = curriculum.find((day) => day.day === activeDay) ?? curriculum[0];
  const previousDay = curriculum.find((day) => day.day === activeDay - 1);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 overflow-hidden px-4 sm:gap-8 sm:px-6 md:gap-10 lg:gap-12 lg:px-8">
      <Toaster richColors position="top-right" />
      <ProgressOverview />
      <LanguageSelector />
      <PathSelector />
      <DayTimeline maxDays={maxDays} />
      <SimplifiedDayCard day={currentDay} previousDay={previousDay} languageId={languageId} />
    </div>
  );
}
