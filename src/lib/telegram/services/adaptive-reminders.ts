// Adaptive Reminder System
// Smart reminders that adapt to user behavior

import type { ReminderType, ReminderContext } from '@/types/telegram';
import { getUserProgress } from '../database';

interface AdaptiveReminderConfig {
  type: ReminderType;
  baseTime: string; // HH:MM
  adaptiveWeight: number; // 0-1, how much to adapt
  ignoreThreshold: number; // Ignore N times before changing time
}

const REMINDER_CONFIGS: Record<ReminderType, AdaptiveReminderConfig> = {
  daily_study: {
    type: 'daily_study',
    baseTime: '19:00',
    adaptiveWeight: 0.7,
    ignoreThreshold: 3
  },
  streak_protection: {
    type: 'streak_protection',
    baseTime: '21:00',
    adaptiveWeight: 0.9, // Highly adaptive - critical for streaks
    ignoreThreshold: 1 // Adapt quickly
  },
  milestone: {
    type: 'milestone',
    baseTime: '12:00',
    adaptiveWeight: 0, // Don't adapt - special event
    ignoreThreshold: 999
  },
  weekly_report: {
    type: 'weekly_report',
    baseTime: '09:00',
    adaptiveWeight: 0, // Fixed time
    ignoreThreshold: 999
  },
  daily_digest: {
    type: 'daily_digest',
    baseTime: '08:00',
    adaptiveWeight: 0.5,
    ignoreThreshold: 5
  }
};

/**
 * Determine if reminder should be sent based on user context
 */
export function shouldSendReminder(context: ReminderContext): {
  send: boolean;
  reason: string;
  priority: 'low' | 'medium' | 'high';
} {
  const { userId, reminderType, userProgress, lastActiveTime, hoursSinceLastActivity } = context;

  // Milestone reminders always send
  if (reminderType === 'milestone') {
    return {
      send: true,
      reason: 'Milestone achievement',
      priority: 'high'
    };
  }

  // Weekly reports always send on schedule
  if (reminderType === 'weekly_report') {
    return {
      send: true,
      reason: 'Scheduled weekly report',
      priority: 'medium'
    };
  }

  // Don't send if user was active recently (< 4 hours)
  if (hoursSinceLastActivity < 4) {
    return {
      send: false,
      reason: 'User recently active',
      priority: 'low'
    };
  }

  // STREAK PROTECTION: High priority if streak at risk
  if (reminderType === 'streak_protection') {
    const { streak } = userProgress;

    // Only send if:
    // 1. User has a streak (> 0)
    // 2. Haven't studied today (>= 12 hours)
    // 3. It's getting late (after 18:00)
    const now = new Date();
    const currentHour = now.getHours();

    if (streak > 0 && hoursSinceLastActivity >= 12 && currentHour >= 18) {
      return {
        send: true,
        reason: `Streak of ${streak} days at risk`,
        priority: 'high'
      };
    }

    return {
      send: false,
      reason: 'Streak not at risk yet',
      priority: 'low'
    };
  }

  // DAILY STUDY: Standard reminder
  if (reminderType === 'daily_study') {
    // Don't send if already studied today
    if (hoursSinceLastActivity < 12) {
      return {
        send: false,
        reason: 'Already studied today',
        priority: 'low'
      };
    }

    // Higher priority if falling behind
    const { currentDay, completedDays } = userProgress;
    const daysБehind = currentDay - completedDays;

    if (daysБehind > 3) {
      return {
        send: true,
        reason: `${daysБehind} days behind schedule`,
        priority: 'high'
      };
    }

    return {
      send: true,
      reason: 'Daily study reminder',
      priority: 'medium'
    };
  }

  // DAILY DIGEST: Send in the morning
  if (reminderType === 'daily_digest') {
    const now = new Date();
    const currentHour = now.getHours();

    // Only send between 7-10 AM
    if (currentHour >= 7 && currentHour <= 10) {
      return {
        send: true,
        reason: 'Morning digest',
        priority: 'low'
      };
    }

    return {
      send: false,
      reason: 'Outside digest hours',
      priority: 'low'
    };
  }

  return {
    send: false,
    reason: 'Unknown reminder type',
    priority: 'low'
  };
}

/**
 * Generate smart reminder message based on context
 */
export function generateReminderMessage(context: ReminderContext): string {
  const { reminderType, userProgress, hoursSinceLastActivity } = context;
  const { currentDay, completedDays, streak } = userProgress;

  switch (reminderType) {
    case 'streak_protection':
      return `🔥 Внимание! Твоя серия ${streak} ${getDayWord(streak)} под угрозой!\n\n` +
        `Ты не занимался уже ${Math.floor(hoursSinceLastActivity)} часов.\n` +
        `Не потеряй прогресс - открой урок дня! 💪\n\n` +
        `День ${currentDay}/90 ждёт тебя! 🚀`;

    case 'daily_study':
      const daysБehind = currentDay - completedDays;

      if (daysБehind > 3) {
        return `⚠️ Эй, ты отстаёшь на ${daysБehind} дней!\n\n` +
          `Но не переживай - можно наверстать! 💪\n` +
          `Начни с дня ${currentDay} сегодня.\n\n` +
          `Помни: от нуля до junior за 90 дней! 🎯`;
      }

      if (hoursSinceLastActivity > 48) {
        return `👋 Давно не виделись!\n\n` +
          `Прошло уже ${Math.floor(hoursSinceLastActivity / 24)} дней с последнего занятия.\n` +
          `Самое время вернуться к обучению! 📚\n\n` +
          `День ${currentDay}/90 - старт! 🚀`;
      }

      return `⏰ Время учиться!\n\n` +
        `📚 День ${currentDay}/90\n` +
        `✅ Завершено: ${completedDays} дней\n` +
        `🔥 Серия: ${streak} ${getDayWord(streak)}\n\n` +
        `Вперёд к новым знаниям! 💻`;

    case 'milestone':
      if (currentDay === 30) {
        return `🎉 ПОЗДРАВЛЯЮ! Целый месяц позади!\n\n` +
          `Ты прошёл 30 дней обучения! 🏆\n` +
          `Это невероятное достижение! 💪\n\n` +
          `Еще 60 дней - и ты junior! 🚀`;
      }

      if (currentDay === 60) {
        return `🔥 ДВА МЕСЯЦА! Ты настоящий герой!\n\n` +
          `60 дней непрерывного обучения! 🏅\n` +
          `Осталось всего 30 дней до цели! 🎯\n\n` +
          `Финишная прямая! 💻`;
      }

      if (currentDay === 90) {
        return `🎊 НЕВЕРОЯТНО! ТЫ СДЕЛАЛ ЭТО!\n\n` +
          `90 ДНЕЙ ЗАВЕРШЕНО! 🏆🏆🏆\n` +
          `От нуля до Junior Developer! 🎓\n\n` +
          `Ты легенда! Поздравляю! 🎉🎉🎉`;
      }

      if (completedDays % 10 === 0) {
        return `🌟 Промежуточный рубеж: ${completedDays} дней!\n\n` +
          `Ты молодец! Так держать! 💪\n` +
          `До финиша: ${90 - completedDays} дней 🎯`;
      }

      return `🎯 Веха пройдена: ${completedDays} дней! 🎉`;

    case 'weekly_report':
      const weekNumber = Math.ceil(completedDays / 7);
      return `📊 Недельный отчёт #${weekNumber}\n\n` +
        `📈 Твои результаты за неделю:\n` +
        `✅ Дней завершено: ${completedDays}\n` +
        `🔥 Текущая серия: ${streak}\n` +
        `💪 Продолжай в том же духе!\n\n` +
        `Команда VibeStudy гордится тобой! 🚀`;

    case 'daily_digest':
      return `☀️ Доброе утро!\n\n` +
        `📅 День ${currentDay}/90\n` +
        `🔥 Серия: ${streak} ${getDayWord(streak)}\n\n` +
        `План на сегодня:\n` +
        `📖 Изучить теорию\n` +
        `💻 Решить 5 задач\n` +
        `🎯 Закрепить материал\n\n` +
        `Удачного дня! 🚀`;

    default:
      return 'Пора учиться! 📚';
  }
}

/**
 * Calculate optimal reminder time based on user behavior
 */
export function calculateOptimalTime(
  userId: string,
  reminderType: ReminderType,
  ignoreCount: number,
  responseCount: number,
  peakHours: number[]
): string {
  const config = REMINDER_CONFIGS[reminderType];

  // Don't adapt if weight is 0
  if (config.adaptiveWeight === 0) {
    return config.baseTime;
  }

  // Don't adapt until threshold reached
  if (ignoreCount < config.ignoreThreshold) {
    return config.baseTime;
  }

  // Find best time based on peak activity hours
  if (peakHours && peakHours.length > 0) {
    const baseHour = parseInt(config.baseTime.split(':')[0]);

    // Sort peak hours by proximity to base time
    const sortedPeaks = [...peakHours].sort((a, b) => {
      const distA = Math.abs(a - baseHour);
      const distB = Math.abs(b - baseHour);
      return distA - distB;
    });

    // Use closest peak hour
    const optimalHour = sortedPeaks[0];
    const adaptedHour = Math.round(
      baseHour * (1 - config.adaptiveWeight) + optimalHour * config.adaptiveWeight
    );

    return `${String(adaptedHour).padStart(2, '0')}:00`;
  }

  return config.baseTime;
}

/**
 * Helper: Get correct word form for days
 */
function getDayWord(days: number): string {
  if (days % 10 === 1 && days % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
  return 'дней';
}

/**
 * Get Do-Not-Disturb status
 */
export function isInDoNotDisturbPeriod(
  currentTime: Date,
  dndStart?: string, // "22:00"
  dndEnd?: string    // "08:00"
): boolean {
  if (!dndStart || !dndEnd) return false;

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const [startHour, startMin] = dndStart.split(':').map(Number);
  const [endHour, endMin] = dndEnd.split(':').map(Number);
  const startTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = endHour * 60 + endMin;

  // Handle overnight DND (e.g., 22:00 - 08:00)
  if (startTotalMinutes > endTotalMinutes) {
    return currentTotalMinutes >= startTotalMinutes || currentTotalMinutes <= endTotalMinutes;
  }

  return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
}
