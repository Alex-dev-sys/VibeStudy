'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useKnowledgeProfileStore } from '@/store/knowledge-profile-store';
import { getDayTopic } from '@/lib/content/curriculum';

interface AdaptiveRecommendationsPanelProps {
  currentDay: number;
  languageId: string;
}

export function AdaptiveRecommendationsPanel({ currentDay, languageId }: AdaptiveRecommendationsPanelProps) {
  const {
    weakAreas,
    suggestedReviewTopics,
    averageScore,
    totalAttempts,
    getRecommendations
  } = useKnowledgeProfileStore();

  const [recommendations, setRecommendations] = useState<{
    difficulty: 'easy' | 'medium' | 'hard';
    reviewTopics: string[];
    nextActions: string[];
  } | null>(null);

  useEffect(() => {
    if (totalAttempts > 0) {
      const recs = getRecommendations();
      setRecommendations(recs);
    }
  }, [totalAttempts, getRecommendations]);

  // Не показываем панель, если нет данных
  if (totalAttempts === 0 || !recommendations) {
    return null;
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'text-emerald-400';
      case 'hard':
        return 'text-rose-400';
      default:
        return 'text-amber-400';
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'Лёгкая';
      case 'hard':
        return 'Сложная';
      default:
        return 'Средняя';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="border border-[#ff5bc8]/30 bg-gradient-to-br from-[#ff0094]/18 via-[#46135a]/20 to-transparent glow-border">
        <div className="relative overflow-hidden rounded-[26px] border border-white/12 bg-[rgba(255,255,255,0.15)] p-4 sm:p-6">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_top_right,rgba(255,0,148,0.2),transparent_65%)]" />
          <div className="relative space-y-4">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
                <h3 className="text-lg font-semibold text-white/95 sm:text-xl">Адаптивные рекомендации</h3>
                <p className="text-xs text-white/70 sm:text-sm">На основе вашего прогресса</p>
            </div>
          </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/12 bg-[rgba(255,255,255,0.15)] p-3 sm:grid-cols-4">
            <div>
                <p className="text-xs text-white/60">Средний балл</p>
                <p className="text-lg font-semibold text-white/95">{Math.round(averageScore)}</p>
            </div>
            <div>
                <p className="text-xs text-white/60">Попыток</p>
                <p className="text-lg font-semibold text-white/95">{totalAttempts}</p>
            </div>
            <div>
                <p className="text-xs text-white/60">Рекомендуемая сложность</p>
              <p className={`text-lg font-semibold ${getDifficultyColor(recommendations.difficulty)}`}>
                {getDifficultyLabel(recommendations.difficulty)}
              </p>
            </div>
            <div>
                <p className="text-xs text-white/60">Слабых мест</p>
                <p className="text-lg font-semibold text-white/95">{weakAreas.length}</p>
            </div>
          </div>

          {recommendations.nextActions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white/85">📋 Что делать дальше:</h4>
              <ul className="space-y-2">
                {recommendations.nextActions.map((action, i) => (
                  <li
                    key={i}
                      className="flex items-start gap-2 rounded-lg border border-white/12 bg-[rgba(255,255,255,0.18)] p-2 text-xs text-white/75 sm:text-sm"
                  >
                      <span className="text-gradient">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.reviewTopics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white/85">🔄 Рекомендуем повторить:</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.reviewTopics.map((topic, i) => (
                  <Badge key={i} tone="accent" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {weakAreas.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white/85">⚠️ Требуют внимания:</h4>
              <div className="space-y-2">
                {weakAreas.slice(0, 3).map((area, i) => (
                    <div key={i} className="rounded-lg border border-rose-400/35 bg-rose-400/15 p-2 text-xs text-white/90 sm:text-sm">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{area.topic}</span>
                        <Badge tone="accent" className="bg-rose-400/30 text-white">
                        {Math.round(area.failureRate)}% ошибок
                      </Badge>
                    </div>
                    {area.commonErrors.length > 0 && (
                        <p className="mt-1 text-white/75">Частые ошибки: {area.commonErrors.join(', ')}</p>
                    )}
                      <p className="mt-1 text-white/70">
                      Действие: {area.recommendedAction === 'review' ? '📖 Повторить теорию' : area.recommendedAction === 'practice' ? '💪 Больше практики' : '⏭️ Перейти дальше'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
