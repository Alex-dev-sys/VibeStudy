/**
 * Error types and utilities for AI Assistant
 */

import { ErrorResponse } from './types';

/**
 * Error codes for AI Assistant
 */
export enum AssistantErrorCode {
  // Authentication Errors
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  INVALID_SESSION = 'INVALID_SESSION',
  EXPIRED_SUBSCRIPTION = 'EXPIRED_SUBSCRIPTION',
  
  // Validation Errors
  EMPTY_MESSAGE = 'EMPTY_MESSAGE',
  MESSAGE_TOO_LONG = 'MESSAGE_TOO_LONG',
  INVALID_REQUEST_TYPE = 'INVALID_REQUEST_TYPE',
  
  // Rate Limit Errors
  DAILY_LIMIT_EXCEEDED = 'DAILY_LIMIT_EXCEEDED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIER_LIMIT_REACHED = 'TIER_LIMIT_REACHED',
  
  // AI Service Errors
  AI_TIMEOUT = 'AI_TIMEOUT',
  AI_UNAVAILABLE = 'AI_UNAVAILABLE',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
}

/**
 * Custom error class for AI Assistant
 */
export class AssistantError extends Error {
  constructor(
    public code: AssistantErrorCode,
    public userMessage: string,
    public retryable: boolean = false,
    public upgradePrompt?: { tier: string; url: string }
  ) {
    super(userMessage);
    this.name = 'AssistantError';
  }

  toErrorResponse(): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        userMessage: this.userMessage,
        retryable: this.retryable,
        upgradePrompt: this.upgradePrompt,
      },
    };
  }
}

/**
 * Create error response for authentication errors
 */
export function createAuthError(code: AssistantErrorCode): AssistantError {
  const messages: Record<string, string> = {
    [AssistantErrorCode.NOT_AUTHENTICATED]: 'Пожалуйста, войдите в систему',
    [AssistantErrorCode.INVALID_SESSION]: 'Сессия истекла. Пожалуйста, войдите снова',
    [AssistantErrorCode.EXPIRED_SUBSCRIPTION]: 'Ваша подписка истекла',
  };

  return new AssistantError(
    code,
    messages[code] || 'Ошибка аутентификации',
    false,
    code === AssistantErrorCode.EXPIRED_SUBSCRIPTION
      ? { tier: 'premium', url: '/pricing' }
      : undefined
  );
}

/**
 * Create error response for validation errors
 */
export function createValidationError(code: AssistantErrorCode): AssistantError {
  const messages: Record<string, string> = {
    [AssistantErrorCode.EMPTY_MESSAGE]: 'Сообщение не может быть пустым',
    [AssistantErrorCode.MESSAGE_TOO_LONG]: 'Сообщение слишком длинное (максимум 2000 символов)',
    [AssistantErrorCode.INVALID_REQUEST_TYPE]: 'Неверный тип запроса',
  };

  return new AssistantError(
    code,
    messages[code] || 'Ошибка валидации',
    false
  );
}

/**
 * Create error response for rate limit errors
 */
export function createRateLimitError(code: AssistantErrorCode): AssistantError {
  const messages: Record<string, string> = {
    [AssistantErrorCode.DAILY_LIMIT_EXCEEDED]: 'Вы достигли дневного лимита запросов',
    [AssistantErrorCode.RATE_LIMIT_EXCEEDED]: 'Слишком много запросов. Пожалуйста, подождите',
    [AssistantErrorCode.TIER_LIMIT_REACHED]: 'Достигнут лимит для вашего тарифа',
  };

  return new AssistantError(
    code,
    messages[code] || 'Превышен лимит запросов',
    code === AssistantErrorCode.RATE_LIMIT_EXCEEDED,
    code === AssistantErrorCode.TIER_LIMIT_REACHED
      ? { tier: 'premium', url: '/pricing' }
      : undefined
  );
}

/**
 * Create error response for AI service errors
 */
export function createAIServiceError(code: AssistantErrorCode): AssistantError {
  const messages: Record<string, string> = {
    [AssistantErrorCode.AI_TIMEOUT]: 'Превышено время ожидания ответа',
    [AssistantErrorCode.AI_UNAVAILABLE]: 'AI сервис временно недоступен',
    [AssistantErrorCode.INVALID_RESPONSE]: 'Получен некорректный ответ от AI',
  };

  return new AssistantError(
    code,
    messages[code] || 'Ошибка AI сервиса',
    true
  );
}

/**
 * Create error response for network errors
 */
export function createNetworkError(code: AssistantErrorCode): AssistantError {
  const messages: Record<string, string> = {
    [AssistantErrorCode.NETWORK_ERROR]: 'Ошибка сети. Проверьте подключение',
    [AssistantErrorCode.REQUEST_TIMEOUT]: 'Превышено время ожидания',
    [AssistantErrorCode.SERVER_ERROR]: 'Ошибка сервера. Попробуйте позже',
  };

  return new AssistantError(
    code,
    messages[code] || 'Ошибка сети',
    true
  );
}
