'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAnalyticsStore } from '@/store/analytics-store';

export function WeakAreasPanel() {
  const { topicMastery, weakAreas } = useAnalyticsStore();

  const weakTopics = useMemo(() => {
    return weakAreas
      .map((area) => topicMastery[area])
      .filter(Boolean)
      .sort((a, b) => a.successRate - b.successRate);
  }, [weakAreas, topicMastery]);

  if (weakTopics.length === 0) {
    return (
      <Card className="border-green-500/30 bg-green-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎉</span>
            <span>Слабых мест не обнаружено!</span>
          </CardTitle>
          <CardDescription>
            Отличная работа! Все темы освоены на уровне выше 70%
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-panel-enhanced border-orange-500/30 bg-orange-500/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="text-orange-400">⚠️</span>
          <span>Области для улучшения</span>
        </CardTitle>
        <CardDescription className="text-white/60">
          Темы с успехом ниже 70% — стоит повторить
        </CardDescription>
      </CardHeader>
      <div className="space-y-3 px-6 pb-6">
        {weakTopics.map((topic, index) => (
          <motion.div
            key={topic.topic}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between rounded-lg border border-orange-400/20 bg-orange-400/10 p-3"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-white/90">
                {topic.topic.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
              <p className="text-xs text-white/60">
                {topic.completedTasks} из {topic.totalTasks} задач успешно
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-lg font-bold text-orange-400">
                {topic.successRate.toFixed(0)}%
              </span>
              <span className="text-xs text-white/60">успех</span>
            </div>
          </motion.div>
        ))}

        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/70">
            💡 <strong>Совет:</strong> Пересмотри теорию по этим темам и попробуй решить дополнительные задачи
          </p>
        </div>
      </div>
    </Card>
  );
}
