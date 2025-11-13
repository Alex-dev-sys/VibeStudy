import { upsertProgress, type ProgressData } from '../supabase/database';
import type { MigrationResult } from './types';

/**
 * Migrate progress data from localStorage to Supabase
 */
export async function migrateProgressData(userId: string): Promise<MigrationResult> {
  const errors: Error[] = [];
  let itemsMigrated = 0;

  try {
    // Read progress data from localStorage
    const progressDataRaw = localStorage.getItem('vibestudy-progress');
    
    if (!progressDataRaw) {
      return {
        success: true,
        itemsMigrated: 0,
        errors: []
      };
    }

    const progressData = JSON.parse(progressDataRaw);
    const state = progressData?.state;

    if (!state) {
      return {
        success: true,
        itemsMigrated: 0,
        errors: []
      };
    }

    // Transform localStorage format to Supabase format
    const progressToMigrate: ProgressData = {
      userId,
      dayStates: state.dayStates || {},
      record: state.record || {
        completedDays: [],
        lastActiveDay: 1,
        streak: 0,
        history: []
      },
      languageId: state.languageId || 'python',
      activeDay: state.activeDay || 1
    };

    // Upload to Supabase
    const result = await upsertProgress(progressToMigrate);

    if (result.error) {
      errors.push(result.error);
      return {
        success: false,
        itemsMigrated: 0,
        errors
      };
    }

    // Count migrated items
    itemsMigrated = Object.keys(progressToMigrate.dayStates).length;

    return {
      success: true,
      itemsMigrated,
      errors: []
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error during progress migration');
    errors.push(err);
    return {
      success: false,
      itemsMigrated,
      errors
    };
  }
}
