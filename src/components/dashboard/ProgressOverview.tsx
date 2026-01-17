'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { RotateCcw, Flame, Trophy, Target } from 'lucide-react';
import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { getPathById } from '@/data/paths';

// Circular Progress Component
function CircularProgress({ percentage, size = 120, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff0094" />
            <stop offset="100%" stopColor="#ffd200" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.span>
        <span className="text-xs text-white/50 uppercase tracking-wider">Complete</span>
      </div>
    </div>
  );
}

export function ProgressOverview() {
  const { record, resetProgress, activePathId } = useProgressStore((state) => ({
    record: state.record,
    resetProgress: state.resetProgress,
    activePathId: state.activePathId
  }));
  const unlockedAchievements = useAchievementsStore((state) => state.unlockedAchievements.length);

  const activePath = activePathId ? getPathById(activePathId) : null;
  const totalDays = activePath?.duration ?? 45;
  const completionRate = (record.completedDays.length / totalDays) * 100;

  const motivationalMessage = useMemo(() => {
    if (completionRate === 0) return "Начни свой путь к успеху!";
    if (completionRate < 25) return "Отличное начало! Продолжай!";
    if (completionRate < 50) return "Ты на правильном пути!";
    if (completionRate < 75) return "Больше половины пути пройдено!";
    if (completionRate < 100) return "Финишная прямая! Ты почти у цели!";
    return "🎉 Поздравляем! Курс завершён!";
  }, [completionRate]);

  const handleResetClick = () => {
    if (typeof window === 'undefined') return;
    const confirmed = window.confirm('Точно сбросить весь прогресс курса? Действие нельзя отменить.');
    if (confirmed) resetProgress();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1625]/90 to-[#0d0a14]/90 backdrop-blur-xl border border-white/10 p-6 sm:p-8"
    >
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ff0094]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#ffd200]/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        {/* Circular Progress */}
        <CircularProgress percentage={completionRate} size={140} strokeWidth={10} />

        {/* Stats */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {activePath?.name || 'Твой прогресс'}
          </h2>
          <p className="text-white/60 mb-4">{motivationalMessage}</p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Target className="w-4 h-4 text-[#ff0094]" />
              <span className="text-sm text-white/80">
                <span className="font-bold text-white">{record.completedDays.length}</span> / {totalDays}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-white/80">
                <span className="font-bold text-white">{record.streak}</span> 🔥
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white/80">
                <span className="font-bold text-white">{unlockedAchievements}</span> 🏆
              </span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleResetClick}
          className="absolute top-4 right-4 p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          aria-label="Сбросить прогресс"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </motion.section>
  );
}
