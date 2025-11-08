'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import { useProgressStore } from '@/store/progress-store';

const TOTAL_DAYS = 90;
const CHUNK_SIZE = 15;

const buildChunks = () => {
  const chunks: number[][] = [];
  let buffer: number[] = [];
  for (let i = 1; i <= TOTAL_DAYS; i += 1) {
    buffer.push(i);
    if (buffer.length === CHUNK_SIZE || i === TOTAL_DAYS) {
      chunks.push(buffer);
      buffer = [];
    }
  }
  return chunks;
};

const CHUNKS = buildChunks();

export function DayTimeline() {
  const { activeDay, completedDays, setActiveDay } = useProgressStore((state) => ({
    activeDay: state.activeDay,
    completedDays: state.record.completedDays,
    setActiveDay: state.setActiveDay
  }));

  const chunkIndex = useMemo(() => CHUNKS.findIndex((chunk) => chunk.includes(activeDay)), [activeDay]);

  return (
    <section className="glass-panel rounded-2xl p-4 sm:rounded-3xl sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-white sm:text-lg">Навигация по дням</h2>
        <p className="hidden text-xs text-white/50 sm:block">Используй стрелки ← → для навигации</p>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 sm:mt-4 sm:gap-3">
        {CHUNKS.map((chunk, index) => (
          <button
            key={`chunk-${index}`}
            type="button"
            onClick={() => setActiveDay(chunk[0])}
            className={clsx(
              'min-w-[100px] rounded-xl border px-2 py-1.5 text-left text-[10px] uppercase tracking-wide transition-colors duration-200 sm:min-w-[140px] sm:rounded-2xl sm:px-3 sm:py-2 sm:text-xs',
              index === chunkIndex ? 'border-accent bg-accent/20 text-accent' : 'border-white/10 bg-black/30 text-white/50 hover:border-white/30'
            )}
          >
            дн {chunk[0]} – {chunk[chunk.length - 1]}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5 sm:mt-4 sm:grid-cols-10 sm:gap-2 lg:grid-cols-15">
        {Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1).map((day) => {
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
                  ? 'border-accent bg-accent/30 text-white shadow-glow'
                  : isCompleted
                    ? 'border-accent/50 bg-accent/10 text-accent'
                    : 'border-white/10 bg-black/40 text-white/60 hover:border-white/20'
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}

