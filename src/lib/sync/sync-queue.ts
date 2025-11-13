/**
 * Sync Queue Manager
 * Manages the queue of sync operations with retry logic
 */

import { SyncOperation, SyncOperationType, SyncAction, SyncResult } from './types';
import { queueStorage } from './queue-storage';
import { getSupabaseClient, isSupabaseConfigured } from '../supabase/client';
import {
  resolveProgressConflict,
  resolveAchievementConflict,
  resolveProfileConflict,
  resolveConflict,
} from './conflict-resolution';
import {
  retryWithBackoff,
  isRetryableError,
  calculateBackoffDelay,
  DEFAULT_RETRY_CONFIG,
} from './retry-logic';

class SyncQueue {
  private isProcessing = false;
  private processingPromise: Promise<void> | null = null;

  /**
   * Add operation to sync queue
   */
  async queueOperation(
    type: SyncOperationType,
    action: SyncAction,
    data: any,
    userId: string
  ): Promise<string> {
    const operation: SyncOperation = {
      id: `${type}-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 3,
      userId,
    };

    try {
      await queueStorage.addOperation(operation);
      console.log(`[SyncQueue] Operation queued: ${operation.id}`, { type, action });
      
      // Trigger processing if not already processing
      if (!this.isProcessing) {
        this.processQueue().catch(err => {
          console.error('[SyncQueue] Error processing queue:', err);
        });
      }
      
      return operation.id;
    } catch (error) {
      console.error('[SyncQueue] Failed to queue operation:', error);
      throw error;
    }
  }

  /**
   * Process all queued operations
   */
  async processQueue(): Promise<void> {
    // Prevent concurrent processing
    if (this.isProcessing) {
      return this.processingPromise || Promise.resolve();
    }

    this.isProcessing = true;
    this.processingPromise = this._processQueueInternal();
    
    try {
      await this.processingPromise;
    } finally {
      this.isProcessing = false;
      this.processingPromise = null;
    }
  }

  private async _processQueueInternal(): Promise<void> {
    const client = getSupabaseClient();
    
    if (!isSupabaseConfigured() || !client) {
      console.log('[SyncQueue] Supabase not configured, skipping queue processing');
      return;
    }

    try {
      const operations = await queueStorage.getAllOperations();
      
      if (operations.length === 0) {
        return;
      }

      console.log(`[SyncQueue] Processing ${operations.length} operations`);

      for (const operation of operations) {
        try {
          // Use retry logic with exponential backoff
          const retryResult = await retryWithBackoff(
            () => this.executeOperationInternal(operation),
            {
              ...DEFAULT_RETRY_CONFIG,
              maxRetries: operation.maxRetries - operation.retries,
            },
            isRetryableError
          );

          if (retryResult.success) {
            // Remove from queue on success
            await queueStorage.removeOperation(operation.id);
            console.log(
              `[SyncQueue] Operation completed after ${retryResult.attempts} attempt(s): ${operation.id}`
            );
          } else {
            // Update retry count
            operation.retries += retryResult.attempts;

            if (operation.retries >= operation.maxRetries) {
              // Max retries reached, remove from queue
              console.error(
                `[SyncQueue] Max retries reached for operation: ${operation.id}`,
                retryResult.error
              );
              await queueStorage.removeOperation(operation.id);
            } else {
              // Update retry count and calculate next retry time
              await queueStorage.updateOperation(operation);
              const nextDelay = calculateBackoffDelay(operation.retries);
              console.log(
                `[SyncQueue] Operation will retry in ${nextDelay}ms. ` +
                  `Attempts: ${operation.retries}/${operation.maxRetries}`
              );
            }
          }
        } catch (error) {
          console.error(`[SyncQueue] Unexpected error processing operation ${operation.id}:`, error);
          
          // Increment retry count on unexpected error
          operation.retries++;
          
          if (operation.retries >= operation.maxRetries) {
            await queueStorage.removeOperation(operation.id);
          } else {
            await queueStorage.updateOperation(operation);
          }
        }
      }
    } catch (error) {
      console.error('[SyncQueue] Error in queue processing:', error);
    }
  }

  /**
   * Execute a single sync operation (internal, throws on error)
   */
  private async executeOperationInternal(operation: SyncOperation): Promise<void> {
    const client = getSupabaseClient();
    
    if (!client) {
      throw new Error('Supabase client not available');
    }

    switch (operation.type) {
      case 'progress':
        await this.syncProgress(operation);
        break;
      case 'achievement':
        await this.syncAchievement(operation);
        break;
      case 'profile':
        await this.syncProfile(operation);
        break;
      case 'task_attempt':
        await this.syncTaskAttempt(operation);
        break;
      case 'topic_mastery':
        await this.syncTopicMastery(operation);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Sync progress data with conflict resolution
   */
  private async syncProgress(operation: SyncOperation): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not available');

    // Fetch remote data first
    const { data: remoteData, error: fetchError } = await client
      .from('user_progress')
      .select('*')
      .eq('user_id', operation.userId)
      .eq('topic_id', operation.data.topic_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine
      throw fetchError;
    }

    // Resolve conflict if remote data exists
    let dataToSync = operation.data;
    if (remoteData) {
      const resolution = resolveProgressConflict(operation.data, remoteData);
      dataToSync = resolution.resolved;
      
      if (resolution.hadConflict) {
        console.log('[SyncQueue] Progress conflict resolved using merge strategy');
      }
    }

    // Upsert resolved data
    const { error } = await client
      .from('user_progress')
      .upsert({
        user_id: operation.userId,
        ...dataToSync,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  /**
   * Sync achievement data
   */
  private async syncAchievement(operation: SyncOperation): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not available');

    if (operation.action === 'create') {
      const { error } = await client
        .from('user_achievements')
        .insert({
          user_id: operation.userId,
          ...operation.data,
        });

      if (error) throw error;
    } else if (operation.action === 'update') {
      const { error } = await client
        .from('user_achievements')
        .update(operation.data)
        .eq('user_id', operation.userId)
        .eq('achievement_id', operation.data.achievement_id);

      if (error) throw error;
    }
  }

  /**
   * Sync profile data with conflict resolution
   */
  private async syncProfile(operation: SyncOperation): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not available');

    // Fetch remote data first
    const { data: remoteData, error: fetchError } = await client
      .from('user_profiles')
      .select('*')
      .eq('user_id', operation.userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Resolve conflict if remote data exists
    let dataToSync = operation.data;
    if (remoteData) {
      const resolution = resolveProfileConflict(operation.data, remoteData);
      dataToSync = resolution.resolved;
      
      if (resolution.hadConflict) {
        console.log('[SyncQueue] Profile conflict resolved using last-write-wins');
      }
    }

    // Upsert resolved data
    const { error } = await client
      .from('user_profiles')
      .upsert({
        user_id: operation.userId,
        ...dataToSync,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  /**
   * Sync task attempt data
   */
  private async syncTaskAttempt(operation: SyncOperation): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not available');

    const { error } = await client
      .from('task_attempts')
      .insert({
        user_id: operation.userId,
        ...operation.data,
      });

    if (error) throw error;
  }

  /**
   * Sync topic mastery data with conflict resolution
   */
  private async syncTopicMastery(operation: SyncOperation): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not available');

    // Fetch remote data first
    const { data: remoteData, error: fetchError } = await client
      .from('topic_mastery')
      .select('*')
      .eq('user_id', operation.userId)
      .eq('topic', operation.data.topic)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Resolve conflict if remote data exists (use last-write-wins for mastery)
    let dataToSync = operation.data;
    if (remoteData) {
      const resolution = resolveConflict(operation.data, remoteData, 'last-write-wins');
      dataToSync = resolution.resolved;
      
      if (resolution.hadConflict) {
        console.log('[SyncQueue] Topic mastery conflict resolved using last-write-wins');
      }
    }

    // Upsert resolved data
    const { error } = await client
      .from('topic_mastery')
      .upsert({
        user_id: operation.userId,
        ...dataToSync,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  /**
   * Get current queue size
   */
  async getQueueSize(): Promise<number> {
    return queueStorage.getQueueSize();
  }

  /**
   * Clear the entire queue
   */
  async clearQueue(): Promise<void> {
    await queueStorage.clearQueue();
    console.log('[SyncQueue] Queue cleared');
  }

  /**
   * Get all queued operations
   */
  async getQueuedOperations(): Promise<SyncOperation[]> {
    return queueStorage.getAllOperations();
  }
}

// Singleton instance
export const syncQueue = new SyncQueue();
