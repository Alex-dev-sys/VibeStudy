/**
 * Centralized error handling service.
 * Provides logging, reporting, retry hints and user-friendly messaging.
 */

import { logError, logWarn, logInfo } from '@/lib/logger';
import { isRetryableError } from '@/lib/sync/retry-logic';
import type { LogContext } from '@/lib/logger';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  severity?: ErrorSeverity;
}

export type ErrorListener = (error: Error, context?: ErrorContext) => void;

const ERROR_MESSAGE_MAP: Record<string, { title: string; message: string }> = {
  NETWORK_ERROR: {
    title: 'Проблемы с подключением',
    message: 'Не удалось связаться с сервером. Проверьте интернет и попробуйте снова.'
  },
  AUTH_ERROR: {
    title: 'Нужна авторизация',
    message: 'Сессия устарела. Перезайдите, чтобы продолжить.'
  },
  VALIDATION_ERROR: {
    title: 'Проверьте данные',
    message: 'Некоторые поля заполнены некорректно. Исправьте ошибки и повторите.'
  },
  RATE_LIMIT: {
    title: 'Слишком много запросов',
    message: 'Подождите несколько секунд перед повторной попыткой.'
  },
  SERVER_ERROR: {
    title: 'На сервере что-то пошло не так',
    message: 'Мы уже разбираемся. Попробуйте еще раз чуть позже.'
  }
};

export class ErrorHandler {
  private listeners: Set<ErrorListener> = new Set();

  handle(error: unknown, context?: ErrorContext): void {
    const normalized = this.normalizeError(error);
    logError(
      normalized.message,
      normalized,
      this.toLogContext(context)
    );

    for (const listener of this.listeners) {
      try {
        listener(normalized, context);
      } catch (listenerError) {
        logWarn('Error listener failed', {
          component: 'error-handler',
          action: 'notify-listeners',
          metadata: { listenerError: (listenerError as Error).message }
        });
      }
    }
  }

  report(error: unknown, context?: ErrorContext): void {
    const normalized = this.normalizeError(error);
    this.handle(normalized, context);

    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate Sentry / Logtail / Axiom here
    } else {
      logInfo('Report skipped (dev mode)', {
        component: 'error-handler',
        action: 'report',
        metadata: context?.metadata
      });
    }
  }

  /**
   * Convert known errors to user-friendly copy.
   */
  getUserMessage(error: unknown): { title: string; message: string } {
    const normalized = this.normalizeError(error);
    const message = normalized.message.toLowerCase();

    if (message.includes('auth') || message.includes('session')) {
      return ERROR_MESSAGE_MAP.AUTH_ERROR;
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ERROR_MESSAGE_MAP.NETWORK_ERROR;
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return ERROR_MESSAGE_MAP.VALIDATION_ERROR;
    }

    if (message.includes('rate limit') || message.includes('429')) {
      return ERROR_MESSAGE_MAP.RATE_LIMIT;
    }

    if (message.includes('server') || message.includes('500')) {
      return ERROR_MESSAGE_MAP.SERVER_ERROR;
    }

    return {
      title: 'Неизвестная ошибка',
      message: 'Что-то пошло не так. Попробуйте обновить страницу.'
    };
  }

  shouldRetry(error: unknown): boolean {
    const normalized = this.normalizeError(error);
    return isRetryableError(normalized);
  }

  addListener(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    return new Error('Unknown error');
  }

  private toLogContext(context?: ErrorContext): LogContext | undefined {
    if (!context) {
      return undefined;
    }

    return {
      component: context.component,
      action: context.action,
      userId: context.userId,
      metadata: {
        ...context.metadata,
        severity: context.severity
      }
    };
  }
}

export const errorHandler = new ErrorHandler();

