'use client';

import { motion } from 'framer-motion';
import type { CompleteMigrationResult } from '@/lib/migration';

interface MigrationProgressProps {
  result: CompleteMigrationResult | null;
  isLoading: boolean;
}

export function MigrationProgress({ result, isLoading }: MigrationProgressProps) {
  if (!isLoading && !result) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 shadow-2xl"
      >
        {isLoading && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-accent" />
            </div>
            <h2 className="mb-2 text-center text-xl font-bold text-white">
              Переносим данные...
            </h2>
            <p className="text-center text-sm text-white/70">
              Пожалуйста, подождите
            </p>
          </>
        )}

        {!isLoading && result && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-4xl">
                {result.totalSuccess ? '✅' : '⚠️'}
              </div>
            </div>

            <h2 className="mb-4 text-center text-xl font-bold text-white">
              {result.totalSuccess ? 'Миграция завершена!' : 'Миграция завершена с ошибками'}
            </h2>

            <div className="space-y-2">
              <MigrationItem
                label="Прогресс"
                success={result.progress.success}
                count={result.progress.itemsMigrated}
              />
              <MigrationItem
                label="Достижения"
                success={result.achievements.success}
                count={result.achievements.itemsMigrated}
              />
              <MigrationItem
                label="Профиль"
                success={result.profile.success}
                count={result.profile.itemsMigrated}
              />
              <MigrationItem
                label="Знания"
                success={result.knowledgeProfile.success}
                count={result.knowledgeProfile.itemsMigrated}
              />
            </div>

            {!result.totalSuccess && (
              <div className="mt-4 rounded-lg border border-yellow-400/40 bg-yellow-400/10 p-3">
                <p className="text-xs text-white/80">
                  Некоторые данные не удалось перенести. Ваши локальные данные сохранены.
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

function MigrationItem({ label, success, count }: { label: string; success: boolean; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2">
      <span className="text-sm text-white/80">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/60">{count} элементов</span>
        <span className="text-lg">{success ? '✅' : '❌'}</span>
      </div>
    </div>
  );
}
