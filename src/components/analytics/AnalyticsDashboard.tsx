import React from 'react';
import { motion } from 'framer-motion';
import { LearningVelocityChart } from './LearningVelocityChart';
import { TopicMasteryRadar } from './TopicMasteryRadar';
import { WeakAreasPanel } from './WeakAreasPanel';
import { ProgressPrediction } from './ProgressPrediction';
import { WeeklySummary } from './WeeklySummary';
import { useAnalyticsStore } from '@/store/analytics-store';
import { cn } from '@/lib/utils';
import { Lightbulb, Sparkles } from 'lucide-react';

// Reusable Bento Card Component (Local version for dashboard)
const BentoCard = ({
  className,
  children,
  glowColor = "none",
  delay = 0
}: {
  className?: string,
  children: React.ReactNode,
  glowColor?: "purple" | "pink" | "orange" | "blue" | "green" | "none",
  delay?: number
}) => {
  const glowStyles = {
    purple: "hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] hover:border-purple-500/50",
    pink: "hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.4)] hover:border-pink-500/50",
    orange: "hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)] hover:border-orange-500/50",
    blue: "hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] hover:border-blue-500/50",
    green: "hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)] hover:border-green-500/50",
    none: "hover:border-white/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl transition-all duration-500",
        glowStyles[glowColor],
        className
      )}
    >
      <div className="relative z-10 h-full p-6">{children}</div>
      {/* Inner subtle gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
    </motion.div>
  );
};

export function AnalyticsDashboard() {
  const { recommendations, isLoading, error, loadFromServer } = useAnalyticsStore();

  // Load analytics from server on mount
  React.useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
          <p className="mt-4 text-white/60">Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-400">
          <p>Ошибка загрузки аналитики</p>
          <p className="text-sm text-white/60 mt-2">{error}</p>
          <button
            onClick={loadFromServer}
            className="mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(180px,auto)]">

      {/* Weekly Summary - Full Width Top */}
      <BentoCard className="md:col-span-12" glowColor="blue" delay={0}>
        <WeeklySummary />
      </BentoCard>

      {/* Learning Velocity - Large Chart */}
      <BentoCard className="md:col-span-8 md:row-span-2 min-h-[400px]" glowColor="purple" delay={0.1}>
        <LearningVelocityChart />
      </BentoCard>

      {/* Topic Mastery - Radar Chart */}
      <BentoCard className="md:col-span-4 md:row-span-2 min-h-[400px]" glowColor="pink" delay={0.2}>
        <TopicMasteryRadar />
      </BentoCard>

      {/* Weak Areas */}
      <BentoCard className="md:col-span-6 min-h-[300px]" glowColor="orange" delay={0.3}>
        <WeakAreasPanel />
      </BentoCard>

      {/* Progress Prediction */}
      <BentoCard className="md:col-span-6 min-h-[300px]" glowColor="green" delay={0.4}>
        <ProgressPrediction />
      </BentoCard>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <BentoCard className="md:col-span-12" glowColor="none" delay={0.5}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Персональные рекомендации</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-white/10"
              >
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-xl transition-all group-hover:scale-150" />
                <div className="relative flex gap-3">
                  <Sparkles className="h-5 w-5 text-yellow-400 shrink-0 mt-1" />
                  <p className="text-sm leading-relaxed text-white/80">{rec}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </BentoCard>
      )}
    </div>
  );
}
