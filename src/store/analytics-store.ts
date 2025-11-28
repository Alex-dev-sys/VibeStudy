import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TaskAttempt {
  taskId: string;
  day: number;
  startTime: number;
  endTime: number;
  success: boolean;
  attempts: number;
}

export interface TopicMastery {
  topic: string;
  totalTasks: number;
  completedTasks: number;
  successRate: number;
  averageTime: number;
}

export interface LearningVelocity {
  tasksPerDay: number;
  averageSessionDuration: number;
  mostProductiveHour: number;
  weeklyTrend: number[];
}

interface AnalyticsStore {
  taskAttempts: TaskAttempt[];
  topicMastery: Record<string, TopicMastery>;
  learningVelocity: LearningVelocity;
  weakAreas: string[];
  recommendations: string[];
  activeTaskStart: Record<string, number>; // taskId -> startTime
  isLoading: boolean;
  error: string | null;

  trackTaskStart: (day: number, taskId: string) => void;
  trackTaskComplete: (day: number, taskId: string, success: boolean) => void;
  calculateTopicMastery: () => void;
  generateRecommendations: () => void;
  predictCompletionDate: () => Date;
  getWeakAreas: () => string[];
  loadFromServer: () => Promise<void>;
}

const defaultVelocity: LearningVelocity = {
  tasksPerDay: 0,
  averageSessionDuration: 0,
  mostProductiveHour: 14,
  weeklyTrend: [0, 0, 0, 0, 0, 0, 0]
};

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      taskAttempts: [],
      topicMastery: {},
      learningVelocity: defaultVelocity,
      weakAreas: [],
      recommendations: [],
      activeTaskStart: {},
      isLoading: false,
      error: null,

      trackTaskStart: (day: number, taskId: string) => {
        const now = Date.now();
        set((state) => ({
          activeTaskStart: {
            ...state.activeTaskStart,
            [taskId]: now
          }
        }));
      },

      trackTaskComplete: (day: number, taskId: string, success: boolean) => {
        const state = get();
        const startTime = state.activeTaskStart[taskId] || Date.now();
        const endTime = Date.now();

        // Find existing attempt for this task
        const existingAttemptIndex = state.taskAttempts.findIndex(
          (a) => a.taskId === taskId && a.day === day
        );

        let newAttempts: TaskAttempt[];

        if (existingAttemptIndex >= 0) {
          // Update existing attempt
          newAttempts = [...state.taskAttempts];
          const existing = newAttempts[existingAttemptIndex];
          newAttempts[existingAttemptIndex] = {
            ...existing,
            endTime,
            success,
            attempts: existing.attempts + 1
          };
        } else {
          // Create new attempt
          const newAttempt: TaskAttempt = {
            taskId,
            day,
            startTime,
            endTime,
            success,
            attempts: 1
          };
          newAttempts = [...state.taskAttempts, newAttempt];
        }

        set({ taskAttempts: newAttempts });

        // Remove from active tasks
        const newActiveTaskStart = { ...state.activeTaskStart };
        delete newActiveTaskStart[taskId];
        set({ activeTaskStart: newActiveTaskStart });

        // Recalculate analytics
        get().calculateTopicMastery();
        get().generateRecommendations();
      },

      calculateTopicMastery: () => {
        const state = get();
        const topicMastery: Record<string, TopicMastery> = {};

        // Group attempts by topic (extracted from taskId)
        state.taskAttempts.forEach((attempt) => {
          // Extract topic from taskId (e.g., "python-basics-task1" -> "python-basics")
          const topic = attempt.taskId.split('-').slice(0, -1).join('-') || 'general';

          if (!topicMastery[topic]) {
            topicMastery[topic] = {
              topic,
              totalTasks: 0,
              completedTasks: 0,
              successRate: 0,
              averageTime: 0
            };
          }

          topicMastery[topic].totalTasks++;
          if (attempt.success) {
            topicMastery[topic].completedTasks++;
          }
        });

        // Calculate success rates and average times
        Object.keys(topicMastery).forEach((topic) => {
          const mastery = topicMastery[topic];
          mastery.successRate = (mastery.completedTasks / mastery.totalTasks) * 100;

          // Calculate average time for successful attempts
          const successfulAttempts = state.taskAttempts.filter(
            (a) => a.taskId.startsWith(topic) && a.success
          );

          if (successfulAttempts.length > 0) {
            const totalTime = successfulAttempts.reduce(
              (sum, a) => sum + (a.endTime - a.startTime),
              0
            );
            mastery.averageTime = totalTime / successfulAttempts.length;
          }
        });

        set({ topicMastery });

        // Update weak areas
        const weakAreas = Object.values(topicMastery)
          .filter((m) => m.successRate < 70)
          .map((m) => m.topic);

        set({ weakAreas });
      },

      generateRecommendations: () => {
        const state = get();
        const recommendations: string[] = [];

        // Recommendation based on weak areas
        if (state.weakAreas.length > 0) {
          recommendations.push(
            `Сосредоточься на темах: ${state.weakAreas.join(', ')}. Твой успех в этих областях ниже 70%.`
          );
        }

        // Recommendation based on velocity
        if (state.learningVelocity.tasksPerDay < 3) {
          recommendations.push(
            'Попробуй увеличить темп обучения до 3-5 заданий в день для достижения цели за 90 дней.'
          );
        }

        // Recommendation based on time of day
        const hour = state.learningVelocity.mostProductiveHour;
        recommendations.push(
          `Твоё самое продуктивное время: ${hour}:00. Планируй сложные задачи на это время.`
        );

        // Recommendation based on attempts
        const highAttemptTasks = state.taskAttempts.filter((a) => a.attempts > 3);
        if (highAttemptTasks.length > 0) {
          recommendations.push(
            'Некоторые задачи требуют много попыток. Попроси помощи у AI или пересмотри теорию.'
          );
        }

        set({ recommendations });
      },

      predictCompletionDate: () => {
        const state = get();
        const totalDays = 90;
        const completedDays = new Set(state.taskAttempts.map((a) => a.day)).size;
        const remainingDays = totalDays - completedDays;

        // Calculate average days per week
        const oldestAttempt = state.taskAttempts[0];
        if (!oldestAttempt) {
          // No data, assume 90 days from now
          return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        }

        const daysSinceStart = Math.ceil(
          (Date.now() - oldestAttempt.startTime) / (24 * 60 * 60 * 1000)
        );

        const daysPerDay = completedDays / Math.max(daysSinceStart, 1);
        const estimatedDaysToComplete = remainingDays / Math.max(daysPerDay, 0.1);

        return new Date(Date.now() + estimatedDaysToComplete * 24 * 60 * 60 * 1000);
      },

      loadFromServer: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/analytics/insights');

          console.log('[Analytics] Response status:', response.status);

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Необходима авторизация');
            } else if (response.status === 500) {
              const errorText = await response.text();
              console.error('[Analytics] Server error:', errorText);
              throw new Error('Данные аналитики временно недоступны');
            }
            throw new Error(`Ошибка ${response.status}`);
          }

          const data = await response.json();
          console.log('[Analytics] Data loaded');

          set({
            topicMastery: data.topicMastery || {},
            learningVelocity: data.learningVelocity || defaultVelocity,
            weakAreas: data.weakAreas || [],
            recommendations: data.recommendations || [],
            isLoading: false
          });
        } catch (error) {
          console.error('[Analytics] Error:', error);
          set({
            error: error instanceof Error ? error.message : 'Не удалось загрузить аналитику',
            isLoading: false,
            topicMastery: {},
            learningVelocity: defaultVelocity,
            weakAreas: [],
            recommendations: []
          });
        }
      },

      getWeakAreas: () => {
        return get().weakAreas;
      }
    }),
    {
      name: 'vibestudy-analytics',
      partialize: (state) => ({
        taskAttempts: state.taskAttempts,
        topicMastery: state.topicMastery,
        learningVelocity: state.learningVelocity,
        weakAreas: state.weakAreas,
        recommendations: state.recommendations
      })
    }
  )
);
