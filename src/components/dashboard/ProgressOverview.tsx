'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useProgressStore } from '@/store/progress-store';
import { useTranslations } from '@/store/locale-store';
import { getPathById } from '@/data/paths';

export function ProgressOverview() {
  const { record, resetProgress, activePathId } = useProgressStore((state) => ({
    record: state.record,
    resetProgress: state.resetProgress,
    activePathId: state.activePathId
  }));
  const t = useTranslations();

  // Get path-specific total days
  const activePath = activePathId ? getPathById(activePathId) : null;
  const totalDays = activePath?.duration ?? 45;

  const completionRate = (record.completedDays.length / totalDays) * 100;

  const handleResetClick = () => {
    if (typeof window === 'undefined') return;
    const confirmed = window.confirm('Точно сбросить весь прогресс курса? Действие нельзя отменить.');
    if (confirmed) {
      resetProgress();
    }
  };

  return (
    <section className="relative bg-[#1a1625] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Current Milestone</p>
          <h2 className="text-lg font-bold text-white">
            {record.completedDays.length} of {totalDays} days completed
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetClick}
          className="text-xs text-white/40 hover:text-white uppercase tracking-wider"
        >
          Reset Progress
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[#ff0094]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(completionRate, 2)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </section>
  );
}
