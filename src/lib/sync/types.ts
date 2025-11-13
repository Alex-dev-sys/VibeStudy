/**
 * Sync Queue Types
 * Defines interfaces for the synchronization queue system
 */

export type SyncOperationType = 'progress' | 'achievement' | 'profile' | 'task_attempt' | 'topic_mastery';
export type SyncAction = 'create' | 'update' | 'delete';

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  action: SyncAction;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
  userId: string;
}

export interface SyncQueueState {
  operations: SyncOperation[];
  isProcessing: boolean;
  lastProcessedAt: number | null;
}

export interface SyncResult {
  success: boolean;
  operationId: string;
  error?: Error;
}
