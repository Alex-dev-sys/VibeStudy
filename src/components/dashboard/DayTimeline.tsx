'use client';

import { useMemo, useRef, useEffect, useState, memo, useCallback } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useProgressStore } from '@/store/progress-store';
import { getDayTopic } from '@/lib/content/curriculum';
import { shallow } from 'zustand/shallow';

const WEEK_MARKERS = [
  { week: 1, day: 1 },
  { week: 5, day: 29 },
  { week: 9, day: 57 },
  { week: 13, day: 85 }
];

// Memoized day button component to prevent unnecessary re-renders
interface DayButtonProps {
  dayData: {
    day: number;
    isCompleted: boolean;
    isCurrent: boolean;
    isLocked: boolean;
    topic: string;
    progress: number;
    completedTasksCount: number;
    totalTasks: number;
  };
  isExpanded: boolean;
  onDayClick: (day: number) => void;
}

const DayButton = memo(({ dayData, isExpanded, onDayClick }: DayButtonProps) => {
  const handleClick = useCallback(() => {
    if (!dayData.isLocked) {
      onDayClick(dayData.day);
    }
  }, [dayData.isLocked, dayData.day, onDayClick]);

  return (
    <motion.button
      data-day={dayData.day}
      onClick={handleClick}
      disabled={dayData.isLocked}
      className={clsx(
        'group relative w-full aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        dayData.isCurrent && 'ring-2 ring-primary shadow-lg shadow-primary/50 bg-primary/10',
        dayData.isCompleted && !dayData.isCurrent && 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20',
        !dayData.isCompleted && !dayData.isCurrent && !dayData.isLocked && 'bg-white/5 border border-white/10 hover:bg-white/10',
        dayData.isLocked && 'bg-white/5 border border-white/5 opacity-40 cursor-not-allowed'
      )}
      title={
        dayData.isCompleted && !dayData.isCurrent
          ? `День ${dayData.day}: ${dayData.topic} (завершён)`
          : dayData.isLocked
            ? 'Завершите предыдущий день чтобы разблокировать'
            : `День ${dayData.day}: ${dayData.topic}`
      }
    >
      {/* Status Indicator */}
      <div className={clsx(
        'absolute top-2 right-2 w-2 h-2 rounded-full',
        dayData.isCompleted ? 'bg-green-500' :
          dayData.isCurrent ? 'bg-primary animate-pulse' :
            dayData.isLocked ? 'bg-white/20' : 'bg-white/40'
      )} />

      {/* Day number */}
      <div className={clsx(
        'font-bold mb-1 transition-all',
        isExpanded ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl',
        dayData.isCurrent ? 'text-white' :
          dayData.isCompleted ? 'text-green-400' :
            dayData.isLocked ? 'text-white/20' : 'text-white/70'
      )}>
        {dayData.day}
      </div>

      {/* Topic name below - Only show on hover or if current/completed */}
      {(dayData.isCurrent || dayData.isCompleted || !dayData.isLocked) && (
        <div className={clsx(
          "text-center leading-tight line-clamp-2 w-full px-1 transition-all",
          isExpanded ? 'text-[8px]' : 'text-[10px]',
          dayData.isCurrent ? 'text-primary-foreground/80' : 'text-white/40'
        )}>
          {dayData.topic}
        </div>
      )}

      {/* Lock Icon Overlay */}
      {dayData.isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-[1px]">
          <span className={clsx(
            "opacity-50 transition-all",
            isExpanded ? 'text-base' : 'text-lg'
          )}>🔒</span>
        </div>
      )}
    </motion.button>
  );
});

DayButton.displayName = 'DayButton';

interface DayTimelineProps {
  maxDays?: number;
}

export function DayTimeline({ maxDays = 90 }: DayTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use shallow comparison to prevent unnecessary re-renders
  const { activeDay, completedDays, dayStates, setActiveDay, languageId } = useProgressStore(
    (state) => ({
      activeDay: state.activeDay,
      completedDays: state.record.completedDays,
      dayStates: state.dayStates,
      setActiveDay: state.setActiveDay,
      languageId: state.languageId
    }),
    shallow
  );

  // Track if this is the first render
  const isFirstRender = useRef(true);

  // Memoize the day click handler
  const handleDayClick = useCallback((day: number) => {
    setActiveDay(day);
  }, [setActiveDay]);

  // Auto-scroll to active day only when activeDay changes (not on initial mount)
  useEffect(() => {
    // Skip scroll on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

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
    return Array.from({ length: maxDays }, (_, i) => {
      const day = i + 1;
      const isCompleted = completedDays.includes(day);
      const isCurrent = day === activeDay;
      const lastCompletedDay = completedDays.length > 0 ? Math.max(...completedDays) : 0;
      const isLocked = day > 1 && day > lastCompletedDay + 1;
      const dayTopic = getDayTopic(day, languageId);

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
  }, [activeDay, completedDays, dayStates, languageId, maxDays]);

  // Calculate current week (7 days around active day)
  const currentWeekDays = useMemo(() => {
    const weekStart = Math.floor((activeDay - 1) / 7) * 7 + 1;
    const weekEnd = Math.min(weekStart + 6, maxDays);
    return daysWithProgress.filter(d => d.day >= weekStart && d.day <= weekEnd);
  }, [activeDay, daysWithProgress, maxDays]);

  const displayedDays = isExpanded ? daysWithProgress : currentWeekDays;

  return (
    <section className="relative glass-panel-soft rounded-2xl p-4 sm:rounded-3xl sm:p-6">
      {/* Header with Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 rounded-lg"
      >
        <div>
          <h2 className="text-base font-semibold text-white/95 sm:text-lg">Твой путь</h2>
          <p className="mt-1 text-xs text-white/60 sm:text-sm">
            {completedDays.length} из {maxDays} дней завершено
          </p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-white/60" />
        </motion.div>
      </button>

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

      {/* Timeline Grid - Collapsible */}
      <AnimatePresence initial={false}>
        {(isExpanded || currentWeekDays.length > 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              ref={scrollContainerRef}
              className={clsx(
                "mt-6 gap-2 p-2",
                isExpanded
                  ? "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 max-h-[60vh] overflow-y-auto pr-2"
                  : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3"
              )}
            >
              {displayedDays.map((dayData) => (
                <DayButton
                  key={dayData.day}
                  dayData={dayData}
                  isExpanded={isExpanded}
                  onDayClick={handleDayClick}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

