'use client';

import { Trophy } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface EmptyAchievementsProps {
  onStartLearning?: () => void;
}

/**
 * Empty state for achievements panel when no achievements are unlocked
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function EmptyAchievements({ onStartLearning }: EmptyAchievementsProps) {
  return (
    <EmptyState
      icon={Trophy}
      title="Пока нет достижений"
      description="Начни обучение и выполняй задания, чтобы разблокировать первые достижения. Каждое достижение — это твой прогресс!"
      action={
        onStartLearning
          ? {
              label: 'Начать обучение',
              onClick: onStartLearning,
            }
          : undefined
      }
      helpText="Первое достижение можно получить уже после первого дня обучения"
      metadata={
        <div className="flex items-center justify-center gap-4">
          <span>🏆 21 достижение доступно</span>
          <span>•</span>
          <span>🎯 4 категории</span>
        </div>
      }
      size="md"
    />
  );
}
