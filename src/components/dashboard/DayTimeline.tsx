'use client';

import { useMemo, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/store/progress-store';
import { getDayTopic } from '@/lib/curriculum';

const WEEK_MARKERS = [
  { week: 1, day: 1 },
  { week: 5, day: 29 },
  { week: 9, day: 57 },
  { week: 13, day: 85 }
];

export function DayTimeline() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { activeDay, completedDays, dayStates, setActiveDay } = useProgressStore((state) => ({
    activeDay: state.activeDay,
    completedDays: state.record.completedDays,
    dayStates: state.dayStates,
    setActiveDay: state.setActiveDay
  }));

  // Auto-scroll to active day on mount and when activeDay changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeDayElement = scrollContainerRef.current.querySelector(`[data-day="${activeDay}"]`);
      if (activeDayElement) {
        activeDayElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        });
      }
    }
  }, [activeDay]);

  // Calculate progress for each day
  const daysWithProgress = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => {
      const day = i + 1;
      const isCompleted = completedDays.includes(day);
      const isCurrent = day === activeDay;
      const lastCompletedDay = completedDays.length > 0 ? Math.max(...completedDays) : 0;
      const isLocked = day > 1 && day > lastCompletedDay + 1;
      const dayTopic = getDayTopic(day);
      
      // Get task progress for this day
      const dayState = dayStates[day];
      const completedTasksCount = dayState?.completedTasks?.length || 0;
      const totalTasks = 5; // Assuming 5 tasks per day on average
      
      return {
        day,
        isCompleted,
        isCurrent,
        isLocked,
        topic: dayTopic.topic,
        progress: isCompleted ? 100 : (completedTasksCount / totalTasks) * 100,
        completedTasksCount,
        totalTasks
      };
    });
  }, [activeDay, completedDays, dayStates]);

  return (
    <section className="relative glass-panel-soft rounded-2xl p-4 sm:rounded-3xl sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white/95 sm:text-lg">Твой путь</h2>
          <p className="mt-1 text-xs text-white/60 sm:text-sm">
            {completedDays.length} из 90 дней завершено
          </p>
        </div>
        <p className="text-xs text-white/55 sm:text-right sm:text-sm">
          Совет: используй клавиши ← → для быстрого переключения
        </p>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/55 sm:mt-4 sm:text-xs">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border-2 border-primary bg-gradient-to-br from-primary/50 to-accent/50 shadow-[0_0_12px_rgba(255,0,148,0.5)]" aria-hidden />
          Активный
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-green-500/50 bg-green-500/20" aria-hidden />
          Завершён
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-white/20 bg-white/10" aria-hidden />
          Доступен
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-white/10 bg-white/5" aria-hidden />
          Заблокирован
        </span>
      </div>

      {/* Horizontal scrollable timeline */}
      <div 
        ref={scrollContainerRef}
        className="mt-6 flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {daysWithProgress.map((dayData) => (
          <motion.button
            key={dayData.day}
            data-day={dayData.day}
            onClick={() => !dayData.isLocked && setActiveDay(dayData.day)}
            disabled={dayData.isLocked}
            whileHover={!dayData.isLocked ? { scale: 1.05 } : {}}
            whileTap={!dayData.isLocked ? { scale: 0.95 } : {}}
            className={clsx(
              'group relative flex-shrink-0 w-24 h-28 rounded-xl p-3 flex flex-col items-center justify-between transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              dayData.isCurrent && 'ring-2 ring-primary shadow-lg shadow-primary/50 scale-105',
              dayData.isCompleted && !dayData.isCurrent && 'bg-green-500/20 border border-green-500/50 hover:bg-green-500/30',
              !dayData.isCompleted && !dayData.isCurrent && !dayData.isLocked && 'bg-white/5 border border-white/10 hover:bg-white/10',
              dayData.isLocked && 'bg-white/5 border border-white/5 opacity-50 cursor-not-allowed'
            )}
            title={
              dayData.isCompleted && !dayData.isCurrent
                ? `День ${dayData.day}: ${dayData.topic} (завершён)` 
                : dayData.isLocked 
                  ? 'Завершите предыдущий день чтобы разблокировать' 
                  : `День ${dayData.day}: ${dayData.topic}`
            }
          >
            {/* Day number */}
            <div className={clsx(
              'text-lg font-bold transition-colors',
              dayData.isCurrent && 'text-primary',
              dayData.isCompleted && !dayData.isCurrent && 'text-green-400',
              dayData.isLocked && 'text-white/30',
              !dayData.isCompleted && !dayData.isCurrent && !dayData.isLocked && 'text-white/80'
            )}>
              {dayData.day}
            </div>
            
            {/* Status icon */}
            <div className="text-2xl">
              {dayData.isCompleted ? '✓' : dayData.isLocked ? '🔒' : dayData.isCurrent ? '▶️' : '○'}
            </div>
            
            {/* Progress indicator for non-completed days with some progress */}
            {!dayData.isCompleted && dayData.completedTasksCount > 0 && (
              <div className="absolute bottom-2 left-2 right-2">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dayData.progress}%` }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
                <div className="text-[9px] text-white/50 text-center mt-0.5">
                  {dayData.completedTasksCount}/{dayData.totalTasks}
                </div>
              </div>
            )}
            
            {/* Topic hint - shown on hover */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-48">
              <div className="bg-[#1a0b2e] border border-white/20 rounded-lg p-2 text-[10px] text-white/90 text-center shadow-xl">
                {dayData.topic}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Week markers */}
      <div className="mt-8 flex items-center justify-between text-xs text-white/40 px-2">
        {WEEK_MARKERS.map((marker, index) => (
          <div key={marker.week} className="flex items-center gap-2">
            {index > 0 && <div className="flex-1 border-t border-white/10 w-16 sm:w-24" />}
            <span className="whitespace-nowrap">Неделя {marker.week}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

