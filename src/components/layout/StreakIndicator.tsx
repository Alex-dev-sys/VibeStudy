'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useProgressStore } from '@/store/progress-store';

interface StreakIndicatorProps {
  streak: number;
}

export function StreakIndicator({ streak }: StreakIndicatorProps) {
  // Only subscribe to the history array, not the entire record object
  const history = useProgressStore((state) => state.record.history);

  const isStreakAtRisk = useMemo(() => {
    if (!history || history.length === 0) return false;

    const lastActivity = history[history.length - 1]?.timestamp;
    if (!lastActivity) return false;

    const hoursSinceActivity = (Date.now() - lastActivity) / (1000 * 60 * 60);
    return hoursSinceActivity > 20; // Warn if no activity in 20 hours
  }, [history]);
  
  return (
    <motion.div
      animate={isStreakAtRisk ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        isStreakAtRisk 
          ? 'bg-orange-500/20' 
          : 'bg-white/5'
      )}
      role="status"
      aria-label={`Серия: ${streak} ${streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд${isStreakAtRisk ? ', под угрозой' : ''}`}
    >
      <motion.span
        animate={isStreakAtRisk ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-lg"
        aria-hidden="true"
      >
        🔥
      </motion.span>
      <div className="flex flex-col">
        <div className="text-sm font-medium leading-none text-orange-400">{streak}</div>
        {isStreakAtRisk && (
          <div className="text-[10px] text-orange-400 leading-none mt-0.5">
            Не теряй!
          </div>
        )}
      </div>
    </motion.div>
  );
}
