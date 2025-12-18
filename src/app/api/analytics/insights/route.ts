import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/core/rate-limit';
import { logError } from '@/lib/core/logger';
import { errorHandler } from '@/lib/core/error-handler';
import type { TaskAttemptAnalytics } from '@/types/database';

export const dynamic = 'force-dynamic';

interface TopicMastery {
  topic: string;
  totalTasks: number;
  completedTasks: number;
  successRate: number;
  averageTime: number;
}

interface LearningVelocity {
  tasksPerDay: number;
  averageSessionDuration: number;
  mostProductiveHour: number;
  weeklyTrend: number[];
}

interface AnalyticsInsights {
  topicMastery: Record<string, TopicMastery>;
  learningVelocity: LearningVelocity;
  weakAreas: string[];
  recommendations: string[];
  predictedCompletionDate: string;
}

const defaultVelocity: LearningVelocity = {
  tasksPerDay: 0,
  averageSessionDuration: 0,
  mostProductiveHour: 14,
  weeklyTrend: [0, 0, 0, 0, 0, 0, 0]
};

export async function GET(request: NextRequest) {
  try {
    const rateState = await evaluateRateLimit(request, RATE_LIMITS.ANALYTICS, {
      bucketId: 'analytics-insights'
    });

    if (!rateState.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: buildRateLimitHeaders(rateState) }
      );
    }

    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    let supabase;
    try {
      supabase = createClient();
    } catch (error) {
      logError('Error creating Supabase client', error as Error, {
        component: 'api/analytics/insights'
      });
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Fetch only necessary fields for analytics (instead of SELECT *)
    const { data: attempts, error } = await supabase
      .from('task_attempts')
      .select('task_id, success, is_correct, time_spent, start_time, end_time, created_at, day, attempts')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(10000); // Safety limit to prevent excessive data loads
    
    if (error) {
      logError('Error fetching analytics from database', error, {
        component: 'api/analytics/insights',
        metadata: {
          userId: user.id,
          errorCode: error.code,
          errorMessage: error.message
        }
      });
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }
    
    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        topicMastery: {},
        learningVelocity: defaultVelocity,
        weakAreas: [],
        recommendations: [],
        predictedCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // Single-pass calculation: topic mastery, time stats, and other metrics
    const topicMastery: Record<string, TopicMastery & { totalTime: number; successCount: number }> = {};
    const completedDaysSet = new Set<number>();
    const hourCounts: Record<number, number> = {};
    let totalTime = 0;
    let validAttempts = 0;
    let oldestTimestamp: number | null = null;
    const weeklyBuckets: number[] = [0, 0, 0, 0, 0, 0, 0];
    const now = Date.now();

    // Pre-calculate day boundaries for weekly trend
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartTime = weekStart.getTime();

    // Single loop through all attempts
    attempts.forEach((attempt: TaskAttemptAnalytics) => {
      try {
        // Extract topic from taskId
        if (!attempt.task_id || typeof attempt.task_id !== 'string') return;

        const topic = attempt.task_id.split('-').slice(0, -1).join('-') || 'general';
        const isSuccessful = attempt.success !== undefined ? attempt.success : (attempt.is_correct || false);

        // Initialize topic if needed
        if (!topicMastery[topic]) {
          topicMastery[topic] = {
            topic,
            totalTasks: 0,
            completedTasks: 0,
            successRate: 0,
            averageTime: 0,
            totalTime: 0,
            successCount: 0
          };
        }

        // Update topic stats
        topicMastery[topic].totalTasks++;
        if (isSuccessful) {
          topicMastery[topic].completedTasks++;
        }

        // Calculate time for this attempt
        let attemptTime = 0;
        if (attempt.start_time && attempt.end_time) {
          const start = new Date(attempt.start_time).getTime();
          const end = new Date(attempt.end_time).getTime();
          if (!isNaN(start) && !isNaN(end) && end >= start) {
            attemptTime = end - start;
          }
        } else if (attempt.time_spent && typeof attempt.time_spent === 'number' && attempt.time_spent > 0) {
          attemptTime = attempt.time_spent * 1000;
        }

        // Accumulate time for successful attempts in topic
        if (isSuccessful && attemptTime > 0) {
          topicMastery[topic].totalTime += attemptTime;
          topicMastery[topic].successCount++;
        }

        // Track overall session duration
        if (attemptTime > 0) {
          totalTime += attemptTime;
          validAttempts++;
        }

        // Track completed days
        if (attempt.day != null && !isNaN(Number(attempt.day))) {
          completedDaysSet.add(Number(attempt.day));
        }

        // Track oldest timestamp
        const timestamp = attempt.start_time || attempt.created_at;
        if (timestamp) {
          const ts = new Date(timestamp).getTime();
          if (!isNaN(ts)) {
            if (oldestTimestamp === null || ts < oldestTimestamp) {
              oldestTimestamp = ts;
            }

            // Track productive hours
            const hour = new Date(timestamp).getHours();
            if (!isNaN(hour) && hour >= 0 && hour <= 23) {
              hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            }

            // Track weekly trend (last 7 days)
            if (ts >= weekStartTime) {
              const dayIndex = Math.floor((ts - weekStartTime) / (24 * 60 * 60 * 1000));
              if (dayIndex >= 0 && dayIndex < 7) {
                weeklyBuckets[dayIndex]++;
              }
            }
          }
        }
      } catch (err) {
        // Skip invalid attempts silently
      }
    });

    // Finalize topic mastery calculations
    Object.values(topicMastery).forEach((mastery) => {
      mastery.successRate = (mastery.completedTasks / mastery.totalTasks) * 100;
      mastery.averageTime = mastery.successCount > 0
        ? mastery.totalTime / mastery.successCount
        : 0;
    });
    
    // Calculate weak areas using pre-calculated topic mastery
    const weakAreas = Object.values(topicMastery)
      .filter((m) => m.successRate < 70)
      .map((m) => m.topic);

    // Use pre-calculated values for learning velocity
    const completedDays = completedDaysSet.size;

    // Return default if no valid timestamps found
    if (oldestTimestamp === null) {
      return NextResponse.json({
        topicMastery: {},
        learningVelocity: defaultVelocity,
        weakAreas: [],
        recommendations: [],
        predictedCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    // Calculate days since start
    const daysSinceStart = Math.max(
      Math.ceil((now - oldestTimestamp) / (24 * 60 * 60 * 1000)),
      1
    );

    const tasksPerDay = attempts.length / daysSinceStart;
    const averageSessionDuration = validAttempts > 0 ? totalTime / validAttempts : 0;

    // Find most productive hour from pre-calculated counts
    const mostProductiveHour = Object.keys(hourCounts).length > 0
      ? Number(Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0]) || 14
      : 14;
    
    const learningVelocity: LearningVelocity = {
      tasksPerDay,
      averageSessionDuration,
      mostProductiveHour: Number(mostProductiveHour),
      weeklyTrend: weeklyBuckets
    };
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (weakAreas.length > 0) {
      recommendations.push(
        `Сосредоточься на темах: ${weakAreas.join(', ')}. Твой успех в этих областях ниже 70%.`
      );
    }
    
    if (tasksPerDay < 3) {
      recommendations.push(
        'Попробуй увеличить темп обучения до 3-5 заданий в день для достижения цели за 90 дней.'
      );
    }
    
    recommendations.push(
      `Твоё самое продуктивное время: ${mostProductiveHour}:00. Планируй сложные задачи на это время.`
    );
    
    const highAttemptTasks = attempts.filter((a: TaskAttemptAnalytics) => (a.attempts ?? 0) > 3);
    if (highAttemptTasks.length > 0) {
      recommendations.push(
        'Некоторые задачи требуют много попыток. Попроси помощи у AI или пересмотри теорию.'
      );
    }
    
    // Predict completion date
    const totalDays = 90;
    const remainingDays = totalDays - completedDays;
    const daysPerDay = completedDays / Math.max(daysSinceStart, 1);
    const estimatedDaysToComplete = remainingDays / Math.max(daysPerDay, 0.1);
    const predictedCompletionDate = new Date(
      Date.now() + estimatedDaysToComplete * 24 * 60 * 60 * 1000
    ).toISOString();
    
    const insights: AnalyticsInsights = {
      topicMastery,
      learningVelocity,
      weakAreas,
      recommendations,
      predictedCompletionDate
    };
    
    return NextResponse.json(insights);
  } catch (error) {
    logError('Error in analytics insights endpoint', error as Error, {
      component: 'api/analytics/insights'
    });
    errorHandler.report(error as Error, {
      component: 'api/analytics/insights',
      action: 'GET'
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
