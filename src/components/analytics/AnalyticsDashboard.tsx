'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LearningVelocityChart } from './LearningVelocityChart';
import { TopicMasteryRadar } from './TopicMasteryRadar';
import { WeakAreasPanel } from './WeakAreasPanel';
import { ProgressPrediction } from './ProgressPrediction';
import { WeeklySummary } from './WeeklySummary';
import { useAnalyticsStore } from '@/store/analytics-store';

export function AnalyticsDashboard() {
  const { taskAttempts, topicMastery, learningVelocity, weakAreas, recommendations } = useAnalyticsStore();
  
  const hasData = taskAttempts.length > 0;
  
  if (!hasData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>📊 Аналитика пока недоступна</CardTitle>
            <CardDescription>
              Начни решать задачи, чтобы увидеть детальную статистику своего прогресса
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Weekly Summary */}
      <WeeklySummary />
      
      {/* Main Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <LearningVelocityChart />
        <TopicMasteryRadar />
      </div>
      
      {/* Weak Areas and Predictions */}
      <div className="grid gap-6 md:grid-cols-2">
        <WeakAreasPanel />
        <ProgressPrediction />
      </div>
      
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💡 Персональные рекомендации</CardTitle>
          </CardHeader>
          <div className="space-y-3 px-6 pb-6">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <span className="text-xl">✨</span>
                <p className="text-sm text-white/80">{rec}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
