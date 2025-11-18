/**
 * Centralized Logging System
 * Replaces console.log/warn/error with structured logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, levelName: string, message: string, context?: LogContext, error?: Error): void {
    if (level < this.level) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, context);

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, error || '');
        // TODO: Send to error tracking service in production
        // if (!this.isDevelopment) {
        //   errorTracker.captureException(error || new Error(message), { extra: context });
        // }
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, 'INFO', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, 'WARN', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, 'ERROR', message, context, error);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience functions
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);
export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context);
export const logError = (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context);

