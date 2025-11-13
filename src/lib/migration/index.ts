import { migrateProgressData } from './migrate-progress';
import { migrateAchievementsData } from './migrate-achievements';
import { migrateKnowledgeProfile } from './migrate-knowledge';
import { upsertProfile } from '../supabase/database';
import type { CompleteMigrationResult, MigrationOptions } from './types';

/**
 * Migrate all user data from localStorage to Supabase
 */
export async function migrateAllData(
  userId: string,
  options: MigrationOptions = {}
): Promise<CompleteMigrationResult> {
  console.log('🚀 Starting data migration for user:', userId);

  // Migrate progress
  console.log('📊 Migrating progress data...');
  const progressResult = await migrateProgressData(userId);
  console.log('✅ Progress migration:', progressResult.success ? 'Success' : 'Failed', 
    `(${progressResult.itemsMigrated} items)`);

  // Migrate achievements
  console.log('🏆 Migrating achievements...');
  const achievementsResult = await migrateAchievementsData(userId);
  console.log('✅ Achievements migration:', achievementsResult.success ? 'Success' : 'Failed',
    `(${achievementsResult.itemsMigrated} items)`);

  // Migrate profile
  console.log('👤 Migrating profile...');
  const profileResult = await migrateProfileData(userId);
  console.log('✅ Profile migration:', profileResult.success ? 'Success' : 'Failed',
    `(${profileResult.itemsMigrated} items)`);

  // Migrate knowledge profile
  console.log('🧠 Migrating knowledge profile...');
  const knowledgeResult = await migrateKnowledgeProfile(userId);
  console.log('✅ Knowledge profile migration:', knowledgeResult.success ? 'Success' : 'Failed',
    `(${knowledgeResult.itemsMigrated} items)`);

  const totalSuccess = 
    progressResult.success &&
    achievementsResult.success &&
    profileResult.success &&
    knowledgeResult.success;

  // Clear localStorage if requested and migration was successful
  if (options.clearLocalDataAfterSuccess && totalSuccess) {
    console.log('🧹 Clearing local data...');
    clearLocalDataAfterMigration();
  }

  console.log('🎉 Migration complete!', totalSuccess ? 'All data migrated successfully' : 'Some errors occurred');

  return {
    progress: progressResult,
    achievements: achievementsResult,
    profile: profileResult,
    knowledgeProfile: knowledgeResult,
    totalSuccess
  };
}

/**
 * Migrate profile data from localStorage to Supabase
 */
async function migrateProfileData(userId: string) {
  const errors: Error[] = [];
  let itemsMigrated = 0;

  try {
    const profileDataRaw = localStorage.getItem('vibestudy-profile');
    
    if (!profileDataRaw) {
      return {
        success: true,
        itemsMigrated: 0,
        errors: []
      };
    }

    const profileData = JSON.parse(profileDataRaw);
    const profile = profileData?.state?.profile;

    if (!profile) {
      return {
        success: true,
        itemsMigrated: 0,
        errors: []
      };
    }

    // Upload profile to Supabase
    const result = await upsertProfile({
      id: userId,
      name: profile.name || 'User',
      email: profile.email,
      avatar: profile.avatar,
      bio: profile.bio,
      joinedAt: profile.joinedAt || Date.now(),
      preferredLanguage: profile.preferredLanguage || 'python',
      interfaceLanguage: profile.interfaceLanguage || 'ru',
      telegramUsername: profile.telegramUsername,
      telegramChatId: profile.telegramChatId,
      telegramNotifications: profile.telegramNotifications ?? true,
      reminderTime: profile.reminderTime || '19:00'
    });

    if (result.error) {
      errors.push(result.error);
      return {
        success: false,
        itemsMigrated: 0,
        errors
      };
    }

    itemsMigrated = 1;

    return {
      success: true,
      itemsMigrated,
      errors: []
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error during profile migration');
    errors.push(err);
    return {
      success: false,
      itemsMigrated,
      errors
    };
  }
}

/**
 * Clear localStorage data after successful migration
 */
export function clearLocalDataAfterMigration(): void {
  try {
    // Keep guest mode flag if it exists
    const guestMode = localStorage.getItem('guestMode');
    
    // Clear all VibeStudy data
    localStorage.removeItem('vibestudy-progress');
    localStorage.removeItem('vibestudy-achievements');
    localStorage.removeItem('vibestudy-profile');
    localStorage.removeItem('vibestudy-knowledge-profile');
    
    // Restore guest mode flag if it was set
    if (guestMode) {
      localStorage.setItem('guestMode', guestMode);
    }
    
    console.log('✅ Local data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing local data:', error);
  }
}

// Re-export detection functions
export { detectLocalData, hasDataToMigrate, getMigrationSummaryMessage } from './detect';
export type { LocalDataSummary, MigrationResult, CompleteMigrationResult, MigrationOptions } from './types';
