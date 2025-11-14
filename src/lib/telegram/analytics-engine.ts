// Analytics Engine for learning pattern analysis

import type { LearningPattern, PredictionResult, RiskFactor, TimeSlot } from '@/types/telegram';
import { getLearningAnalytics, getAnalyticsSummary } from './database';

export async function analyzeLearningPattern(userId: string): Promise<LearningPattern> {
  const { data: analytics } = await getLearningAnalytics(userId, 30);
  
  if (!analytics || analytics.length === 0) {
    return getDefaultPattern();
  }

  // Analyze preferred study times
  const hourCounts = new Map<number, number>();
  analytics.forEach(day => {
    day.peak_hours?.forEach(hour => {
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
  });

  const preferredStudyTimes: TimeSlot[] = Array.from(hourCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({
      hour,
      productivity: Math.min(100, (count / analytics.length) * 100)
    }));

  // Calculate averages
  const totalDuration = analytics.reduce((sum, day) => sum + day.study_duration_minutes, 0);
  const totalSessions = analytics.reduce((sum, day) => sum + day.session_count, 0);
  const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

  // Study frequency (days per week)
  const studyFrequency = (analytics.length / 30) * 7;

  // Weak topics
  const weakTopicsSet = new Set<string>();
  analytics.forEach(day => {
    day.weak_topics?.forEach(topic => weakTopicsSet.add(topic));
  });

  return {
    preferredStudyTimes,
    averageSessionDuration,
    studyFrequency,
    focusTopics: [],
    weakTopics: Array.from(weakTopicsSet),
    learningVelocity: studyFrequency
  };
}

export async function predictCompletionDate(userId: string): Promise<PredictionResult> {
  const { data: summary } = await getAnalyticsSummary(userId);
  
  if (!summary || summary.total_days_tracked === 0) {
    return {
      estimatedCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      confidenceScore: 0,
      riskFactors: [{ 
        type: 'long_absence', 
        severity: 'high',
        description: 'Нет данных об обучении',
        suggestion: 'Начни обучение чтобы получить прогноз'
      }],
      recommendations: ['Начни с первого дня курса']
    };
  }

  // Calculate velocity (days per week)
  const daysSinceStart = Math.max(1, 
    (Date.now() - new Date(summary.last_activity_date).getTime()) / (24 * 60 * 60 * 1000)
  );
  const velocity = (summary.total_days_tracked / daysSinceStart) * 7;

  // Predict completion
  const remainingDays = 90 - summary.total_days_tracked;
  const weeksNeeded = velocity > 0 ? remainingDays / velocity : 999;
  const estimatedCompletionDate = new Date(Date.now() + weeksNeeded * 7 * 24 * 60 * 60 * 1000);

  // Detect risk factors
  const riskFactors: RiskFactor[] = [];
  
  if (velocity < 3) {
    riskFactors.push({
      type: 'low_velocity',
      severity: velocity < 1 ? 'high' : 'medium',
      description: `Низкая скорость обучения: ${velocity.toFixed(1)} дней/неделю`,
      suggestion: 'Увеличь время занятий до 30-60 минут в день'
    });
  }

  if (summary.avg_engagement < 50) {
    riskFactors.push({
      type: 'declining_engagement',
      severity: 'medium',
      description: 'Снижение вовлеченности',
      suggestion: 'Попробуй новые форматы обучения или сделай перерыв'
    });
  }

  // Confidence score
  const confidenceScore = Math.min(100, 
    (summary.total_days_tracked / 10) * 50 + 
    (velocity / 7) * 50
  );

  return {
    estimatedCompletionDate,
    confidenceScore: Math.round(confidenceScore),
    riskFactors,
    recommendations: generateRecommendations(velocity, riskFactors)
  };
}

export async function identifyOptimalStudyTime(userId: string): Promise<TimeSlot[]> {
  const pattern = await analyzeLearningPattern(userId);
  return pattern.preferredStudyTimes;
}

export async function calculateEngagementScore(userId: string): Promise<number> {
  const { data: summary } = await getAnalyticsSummary(userId);
  
  if (!summary) return 0;

  const completionRate = summary.total_tasks_attempted > 0
    ? (summary.total_tasks_completed / summary.total_tasks_attempted) * 100
    : 0;

  const consistencyScore = Math.min(100, (summary.total_days_tracked / 30) * 100);
  const engagementScore = (completionRate * 0.6 + consistencyScore * 0.4);

  return Math.round(engagementScore);
}

export async function detectRiskFactors(userId: string): Promise<RiskFactor[]> {
  const prediction = await predictCompletionDate(userId);
  return prediction.riskFactors;
}

function getDefaultPattern(): LearningPattern {
  return {
    preferredStudyTimes: [
      { hour: 9, productivity: 0 },
      { hour: 14, productivity: 0 },
      { hour: 19, productivity: 0 }
    ],
    averageSessionDuration: 0,
    studyFrequency: 0,
    focusTopics: [],
    weakTopics: [],
    learningVelocity: 0
  };
}

function generateRecommendations(velocity: number, riskFactors: RiskFactor[]): string[] {
  const recommendations: string[] = [];

  if (velocity < 3) {
    recommendations.push('Увеличь частоту занятий до 3-5 раз в неделю');
  }

  if (velocity > 7) {
    recommendations.push('Отличный темп! Не забывай про отдых');
  }

  if (riskFactors.length > 0) {
    recommendations.push('Обрати внимание на факторы риска');
  }

  if (recommendations.length === 0) {
    recommendations.push('Продолжай в том же духе!');
  }

  return recommendations;
}

