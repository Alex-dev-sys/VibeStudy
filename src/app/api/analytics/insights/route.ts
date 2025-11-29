import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import { errorHandler } from '@/lib/error-handler';

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
    const rateState = evaluateRateLimit(request, RATE_LIMITS.ANALYTICS, {
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
    
    // Fetch all task attempts for the user
    const { data: attempts, error } = await supabase
      .from('task_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
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
    
    // Calculate topic mastery
    const topicMastery: Record<string, TopicMastery> = {};
    
    attempts.forEach((attempt: any) => {
      try {
        // Extract topic from taskId (e.g., "python-basics-task1" -> "python-basics")
        if (!attempt.task_id || typeof attempt.task_id !== 'string') {
          return; // Skip invalid attempts
        }
        
        const topic = attempt.task_id.split('-').slice(0, -1).join('-') || 'general';
        
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
        // Use success field if available, otherwise fall back to is_correct
        const isSuccessful = attempt.success !== undefined 
          ? attempt.success 
          : (attempt.is_correct || false);
        if (isSuccessful) {
          topicMastery[topic].completedTasks++;
        }
      } catch (err) {
        // Skip invalid attempts
        logError('Error processing attempt', err as Error, {
          component: 'api/analytics/insights',
          metadata: { attempt }
        });
      }
    });
    
    // Calculate success rates and average times
    Object.keys(topicMastery).forEach((topic) => {
      try {
        const mastery = topicMastery[topic];
        mastery.successRate = (mastery.completedTasks / mastery.totalTasks) * 100;
        
        // Calculate average time for successful attempts
        const successfulAttempts = attempts.filter(
          (a: any): boolean => {
            if (!a.task_id || typeof a.task_id !== 'string') return false;
            const isSuccessful = a.success !== undefined ? a.success : (a.is_correct || false);
            return a.task_id.startsWith(topic) && isSuccessful;
          }
        );
        
        if (successfulAttempts.length > 0) {
          const totalTime = successfulAttempts.reduce((sum: number, a: any) => {
            try {
              // Try to use start_time/end_time, fallback to time_spent or created_at
              if (a.start_time && a.end_time) {
                const start = new Date(a.start_time).getTime();
                const end = new Date(a.end_time).getTime();
                if (!isNaN(start) && !isNaN(end) && end >= start) {
                  return sum + (end - start);
                }
              }
              // Fallback to time_spent (in seconds, convert to milliseconds)
              if (a.time_spent && typeof a.time_spent === 'number') {
                return sum + (a.time_spent * 1000);
              }
              return sum;
            } catch {
              return sum;
            }
          }, 0);
          mastery.averageTime = totalTime / successfulAttempts.length;
        }
      } catch (err) {
        logError('Error calculating mastery', err as Error, {
          component: 'api/analytics/insights',
          metadata: { topic }
        });
      }
    });
    
    // Calculate weak areas
    const weakAreas = Object.values(topicMastery)
      .filter((m: TopicMastery) => m.successRate < 70)
      .map((m: TopicMastery) => m.topic);
    
    // Calculate learning velocity
    const completedDays = new Set(
      attempts
        .map((a: any) => a.day)
        .filter((day: any) => day != null && !isNaN(Number(day)))
    ).size;
    
    // Find oldest attempt by start_time or created_at
    const oldestAttempt = attempts.find((a: any) => a.start_time || a.created_at);
    if (!oldestAttempt) {
      // Return default if no valid attempts
      return NextResponse.json({
        topicMastery: {},
        learningVelocity: defaultVelocity,
        weakAreas: [],
        recommendations: [],
        predictedCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    let daysSinceStart = 1;
    try {
      // Use start_time if available, otherwise use created_at
      const timestamp = oldestAttempt.start_time || oldestAttempt.created_at;
      if (timestamp) {
        const startTime = new Date(timestamp).getTime();
        if (!isNaN(startTime)) {
          daysSinceStart = Math.max(
            Math.ceil((Date.now() - startTime) / (24 * 60 * 60 * 1000)),
            1
          );
        }
      }
    } catch {
      // Use default value
    }
    
    const tasksPerDay = attempts.length / daysSinceStart;
    
    // Calculate average session duration
    let totalTime = 0;
    let validAttempts = 0;
    attempts.forEach((a: any) => {
      try {
        // Try start_time/end_time first
        if (a.start_time && a.end_time) {
          const start = new Date(a.start_time).getTime();
          const end = new Date(a.end_time).getTime();
          if (!isNaN(start) && !isNaN(end) && end >= start) {
            totalTime += (end - start);
            validAttempts++;
            return;
          }
        }
        // Fallback to time_spent (in seconds, convert to milliseconds)
        if (a.time_spent && typeof a.time_spent === 'number' && a.time_spent > 0) {
          totalTime += (a.time_spent * 1000);
          validAttempts++;
        }
      } catch {
        // Skip invalid attempts
      }
    });
    const averageSessionDuration = validAttempts > 0 ? totalTime / validAttempts : 0;
    
    // Calculate most productive hour
    const hourCounts: Record<number, number> = {};
    attempts.forEach((a: any) => {
      try {
        // Use start_time if available, otherwise use created_at
        const timestamp = a.start_time || a.created_at;
        if (!timestamp) {
          return;
        }
        const hour = new Date(timestamp).getHours();
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      } catch {
        // Skip invalid attempts
      }
    });
    const mostProductiveHour = Object.keys(hourCounts).length > 0
      ? Number(Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0]) || 14
      : 14;
    
    // Calculate weekly trend (last 7 days)
    const weeklyTrend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      const dayAttempts = attempts.filter((a: any) => {
        try {
          // Use start_time if available, otherwise use created_at
          const timestamp = a.start_time || a.created_at;
          if (!timestamp) {
            return false;
          }
          const attemptTime = new Date(timestamp).getTime();
          return !isNaN(attemptTime) && attemptTime >= dayStart && attemptTime < dayEnd;
        } catch {
          return false;
        }
      });
      
      weeklyTrend.push(dayAttempts.length);
    }
    
    const learningVelocity: LearningVelocity = {
      tasksPerDay,
      averageSessionDuration,
      mostProductiveHour: Number(mostProductiveHour),
      weeklyTrend
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
    
    const highAttemptTasks = attempts.filter((a: any) => a.attempts > 3);
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
