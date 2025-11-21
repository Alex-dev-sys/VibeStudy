'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { useProgressStore } from '@/store/progress-store';

const LEVEL_NAMES = [
  'Новичок',      // 0-10 days
  'Ученик',       // 11-20 days
  'Практик',      // 21-30 days
  'Специалист',   // 31-40 days
  'Эксперт',      // 41-50 days
  'Мастер',       // 51-60 days
  'Профи',        // 61-70 days
  'Гуру',         // 71-80 days
  'Легенда'       // 81-90 days
];

export function LevelProgressBar() {
  const completedDays = useProgressStore(state => state.record.completedDays.length);
  
  // Calculate level (0-8 based on completed days)
  const level = Math.min(Math.floor(completedDays / 10), LEVEL_NAMES.length - 1);
  const currentLevel = LEVEL_NAMES[level];
  const nextLevel = LEVEL_NAMES[Math.min(level + 1, LEVEL_NAMES.length - 1)];
  
  // Progress within current level (0-10)
  const progressInLevel = completedDays % 10;
  const progressPercentage = (progressInLevel / 10) * 100;
  
  // Calculate XP (50 XP per day)
  const totalXP = completedDays * 50;
  const xpInLevel = progressInLevel * 50;
  const xpToNextLevel = 500; // 10 days * 50 XP
  
  return (
    <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-white/60 mb-1">Твой уровень</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {currentLevel}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60 mb-1">Следующий</div>
          <div className="text-lg font-semibold text-white/80">{nextLevel}</div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative mb-3">
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>
      
      {/* XP and progress text */}
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{xpInLevel} / {xpToNextLevel} XP</span>
        <span>{progressInLevel} / 10 дней до следующего уровня</span>
      </div>
      
      {/* Total XP badge */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2">
        <span className="text-2xl">⚡</span>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{totalXP}</div>
          <div className="text-xs text-white/60">Всего XP</div>
        </div>
      </div>
    </Card>
  );
}
