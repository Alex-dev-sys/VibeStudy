'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKnowledgeProfileStore } from '@/store/knowledge-profile-store';

export function AnalyticsPanel() {
  const { attempts, totalTimeSpent, totalHintsUsed, averageScore } = useKnowledgeProfileStore();

  const analytics = useMemo(() => {
    if (attempts.length === 0) {
      return null;
    }

    // Анализ по типам ошибок
    const errorTypes: Record<string, number> = {};
    attempts.forEach((attempt) => {
      attempt.errors.forEach((error) => {
        errorTypes[error] = (errorTypes[error] || 0) + 1;
      });
    });

    const topErrors = Object.entries(errorTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));

    // Среднее время на задачу
    const avgTimePerTask = attempts.length > 0 ? totalTimeSpent / attempts.length : 0;

    // Процент успешных решений
    const successfulAttempts = attempts.filter((a) => a.completed).length;
    const successRate = (successfulAttempts / attempts.length) * 100;

    // Среднее количество попыток до успеха
    const avgAttemptsToSuccess =
      successfulAttempts > 0
        ? attempts.filter((a) => a.completed).reduce((sum, a) => sum + a.attempts, 0) / successfulAttempts
        : 0;

    // Использование подсказок
    const hintsPerTask = attempts.length > 0 ? totalHintsUsed / attempts.length : 0;

    // Динамика по дням
    const recentAttempts = attempts.slice(-10);
    const recentAvgScore =
      recentAttempts.length > 0
        ? recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length
        : 0;

    const trend = recentAvgScore > averageScore ? 'up' : recentAvgScore < averageScore ? 'down' : 'stable';

    return {
      topErrors,
      avgTimePerTask,
      successRate,
      avgAttemptsToSuccess,
      hintsPerTask,
      recentAvgScore,
      trend
    };
  }, [attempts, totalTimeSpent, totalHintsUsed, averageScore]);

  if (!analytics) {
    return (
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-black/40">
        <div className="p-6 text-center">
          <span className="text-4xl">📊</span>
          <h3 className="mt-3 text-lg font-semibold text-white">Аналитика появится после первых попыток</h3>
          <p className="mt-2 text-sm text-white/60">Решайте задачи, чтобы увидеть детальную статистику</p>
        </div>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-emerald-400';
      case 'down':
        return 'text-rose-400';
      default:
        return 'text-white/60';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}м ${secs}с`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-black/40">
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-lg font-semibold text-white sm:text-xl">Детальная аналитика</h3>
              <p className="text-xs text-white/60 sm:text-sm">Ваш прогресс в цифрах</p>
            </div>
          </div>

          {/* Основные метрики */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <p className="text-xs text-white/50">Процент успеха</p>
              <p className="text-xl font-semibold text-emerald-400">{Math.round(analytics.successRate)}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <p className="text-xs text-white/50">Среднее время</p>
              <p className="text-xl font-semibold text-blue-400">{formatTime(analytics.avgTimePerTask)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <p className="text-xs text-white/50">Попыток до успеха</p>
              <p className="text-xl font-semibold text-amber-400">{analytics.avgAttemptsToSuccess.toFixed(1)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <p className="text-xs text-white/50">Подсказок на задачу</p>
              <p className="text-xl font-semibold text-purple-400">{analytics.hintsPerTask.toFixed(1)}</p>
            </div>
          </div>

          {/* Тренд */}
          <div className="mb-4 rounded-xl border border-white/10 bg-black/40 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Последние 10 задач</p>
                <p className="text-lg font-semibold text-white">{Math.round(analytics.recentAvgScore)} баллов</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTrendIcon(analytics.trend)}</span>
                <span className={`text-sm font-semibold ${getTrendColor(analytics.trend)}`}>
                  {analytics.trend === 'up' ? 'Растёт' : analytics.trend === 'down' ? 'Снижается' : 'Стабильно'}
                </span>
              </div>
            </div>
          </div>

          {/* Топ ошибок */}
          {analytics.topErrors.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-white/80">🔍 Частые проблемы:</h4>
              <div className="space-y-2">
                {analytics.topErrors.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-2"
                  >
                    <span className="text-xs text-white/70 sm:text-sm">{item.error}</span>
                    <Badge tone="accent" className="bg-rose-500/20 text-rose-300">
                      {item.count}x
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Рекомендации */}
          <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
            <h4 className="mb-2 text-sm font-semibold text-blue-200">💡 Совет:</h4>
            <p className="text-xs text-blue-200/80 sm:text-sm">
              {analytics.successRate < 50
                ? 'Не спешите! Внимательно читайте условие и используйте подсказки.'
                : analytics.hintsPerTask > 2
                  ? 'Попробуйте решать задачи самостоятельно — это улучшит усвоение материала.'
                  : analytics.avgTimePerTask < 120
                    ? 'Отличный темп! Но не забывайте вникать в детали решения.'
                    : 'Вы на правильном пути! Продолжайте практиковаться.'}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

