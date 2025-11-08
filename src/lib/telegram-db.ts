/**
 * Функции для работы с данными Telegram пользователей
 * Использует localStorage для хранения связи username <-> chatId
 */

interface TelegramUserData {
  telegramUsername: string;
  telegramChatId: number;
  reminderTime: string; // "09:00", "14:00", "19:00", "22:00"
  reminderEnabled: boolean;
  timezone: string;
  currentDay: number;
  completedDays: number;
  streak: number;
  averageScore: number;
  lastActivity: number;
  languageId: string;
}

const TELEGRAM_USERS_KEY = 'telegram-users';

/**
 * Сохранение связи Telegram username с chatId
 */
export function saveTelegramUser(username: string, chatId: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const users = getTelegramUsers();
    users[username] = {
      ...users[username],
      telegramUsername: username,
      telegramChatId: chatId,
      reminderEnabled: users[username]?.reminderEnabled ?? true,
      reminderTime: users[username]?.reminderTime ?? '19:00',
      timezone: users[username]?.timezone ?? 'Europe/Moscow'
    };
    
    localStorage.setItem(TELEGRAM_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Ошибка сохранения Telegram пользователя:', error);
  }
}

/**
 * Получение всех Telegram пользователей
 */
export function getTelegramUsers(): Record<string, Partial<TelegramUserData>> {
  if (typeof window === 'undefined') return {};
  
  try {
    const data = localStorage.getItem(TELEGRAM_USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Ошибка загрузки Telegram пользователей:', error);
    return {};
  }
}

/**
 * Получение chatId по username
 */
export function getChatIdByUsername(username: string): number | null {
  const users = getTelegramUsers();
  return users[username]?.telegramChatId ?? null;
}

/**
 * Обновление настроек напоминаний
 */
export function updateReminderSettings(
  username: string,
  settings: {
    reminderEnabled?: boolean;
    reminderTime?: string;
    timezone?: string;
  }
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const users = getTelegramUsers();
    if (users[username]) {
      users[username] = {
        ...users[username],
        ...settings
      };
      localStorage.setItem(TELEGRAM_USERS_KEY, JSON.stringify(users));
    }
  } catch (error) {
    console.error('Ошибка обновления настроек напоминаний:', error);
  }
}

/**
 * Получение пользователей для отправки напоминаний в определённый час
 * (В production это должно быть на сервере с реальной БД)
 */
export async function getUsersForReminder(hour: number): Promise<TelegramUserData[]> {
  // В реальном приложении это запрос к БД
  // Здесь возвращаем пустой массив, т.к. данные в localStorage
  return [];
}

/**
 * Проверка, подключен ли Telegram
 */
export function isTelegramConnected(username: string): boolean {
  const chatId = getChatIdByUsername(username);
  return chatId !== null;
}

export default {
  saveTelegramUser,
  getTelegramUsers,
  getChatIdByUsername,
  updateReminderSettings,
  getUsersForReminder,
  isTelegramConnected
};

