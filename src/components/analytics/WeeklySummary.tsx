'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalyticsStore } from '@/store/analytics-store';

export function WeeklySummary() {
  const { taskAttempts } = useAnalyticsStore();

  const weeklyStats = useMemo(() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const weekAttempts = taskAttempts.filter((a) => a.startTime >= oneWeekAgo);

    const totalTasks = weekAttempts.length;
    const successfulTasks = weekAttempts.filter((a) => a.success).length;
    const successRate = totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : 0;

    const totalTime = weekAttempts.reduce((sum, a) => sum + (a.endTime - a.startTime), 0);
    const averageTime = totalTasks > 0 ? totalTime / totalTasks : 0;

    const uniqueDays = new Set(weekAttempts.map((a) => a.day)).size;

    return {
      totalTasks,
      successfulTasks,
      successRate,
      averageTime: Math.round(averageTime / 1000 / 60), // minutes
      uniqueDays
    };
  }, [taskAttempts]);

  const stats = [
    { label: 'Задач выполнено', value: weeklyStats.totalTasks, icon: '📝', color: 'text-blue-400' },
    { label: 'Успешных', value: weeklyStats.successfulTasks, icon: '✅', color: 'text-green-400' },
    { label: 'Успех', value: `${weeklyStats.successRate.toFixed(0)}%`, icon: '🎯', color: 'text-purple-400' },
    { label: 'Среднее время', value: `${weeklyStats.averageTime} мин`, icon: '⏱️', color: 'text-orange-400' },
    { label: 'Активных дней', value: weeklyStats.uniqueDays, icon: '📅', color: 'text-pink-400' }
  ];

  return (
    <Card className="glass-panel-enhanced border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <span className="text-blue-400">📊</span>
          Итоги недели
        </CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-4 px-6 pb-6 md:grid-cols-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color.replace('text-', 'from-')}/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100`} />
            <span className="relative text-3xl transition-transform group-hover:scale-110">{stat.icon}</span>
            <span className={`relative text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            <span className="relative text-center text-xs font-medium text-white/60">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
