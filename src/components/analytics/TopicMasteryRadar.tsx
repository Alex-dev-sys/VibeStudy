'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useAnalyticsStore } from '@/store/analytics-store';

export function TopicMasteryRadar() {
  const { topicMastery } = useAnalyticsStore();
  
  const topics = useMemo(() => {
    return Object.values(topicMastery)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5); // Top 5 topics
  }, [topicMastery]);
  
  if (topics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎯 Мастерство по темам</CardTitle>
          <CardDescription>Данных пока недостаточно</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>🎯 Мастерство по темам</CardTitle>
        <CardDescription>Процент успешных решений по темам</CardDescription>
      </CardHeader>
      <div className="space-y-4 px-6 pb-6">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.topic}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-white/90">
                {topic.topic.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
              <span className="text-white/70">
                {topic.successRate.toFixed(0)}%
              </span>
            </div>
            
            <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${topic.successRate}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                className={`h-full rounded-full ${
                  topic.successRate >= 80
                    ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                    : topic.successRate >= 60
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                      : topic.successRate >= 40
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                        : 'bg-gradient-to-r from-red-500 to-rose-400'
                }`}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{topic.completedTasks} из {topic.totalTasks} задач</span>
              <span>~{Math.round(topic.averageTime / 1000 / 60)} мин</span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
