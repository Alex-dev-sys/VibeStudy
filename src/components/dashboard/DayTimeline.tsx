'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import { useProgressStore } from '@/store/progress-store';
const MONTH_SEGMENTS: Array<{ label: string; start: number; end: number }> = [
  { label: 'Месяц 1 · Фундамент', start: 1, end: 30 },
  { label: 'Месяц 2 · Практика', start: 31, end: 60 },
  { label: 'Месяц 3 · Подготовка к собеседованиям', start: 61, end: 90 }
];

export function DayTimeline() {
  const { activeDay, completedDays, setActiveDay } = useProgressStore((state) => ({
    activeDay: state.activeDay,
    completedDays: state.record.completedDays,
    setActiveDay: state.setActiveDay
  }));

  const segmentProgress = useMemo(() => {
    return MONTH_SEGMENTS.map((segment) => {
      const days = Array.from({ length: segment.end - segment.start + 1 }, (_, index) => segment.start + index);
      const completedCount = days.filter((day) => completedDays.includes(day)).length;
      return {
        key: `${segment.start}-${segment.end}`,
        label: segment.label,
        days,
        completedCount,
        total: days.length
      };
    });
  }, [completedDays]);

  return (
    <section className="relative glass-panel-soft rounded-2xl p-4 sm:rounded-3xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white/95 sm:text-lg">Навигация по дням</h2>
          <p className="mt-1 text-xs text-white/60 sm:text-sm">Следи за темпом и переходи к любому дню плана</p>
        </div>
        <p className="text-xs text-white/55 sm:text-right sm:text-sm">Совет: используй клавиши ← → для быстрого переключения</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/55 sm:mt-4 sm:text-xs">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-transparent bg-gradient-to-br from-[#ff0094]/70 to-[#ffd200]/60 shadow-[0_0_15px_rgba(255,0,148,0.6)]" aria-hidden />
          Активный день
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-[#ff84ff]/30 bg-[#ff84ff]/15" aria-hidden />
          Завершён
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full border border-white/12 bg-[rgba(255,255,255,0.15)]" aria-hidden />
          Впереди
        </span>
      </div>
      <div className="mt-4 space-y-4 sm:mt-5">
        {segmentProgress.map((segment) => (
          <div key={segment.key} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/50 sm:text-xs">
              <span>{segment.label}</span>
              <span>
                {segment.completedCount}/{segment.total} дней выполнено
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-2 lg:grid-cols-15">
              {segment.days.map((day) => {
                const isCompleted = completedDays.includes(day);
                const isActive = day === activeDay;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={clsx(
                      'flex h-10 items-center justify-center rounded-xl border text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:h-12 sm:rounded-2xl sm:text-sm',
                      isActive
                        ? 'border-transparent bg-gradient-to-br from-[#ff0094]/45 to-[#ffd200]/30 text-white shadow-[0_0_18px_rgba(255,0,148,0.6)]'
                        : isCompleted
                          ? 'border-[#ff84ff]/30 bg-[#ff84ff]/12 text-[#ffbdf7]'
                          : 'border-white/12 bg-[rgba(255,255,255,0.15)] text-white/60 hover:border-white/25'
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

