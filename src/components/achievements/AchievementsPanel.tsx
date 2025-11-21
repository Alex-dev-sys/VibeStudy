'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AchievementCard } from './AchievementCard';
import { EmptyAchievements } from '@/components/profile/EmptyAchievements';
import { useAchievementsStore } from '@/store/achievements-store';
import { ACHIEVEMENTS } from '@/lib/achievements';
import type { AchievementCategory } from '@/types/achievements';

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
      {/* Header */}
      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">🏆 Достижения</CardTitle>
              <CardDescription className="mt-2">
                Открыто {stats.unlocked} из {stats.total} ({stats.percentage}%)
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-4xl">{stats.percentage === 100 ? '👑' : '🎯'}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent-soft"
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          Все ({ACHIEVEMENTS.length})
        </Button>
        {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
          const count = ACHIEVEMENTS.filter((a) => a.category === category).length;
          return (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(category as AchievementCategory)}
            >
              {label} ({count})
            </Button>
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
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.includes(achievement.id);
            const unlockedData = unlockedAchievements.find((a) => a.id === achievement.id);

            return (
              <AchievementCard
                key={achievement.id}
                achievement={unlockedData || achievement}
                isUnlocked={isUnlocked}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

