/**
 * Console Interceptor for Playground
 * Captures console.log, console.error, console.warn, console.info calls
 */

export interface CapturedMessage {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
}

export class ConsoleInterceptor {
  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
  };
  
  private messages: CapturedMessage[] = [];
  private isIntercepting = false;
  
  constructor() {
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
  }
  
  start(): void {
    if (this.isIntercepting) return;
    
    this.isIntercepting = true;
    this.messages = [];
    
    // Intercept console.log
    console.log = (...args: any[]) => {
      this.capture('log', args);
      this.originalConsole.log(...args);
    };
    
    // Intercept console.error
    console.error = (...args: any[]) => {
      this.capture('error', args);
      this.originalConsole.error(...args);
    };
    
    // Intercept console.warn
    console.warn = (...args: any[]) => {
      this.capture('warn', args);
      this.originalConsole.warn(...args);
    };
    
    // Intercept console.info
    console.info = (...args: any[]) => {
      this.capture('info', args);
      this.originalConsole.info(...args);
    };
  }
  
  stop(): void {
    if (!this.isIntercepting) return;
    
    this.isIntercepting = false;
    
    // Restore original console methods
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
  }
  
  getMessages(): CapturedMessage[] {
    return [...this.messages];
  }
  
  clear(): void {
    this.messages = [];
  }
  
  private capture(type: CapturedMessage['type'], args: any[]): void {
    const message = args
      .map((arg) => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');
    
    // Capture stack trace for errors
    let stack: string | undefined;
    if (type === 'error') {
      const error = args.find((arg) => arg instanceof Error);
      if (error) {
        stack = error.stack;
      } else {
        // Create a stack trace
        const stackTrace = new Error().stack;
        if (stackTrace) {
          // Remove the first 3 lines (Error, this function, console.error)
          stack = stackTrace.split('\n').slice(3).join('\n');
        }
      }
    }
    
    this.messages.push({
      type,
      message,
      stack
    });
  }
}

// Singleton instance
let interceptor: ConsoleInterceptor | null = null;

export function getConsoleInterceptor(): ConsoleInterceptor {
  if (!interceptor) {
    interceptor = new ConsoleInterceptor();
  }
  return interceptor;
}
