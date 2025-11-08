'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/store/progress-store';

export function ProgressChart() {
  const completedDays = useProgressStore((state) => state.record.completedDays);

  const chartData = useMemo(() => {
    const data: { week: number; completed: number }[] = [];
    
    for (let week = 1; week <= 13; week++) {
      const weekStart = (week - 1) * 7 + 1;
      const weekEnd = week * 7;
      const completed = completedDays.filter(
        (day) => day >= weekStart && day <= weekEnd
      ).length;
      
      data.push({ week, completed });
    }
    
    return data;
  }, [completedDays]);

  const maxValue = 7;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Прогресс по неделям</h3>
      
      <div className="flex h-48 items-end justify-between gap-2">
        {chartData.map((item, index) => {
          const height = (item.completed / maxValue) * 100;
          
          return (
            <div key={item.week} className="flex flex-1 flex-col items-center gap-2">
              <motion.div
                className="relative w-full rounded-t-lg bg-gradient-to-t from-accent to-accent-soft"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ opacity: 0.8 }}
              >
                {/* Value Label */}
                {item.completed > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-white">
                    {item.completed}
                  </div>
                )}
              </motion.div>
              
              {/* Week Label */}
              <span className="text-[10px] text-white/50">Н{item.week}</span>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>0 дней</span>
        <span>7 дней/неделю</span>
      </div>
    </div>
  );
}

