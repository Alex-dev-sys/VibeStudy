import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningVelocityChart } from './LearningVelocityChart';
import { TopicMasteryRadar } from './TopicMasteryRadar';
import { WeakAreasPanel } from './WeakAreasPanel';
import { ProgressPrediction } from './ProgressPrediction';
import { WeeklySummary } from './WeeklySummary';
import { useAnalyticsStore } from '@/store/analytics-store';

export function AnalyticsDashboard() {
  const { recommendations } = useAnalyticsStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Weekly Summary - Full Width */}
      <section>
        <WeeklySummary />
      </section>

      {/* Main Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full"
        >
          <LearningVelocityChart />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full"
        >
          <TopicMasteryRadar />
        </motion.div>
      </div>

      {/* Weak Areas and Predictions */}
      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WeakAreasPanel />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ProgressPrediction />
        </motion.div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-panel-enhanced border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="text-yellow-400">💡</span>
                Персональные рекомендации
              </CardTitle>
            </CardHeader>
            <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl transition-all group-hover:scale-150" />
                  <div className="relative flex gap-3">
                    <span className="text-2xl">✨</span>
                    <p className="text-sm leading-relaxed text-white/80">{rec}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.section>
      )}
    </motion.div>
  );
}
