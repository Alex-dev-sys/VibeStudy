'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/store/progress-store';
import { cn } from '@/lib/utils';

export function StreakIndicator() {
  const streak = useProgressStore(state => state.record.streak);
  const completedDays = useProgressStore(state => state.record.completedDays);
  
  // Check if streak is at risk (no activity in last 20 hours)
  const isStreakAtRisk = useMemo(() => {
    if (completedDays.length === 0) return false;
    
    // Get the last completed day
    const lastCompletedDay = Math.max(...completedDays);
    const today = new Date().getDate();
    
    // If last completed day was not today or yesterday, streak is at risk
    // This is a simplified check - in production you'd want to check actual timestamps
    return lastCompletedDay < today - 1;
  }, [completedDays]);
  
  return (
    <motion.div
      animate={isStreakAtRisk ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
        isStreakAtRisk 
          ? 'bg-orange-500/20 border border-orange-500/50' 
          : 'bg-white/5 border border-white/10'
      )}
    >
      <motion.span
        animate={isStreakAtRisk ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-2xl"
      >
        🔥
      </motion.span>
      <div>
        <div className="text-lg font-bold text-white">{streak}</div>
        <div className="text-xs text-white/60">
          {isStreakAtRisk ? 'Не теряй серию!' : 'Дней подряд'}
        </div>
      </div>
    </motion.div>
  );
}
