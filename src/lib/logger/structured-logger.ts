/**
 * Structured Logger
 * Production-ready logging with levels, context, and proper formatting
 * Replaces console.log throughout the codebase
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogContext {
  [key: string]: any;
  userId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  duration?: number;
  statusCode?: number;
}

export interface LogEntry {
  timestamp: string;
  level: keyof typeof LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class StructuredLogger {
  private minLevel: LogLevel;
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.minLevel = this.getMinLogLevel();
  }

  private getMinLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel && envLevel in LogLevel) {
      return LogLevel[envLevel as keyof typeof LogLevel];
    }
    return this.environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatEntry(
    level: keyof typeof LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    const output = JSON.stringify(entry);

    // In development, use console for better DX
    if (this.environment === 'development') {
      const color = this.getConsoleColor(entry.level);
      console.log(`${color}[${entry.level}]${'\x1b[0m'} ${output}`);
      return;
    }

    // In production, use structured JSON to stdout
    // This can be consumed by log aggregation services (Datadog, CloudWatch, etc.)
    console.log(output);
  }

  private getConsoleColor(level: keyof typeof LogLevel): string {
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m', // Magenta
    };
    return colors[level] || '\x1b[0m';
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const entry = this.formatEntry('DEBUG', message, context);
    this.output(entry);
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const entry = this.formatEntry('INFO', message, context);
    this.output(entry);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const entry = this.formatEntry('WARN', message, context);
    this.output(entry);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const entry = this.formatEntry('ERROR', message, context, error);
    this.output(entry);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.FATAL)) return;
    const entry = this.formatEntry('FATAL', message, context, error);
    this.output(entry);
  }

  /**
   * Log API request/response
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const requestContext: LogContext = {
      ...context,
      statusCode,
      duration,
      component: 'api',
    };

    if (statusCode >= 500) {
      this.error(`${method} ${url}`, undefined, requestContext);
    } else if (statusCode >= 400) {
      this.warn(`${method} ${url}`, requestContext);
    } else {
      this.info(`${method} ${url}`, requestContext);
    }
  }

  /**
   * Log database operation
   */
  logDatabase(
    operation: string,
    table: string,
    duration: number,
    context?: LogContext
  ): void {
    this.debug(`Database ${operation} on ${table}`, {
      ...context,
      component: 'database',
      operation,
      table,
      duration,
    });
  }

  /**
   * Log authentication event
   */
  logAuth(event: string, userId?: string, success: boolean = true): void {
    const level = success ? 'INFO' : 'WARN';
    this[level.toLowerCase() as 'info' | 'warn'](`Auth: ${event}`, {
      component: 'auth',
      event,
      userId,
      success,
    });
  }
}

// Singleton instance
export const logger = new StructuredLogger();

// Convenience exports
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) =>
    logger.error(message, error, context),
  fatal: (message: string, error?: Error, context?: LogContext) =>
    logger.fatal(message, error, context),
  request: (
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ) => logger.logRequest(method, url, statusCode, duration, context),
  database: (operation: string, table: string, duration: number, context?: LogContext) =>
    logger.logDatabase(operation, table, duration, context),
  auth: (event: string, userId?: string, success?: boolean) =>
    logger.logAuth(event, userId, success),
};
