'use client';

import { BarChart3 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface EmptyStatisticsProps {
  onStartLearning?: () => void;
}

/**
 * Empty state for statistics panel when no learning data exists
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function EmptyStatistics({ onStartLearning }: EmptyStatisticsProps) {
  return (
    <EmptyState
      icon={BarChart3}
      title="Статистика пока пуста"
      description="Начни обучение, чтобы отслеживать свой прогресс. Здесь будет детальная аналитика твоих достижений и активности."
      action={
        onStartLearning
          ? {
              label: 'Начать первый день',
              onClick: onStartLearning,
            }
          : undefined
      }
      helpText="Статистика обновляется автоматически после каждого выполненного задания"
      metadata={
        <div className="flex items-center justify-center gap-4">
          <span>📊 Графики прогресса</span>
          <span>•</span>
          <span>📈 Календарь активности</span>
          <span>•</span>
          <span>⏱️ Время обучения</span>
        </div>
      }
      size="md"
    />
  );
}
