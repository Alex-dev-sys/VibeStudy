import type { AchievementDefinition, UserStats } from '@/types/achievements';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Progress achievements
  {
    id: 'first_day',
    title: 'Первый шаг',
    description: 'Завершите первый день обучения',
    icon: '🎯',
    category: 'progress',
    requirement: 1,
    checkCondition: (stats) => stats.completedDays >= 1
  },
  {
    id: 'week_complete',
    title: 'Неделя позади',
    description: 'Завершите 7 дней обучения',
    icon: '📅',
    category: 'progress',
    requirement: 7,
    checkCondition: (stats) => stats.completedDays >= 7
  },
  {
    id: 'month_complete',
    title: 'Месяц упорства',
    description: 'Завершите 30 дней обучения',
    icon: '🗓️',
    category: 'progress',
    requirement: 30,
    checkCondition: (stats) => stats.completedDays >= 30
  },
  {
    id: 'two_months',
    title: 'Два месяца силы',
    description: 'Завершите 60 дней обучения',
    icon: '💪',
    category: 'progress',
    requirement: 60,
    checkCondition: (stats) => stats.completedDays >= 60
  },
  {
    id: 'course_complete',
    title: 'Junior разработчик!',
    description: 'Завершите все 90 дней курса',
    icon: '🎓',
    category: 'progress',
    requirement: 90,
    checkCondition: (stats) => stats.completedDays >= 90
  },

  // Streak achievements
  {
    id: 'streak_3',
    title: 'Начало серии',
    description: 'Учитесь 3 дня подряд',
    icon: '🔥',
    category: 'streak',
    requirement: 3,
    checkCondition: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'streak_7',
    title: 'Неделя без перерыва',
    description: 'Учитесь 7 дней подряд',
    icon: '🔥🔥',
    category: 'streak',
    requirement: 7,
    checkCondition: (stats) => stats.longestStreak >= 7
  },
  {
    id: 'streak_14',
    title: 'Две недели огня',
    description: 'Учитесь 14 дней подряд',
    icon: '🔥🔥🔥',
    category: 'streak',
    requirement: 14,
    checkCondition: (stats) => stats.longestStreak >= 14
  },
  {
    id: 'streak_30',
    title: 'Месяц без остановки',
    description: 'Учитесь 30 дней подряд',
    icon: '🔥🔥🔥🔥',
    category: 'streak',
    requirement: 30,
    checkCondition: (stats) => stats.longestStreak >= 30
  },

  // Task achievements
  {
    id: 'tasks_10',
    title: 'Первые 10 задач',
    description: 'Решите 10 задач',
    icon: '✅',
    category: 'tasks',
    requirement: 10,
    checkCondition: (stats) => stats.totalTasksCompleted >= 10
  },
  {
    id: 'tasks_50',
    title: '50 решений',
    description: 'Решите 50 задач',
    icon: '✅✅',
    category: 'tasks',
    requirement: 50,
    checkCondition: (stats) => stats.totalTasksCompleted >= 50
  },
  {
    id: 'tasks_100',
    title: 'Сотня задач',
    description: 'Решите 100 задач',
    icon: '💯',
    category: 'tasks',
    requirement: 100,
    checkCondition: (stats) => stats.totalTasksCompleted >= 100
  },
  {
    id: 'tasks_250',
    title: 'Мастер решений',
    description: 'Решите 250 задач',
    icon: '🏆',
    category: 'tasks',
    requirement: 250,
    checkCondition: (stats) => stats.totalTasksCompleted >= 250
  },
  {
    id: 'tasks_450',
    title: 'Легенда кода',
    description: 'Решите 450 задач',
    icon: '👑',
    category: 'tasks',
    requirement: 450,
    checkCondition: (stats) => stats.totalTasksCompleted >= 450
  },

  // Special achievements
  {
    id: 'perfect_day',
    title: 'Идеальный день',
    description: 'Решите все задачи дня',
    icon: '⭐',
    category: 'special',
    requirement: 1,
    checkCondition: (stats) => stats.perfectDays >= 1
  },
  {
    id: 'perfect_week',
    title: 'Идеальная неделя',
    description: 'Решите все задачи 7 дней подряд',
    icon: '🌟',
    category: 'special',
    requirement: 7,
    checkCondition: (stats) => stats.perfectDays >= 7
  },
  {
    id: 'challenge_master',
    title: 'Мастер челленджей',
    description: 'Решите 50 задач уровня Challenge',
    icon: '💎',
    category: 'special',
    requirement: 50,
    checkCondition: (stats) => stats.challengeTasksCompleted >= 50
  },
  {
    id: 'speed_learner',
    title: 'Скоростное обучение',
    description: 'Проведите 100+ часов за обучением',
    icon: '⚡',
    category: 'special',
    requirement: 6000, // 100 часов в минутах
    checkCondition: (stats) => stats.totalTimeSpent >= 6000
  },
  {
    id: 'night_owl',
    title: 'Ночная сова',
    description: 'Учитесь после полуночи',
    icon: '🦉',
    category: 'special',
    requirement: 1,
    checkCondition: () => {
      const hour = new Date().getHours();
      return hour >= 0 && hour < 6;
    }
  },
  {
    id: 'early_bird',
    title: 'Ранняя пташка',
    description: 'Учитесь до 6 утра',
    icon: '🐦',
    category: 'special',
    requirement: 1,
    checkCondition: () => {
      const hour = new Date().getHours();
      return hour >= 5 && hour < 8;
    }
  }
];

export function checkNewAchievements(
  stats: UserStats,
  unlockedAchievements: string[]
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(
    (achievement) =>
      !unlockedAchievements.includes(achievement.id) &&
      achievement.checkCondition(stats)
  );
}

export function getAchievementProgress(
  achievement: AchievementDefinition,
  stats: UserStats
): number {
  switch (achievement.id) {
    case 'first_day':
    case 'week_complete':
    case 'month_complete':
    case 'two_months':
    case 'course_complete':
      return Math.min((stats.completedDays / achievement.requirement) * 100, 100);
    
    case 'streak_3':
    case 'streak_7':
    case 'streak_14':
    case 'streak_30':
      return Math.min((stats.longestStreak / achievement.requirement) * 100, 100);
    
    case 'tasks_10':
    case 'tasks_50':
    case 'tasks_100':
    case 'tasks_250':
    case 'tasks_450':
      return Math.min((stats.totalTasksCompleted / achievement.requirement) * 100, 100);
    
    case 'perfect_day':
    case 'perfect_week':
      return Math.min((stats.perfectDays / achievement.requirement) * 100, 100);
    
    case 'challenge_master':
      return Math.min((stats.challengeTasksCompleted / achievement.requirement) * 100, 100);
    
    case 'speed_learner':
      return Math.min((stats.totalTimeSpent / achievement.requirement) * 100, 100);
    
    default:
      return achievement.checkCondition(stats) ? 100 : 0;
  }
}

