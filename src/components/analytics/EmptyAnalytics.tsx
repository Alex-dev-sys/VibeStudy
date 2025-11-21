'use client';

import { TrendingUp } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface EmptyAnalyticsProps {
  onStartLearning?: () => void;
}

/**
 * Empty state for analytics page when no learning data exists
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function EmptyAnalytics({ onStartLearning }: EmptyAnalyticsProps) {
  return (
    <EmptyState
      icon={TrendingUp}
      title="Аналитика недоступна"
      description="Начни обучение, чтобы увидеть детальную аналитику своего прогресса. Отслеживай свои успехи и находи области для улучшения."
      action={
        onStartLearning
          ? {
              label: 'Начать обучение',
              onClick: onStartLearning,
            }
          : undefined
      }
      helpText="Аналитика включает графики прогресса, календарь активности и рекомендации"
      metadata={
        <div className="flex items-center justify-center gap-4">
          <span>📊 Визуализация данных</span>
          <span>•</span>
          <span>🎯 Персональные рекомендации</span>
          <span>•</span>
          <span>📈 Тренды обучения</span>
        </div>
      }
      size="md"
    />
  );
}
