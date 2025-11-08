'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { useTranslations } from '@/store/locale-store';

const TOTAL_DAYS = 90;

export function ProgressOverview() {
  const { record, resetProgress } = useProgressStore((state) => ({ record: state.record, resetProgress: state.resetProgress }));
  const unlockedAchievements = useAchievementsStore((state) => state.unlockedAchievements.length);
  const t = useTranslations();
  const completionRate = (record.completedDays.length / TOTAL_DAYS) * 100;

  const streakMessage = useMemo(() => {
    if (record.streak === 0) return 'Только начинаем — впереди мощный прогресс!';
    if (record.streak < 7) return `Отличный старт! Серия ${record.streak} дня.`;
    if (record.streak < 21) return `Ты на волне: серия ${record.streak} дней удерживается.`;
    return `Сильнейший результат! Серия ${record.streak} дней — почти на финише.`;
  }, [record.streak]);

  return (
    <section className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:gap-4 sm:rounded-3xl sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-white sm:text-xl md:text-2xl">{t.dashboard.title}</h1>
          <p className="mt-1 text-xs text-white/60 sm:text-sm">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LocaleSwitcher />
          <Link href="/profile">
            <Button variant="secondary" size="sm" className="text-xs sm:text-sm">
              👤 {t.dashboard.profile}
            </Button>
          </Link>
          <Link href="/playground">
            <Button variant="secondary" size="sm" className="text-xs sm:text-sm">
              🎨 {t.dashboard.playground}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={resetProgress} className="text-xs sm:text-sm">
            {t.common.reset}
          </Button>
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-white/60 sm:text-sm">
          <span>{t.dashboard.completed}: {record.completedDays.length} / {TOTAL_DAYS}</span>
          <span>{completionRate.toFixed(0)}%</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10 sm:h-4">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-accent shadow-glow"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 text-xs text-white/70 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span>🔥 {t.dashboard.streak}: {record.streak} {t.dashboard.days}</span>
          <span>🏆 {t.dashboard.achievements}: {unlockedAchievements}</span>
        </div>
        <span className="text-white/50 sm:text-white/70">{streakMessage}</span>
      </div>
    </section>
  );
}

