'use client';

import { Toaster } from 'sonner';
import { useProgressStore } from '@/store/progress-store';
import { ProgressOverview } from './ProgressOverview';
import { DayCardsGrid } from './DayCardsGrid';
import { CurriculumSection } from './CurriculumSection';
import { getPathById } from '@/data/paths';

export default function LearningDashboard() {
  const { activePathId } = useProgressStore((state) => ({
    activePathId: state.activePathId
  }));

  // Get path info for duration
  const activePath = activePathId ? getPathById(activePathId) : null;
  const maxDays = activePath?.duration ?? 45;

  // Show only first 8 days in the grid (2 rows x 4 columns)
  const visibleDays = Math.min(maxDays, 8);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
      <Toaster richColors position="top-right" />

      {/* Progress Section */}
      <ProgressOverview />

      {/* Day Cards Grid */}
      <DayCardsGrid maxDays={visibleDays} />

      {/* Curriculum Section */}
      <CurriculumSection />
    </div>
  );
}
