import { unlockAchievement, updateUserStats } from '../supabase/database';
import type { MigrationResult } from './types';

/**
 * Migrate achievements data from localStorage to Supabase
 */
export async function migrateAchievementsData(userId: string): Promise<MigrationResult> {
  const errors: Error[] = [];
  let itemsMigrated = 0;

  try {
    // Read achievements data from localStorage
    const achievementsDataRaw = localStorage.getItem('vibestudy-achievements');
    
    if (!achievementsDataRaw) {
      return {
        success: true,
        itemsMigrated: 0,
        errors: []
      };
    }

    const achievementsData = JSON.parse(achievementsDataRaw);
    const state = achievementsData?.state;

    if (!state) {
      return {
        success: true,
        itemsMigrated: 0,
        errors: []
      };
    }

    // Migrate unlocked achievements
    const unlockedAchievements = state.unlockedAchievements || [];
    
    for (const achievement of unlockedAchievements) {
      const result = await unlockAchievement(userId, achievement.id);
      
      if (result.error) {
        errors.push(result.error);
      } else {
        itemsMigrated++;
      }
    }

    // Migrate user stats
    if (state.stats) {
      const statsResult = await updateUserStats(userId, state.stats);
      
      if (statsResult.error) {
        errors.push(statsResult.error);
      }
    }

    return {
      success: errors.length === 0,
      itemsMigrated,
      errors
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error during achievements migration');
    errors.push(err);
    return {
      success: false,
      itemsMigrated,
      errors
    };
  }
}
