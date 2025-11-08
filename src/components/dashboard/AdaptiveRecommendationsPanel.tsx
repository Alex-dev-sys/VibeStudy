'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useKnowledgeProfileStore } from '@/store/knowledge-profile-store';
import { getDayTopic } from '@/lib/curriculum';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-black/40">
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="text-lg font-semibold text-white sm:text-xl">Адаптивные рекомендации</h3>
              <p className="text-xs text-white/60 sm:text-sm">На основе вашего прогресса</p>
            </div>
          </div>

          {/* Текущая статистика */}
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/40 p-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-white/50">Средний балл</p>
              <p className="text-lg font-semibold text-white">{Math.round(averageScore)}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Попыток</p>
              <p className="text-lg font-semibold text-white">{totalAttempts}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Рекомендуемая сложность</p>
              <p className={`text-lg font-semibold ${getDifficultyColor(recommendations.difficulty)}`}>
                {getDifficultyLabel(recommendations.difficulty)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/50">Слабых мест</p>
              <p className="text-lg font-semibold text-white">{weakAreas.length}</p>
            </div>
          </div>

          {/* Следующие действия */}
          {recommendations.nextActions.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-semibold text-white/80">📋 Что делать дальше:</h4>
              <ul className="space-y-2">
                {recommendations.nextActions.map((action, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-white/10 bg-black/20 p-2 text-xs text-white/70 sm:text-sm"
                  >
                    <span className="text-accent">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Темы для повторения */}
          {recommendations.reviewTopics.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-white/80">🔄 Рекомендуем повторить:</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.reviewTopics.map((topic, i) => (
                  <Badge key={i} tone="accent" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Слабые места */}
          {weakAreas.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-semibold text-white/80">⚠️ Требуют внимания:</h4>
              <div className="space-y-2">
                {weakAreas.slice(0, 3).map((area, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs sm:text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-200">{area.topic}</span>
                      <Badge tone="accent" className="bg-rose-500/20 text-rose-300">
                        {Math.round(area.failureRate)}% ошибок
                      </Badge>
                    </div>
                    {area.commonErrors.length > 0 && (
                      <p className="mt-1 text-rose-200/70">
                        Частые ошибки: {area.commonErrors.join(', ')}
                      </p>
                    )}
                    <p className="mt-1 text-rose-200/60">
                      Действие: {area.recommendedAction === 'review' ? '📖 Повторить теорию' : area.recommendedAction === 'practice' ? '💪 Больше практики' : '⏭️ Перейти дальше'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
