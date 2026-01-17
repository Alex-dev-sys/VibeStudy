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
        'flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md transition-colors',
        isStreakAtRisk
          ? 'bg-orange-500/10 border-orange-500/30'
          : 'bg-white/5 hover:bg-white/10'
      )}
      role="status"
      aria-label={`Серия: ${streak} ${streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд`}
    >
      <motion.span
        animate={isStreakAtRisk ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-lg leading-none"
        aria-hidden="true"
      >
        🔥
      </motion.span>
      <span className={cn(
        "text-sm font-semibold leading-none",
        isStreakAtRisk ? "text-orange-400" : "text-white/90"
      )}>
        {streak} Не теряй!
      </span>
    </motion.div>
  );
}
