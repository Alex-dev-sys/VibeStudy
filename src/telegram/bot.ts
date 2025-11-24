/**
 * Telegram Bot для VibeStudy
 * 
 * Функции:
 * - Напоминания о занятиях
 * - Персональные советы по обучению
 * - Статистика прогресса
 * - Мотивационные сообщения
 */

import { logError } from '@/lib/logger';
import { getDictionary } from '@/lib/i18n/dictionaries';

interface TelegramUser {
  chatId: number;
  username: string;
  firstName?: string;
  lastName?: string;
}

interface UserProgress {
  username: string;
  currentDay: number;
  completedDays: number;
  streak: number;
  averageScore: number;
  lastActivity: number;
  languageId: string;
}

interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

interface ReplyKeyboardMarkup {
  keyboard: Array<Array<{ text: string }>>;
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
}

interface InlineKeyboardMarkup {
  inline_keyboard: Array<Array<InlineKeyboardButton>>;
}

type ReplyMarkup = ReplyKeyboardMarkup | InlineKeyboardMarkup;

interface BotMessage {
  chatId: number;
  text: string;
  parseMode?: 'Markdown' | 'HTML';
  replyMarkup?: ReplyMarkup;
}

/**
 * Отправка сообщения через Telegram Bot API
 */
export async function sendTelegramMessage(message: BotMessage): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    logError('TELEGRAM_BOT_TOKEN не установлен', undefined, { component: 'telegram-bot' });
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chatId,
        text: message.text,
        parse_mode: message.parseMode || 'Markdown',
        reply_markup: message.replyMarkup
      })
    });

    if (!response.ok) {
      const error = await response.text();
      logError('Ошибка отправки Telegram сообщения', new Error(error), { component: 'telegram-bot', metadata: { chatId: message.chatId } });
      return false;
    }

    return true;
  } catch (error) {
    logError('Ошибка при отправке в Telegram', error as Error, { component: 'telegram-bot', metadata: { chatId: message.chatId } });
    return false;
  }
}

/**
 * Генерация мотивационного сообщения на основе прогресса
 */
export function generateMotivationalMessage(progress: UserProgress, locale: 'ru' | 'en' = 'ru'): string {
  const { currentDay, completedDays, streak, averageScore, lastActivity } = progress;
  const { telegram } = getDictionary(locale);

  const hoursSinceLastActivity = (Date.now() - lastActivity) / (1000 * 60 * 60);

  // Напоминание, если давно не занимался
  if (hoursSinceLastActivity > 24) {
    return telegram.motivational.reminder(Math.floor(hoursSinceLastActivity), currentDay);
  }

  // Поздравление с серией
  if (streak >= 7) {
    return telegram.motivational.streak(streak);
  }

  // Поддержка при низких баллах
  if (averageScore < 50) {
    return telegram.motivational.lowScore;
  }

  // Стандартное напоминание
  return telegram.motivational.standard(currentDay, completedDays, Math.round(averageScore));
}

/**
 * Генерация персонального совета на основе аналитики
 */
export function generatePersonalizedAdvice(progress: UserProgress, weakAreas?: string[], locale: 'ru' | 'en' = 'ru'): string {
  const { currentDay, averageScore, streak } = progress;
  const { telegram } = getDictionary(locale);

  let advice = telegram.advice.header(currentDay);

  // Анализ слабых мест
  if (weakAreas && weakAreas.length > 0) {
    advice += telegram.advice.weakAreas(weakAreas.slice(0, 3));
  }

  // Рекомендации по темпу
  if (currentDay > 30 && averageScore > 80) {
    advice += telegram.advice.goodProgress;
  } else if (averageScore < 60) {
    advice += telegram.advice.slowDown;
  }

  // Мотивация по серии
  if (streak === 0) {
    advice += telegram.advice.startStreak;
  }

  advice += telegram.advice.footer;

  return advice;
}

/**
 * Форматирование статистики для отправки в Telegram
 */
export function formatProgressStats(progress: UserProgress): string {
  const { currentDay, completedDays, streak, averageScore, languageId } = progress;

  const progressPercent = Math.round((completedDays / 90) * 100);
  const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));

  return `📊 *Твоя статистика VibeStudy*\n\n` +
    `🎯 Текущий день: ${currentDay}/90\n` +
    `✅ Завершено: ${completedDays} дней (${progressPercent}%)\n` +
    `${progressBar}\n\n` +
    `🔥 Серия: ${streak} ${streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}\n` +
    `⭐ Средний балл: ${Math.round(averageScore)}/100\n` +
    `💻 Язык: ${languageId.toUpperCase()}\n\n` +
    `Продолжай в том же духе! 🚀`;
}

/**
 * Обработка команд бота
 */
export function handleBotCommand(command: string, progress?: UserProgress): string {
  switch (command) {
    case '/start':
      return `👋 Привет! Я бот VibeStudy.\n\n` +
        `Помогу тебе:\n` +
        `• Напоминать о занятиях\n` +
        `• Отслеживать прогресс\n` +
        `• Давать персональные советы\n\n` +
        `Команды:\n` +
        `/stats - Твоя статистика\n` +
        `/advice - Персональный совет\n` +
        `/remind - Настроить напоминания\n` +
        `/help - Помощь\n\n` +
        `Укажи свой Telegram username в профиле VibeStudy для связи!`;

    case '/help':
      return `📖 *Помощь*\n\n` +
        `*Доступные команды:*\n` +
        `/start - Начать работу с ботом\n` +
        `/stats - Показать статистику обучения\n` +
        `/advice - Получить персональный совет\n` +
        `/remind - Настроить напоминания\n` +
        `/help - Эта справка\n\n` +
        `*Как это работает:*\n` +
        `1. Укажи свой Telegram username в профиле на сайте\n` +
        `2. Бот автоматически свяжется с тобой\n` +
        `3. Получай напоминания и советы!\n\n` +
        `Вопросы? Пиши в поддержку!`;

    case '/stats':
      if (!progress) {
        return `⚠️ Не удалось загрузить статистику.\n\nУбедись, что твой Telegram username указан в профиле VibeStudy.`;
      }
      return formatProgressStats(progress);

    case '/advice':
      if (!progress) {
        return `⚠️ Не удалось загрузить данные.\n\nУкажи свой Telegram username в профиле VibeStudy.`;
      }
      return generatePersonalizedAdvice(progress);

    case '/remind':
      return `⏰ *Настройка напоминаний*\n\n` +
        `Выбери удобное время для напоминаний:\n\n` +
        `🌅 Утро (9:00)\n` +
        `☀️ День (14:00)\n` +
        `🌆 Вечер (19:00)\n` +
        `🌙 Ночь (22:00)\n\n` +
        `Или отключи напоминания в настройках профиля на сайте.`;

    default:
      return `❓ Неизвестная команда.\n\nИспользуй /help для списка доступных команд.`;
  }
}

/**
 * Проверка, нужно ли отправить напоминание
 */
export function shouldSendReminder(
  lastActivity: number,
  reminderTime: string,
  timezone: string = 'Europe/Moscow'
): boolean {
  const now = new Date();
  const hoursSinceActivity = (now.getTime() - lastActivity) / (1000 * 60 * 60);

  // Не напоминать, если занимался менее 12 часов назад
  if (hoursSinceActivity < 12) {
    return false;
  }

  // Проверка времени напоминания
  const currentHour = now.getHours();
  const reminderHour = parseInt(reminderTime.split(':')[0]);

  return currentHour === reminderHour;
}

const botFunctions = {
  sendTelegramMessage,
  generateMotivationalMessage,
  generatePersonalizedAdvice,
  formatProgressStats,
  handleBotCommand,
  shouldSendReminder
};

export default botFunctions;
