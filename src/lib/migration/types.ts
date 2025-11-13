/**
 * Migration Types
 * Interfaces for data migration from localStorage to Supabase
 */

export interface LocalDataSummary {
  hasProgress: boolean;
  hasAchievements: boolean;
  hasProfile: boolean;
  completedDays: number;
  totalTasks: number;
  unlockedAchievements: number;
}

export interface MigrationResult {
  success: boolean;
  itemsMigrated: number;
  errors: Error[];
}

export interface CompleteMigrationResult {
  progress: MigrationResult;
  achievements: MigrationResult;
  profile: MigrationResult;
  knowledgeProfile: MigrationResult;
  totalSuccess: boolean;
}

export interface MigrationOptions {
  clearLocalDataAfterSuccess?: boolean;
  batchSize?: number;
}
