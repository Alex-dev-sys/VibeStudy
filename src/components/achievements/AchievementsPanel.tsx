'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AchievementCard } from './AchievementCard';
import { EmptyAchievements } from '@/components/profile/EmptyAchievements';
import { useAchievementsStore } from '@/store/achievements-store';
import { ACHIEVEMENTS } from '@/lib/achievements';
import type { AchievementCategory } from '@/types/achievements';
import { Trophy, Star, Target, Crown, Grid, Flame, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<AchievementCategory | 'all', any> = {
  all: Grid,
  progress: Target,
  streak: Flame,
  tasks: CheckCircle2,
  special: Star
};

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  progress: 'Прогресс',
  streak: 'Серии',
  tasks: 'Задачи',
  special: 'Особые'
};

export function AchievementsPanel() {
  const router = useRouter();
  const { unlockedAchievements } = useAchievementsStore();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  const unlockedIds = useMemo(
    () => unlockedAchievements.map((a) => a.id),
    [unlockedAchievements]
  );

  const stats = useMemo(() => {
    const total = ACHIEVEMENTS.length;
    const unlocked = unlockedAchievements.length;
    return {
      total,
      unlocked,
      percentage: Math.round((unlocked / total) * 100)
    };
  }, [unlockedAchievements]);

  // Show empty state if no achievements unlocked
  if (unlockedAchievements.length === 0) {
    return <EmptyAchievements onStartLearning={() => router.push('/learn')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="relative overflow-hidden rounded-xl bg-[#1e1e1e] p-6 shadow-lg ring-1 ring-white/5">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-5">
          <Trophy className="h-32 w-32 text-yellow-400" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-yellow-400/10 p-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Достижения</h2>
              </div>
              <p className="mt-1 text-sm text-white/60">
                Открыто {stats.unlocked} из {stats.total} наград
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 ring-1 ring-white/5">
              <Crown className={cn("h-5 w-5", stats.percentage === 100 ? "text-yellow-400" : "text-white/40")} />
              <span className="font-mono font-bold text-white">{stats.percentage}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            selectedCategory === 'all'
              ? "bg-white text-black shadow-lg scale-105"
              : "bg-[#1e1e1e] text-white/60 hover:bg-white/10 hover:text-white ring-1 ring-white/5"
          )}
        >
          <Grid className="h-3.5 w-3.5" />
          Все ({ACHIEVEMENTS.length})
        </button>

        {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
          const count = ACHIEVEMENTS.filter((a) => a.category === category).length;
          const Icon = CATEGORY_ICONS[category as AchievementCategory] || Star;
          const isActive = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as AchievementCategory)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-white text-black shadow-lg scale-105"
                  : "bg-[#1e1e1e] text-white/60 hover:bg-white/10 hover:text-white ring-1 ring-white/5"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
        >
          {filteredAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.includes(achievement.id);
            const unlockedData = unlockedAchievements.find((a) => a.id === achievement.id);
            const displayAchievement = unlockedData || achievement;

            return (
              <div key={achievement.id} className="group relative flex justify-center">
                {/* Avatar / Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 transition-all shadow-lg",
                    isUnlocked
                      ? "border-yellow-500/50 bg-yellow-500/10 shadow-yellow-500/20"
                      : "border-white/10 bg-white/5 grayscale"
                  )}
                >
                  <span className="text-2xl select-none">{displayAchievement.icon}</span>

                  {/* Unlocked Indicator */}
                  {isUnlocked && (
                    <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-yellow-500 ring-2 ring-[#1e1e1e] flex items-center justify-center">
                      <CheckCircle2 className="h-2.5 w-2.5 text-black" />
                    </div>
                  )}
                </motion.div>

                {/* Hover Card */}
                <div className="absolute bottom-full left-1/2 mb-3 hidden w-64 -translate-x-1/2 group-hover:block z-50">
                  <div className="relative rounded-xl bg-[#1e1e1e] shadow-2xl ring-1 ring-white/10">
                    <AchievementCard
                      achievement={displayAchievement}
                      isUnlocked={isUnlocked}
                    />
                    {/* Arrow */}
                    <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#1e1e1e] ring-1 ring-white/10 border-b border-r border-white/10" />
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
