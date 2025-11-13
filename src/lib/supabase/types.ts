import type { User, Session } from '@supabase/supabase-js';

// Re-export Supabase types for convenience
export type { User, Session };

// Auth result interface
export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

// Auth callback type
export type AuthCallback = (event: string, session: Session | null) => void;

// Unsubscribe function type
export type Unsubscribe = () => void;

// Profile updates interface
export interface ProfileUpdates {
  name?: string;
  avatar?: string;
  bio?: string;
  preferredLanguage?: string;
  githubUsername?: string;
  telegramUsername?: string;
}

// Database operation result
export interface DatabaseResult<T> {
  data: T | null;
  error: Error | null;
}

// Sync operation types
export type SyncOperationType = 'progress' | 'achievement' | 'profile' | 'task_attempt';
export type SyncActionType = 'create' | 'update' | 'delete';

// Sync operation interface
export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  action: SyncActionType;
  data: any;
  timestamp: number;
  retries: number;
}

// Sync result interface
export interface SyncResult {
  success: boolean;
  error?: Error;
  synced?: number;
}

// Conflict resolution strategies
export type ConflictStrategy = 'last-write-wins' | 'merge' | 'manual';
