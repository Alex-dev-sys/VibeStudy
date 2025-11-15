import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';

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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const supabase = createClient();
    
    // Fetch all task attempts for the user
    const { data: attempts, error } = await supabase
      .from('task_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error('Error fetching analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }
    
    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        topicMastery: {},
        learningVelocity: {
          tasksPerDay: 0,
          averageSessionDuration: 0,
          mostProductiveHour: 14,
          weeklyTrend: [0, 0, 0, 0, 0, 0, 0]
        },
        weakAreas: [],
        recommendations: [],
        predictedCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    // Calculate topic mastery
    const topicMastery: Record<string, TopicMastery> = {};
    
    attempts.forEach((attempt: any) => {
      // Extract topic from taskId (e.g., "python-basics-task1" -> "python-basics")
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
      if (attempt.success) {
        topicMastery[topic].completedTasks++;
      }
    });
    
    // Calculate success rates and average times
    Object.keys(topicMastery).forEach((topic) => {
      const mastery = topicMastery[topic];
      mastery.successRate = (mastery.completedTasks / mastery.totalTasks) * 100;
      
      // Calculate average time for successful attempts
      const successfulAttempts = attempts.filter(
        (a: any): boolean => a.task_id.startsWith(topic) && a.success
      );
      
      if (successfulAttempts.length > 0) {
        const totalTime = successfulAttempts.reduce((sum: number, a: any) => {
          const start = new Date(a.start_time).getTime();
          const end = new Date(a.end_time).getTime();
          return sum + (end - start);
        }, 0);
        mastery.averageTime = totalTime / successfulAttempts.length;
      }
    });
    
    // Calculate weak areas
    const weakAreas = Object.values(topicMastery)
      .filter((m: TopicMastery) => m.successRate < 70)
      .map((m: TopicMastery) => m.topic);
    
    // Calculate learning velocity
    const completedDays = new Set(attempts.map((a: any) => a.day)).size;
    const oldestAttempt = attempts[0];
    const daysSinceStart = Math.ceil(
      (Date.now() - new Date(oldestAttempt.start_time).getTime()) / (24 * 60 * 60 * 1000)
    );
    
    const tasksPerDay = attempts.length / Math.max(daysSinceStart, 1);
    
    // Calculate average session duration
    const totalTime = attempts.reduce((sum: number, a: any) => {
      const start = new Date(a.start_time).getTime();
      const end = new Date(a.end_time).getTime();
      return sum + (end - start);
    }, 0);
    const averageSessionDuration = totalTime / attempts.length;
    
    // Calculate most productive hour
    const hourCounts: Record<number, number> = {};
    attempts.forEach((a: any) => {
      const hour = new Date(a.start_time).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const mostProductiveHour = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 14;
    
    // Calculate weekly trend (last 7 days)
    const weeklyTrend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      const dayAttempts = attempts.filter((a: any) => {
        const attemptTime = new Date(a.start_time).getTime();
        return attemptTime >= dayStart && attemptTime < dayEnd;
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
    console.error('Error in analytics insights endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
