'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { useTranslations } from '@/store/locale-store';
import { getPathById } from '@/data/paths';
import { Link as LinkIcon } from 'lucide-react';

export function ProgressOverview() {
  const { record, resetProgress, activePathId } = useProgressStore((state) => ({
    record: state.record,
    resetProgress: state.resetProgress,
    activePathId: state.activePathId
  }));
  const unlockedAchievements = useAchievementsStore((state) => state.unlockedAchievements.length);
  const t = useTranslations();

  // Get path-specific total days
  const activePath = activePathId ? getPathById(activePathId) : null;
  const totalDays = activePath?.duration ?? 90;

  const completionRate = (record.completedDays.length / totalDays) * 100;

  const streakMessage = useMemo(() => {
    if (record.streak === 0) return 'Только начинаем — впереди мощный прогресс!';
    if (record.streak < 7) return `Отличный старт! Серия ${record.streak} дня.`;
    if (record.streak < 21) return `Ты на волне: серия ${record.streak} дней удерживается.`;
    return `Сильнейший результат! Серия ${record.streak} дней — почти на финише.`;
  }, [record.streak]);

  const handleResetClick = () => {
    if (typeof window === 'undefined') return;

    const confirmed = window.confirm('Точно сбросить весь прогресс курса? Действие нельзя отменить.');
    if (confirmed) {
      resetProgress();
    }
  };

  return (
    <section className="relative glass-panel-soft flex flex-col gap-4 rounded-3xl p-6 sm:p-8 overflow-hidden group">
      {/* Glow effect background */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-[#ff0094]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#ff0094]/15 transition-colors duration-500" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {activePath ? `${activePath.name}` : t.dashboard.title}
            </h1>
            {activePath && (
              <LinkIcon className="w-5 h-5 text-green-400 rotate-45" />
            )}
          </div>
          <p className="text-sm sm:text-base text-white/60 font-medium max-w-2xl">
            {activePath?.description || t.dashboard.subtitle}
          </p>
        </div>

        {/* Progress Bar Section */}
        <div className="space-y-3">
          <div className="flex items-end justify-between text-sm font-medium">
            <span className="text-white/90">
              {t.dashboard.completed}: <span className="text-white">{record.completedDays.length} / {totalDays}</span>
            </span>
            <span className="text-white font-bold text-lg">{completionRate.toFixed(0)}%</span>
          </div>

          <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff5b7f] to-[#ff8c42] shadow-[0_0_20px_rgba(255,91,127,0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Stats & Footer */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
          <div className="flex flex-col gap-4">
            {/* Stats Piss */}
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <div className="flex items-center gap-1.5 text-orange-400">
                <span>🔥</span>
                <span>{t.dashboard.streak}: {record.streak} {t.dashboard.days}</span>
              </div>
              <div className="flex items-center gap-1.5 text-yellow-400">
                <span>🏆</span>
                <span>{t.dashboard.achievements}: {unlockedAchievements}</span>
              </div>
            </div>

            <p className="text-sm text-white/50 font-medium">
              {streakMessage}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetClick}
            className="self-end sm:self-auto border-white/10 bg-transparent text-white/40 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all uppercase text-xs tracking-wider"
          >
            {t.common.reset}
          </Button>
        </div>
      </div>
    </section>
  );
}
