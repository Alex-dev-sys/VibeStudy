'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/store/progress-store';

interface DayData {
  date: Date;
  count: number;
  isCompleted: boolean;
}

export function ActivityCalendar() {
  const completedDays = useProgressStore((state) => state.record.completedDays);
  const dayStates = useProgressStore((state) => state.dayStates);

  const calendarData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 90); // Последние 90 дней

    const data: DayData[] = [];
    for (let i = 0; i < 91; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayNumber = i + 1;
      const isCompleted = completedDays.includes(dayNumber);
      const tasksCompleted = dayStates[dayNumber]?.completedTasks?.length || 0;

      data.push({
        date,
        count: tasksCompleted,
        isCompleted
      });
    }
    return data;
  }, [completedDays, dayStates]);

  const weeks = useMemo(() => {
    const result: DayData[][] = [];
    let week: DayData[] = [];

    calendarData.forEach((day, index) => {
      week.push(day);
      if (week.length === 7 || index === calendarData.length - 1) {
        result.push(week);
        week = [];
      }
    });

    return result;
  }, [calendarData]);

  const getIntensityColor = (count: number, isCompleted: boolean) => {
    if (!isCompleted) return 'bg-white/5';
    if (count === 0) return 'bg-accent/20';
    if (count <= 2) return 'bg-accent/40';
    if (count <= 4) return 'bg-accent/60';
    return 'bg-accent';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Календарь активности</h3>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>Меньше</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-white/5" />
            <div className="h-3 w-3 rounded-sm bg-accent/20" />
            <div className="h-3 w-3 rounded-sm bg-accent/40" />
            <div className="h-3 w-3 rounded-sm bg-accent/60" />
            <div className="h-3 w-3 rounded-sm bg-accent" />
          </div>
          <span>Больше</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                  whileHover={{ scale: 1.2 }}
                  className={`group relative h-3 w-3 rounded-sm transition-all ${getIntensityColor(
                    day.count,
                    day.isCompleted
                  )}`}
                  title={`${day.date.toLocaleDateString('ru-RU')}: ${
                    day.isCompleted ? `${day.count} задач` : 'Не завершён'
                  }`}
                >
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-black/90 px-2 py-1 text-xs text-white group-hover:block">
                    {day.date.toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short'
                    })}
                    : {day.isCompleted ? `${day.count} задач` : 'Не завершён'}
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

