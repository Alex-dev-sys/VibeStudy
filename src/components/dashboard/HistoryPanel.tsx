'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '@/store/progress-store';

export function HistoryPanel() {
  const [open, setOpen] = useState(false);
  const history = useProgressStore((state) => state.record.history);
  const setActiveDay = useProgressStore((state) => state.setActiveDay);

  return (
    <div className="glass-panel relative rounded-3xl p-6">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-white transition-colors hover:text-accent"
      >
        История прогресса
        <span className="text-xs text-white/50">({history.length} записей)</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex flex-col gap-3 text-sm"
          >
            {history.length === 0 && <li className="text-white/50">Отмечай выполненные дни — и они появятся здесь.</li>}
            {history
              .slice()
              .reverse()
              .map((entry) => (
                <li key={`${entry.day}-${entry.timestamp}`} className="rounded-2xl border border-white/10 bg-black/40 p-3">
                  <button
                    type="button"
                    className="text-left text-white/80 hover:text-accent"
                    onClick={() => setActiveDay(entry.day)}
                  >
                    День {entry.day}
                  </button>
                  <p className="text-xs text-white/40">
                    {new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(entry.timestamp)}
                  </p>
                  {entry.notes && <p className="mt-2 text-xs text-white/50">Заметки: {entry.notes}</p>}
                </li>
              ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

