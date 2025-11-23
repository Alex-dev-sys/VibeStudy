'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import type { Achievement } from '@/types/achievements';
import { getAchievementProgress, ACHIEVEMENTS } from '@/lib/achievements';
import { useAchievementsStore } from '@/store/achievements-store';
import { cn } from '@/lib/utils';

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
      whileHover={{ scale: isUnlocked ? 1.02 : 1.01 }}
      className="h-full"
    >
      <div
        className={cn(
          "relative flex h-full flex-col items-center justify-between overflow-hidden rounded-xl border p-4 text-center transition-all",
          isUnlocked
            ? "border-yellow-500/30 bg-yellow-500/5 shadow-lg shadow-yellow-500/5"
            : "border-white/5 bg-[#1e1e1e] opacity-70 hover:opacity-100"
        )}
      >
        {/* Badge Icon */}
        <div className="mb-3 flex items-center justify-center">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all shadow-inner",
              isUnlocked ? "bg-yellow-500/20 shadow-yellow-500/20" : "bg-white/5 grayscale"
            )}
          >
            {achievement.icon}
          </div>
        </div>

        {/* Content */}
        <div className="w-full space-y-1">
          <h3
            className={cn(
              "text-sm font-bold leading-tight",
              isUnlocked ? "text-white" : "text-white/60"
            )}
          >
            {achievement.title}
          </h3>
          <p className="text-[10px] leading-relaxed text-white/40 line-clamp-2">
            {achievement.description}
          </p>

          {/* Progress Bar */}
          {!isUnlocked && progress > 0 && (
            <div className="mt-2 w-full">
              <div className="mb-1 flex items-center justify-between text-[9px] text-white/30">
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full bg-yellow-500/50"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Unlocked Date */}
          {isUnlocked && achievement.unlockedAt && (
            <p className="mt-2 text-[9px] font-medium text-yellow-500/70">
              {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
              })}
            </p>
          )}
        </div>

        {/* Unlocked Badge */}
        {isUnlocked && (
          <div className="absolute right-2 top-2">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
