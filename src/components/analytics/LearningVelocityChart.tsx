'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAnalyticsStore } from '@/store/analytics-store';

export function LearningVelocityChart() {
  const { taskAttempts } = useAnalyticsStore();

  const chartData = useMemo(() => {
    // Get last 7 days
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const dayAttempts = taskAttempts.filter(
        (a) => a.startTime >= dayStart && a.startTime < dayEnd
      );

      days.push({
        label: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
        count: dayAttempts.length,
        success: dayAttempts.filter((a) => a.success).length
      });
    }

    return days;
  }, [taskAttempts]);

  const maxCount = chartData.length > 0
    ? Math.max(...chartData.map((d) => d.count), 1)
    : 1;

  return (
    <Card className="glass-panel-enhanced border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="text-green-400">📈</span>
          Скорость обучения
        </CardTitle>
        <CardDescription className="text-white/60">Задач выполнено за последние 7 дней</CardDescription>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between gap-2" style={{ height: '200px' }}>
          {chartData.map((day, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex w-full flex-col items-center justify-end" style={{ height: '160px' }}>
                {/* Success bar */}
                {day.success > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.success / maxCount) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-green-500/80 to-green-400/80"
                    title={`Успешных: ${day.success}`}
                  />
                )}

                {/* Total bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.count / maxCount) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-500/60 to-blue-400/60"
                  title={`Всего: ${day.count}`}
                />

                {/* Count label */}
                {day.count > 0 && (
                  <span className="absolute -top-6 text-xs font-semibold text-white">
                    {day.count}
                  </span>
                )}
              </div>

              {/* Day label */}
              <span className="text-xs text-white/60">{day.label}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500/60" />
            <span className="text-white/70">Всего попыток</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500/80" />
            <span className="text-white/70">Успешных</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
