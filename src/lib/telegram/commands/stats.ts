// /stats Command Handler
// Enhanced progress visualization

import type { BotResponse } from '@/types/telegram';
import { getUserProgress, getLearningAnalyticsSummary } from '../database';

/**
 * Create visual progress bar
 */
function createProgressBar(percent: number, length: number = 20): string {
  const filled = Math.floor((percent / 100) * length);
  const empty = length - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Get emoji for streak
 */
function getStreakEmoji(streak: number): string {
  if (streak === 0) return '💤';
  if (streak < 7) return '🔥';
  if (streak < 30) return '🔥🔥';
  if (streak < 60) return '🔥🔥🔥';
  return '🔥🔥🔥🏆';
}

/**
 * Get score emoji and rating
 */
function getScoreInfo(score: number): { emoji: string; rating: string } {
  if (score >= 90) return { emoji: '⭐⭐⭐', rating: 'Отлично!' };
  if (score >= 75) return { emoji: '⭐⭐', rating: 'Хорошо!' };
  if (score >= 60) return { emoji: '⭐', rating: 'Неплохо' };
  return { emoji: '📈', rating: 'Есть над чем работать' };
}

/**
 * Calculate velocity (days per week)
 */
function calculateVelocity(completedDays: number, totalDays: number): number {
  if (totalDays === 0) return 0;
  return Math.round((completedDays / totalDays) * 7 * 10) / 10;
}

/**
 * Format time duration
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}м`;
  if (mins === 0) return `${hours}ч`;
  return `${hours}ч ${mins}м`;
}

/**
 * Get day word form
 */
function getDayWord(days: number): string {
  const lastDigit = days % 10;
  const lastTwo = days % 100;

  if (lastTwo >= 11 && lastTwo <= 14) return 'дней';
  if (lastDigit === 1) return 'день';
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
  return 'дней';
}

export async function handleStatsCommand(
  userId: string,
  telegramUserId: number,
  chatId: number,
  args: string[]
): Promise<BotResponse> {
  if (!userId) {
    return {
      text: '⚠️ Сначала зарегистрируйся на сайте VibeStudy и укажи свой Telegram username в профиле.',
      parseMode: 'Markdown'
    };
  }

  try {
    // Get user progress data
    const progressResult = await getUserProgress(userId);
    const analyticsResult = await getLearningAnalyticsSummary(userId);

    const progress = progressResult.data;
    const analytics = analyticsResult.data;

    if (!progress) {
      return {
        text: '⚠️ Не удалось загрузить статистику.\n\nНачни обучение на сайте! 🚀',
        parseMode: 'Markdown',
        replyMarkup: {
          inline_keyboard: [
            [
              { text: '🌐 Открыть VibeStudy', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://vibestudy.com' }
            ]
          ]
        }
      };
    }

    const {
      current_day = 1,
      completed_days = 0,
      current_streak = 0,
      average_score = 0,
      language_id = 'python',
      total_tasks_completed = 0
    } = progress;

    const completionPercent = Math.round((completed_days / 90) * 100);
    const progressBar = createProgressBar(completionPercent);
    const streakEmoji = getStreakEmoji(current_streak);
    const scoreInfo = getScoreInfo(average_score);
    const velocity = calculateVelocity(completed_days, current_day);

    // Calculate estimated completion date
    const daysRemaining = 90 - completed_days;
    const weeksToComplete = velocity > 0 ? Math.ceil(daysRemaining / velocity) : 0;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (weeksToComplete * 7));
    const estimatedDateStr = weeksToComplete > 0 && weeksToComplete < 52
      ? estimatedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
      : 'неизвестно';

    // Analytics data
    const totalStudyTime = analytics?.total_study_time || 0;
    const avgEngagement = analytics?.avg_engagement || 0;
    const tasksAttempted = analytics?.total_tasks_attempted || 0;
    const successRate = tasksAttempted > 0
      ? Math.round((total_tasks_completed / tasksAttempted) * 100)
      : 0;

    const text = `📊 *Твоя статистика VibeStudy*

╔═══════════════════════╗
║  🎯 ПРОГРЕСС ОБУЧЕНИЯ  ║
╚═══════════════════════╝

📅 День: *${current_day}/90*
✅ Завершено: *${completed_days} ${getDayWord(completed_days)}* (${completionPercent}%)
${progressBar}

${streakEmoji} *Серия:* ${current_streak} ${getDayWord(current_streak)}
${scoreInfo.emoji} *Средний балл:* ${Math.round(average_score)}/100 (${scoreInfo.rating})
💻 *Язык:* ${language_id.toUpperCase()}

╔═══════════════════════╗
║  📈 АНАЛИТИКА         ║
╚═══════════════════════╝

⏱️ *Время обучения:* ${formatDuration(totalStudyTime)}
📝 *Задач решено:* ${total_tasks_completed}/${tasksAttempted}
${successRate > 0 ? `🎯 *Успешность:* ${successRate}%\n` : ''}📊 *Темп:* ${velocity} дней/неделю
${avgEngagement > 0 ? `💪 *Вовлечённость:* ${Math.round(avgEngagement)}%\n` : ''}
╔═══════════════════════╗
║  🎯 ПРОГНОЗ           ║
╚═══════════════════════╝

📆 *До финиша:* ${daysRemaining} ${getDayWord(daysRemaining)}
${velocity > 0 ? `⏳ *Примерная дата завершения:* ${estimatedDateStr}\n` : ''}${velocity < 4 ? '⚠️ *Рекомендация:* Увеличь темп до 4+ дней/неделю!\n' : ''}${current_streak === 0 ? '💡 *Совет:* Начни серию - занимайся каждый день!\n' : ''}
${completionPercent >= 30 ? '🎉 ' : ''}Продолжай в том же духе! 🚀`;

    return {
      text,
      parseMode: 'Markdown',
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '📈 Детальный прогресс', callback_data: 'stats:detailed' },
            { text: '📊 По темам', callback_data: 'stats:topics' }
          ],
          [
            { text: '📚 Открыть урок дня', url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vibestudy.com'}/learn` }
          ],
          [
            { text: '🔙 Назад', callback_data: 'btn_menu' }
          ]
        ]
      }
    };
  } catch (error) {
    console.error('Error fetching stats:', error);

    return {
      text: '❌ *Ошибка загрузки статистики*\n\nПопробуй позже или открой сайт.',
      parseMode: 'Markdown',
      replyMarkup: {
        inline_keyboard: [
          [
            { text: '🌐 Открыть VibeStudy', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://vibestudy.com' }
          ]
        ]
      }
    };
  }
}

