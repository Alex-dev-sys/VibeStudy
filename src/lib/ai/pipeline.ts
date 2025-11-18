/**
 * AI Request Queue
 * Serialises heavy HuggingFace calls to avoid spikes and support retries.
 */

import { errorHandler } from '@/lib/error-handler';
import { logInfo, logWarn } from '@/lib/logger';

interface AIJob<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  options: AIJobOptions;
}

export interface AIJobOptions {
  timeoutMs?: number;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, unknown>;
}

const DEFAULT_TIMEOUT = 60_000;

class AIProcessingQueue {
  private queue: AIJob<any>[] = [];
  private activeCount = 0;
  private readonly concurrency: number;

  constructor(concurrency: number = 2) {
    this.concurrency = Math.max(1, concurrency);
  }

  enqueue<T>(execute: () => Promise<T>, options: AIJobOptions = {}): Promise<T> {
    const jobId = `ai-job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return new Promise<T>((resolve, reject) => {
      const job: AIJob<T> = {
        id: jobId,
        execute,
        resolve,
        reject,
        options
      };

      this.queue.push(job);
      this.queue.sort((a, b) => this.getPriorityWeight(b.options.priority) - this.getPriorityWeight(a.options.priority));
      logInfo('AI job queued', {
        component: 'ai-queue',
        action: 'enqueue',
        metadata: { jobId, queueSize: this.queue.length }
      });
      this.processNext();
    });
  }

  private getPriorityWeight(priority: AIJobOptions['priority']): number {
    switch (priority) {
      case 'high':
        return 3;
      case 'low':
        return 1;
      default:
        return 2;
    }
  }

  private processNext(): void {
    if (this.activeCount >= this.concurrency) {
      return;
    }

    const job = this.queue.shift();
    if (!job) {
      return;
    }

    this.activeCount++;
    const timeoutMs = job.options.timeoutMs ?? DEFAULT_TIMEOUT;
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('AI job timeout'));
      }, timeoutMs);
    });

    logInfo('AI job started', {
      component: 'ai-queue',
      action: 'start',
      metadata: { jobId: job.id, timeoutMs }
    });

    Promise.race([job.execute(), timeoutPromise])
      .then((result) => {
        logInfo('AI job completed', {
          component: 'ai-queue',
          action: 'complete',
          metadata: { jobId: job.id }
        });
        job.resolve(result);
      })
      .catch((error) => {
        errorHandler.report(error as Error, {
          component: 'ai-queue',
          action: 'execute',
          metadata: { jobId: job.id, ...job.options.metadata }
        });
        job.reject(error);
      })
      .finally(() => {
        this.activeCount--;
        this.processNext();
      });
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  cancelAll(): void {
    if (this.queue.length > 0) {
      logWarn('Cancelling queued AI jobs', {
        component: 'ai-queue',
        action: 'cancel',
        metadata: { count: this.queue.length }
      });
    }

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      job?.reject(new Error('AI job cancelled'));
    }
  }
}

export const aiQueue = new AIProcessingQueue(2);

