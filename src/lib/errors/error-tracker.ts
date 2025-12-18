/**
 * Error Tracking System
 * 
 * Tracks errors for debugging and analytics purposes.
 * Provides insights into error patterns and helps identify issues.
 */

import { logInfo, logWarn } from '@/lib/core/logger';
import type { ErrorType } from './user-friendly-errors';

export interface ErrorEvent {
  id: string;
  type: ErrorType;
  message: string;
  stack?: string;
  context: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsByContext: Record<string, number>;
  recentErrors: ErrorEvent[];
  errorRate: number; // errors per minute
}

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private maxStoredErrors = 100;
  private storageKey = 'vibestudy-error-log';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Track an error event
   */
  track(
    error: unknown,
    type: ErrorType,
    context: string,
    metadata?: Record<string, unknown>
  ): void {
    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      type,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      metadata
    };

    this.errors.push(errorEvent);

    // Keep only recent errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(-this.maxStoredErrors);
    }

    this.saveToStorage();

    logInfo(`Error tracked: ${type}`, {
      component: 'error-tracker',
      metadata: { context, errorId: errorEvent.id }
    });

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(errorEvent);
    }
  }

  /**
   * Get error statistics
   */
  getStats(): ErrorStats {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const recentErrors = this.errors.filter(e => e.timestamp > oneMinuteAgo);

    const errorsByType: Record<string, number> = {};
    const errorsByContext: Record<string, number> = {};

    this.errors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsByContext[error.context] = (errorsByContext[error.context] || 0) + 1;
    });

    return {
      totalErrors: this.errors.length,
      errorsByType: errorsByType as Record<ErrorType, number>,
      errorsByContext,
      recentErrors: this.errors.slice(-10),
      errorRate: recentErrors.length
    };
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): ErrorEvent[] {
    return this.errors.filter(e => e.type === type);
  }

  /**
   * Get errors by context
   */
  getErrorsByContext(context: string): ErrorEvent[] {
    return this.errors.filter(e => e.context === context);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): ErrorEvent[] {
    return this.errors.slice(-limit);
  }

  /**
   * Clear all tracked errors
   */
  clear(): void {
    this.errors = [];
    this.saveToStorage();
    logInfo('Error log cleared', { component: 'error-tracker' });
  }

  /**
   * Export errors for debugging
   */
  export(): string {
    return JSON.stringify(this.errors, null, 2);
  }

  /**
   * Check if error rate is high
   */
  isErrorRateHigh(): boolean {
    const stats = this.getStats();
    return stats.errorRate > 5; // More than 5 errors per minute
  }

  /**
   * Get most common error type
   */
  getMostCommonErrorType(): ErrorType | null {
    const stats = this.getStats();
    const entries = Object.entries(stats.errorsByType);
    
    if (entries.length === 0) return null;

    const [type] = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );

    return type as ErrorType;
  }

  /**
   * Get most problematic context
   */
  getMostProblematicContext(): string | null {
    const stats = this.getStats();
    const entries = Object.entries(stats.errorsByContext);
    
    if (entries.length === 0) return null;

    const [context] = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );

    return context;
  }

  /**
   * Generate unique error ID
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load errors from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.errors = JSON.parse(stored);
        logInfo(`Loaded ${this.errors.length} errors from storage`, {
          component: 'error-tracker'
        });
      }
    } catch (error) {
      logWarn('Failed to load error log from storage', {
        component: 'error-tracker',
        metadata: { error: String(error) }
      });
    }
  }

  /**
   * Save errors to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.errors));
    } catch (error) {
      logWarn('Failed to save error log to storage', {
        component: 'error-tracker',
        metadata: { error: String(error) }
      });
    }
  }

  /**
   * Send error to analytics service
   */
  private async sendToAnalytics(errorEvent: ErrorEvent): Promise<void> {
    try {
      // TODO: Implement actual analytics integration
      // For now, just log that we would send it
      logInfo('Would send error to analytics', {
        component: 'error-tracker',
        metadata: {
          errorId: errorEvent.id,
          type: errorEvent.type,
          context: errorEvent.context
        }
      });

      // Example integration with Supabase analytics
      /*
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      await supabase.from('error_events').insert({
        error_id: errorEvent.id,
        error_type: errorEvent.type,
        message: errorEvent.message,
        context: errorEvent.context,
        timestamp: new Date(errorEvent.timestamp).toISOString(),
        user_agent: errorEvent.userAgent,
        url: errorEvent.url,
        metadata: errorEvent.metadata
      });
      */
    } catch (error) {
      logWarn('Failed to send error to analytics', {
        component: 'error-tracker',
        metadata: { error: String(error) }
      });
    }
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

/**
 * Hook for React components to track errors
 */
export function useErrorTracking() {
  return {
    trackError: (error: unknown, type: ErrorType, context: string, metadata?: Record<string, unknown>) => {
      errorTracker.track(error, type, context, metadata);
    },
    getStats: () => errorTracker.getStats(),
    getRecentErrors: (limit?: number) => errorTracker.getRecentErrors(limit),
    clearErrors: () => errorTracker.clear(),
    exportErrors: () => errorTracker.export()
  };
}

/**
 * Get error tracking statistics for debugging
 */
export function getErrorTrackingStats(): ErrorStats {
  return errorTracker.getStats();
}

/**
 * Export error log for support
 */
export function exportErrorLog(): string {
  return errorTracker.export();
}

/**
 * Clear error log
 */
export function clearErrorLog(): void {
  errorTracker.clear();
}
