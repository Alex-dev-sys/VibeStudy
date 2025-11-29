import type { CallbackQuery, BotResponse } from '@/types/telegram';
import { getMainMenuKeyboard, getLeaderboardKeyboard, getQuestMenuKeyboard } from './keyboards';
import { questService } from './services/quests';
import { leaderboardService } from './services/leaderboard';

export async function handleCallbackQuery(
  callback: CallbackQuery,
  userId: string
): Promise<BotResponse | null> {
  const data = callback.data;

  if (!data) return null;

  // Parse callback data
  const [action, ...params] = data.split(':');

  // Handle simple buttons
  switch (data) {
    case 'btn_menu':
      return {
        text: '📋 *Главное меню*',
        parseMode: 'Markdown',
        replyMarkup: getMainMenuKeyboard()
      };

    case 'btn_lessons':
      return {
        text: '📚 *Уроки*\n\nЗдесь будет список доступных уроков.',
        parseMode: 'Markdown',
        // replyMarkup: getLessonsKeyboard()
      };

    case 'btn_stats':
      return {
        text: '📊 *Ваша статистика*\n\nИспользуйте /stats для детальной информации.',
        parseMode: 'Markdown'
      };

    case 'btn_leaderboard':
      return {
        text: '🏆 *Рейтинг*\n\nВыберите тип рейтинга:',
        parseMode: 'Markdown',
        replyMarkup: getLeaderboardKeyboard()
      };

    case 'btn_mentor':
      return {
        text: '❓ *AI Ментор*\n\nЗадайте свой вопрос с помощью команды /ask [вопрос]',
        parseMode: 'Markdown'
      };

    case 'btn_social':
      return {
        text: '👥 *Социум*\n\nСоциальные функции скоро будут доступны!',
        parseMode: 'Markdown'
      };

    case 'leaderboard_global':
      const globalData = await leaderboardService.getGlobalLeaderboard();
      const globalText = globalData
        .map((u, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          return `${medal} *${u.username}*\n   Lvl ${u.level} | ${u.tasks_solved} задач | ${u.xp} XP`;
        })
        .join('\n\n');
      return {
        text: `🌍 *Глобальный рейтинг*\n\n${globalText}`,
        parseMode: 'Markdown',
        replyMarkup: getLeaderboardKeyboard()
      };

    case 'leaderboard_weekly':
      const weeklyData = await leaderboardService.getWeeklyLeaderboard();
      const weeklyText = weeklyData
        .map((u, i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          return `${medal} *${u.username}*\n   ${u.tasks_solved} задач за неделю | ${u.xp} XP`;
        })
        .join('\n\n');
      return {
        text: `📅 *Недельный рейтинг*\n\n${weeklyText}`,
        parseMode: 'Markdown',
        replyMarkup: getLeaderboardKeyboard()
      };
  }

  // Handle dynamic buttons
  if (data.startsWith('quest_accept_')) {
    const questId = data.replace('quest_accept_', '');
    await questService.acceptQuest(callback.from.id, questId);
    return {
      text: `✅ Квест принят!`,
      parseMode: 'Markdown'
    };
  }

  // Legacy handlers
  switch (action) {
    case 'today_lesson':
      return {
        text: '📚 Открой сегодняшний урок на сайте VibeStudy!',
        parseMode: 'Markdown'
      };

    case 'my_progress':
      return {
        text: '📊 Используй /stats для просмотра статистики',
        parseMode: 'Markdown'
      };

    case 'get_advice':
      return {
        text: '💡 Используй /advice для получения персонального совета',
        parseMode: 'Markdown'
      };

    default:
      return {
        text: '❓ Неизвестное действие',
        parseMode: 'Markdown'
      };
  }
}

