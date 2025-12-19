/**
 * Adaptive Learning System
 * Analyzes user progress and provides personalized recommendations
 */

import type {
  TaskAttempt,
  TopicMastery,
  LearningRecommendation,
  DayTaskWithTests
} from '@/types/curriculum';

export interface UserLearningProfile {
  userId: string;
  currentDay: number;
  tasksCompleted: number;
  totalTasksAttempted: number;

  // Performance metrics
  averageAttemptsPerTask: number;
  averageTimePerTask: number; // seconds
  hintsUsageRate: number; // 0-1

  // Mastery by topic
  topicMastery: Record<string, TopicMastery>;

  // Learning speed
  learningSpeed: 'slow' | 'normal' | 'fast';
  recommendedPace: number; // tasks per day

  // Weak and strong areas
  weakTopics: string[];
  strongTopics: string[];

  // Time patterns
  preferredStudyTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  averageSessionDuration: number; // minutes

  lastUpdated: Date;
}

/**
 * Calculate topic mastery based on task attempts
 */
export function calculateTopicMastery(
  attempts: TaskAttempt[],
  topic: string
): TopicMastery {
  const topicAttempts = attempts.filter(a =>
    a.taskId.includes(topic.toLowerCase())
  );

  if (topicAttempts.length === 0) {
    return {
      topic,
      level: 0,
      tasksCompleted: 0,
      tasksTotal: 0,
      averageAttempts: 0,
      lastPracticed: new Date()
    };
  }

  const completedTasks = topicAttempts.filter(a => a.completed);
  const averageAttempts =
    topicAttempts.reduce((sum, a) => sum + a.attemptNumber, 0) /
    topicAttempts.length;

  const averageTestsPass =
    topicAttempts.reduce(
      (sum, a) => sum + (a.testsPassedCount / a.totalTestsCount),
      0
    ) / topicAttempts.length;

  // Calculate mastery level (0-100)
  const completionRate = completedTasks.length / topicAttempts.length;
  const efficiencyScore = Math.max(0, 1 - (averageAttempts - 1) / 5); // Penalize many attempts
  const accuracyScore = averageTestsPass;

  const level = Math.round(
    (completionRate * 0.4 + efficiencyScore * 0.3 + accuracyScore * 0.3) * 100
  );

  return {
    topic,
    level,
    tasksCompleted: completedTasks.length,
    tasksTotal: topicAttempts.length,
    averageAttempts,
    lastPracticed: topicAttempts[topicAttempts.length - 1].timestamp
  };
}

/**
 * Analyze user's learning profile from attempts history
 */
export function analyzeLearningProfile(
  userId: string,
  attempts: TaskAttempt[],
  currentDay: number
): UserLearningProfile {
  const completedAttempts = attempts.filter(a => a.completed);

  // Calculate averages
  const averageAttemptsPerTask =
    attempts.reduce((sum, a) => sum + a.attemptNumber, 0) / attempts.length || 1;

  const averageTimePerTask =
    attempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0) / attempts.length ||
    0;

  const hintsUsageRate =
    attempts.reduce((sum, a) => sum + a.hintsUsed, 0) /
      (attempts.length * 3) || // Assume max 3 hints per task
    0;

  // Determine learning speed
  const tasksPerDay = completedAttempts.length / Math.max(currentDay, 1);
  const learningSpeed: 'slow' | 'normal' | 'fast' =
    tasksPerDay < 3 ? 'slow' : tasksPerDay > 7 ? 'fast' : 'normal';

  // Calculate topic mastery
  const topics = extractTopicsFromAttempts(attempts);
  const topicMastery: Record<string, TopicMastery> = {};

  for (const topic of topics) {
    topicMastery[topic] = calculateTopicMastery(attempts, topic);
  }

  // Identify weak and strong topics
  const masteryEntries = Object.entries(topicMastery);
  const weakTopics = masteryEntries
    .filter(([_, m]) => m.level < 60)
    .map(([topic]) => topic)
    .slice(0, 5);

  const strongTopics = masteryEntries
    .filter(([_, m]) => m.level >= 80)
    .map(([topic]) => topic)
    .slice(0, 5);

  return {
    userId,
    currentDay,
    tasksCompleted: completedAttempts.length,
    totalTasksAttempted: attempts.length,
    averageAttemptsPerTask,
    averageTimePerTask,
    hintsUsageRate,
    topicMastery,
    learningSpeed,
    recommendedPace: calculateRecommendedPace(learningSpeed, weakTopics.length),
    weakTopics,
    strongTopics,
    averageSessionDuration: averageTimePerTask / 60,
    lastUpdated: new Date()
  };
}

/**
 * Extract topics from task attempts
 */
function extractTopicsFromAttempts(attempts: TaskAttempt[]): string[] {
  const topics = new Set<string>();

  for (const attempt of attempts) {
    // Extract topic from task ID (e.g., "day1-loops-task1" -> "loops")
    const parts = attempt.taskId.split('-');
    if (parts.length >= 2) {
      topics.add(parts[1]);
    }
  }

  return Array.from(topics);
}

/**
 * Calculate recommended pace based on performance
 */
function calculateRecommendedPace(
  learningSpeed: 'slow' | 'normal' | 'fast',
  weakTopicsCount: number
): number {
  let basePace = learningSpeed === 'slow' ? 3 : learningSpeed === 'fast' ? 7 : 5;

  // Reduce pace if there are many weak topics
  if (weakTopicsCount > 3) {
    basePace = Math.max(2, basePace - 2);
  }

  return basePace;
}

/**
 * Generate personalized learning recommendations
 */
export function generateRecommendations(
  profile: UserLearningProfile,
  currentDayTasks: DayTaskWithTests[]
): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = [];

  // Check for weak topics that need review
  for (const weakTopic of profile.weakTopics) {
    const mastery = profile.topicMastery[weakTopic];

    if (mastery && mastery.level < 50) {
      recommendations.push({
        type: 'review',
        topic: weakTopic,
        reason: `Низкий уровень освоения (${mastery.level}%). Рекомендуем повторить базовые концепции.`,
        priority: 'high'
      });
    } else if (mastery && mastery.level < 70) {
      recommendations.push({
        type: 'practice',
        topic: weakTopic,
        reason: `Средний уровень освоения (${mastery.level}%). Нужно больше практики.`,
        priority: 'medium'
      });
    }
  }

  // Check if user is moving too fast
  if (profile.averageAttemptsPerTask > 4) {
    recommendations.push({
      type: 'slow_down',
      topic: 'general',
      reason: 'Ты делаешь много попыток на задачу. Попробуй замедлиться и лучше понять концепции перед решением.',
      priority: 'high'
    });
  }

  // Check if user can advance faster
  if (
    profile.learningSpeed === 'fast' &&
    profile.weakTopics.length === 0 &&
    profile.averageAttemptsPerTask < 2
  ) {
    recommendations.push({
      type: 'advance',
      topic: 'general',
      reason: 'Ты отлично справляешься! Можешь попробовать более сложные задачи или увеличить темп.',
      priority: 'low'
    });
  }

  // Check for long time since last practice on topics
  const now = new Date();
  for (const [topic, mastery] of Object.entries(profile.topicMastery)) {
    const daysSinceLastPractice =
      (now.getTime() - mastery.lastPracticed.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastPractice > 7 && mastery.level < 90) {
      recommendations.push({
        type: 'review',
        topic,
        reason: `Прошло ${Math.round(daysSinceLastPractice)} дней с последней практики. Повтори материал, чтобы не забыть!`,
        priority: 'medium'
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return recommendations.slice(0, 5); // Return top 5
}

/**
 * Adjust task difficulty based on user performance
 */
export function getAdaptiveTasks(
  profile: UserLearningProfile,
  tasks: DayTaskWithTests[]
): DayTaskWithTests[] {
  const overallMastery =
    Object.values(profile.topicMastery).reduce((sum, m) => sum + m.level, 0) /
      Object.keys(profile.topicMastery).length || 50;

  // If user is struggling, provide more easy tasks
  if (overallMastery < 50 || profile.averageAttemptsPerTask > 4) {
    return tasks.filter(t => t.difficulty === 'easy' || t.difficulty === 'medium');
  }

  // If user is doing very well, provide more challenging tasks
  if (overallMastery > 80 && profile.averageAttemptsPerTask < 2) {
    return tasks.filter(t => t.difficulty === 'medium' || t.difficulty === 'hard');
  }

  // Default: return all tasks
  return tasks;
}

/**
 * Calculate spaced repetition schedule
 */
export function calculateReviewSchedule(
  mastery: TopicMastery,
  lastReviewDate: Date
): Date {
  const now = new Date();
  const daysSinceReview =
    (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24);

  // Spaced repetition intervals based on mastery level
  let interval: number;

  if (mastery.level < 50) {
    interval = 1; // Review daily
  } else if (mastery.level < 70) {
    interval = 3; // Review every 3 days
  } else if (mastery.level < 85) {
    interval = 7; // Review weekly
  } else {
    interval = 14; // Review bi-weekly
  }

  const nextReview = new Date(lastReviewDate);
  nextReview.setDate(nextReview.getDate() + interval);

  return nextReview;
}

/**
 * Predict when user will complete the course
 */
export function predictCompletionDate(
  profile: UserLearningProfile,
  totalDays: number = 90
): { date: Date; confidence: 'high' | 'medium' | 'low' } {
  const daysRemaining = totalDays - profile.currentDay;
  const tasksPerDay = profile.tasksCompleted / Math.max(profile.currentDay, 1);

  // Adjust based on learning speed
  const adjustedTasksPerDay =
    profile.learningSpeed === 'fast'
      ? tasksPerDay * 1.2
      : profile.learningSpeed === 'slow'
        ? tasksPerDay * 0.8
        : tasksPerDay;

  const estimatedDaysToComplete = daysRemaining / Math.max(adjustedTasksPerDay, 1);

  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + Math.ceil(estimatedDaysToComplete));

  // Confidence based on consistency
  const confidence =
    profile.currentDay < 10
      ? 'low'
      : profile.currentDay < 30
        ? 'medium'
        : 'high';

  return { date: completionDate, confidence };
}
