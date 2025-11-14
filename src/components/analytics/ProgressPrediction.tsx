'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useAnalyticsStore } from '@/store/analytics-store';

export function ProgressPrediction() {
  const { taskAttempts, predictCompletionDate } = useAnalyticsStore();
  
  const prediction = useMemo(() => {
    const completedDays = new Set(taskAttempts.map((a) => a.day)).size;
    const totalDays = 90;
    const remainingDays = totalDays - completedDays;
    const completionPercentage = (completedDays / totalDays) * 100;
    
    const estimatedDate = predictCompletionDate();
    const daysUntilCompletion = Math.ceil(
      (estimatedDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
    
    // Calculate velocity
    const oldestAttempt = taskAttempts[0];
    const daysSinceStart = oldestAttempt
      ? Math.ceil((Date.now() - oldestAttempt.startTime) / (24 * 60 * 60 * 1000))
      : 1;
    
    const velocity = completedDays / Math.max(daysSinceStart, 1);
    const isOnTrack = velocity >= 1.0;
    
    return {
      completedDays,
      remainingDays,
      completionPercentage,
      estimatedDate,
      daysUntilCompletion,
      velocity,
      isOnTrack
    };
  }, [taskAttempts, predictCompletionDate]);
  
  return (
    <Card className={prediction.isOnTrack ? 'border-green-500/30 bg-green-500/10' : 'border-yellow-500/30 bg-yellow-500/10'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{prediction.isOnTrack ? '🚀' : '⏰'}</span>
          <span>Прогноз завершения</span>
        </CardTitle>
        <CardDescription>
          {prediction.isOnTrack
            ? 'Ты идёшь по графику!'
            : 'Нужно немного ускориться'}
        </CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6 pb-6">
        {/* Progress Circle */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="160" height="160" className="rotate-[-90deg]">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={prediction.isOnTrack ? '#10b981' : '#f59e0b'}
                strokeWidth="12"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 440' }}
                animate={{
                  strokeDasharray: `${(prediction.completionPercentage / 100) * 440} 440`
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {prediction.completionPercentage.toFixed(0)}%
              </span>
              <span className="text-xs text-white/60">завершено</span>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            <p className="text-2xl font-bold text-white">{prediction.completedDays}</p>
            <p className="text-xs text-white/60">дней пройдено</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
            <p className="text-2xl font-bold text-white">{prediction.remainingDays}</p>
            <p className="text-xs text-white/60">дней осталось</p>
          </div>
        </div>
        
        {/* Prediction */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/90">Ожидаемое завершение</p>
              <p className="text-xs text-white/60">
                {prediction.estimatedDate.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{prediction.daysUntilCompletion}</p>
              <p className="text-xs text-white/60">дней</p>
            </div>
          </div>
        </div>
        
        {/* Velocity indicator */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/70">
            <strong>Скорость:</strong> {prediction.velocity.toFixed(2)} дней/день
            {!prediction.isOnTrack && (
              <span className="ml-2 text-yellow-400">
                (рекомендуется ≥1.0 для завершения за 90 дней)
              </span>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}
