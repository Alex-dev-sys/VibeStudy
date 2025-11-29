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

  private log(level: LogLevel, levelName: string, message: string, context?: LogContext, error?: Error, ...args: unknown[]): void {
    if (level < this.level) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, context);

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage, ...args);
        }
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, error || '', ...args);
        // TODO: Send to error tracking service in production
        // if (!this.isDevelopment) {
        //   errorTracker.captureException(error || new Error(message), { extra: context });
        // }
        break;
    }
  }

  debug(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context, undefined, ...args);
  }

  info(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log(LogLevel.INFO, 'INFO', message, context, undefined, ...args);
  }

  warn(message: string, context?: LogContext, ...args: unknown[]): void {
    this.log(LogLevel.WARN, 'WARN', message, context, undefined, ...args);
  }

  error(message: string, error?: Error, context?: LogContext, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, 'ERROR', message, context, error, ...args);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience functions
export const logDebug = (message: string, context?: LogContext, ...args: unknown[]): void => logger.debug(message, context, ...args);
export const logInfo = (message: string, context?: LogContext, ...args: unknown[]): void => logger.info(message, context, ...args);
export const logWarn = (message: string, context?: LogContext, ...args: unknown[]): void => logger.warn(message, context, ...args);
export const logError = (message: string, error?: Error, context?: LogContext, ...args: unknown[]): void => logger.error(message, error, context, ...args);

