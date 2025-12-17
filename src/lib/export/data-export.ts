/**
 * Data Export/Import Service
 * Handles exporting and importing user data
 */

import { useProgressStore } from '@/store/progress-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { useProfileStore } from '@/store/profile-store';
import type { TaskAttempt, TopicMastery } from '@/lib/supabase/database';
import type { DayStateSnapshot, ProgressRecord, Achievement, UserStats, Profile } from '@/types';

export interface ExportData {
  version: string;
  exportedAt: number;
  userId: string;
  progress: {
    dayStates: Record<number, DayStateSnapshot>;
    record: ProgressRecord;
    languageId: string;
    activeDay: number;
  };
  achievements: {
    unlocked: Achievement[];
    stats: UserStats;
  };
  profile: Profile;
  taskAttempts?: TaskAttempt[];
  topicMastery?: TopicMastery[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportResult {
  success: boolean;
  imported: {
    progress: boolean;
    achievements: boolean;
    profile: boolean;
    taskAttempts: boolean;
    topicMastery: boolean;
  };
  errors: string[];
}

const EXPORT_VERSION = '1.0.0';

/**
 * Export all user data
 */
export async function exportAllData(userId: string): Promise<ExportData> {
  const progressStore = useProgressStore.getState();
  const achievementsStore = useAchievementsStore.getState();
  const profileStore = useProfileStore.getState();

  // Fetch task attempts and mastery from cloud if available
  let taskAttempts: TaskAttempt[] = [];
  let topicMastery: TopicMastery[] = [];

  try {
    const { fetchRecentAttempts, fetchTopicMastery } = await import('@/lib/supabase/database');
    
    const attemptsResult = await fetchRecentAttempts(userId, 100);
    if (attemptsResult.data) {
      taskAttempts = attemptsResult.data;
    }

    const masteryResult = await fetchTopicMastery(userId);
    if (masteryResult.data) {
      topicMastery = masteryResult.data;
    }
  } catch (error) {
    console.warn('[Export] Could not fetch cloud data:', error);
  }

  const exportData: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    userId,
    progress: {
      dayStates: progressStore.dayStates,
      record: progressStore.record,
      languageId: progressStore.languageId,
      activeDay: progressStore.activeDay,
    },
    achievements: {
      unlocked: achievementsStore.unlockedAchievements,
      stats: achievementsStore.stats,
    },
    profile: profileStore.profile,
    taskAttempts,
    topicMastery,
  };

  return exportData;
}

/**
 * Download export data as JSON file
 */
export function downloadExport(data: ExportData, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `vibestudy-backup-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Validate import data
 */
export function validateImport(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    errors.push('Invalid data format: expected JSON object');
    return { valid: false, errors, warnings };
  }

  // Check version
  if (!data.version) {
    warnings.push('No version information found');
  } else if (data.version !== EXPORT_VERSION) {
    warnings.push(`Version mismatch: expected ${EXPORT_VERSION}, got ${data.version}`);
  }

  // Check required fields
  if (!data.userId) {
    errors.push('Missing userId');
  }

  if (!data.progress) {
    errors.push('Missing progress data');
  } else {
    if (!data.progress.dayStates) {
      errors.push('Missing progress.dayStates');
    }
    if (!data.progress.record) {
      errors.push('Missing progress.record');
    }
  }

  if (!data.achievements) {
    warnings.push('Missing achievements data');
  }

  if (!data.profile) {
    warnings.push('Missing profile data');
  }

  // Check data integrity
  if (data.progress?.dayStates) {
    const dayCount = Object.keys(data.progress.dayStates).length;
    if (dayCount === 0) {
      warnings.push('No day states found in progress data');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Import data from backup
 */
export async function importData(data: ExportData): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: {
      progress: false,
      achievements: false,
      profile: false,
      taskAttempts: false,
      topicMastery: false,
    },
    errors: [],
  };

  try {
    // Import progress
    if (data.progress) {
      useProgressStore.setState({
        dayStates: data.progress.dayStates,
        record: data.progress.record,
        languageId: data.progress.languageId,
        activeDay: data.progress.activeDay,
      });
      result.imported.progress = true;
    }

    // Import achievements
    if (data.achievements) {
      useAchievementsStore.setState({
        unlockedAchievements: data.achievements.unlocked,
        stats: data.achievements.stats,
      });
      result.imported.achievements = true;
    }

    // Import profile
    if (data.profile) {
      useProfileStore.setState({
        profile: data.profile,
      });
      result.imported.profile = true;
    }

    // Import to cloud if user is authenticated
    try {
      const { getCurrentUser } = await import('@/lib/supabase/auth');
      const user = await getCurrentUser();

      if (user) {
        // Sync imported data to cloud
        const progressStore = useProgressStore.getState();
        const achievementsStore = useAchievementsStore.getState();
        const profileStore = useProfileStore.getState();

        await progressStore.syncToCloud();
        await achievementsStore.syncToCloud();
        await profileStore.syncToCloud();

        // Import task attempts if available
        if (data.taskAttempts && data.taskAttempts.length > 0) {
          const { createTaskAttempt } = await import('@/lib/supabase/database');
          for (const attempt of data.taskAttempts) {
            await createTaskAttempt({ ...attempt, userId: user.id });
          }
          result.imported.taskAttempts = true;
        }

        // Import topic mastery if available
        if (data.topicMastery && data.topicMastery.length > 0) {
          const { updateTopicMastery } = await import('@/lib/supabase/database');
          for (const mastery of data.topicMastery) {
            // Recreate mastery by simulating attempts
            for (let i = 0; i < mastery.totalAttempts; i++) {
              const isSuccess = i < mastery.successfulAttempts;
              await updateTopicMastery(user.id, mastery.topic, isSuccess);
            }
          }
          result.imported.topicMastery = true;
        }
      }
    } catch (error) {
      console.warn('[Import] Could not sync to cloud:', error);
      result.errors.push('Failed to sync to cloud: ' + (error as Error).message);
    }

    result.success = true;
  } catch (error) {
    result.success = false;
    result.errors.push('Import failed: ' + (error as Error).message);
  }

  return result;
}

/**
 * Read and parse import file
 */
export async function readImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
