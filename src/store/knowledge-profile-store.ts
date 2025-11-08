import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TaskAttempt {
  taskId: string;
  day: number;
  languageId: string;
  attempts: number;
  hintsUsed: number;
  timeSpent: number; // в секундах
  completed: boolean;
  score: number; // 0-100
  errors: string[];
  timestamp: number;
}

export interface TopicMastery {
  topic: string;
  day: number;
  tasksCompleted: number;
  totalTasks: number;
  averageScore: number;
  averageAttempts: number;
  lastPracticed: number;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'master'; // 0-40, 41-70, 71-90, 91-100
}

export interface WeakArea {
  topic: string;
  days: number[];
  failureRate: number; // процент неудачных попыток
  commonErrors: string[];
  recommendedAction: 'review' | 'practice' | 'skip';
}

export interface KnowledgeProfile {
  // История попыток
  attempts: TaskAttempt[];
  
  // Мастерство по темам
  topicMastery: Record<string, TopicMastery>;
  
  // Слабые места
  weakAreas: WeakArea[];
  
  // Общая статистика
  totalAttempts: number;
  totalHintsUsed: number;
  totalTimeSpent: number;
  averageScore: number;
  
  // Рекомендации
  recommendedDifficulty: 'easy' | 'medium' | 'hard';
  suggestedReviewTopics: string[];
  
  // Последнее обновление
  lastUpdated: number;
}

interface KnowledgeProfileStore extends KnowledgeProfile {
  // Действия
  recordAttempt: (attempt: TaskAttempt) => void;
  updateTopicMastery: (topic: string, day: number, score: number, attempts: number) => void;
  analyzeWeakAreas: () => void;
  getRecommendations: () => {
    difficulty: 'easy' | 'medium' | 'hard';
    reviewTopics: string[];
    nextActions: string[];
  };
  calculateMasteryLevel: (averageScore: number) => 'beginner' | 'intermediate' | 'advanced' | 'master';
  reset: () => void;
}

const initialState: KnowledgeProfile = {
  attempts: [],
  topicMastery: {},
  weakAreas: [],
  totalAttempts: 0,
  totalHintsUsed: 0,
  totalTimeSpent: 0,
  averageScore: 0,
  recommendedDifficulty: 'medium',
  suggestedReviewTopics: [],
  lastUpdated: Date.now()
};

export const useKnowledgeProfileStore = create<KnowledgeProfileStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordAttempt: (attempt: TaskAttempt) => {
        set((state) => {
          const newAttempts = [...state.attempts, attempt];
          
          // Ограничиваем историю последними 500 попытками
          const limitedAttempts = newAttempts.slice(-500);
          
          // Обновляем общую статистику
          const totalAttempts = state.totalAttempts + 1;
          const totalHintsUsed = state.totalHintsUsed + attempt.hintsUsed;
          const totalTimeSpent = state.totalTimeSpent + attempt.timeSpent;
          
          // Пересчитываем средний балл
          const completedAttempts = limitedAttempts.filter((a) => a.completed);
          const averageScore =
            completedAttempts.length > 0
              ? completedAttempts.reduce((sum, a) => sum + a.score, 0) / completedAttempts.length
              : 0;

          return {
            attempts: limitedAttempts,
            totalAttempts,
            totalHintsUsed,
            totalTimeSpent,
            averageScore,
            lastUpdated: Date.now()
          };
        });

        // Автоматически анализируем слабые места после каждой попытки
        get().analyzeWeakAreas();
      },

      updateTopicMastery: (topic: string, day: number, score: number, attempts: number) => {
        set((state) => {
          const existing = state.topicMastery[topic];
          
          const tasksCompleted = existing ? existing.tasksCompleted + 1 : 1;
          const totalTasks = existing ? existing.totalTasks : 5; // примерно 5 задач на тему
          
          // Обновляем средний балл и попытки
          const newAverageScore = existing
            ? (existing.averageScore * existing.tasksCompleted + score) / tasksCompleted
            : score;
          
          const newAverageAttempts = existing
            ? (existing.averageAttempts * existing.tasksCompleted + attempts) / tasksCompleted
            : attempts;
          
          const masteryLevel = get().calculateMasteryLevel(newAverageScore);

          const updatedMastery: TopicMastery = {
            topic,
            day,
            tasksCompleted,
            totalTasks,
            averageScore: newAverageScore,
            averageAttempts: newAverageAttempts,
            lastPracticed: Date.now(),
            masteryLevel
          };

          return {
            topicMastery: {
              ...state.topicMastery,
              [topic]: updatedMastery
            },
            lastUpdated: Date.now()
          };
        });
      },

      calculateMasteryLevel: (averageScore: number) => {
        if (averageScore >= 91) return 'master';
        if (averageScore >= 71) return 'advanced';
        if (averageScore >= 41) return 'intermediate';
        return 'beginner';
      },

      analyzeWeakAreas: () => {
        set((state) => {
          const weakAreas: WeakArea[] = [];
          
          // Группируем попытки по темам (используем день как прокси для темы)
          const attemptsByDay: Record<number, TaskAttempt[]> = {};
          
          state.attempts.forEach((attempt) => {
            if (!attemptsByDay[attempt.day]) {
              attemptsByDay[attempt.day] = [];
            }
            attemptsByDay[attempt.day].push(attempt);
          });

          // Анализируем каждую тему
          Object.entries(attemptsByDay).forEach(([day, attempts]) => {
            const dayNum = parseInt(day);
            const failed = attempts.filter((a) => !a.completed || a.score < 50);
            const failureRate = (failed.length / attempts.length) * 100;

            // Если процент неудач > 40% и было минимум 3 попытки
            if (failureRate > 40 && attempts.length >= 3) {
              const commonErrors = [...new Set(failed.flatMap((a) => a.errors))].slice(0, 3);
              
              let recommendedAction: 'review' | 'practice' | 'skip' = 'practice';
              if (failureRate > 70) recommendedAction = 'review';
              if (attempts.length > 10 && failureRate > 60) recommendedAction = 'skip';

              weakAreas.push({
                topic: `День ${dayNum}`,
                days: [dayNum],
                failureRate,
                commonErrors,
                recommendedAction
              });
            }
          });

          // Сортируем по проценту неудач
          weakAreas.sort((a, b) => b.failureRate - a.failureRate);

          // Обновляем рекомендуемые темы для повторения
          const suggestedReviewTopics = weakAreas
            .filter((wa) => wa.recommendedAction === 'review')
            .map((wa) => wa.topic)
            .slice(0, 5);

          return {
            weakAreas: weakAreas.slice(0, 10), // топ-10 слабых мест
            suggestedReviewTopics,
            lastUpdated: Date.now()
          };
        });
      },

      getRecommendations: () => {
        const state = get();
        
        // Определяем рекомендуемую сложность на основе среднего балла
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
        if (state.averageScore < 50) difficulty = 'easy';
        else if (state.averageScore > 80) difficulty = 'hard';

        // Темы для повторения
        const reviewTopics = state.suggestedReviewTopics;

        // Следующие действия
        const nextActions: string[] = [];
        
        if (state.weakAreas.length > 0) {
          nextActions.push(`Повторите тему: ${state.weakAreas[0].topic}`);
        }
        
        if (state.averageScore < 60) {
          nextActions.push('Рекомендуем снизить сложность заданий');
        }
        
        if (state.totalHintsUsed / Math.max(state.totalAttempts, 1) > 2) {
          nextActions.push('Попробуйте решать задачи без подсказок для лучшего усвоения');
        }

        const recentAttempts = state.attempts.slice(-10);
        const recentFailures = recentAttempts.filter((a) => !a.completed || a.score < 50);
        if (recentFailures.length >= 5) {
          nextActions.push('Возможно, стоит вернуться к теории или предыдущим темам');
        }

        return {
          difficulty,
          reviewTopics,
          nextActions: nextActions.slice(0, 3)
        };
      },

      reset: () => set(initialState)
    }),
    {
      name: 'knowledge-profile-storage',
      version: 1
    }
  )
);
