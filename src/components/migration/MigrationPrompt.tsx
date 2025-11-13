'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LocalDataSummary } from '@/lib/migration/types';
import { getMigrationSummaryMessage } from '@/lib/migration/detect';

interface MigrationPromptProps {
  summary: LocalDataSummary;
  onMigrate: () => void;
  onSkip: () => void;
  isOpen: boolean;
}

export function MigrationPrompt({ summary, onMigrate, onSkip, isOpen }: MigrationPromptProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleSkip = () => {
    setIsClosing(true);
    setTimeout(onSkip, 300);
  };

  const handleMigrate = () => {
    setIsClosing(true);
    setTimeout(onMigrate, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && !isClosing && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 shadow-2xl"
          >
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-soft/20 text-4xl">
                ☁️
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-2 text-center text-2xl font-bold text-white">
              Перенести данные в облако?
            </h2>

            {/* Description */}
            <p className="mb-4 text-center text-sm text-white/70">
              Мы обнаружили ваш прогресс в браузере. Хотите сохранить его в облаке?
            </p>

            {/* Summary */}
            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                Что будет перенесено:
              </p>
              <p className="text-sm text-white">
                {getMigrationSummaryMessage(summary)}
              </p>
            </div>

            {/* Benefits */}
            <div className="mb-6 space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-lg">✅</span>
                <p className="text-sm text-white/80">
                  Доступ с любого устройства
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">✅</span>
                <p className="text-sm text-white/80">
                  Автоматическая синхронизация
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">✅</span>
                <p className="text-sm text-white/80">
                  Безопасное хранение
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleMigrate}
                className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-soft px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-accent/50"
              >
                Перенести в облако
              </button>
              <button
                onClick={handleSkip}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                Начать с чистого листа
              </button>
            </div>

            {/* Note */}
            <p className="mt-4 text-center text-xs text-white/50">
              Ваши локальные данные останутся в браузере
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
