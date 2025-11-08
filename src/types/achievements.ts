export type AchievementCategory = 'progress' | 'streak' | 'tasks' | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  unlockedAt?: number;
}

export interface AchievementDefinition extends Omit<Achievement, 'unlockedAt'> {
  checkCondition: (stats: UserStats) => boolean;
}

export interface UserStats {
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  easyTasksCompleted: number;
  mediumTasksCompleted: number;
  hardTasksCompleted: number;
  challengeTasksCompleted: number;
  perfectDays: number; // дни, где все задачи выполнены
  totalTimeSpent: number; // в минутах
}

