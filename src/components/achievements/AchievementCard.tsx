'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import type { Achievement } from '@/types/achievements';
import { getAchievementProgress, ACHIEVEMENTS } from '@/lib/achievements';
import { useAchievementsStore } from '@/store/achievements-store';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

export function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
  const stats = useAchievementsStore((state) => state.stats);
  const achievementDef = ACHIEVEMENTS.find((a) => a.id === achievement.id);
  const progress = achievementDef ? getAchievementProgress(achievementDef, stats) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: isUnlocked ? 1.05 : 1.02 }}
      className="h-full"
    >
      <Card
        className={`relative h-full overflow-hidden border transition-all ${
          isUnlocked
            ? 'border-accent/60 bg-accent/10 shadow-glow'
            : 'border-white/10 bg-black/40 opacity-60'
        }`}
      >
        {/* Badge Icon */}
        <div className="flex items-center justify-center p-6">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full text-5xl transition-all ${
              isUnlocked ? 'bg-accent/20' : 'bg-white/5 grayscale'
            }`}
          >
            {achievement.icon}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h3
            className={`text-lg font-semibold ${
              isUnlocked ? 'text-white' : 'text-white/50'
            }`}
          >
            {achievement.title}
          </h3>
          <p
            className={`mt-2 text-sm ${
              isUnlocked ? 'text-white/70' : 'text-white/40'
            }`}
          >
            {achievement.description}
          </p>

          {/* Progress Bar */}
          {!isUnlocked && progress > 0 && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                <span>Прогресс</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Unlocked Date */}
          {isUnlocked && achievement.unlockedAt && (
            <p className="mt-3 text-xs text-accent">
              Получено{' '}
              {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Unlocked Badge */}
        {isUnlocked && (
          <div className="absolute right-3 top-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm">
              ✓
            </div>
          </div>
        )}

        {/* Locked Overlay */}
        {!isUnlocked && (
          <div className="absolute right-3 top-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm">
              🔒
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

