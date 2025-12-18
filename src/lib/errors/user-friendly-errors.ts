/**
 * User-Friendly Error Messages System
 * 
 * Provides clear, actionable error messages for users with appropriate
 * actions and recovery steps. Integrates with toast notifications.
 */

import { toast } from '@/lib/ui/toast';
import { logError, logWarn } from '@/lib/core/logger';
import type { LogContext } from '@/lib/core/logger';

export type ErrorType =
  | 'NETWORK_ERROR'
  | 'AI_GENERATION_FAILED'
  | 'AI_TIMEOUT'
  | 'AUTH_FAILED'
  | 'AUTH_SESSION_EXPIRED'
  | 'STORAGE_FULL'
  | 'STORAGE_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT'
  | 'SERVER_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'CODE_EXECUTION_FAILED'
  | 'SYNC_FAILED'
  | 'CACHE_ERROR'
  | 'UNKNOWN_ERROR';

export interface UserFriendlyError {
  type: ErrorType;
  title: string;
  message: string;
  action?: string;
  actionCallback?: () => void;
  recoverySteps?: string[];
  canRetry: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Comprehensive error message catalog with user-friendly descriptions
 */
export const ERROR_MESSAGES: Record<ErrorType, Omit<UserFriendlyError, 'type'>> = {
  NETWORK_ERROR: {
    title: 'Проблема с подключением',
    message: 'Не удалось связаться с сервером. Проверь интернет-соединение и попробуй снова.',
    action: 'Повторить',
    recoverySteps: [
      'Проверь подключение к интернету',
      'Попробуй перезагрузить страницу',
      'Если проблема сохраняется, попробуй позже'
    ],
    canRetry: true,
    severity: 'medium'
  },

  AI_GENERATION_FAILED: {
    title: 'Не удалось сгенерировать задания',
    message: 'AI временно недоступен. Попробуй через минуту или используй стандартные задания.',
    action: 'Использовать стандартные',
    recoverySteps: [
      'Подожди 1-2 минуты и попробуй снова',
      'Используй стандартные задания из библиотеки',
      'Проверь подключение к интернету'
    ],
    canRetry: true,
    severity: 'medium'
  },

  AI_TIMEOUT: {
    title: 'Генерация заняла слишком много времени',
    message: 'AI не успел сгенерировать контент. Попробуй упростить запрос или повтори попытку.',
    action: 'Попробовать снова',
    recoverySteps: [
      'Попробуй снова через несколько секунд',
      'Используй более простой запрос',
      'Проверь стабильность интернета'
    ],
    canRetry: true,
    severity: 'low'
  },

  AUTH_FAILED: {
    title: 'Ошибка входа',
    message: 'Не удалось войти в аккаунт. Проверь данные и попробуй снова.',
    action: 'Попробовать снова',
    recoverySteps: [
      'Проверь правильность email',
      'Убедись, что используешь правильный метод входа',
      'Попробуй войти через другой способ (Google, Email)'
    ],
    canRetry: true,
    severity: 'high'
  },

  AUTH_SESSION_EXPIRED: {
    title: 'Сессия истекла',
    message: 'Твоя сессия устарела. Войди снова, чтобы продолжить.',
    action: 'Войти',
    recoverySteps: [
      'Нажми "Войти" и авторизуйся снова',
      'Твой прогресс сохранён и будет восстановлен'
    ],
    canRetry: false,
    severity: 'high'
  },

  STORAGE_FULL: {
    title: 'Недостаточно места',
    message: 'Закончилось место в хранилище браузера. Очисти кэш или освободи место.',
    action: 'Понятно',
    recoverySteps: [
      'Очисти кэш браузера',
      'Удали ненужные данные с устройства',
      'Создай аккаунт для облачного хранения'
    ],
    canRetry: false,
    severity: 'high'
  },

  STORAGE_ERROR: {
    title: 'Ошибка сохранения',
    message: 'Не удалось сохранить данные. Твой прогресс может быть потерян.',
    action: 'Повторить',
    recoverySteps: [
      'Попробуй сохранить ещё раз',
      'Проверь доступное место на устройстве',
      'Создай аккаунт для надёжного сохранения'
    ],
    canRetry: true,
    severity: 'high'
  },

  VALIDATION_ERROR: {
    title: 'Проверь данные',
    message: 'Некоторые поля заполнены некорректно. Исправь ошибки и повтори.',
    action: 'Исправить',
    recoverySteps: [
      'Проверь все обязательные поля',
      'Убедись, что данные в правильном формате',
      'Следуй подсказкам под полями'
    ],
    canRetry: true,
    severity: 'low'
  },

  RATE_LIMIT: {
    title: 'Слишком много запросов',
    message: 'Ты отправил слишком много запросов. Подожди немного и попробуй снова.',
    action: 'Понятно',
    recoverySteps: [
      'Подожди 30-60 секунд',
      'Не отправляй запросы слишком часто',
      'Попробуй снова через минуту'
    ],
    canRetry: true,
    severity: 'medium'
  },

  SERVER_ERROR: {
    title: 'Ошибка на сервере',
    message: 'На сервере произошла ошибка. Мы уже работаем над исправлением.',
    action: 'Попробовать позже',
    recoverySteps: [
      'Подожди несколько минут',
      'Попробуй обновить страницу',
      'Если проблема не исчезает, сообщи нам'
    ],
    canRetry: true,
    severity: 'high'
  },

  NOT_FOUND: {
    title: 'Не найдено',
    message: 'Запрашиваемый ресурс не найден. Возможно, он был удалён или перемещён.',
    action: 'Вернуться',
    recoverySteps: [
      'Проверь правильность ссылки',
      'Вернись на главную страницу',
      'Попробуй найти нужный раздел через меню'
    ],
    canRetry: false,
    severity: 'low'
  },

  PERMISSION_DENIED: {
    title: 'Доступ запрещён',
    message: 'У тебя нет прав для выполнения этого действия.',
    action: 'Понятно',
    recoverySteps: [
      'Войди в аккаунт, если ещё не вошёл',
      'Проверь, что у тебя есть необходимые права',
      'Обратись к администратору, если нужен доступ'
    ],
    canRetry: false,
    severity: 'medium'
  },

  CODE_EXECUTION_FAILED: {
    title: 'Не удалось выполнить код',
    message: 'Произошла ошибка при выполнении кода. Проверь синтаксис и попробуй снова.',
    action: 'Проверить код',
    recoverySteps: [
      'Проверь код на синтаксические ошибки',
      'Убедись, что используешь правильный язык',
      'Попробуй упростить код для тестирования'
    ],
    canRetry: true,
    severity: 'low'
  },

  SYNC_FAILED: {
    title: 'Ошибка синхронизации',
    message: 'Не удалось синхронизировать данные с облаком. Изменения сохранены локально.',
    action: 'Повторить',
    recoverySteps: [
      'Проверь подключение к интернету',
      'Попробуй синхронизировать позже',
      'Данные сохранены локально и не потеряны'
    ],
    canRetry: true,
    severity: 'medium'
  },

  CACHE_ERROR: {
    title: 'Ошибка кэша',
    message: 'Не удалось загрузить данные из кэша. Загружаем свежие данные.',
    action: 'Понятно',
    recoverySteps: [
      'Данные будут загружены заново',
      'Это может занять немного больше времени',
      'Попробуй очистить кэш браузера'
    ],
    canRetry: false,
    severity: 'low'
  },

  UNKNOWN_ERROR: {
    title: 'Неизвестная ошибка',
    message: 'Что-то пошло не так. Попробуй обновить страницу или повтори действие.',
    action: 'Обновить страницу',
    recoverySteps: [
      'Обнови страницу (F5 или Cmd+R)',
      'Попробуй выполнить действие снова',
      'Если проблема повторяется, сообщи нам'
    ],
    canRetry: true,
    severity: 'medium'
  }
};

/**
 * Identify error type from error object or message
 */
export function identifyErrorType(error: unknown): ErrorType {
  if (!error) return 'UNKNOWN_ERROR';

  const errorMessage = error instanceof Error 
    ? error.message.toLowerCase() 
    : String(error).toLowerCase();

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('networkerror') ||
    errorMessage.includes('connection')
  ) {
    return 'NETWORK_ERROR';
  }

  // AI errors
  if (
    errorMessage.includes('ai_request_failed') ||
    errorMessage.includes('ai generation') ||
    errorMessage.includes('model') ||
    errorMessage.includes('hugging face')
  ) {
    return 'AI_GENERATION_FAILED';
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return 'AI_TIMEOUT';
  }

  // Auth errors
  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('401')
  ) {
    return 'AUTH_FAILED';
  }

  if (
    errorMessage.includes('session') ||
    errorMessage.includes('token expired') ||
    errorMessage.includes('jwt')
  ) {
    return 'AUTH_SESSION_EXPIRED';
  }

  // Storage errors
  if (
    errorMessage.includes('quota') ||
    errorMessage.includes('storage full') ||
    errorMessage.includes('disk space')
  ) {
    return 'STORAGE_FULL';
  }

  if (errorMessage.includes('storage') || errorMessage.includes('localstorage')) {
    return 'STORAGE_ERROR';
  }

  // Validation errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required')
  ) {
    return 'VALIDATION_ERROR';
  }

  // Rate limiting
  if (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('429')
  ) {
    return 'RATE_LIMIT';
  }

  // Server errors
  if (
    errorMessage.includes('server error') ||
    errorMessage.includes('500') ||
    errorMessage.includes('503') ||
    errorMessage.includes('internal server')
  ) {
    return 'SERVER_ERROR';
  }

  // Not found
  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return 'NOT_FOUND';
  }

  // Permission errors
  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('403')
  ) {
    return 'PERMISSION_DENIED';
  }

  // Code execution
  if (
    errorMessage.includes('execution') ||
    errorMessage.includes('runtime error') ||
    errorMessage.includes('syntax error')
  ) {
    return 'CODE_EXECUTION_FAILED';
  }

  // Sync errors
  if (errorMessage.includes('sync') || errorMessage.includes('synchronization')) {
    return 'SYNC_FAILED';
  }

  // Cache errors
  if (errorMessage.includes('cache')) {
    return 'CACHE_ERROR';
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Get user-friendly error details
 */
export function getUserFriendlyError(error: unknown): UserFriendlyError {
  const errorType = identifyErrorType(error);
  const errorDetails = ERROR_MESSAGES[errorType];

  return {
    type: errorType,
    ...errorDetails
  };
}

/**
 * Handle error with user-friendly toast notification
 * 
 * @param error - The error to handle
 * @param context - Additional context for logging
 * @param options - Options for error handling
 */
export interface HandleErrorOptions {
  showToast?: boolean;
  logError?: boolean;
  onRetry?: () => void;
  customMessage?: string;
  customTitle?: string;
}

export function handleError(
  error: unknown,
  context: string,
  options: HandleErrorOptions = {}
): UserFriendlyError {
  const {
    showToast = true,
    logError: shouldLog = true,
    onRetry,
    customMessage,
    customTitle
  } = options;

  const friendlyError = getUserFriendlyError(error);

  // Log error for debugging
  if (shouldLog) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logError(`[${context}] ${friendlyError.type}`, errorObj, {
      component: context,
      metadata: {
        errorType: friendlyError.type,
        severity: friendlyError.severity
      }
    });
  }

  // Show toast notification
  if (showToast) {
    const title = customTitle || friendlyError.title;
    const message = customMessage || friendlyError.message;

    if (friendlyError.severity === 'critical' || friendlyError.severity === 'high') {
      toast.error(title, message);
    } else if (friendlyError.severity === 'medium') {
      toast.warning(title, message);
    } else {
      toast.info(title, message);
    }
  }

  // Set retry callback if provided
  if (onRetry && friendlyError.canRetry) {
    friendlyError.actionCallback = onRetry;
  }

  return friendlyError;
}

/**
 * Handle error with automatic retry logic
 * 
 * @param error - The error to handle
 * @param context - Context for logging
 * @param retryFn - Function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 */
export async function handleErrorWithRetry<T>(
  error: unknown,
  context: string,
  retryFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T | null> {
  const friendlyError = handleError(error, context, { showToast: false });

  if (!friendlyError.canRetry) {
    handleError(error, context, { showToast: true });
    return null;
  }

  // Show loading toast
  const loadingToast = toast.loading(`Повторная попытка...`);

  let lastError: unknown = error;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
      await new Promise(resolve => setTimeout(resolve, delay));

      const result = await retryFn();
      
      toast.dismiss(loadingToast);
      toast.success('Успешно!', 'Операция выполнена');
      
      return result;
    } catch (retryError) {
      lastError = retryError;
      logWarn(`Retry attempt ${attempt}/${maxRetries} failed`, {
        component: context,
        metadata: { attempt, error: String(retryError) }
      });
    }
  }

  // All retries failed
  toast.dismiss(loadingToast);
  handleError(lastError, context, { showToast: true });
  
  return null;
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string,
  options: HandleErrorOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context, options);
      throw error;
    }
  }) as T;
}
