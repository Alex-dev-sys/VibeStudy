import type { LocalDataSummary } from './types';

/**
 * Detect existing data in localStorage
 * Returns summary of what data exists locally
 */
export function detectLocalData(): LocalDataSummary {
  try {
    // Check for progress data
    const progressData = localStorage.getItem('vibestudy-progress');
    const progressState = progressData ? JSON.parse(progressData)?.state : null;
    
    // Check for achievements data
    const achievementsData = localStorage.getItem('vibestudy-achievements');
    const achievementsState = achievementsData ? JSON.parse(achievementsData)?.state : null;
    
    // Check for profile data
    const profileData = localStorage.getItem('vibestudy-profile');
    const profileState = profileData ? JSON.parse(profileData)?.state : null;

    // Calculate statistics
    const completedDays = progressState?.record?.completedDays?.length || 0;
    
    let totalTasks = 0;
    if (progressState?.dayStates) {
      Object.values(progressState.dayStates).forEach((dayState: any) => {
        totalTasks += dayState?.completedTasks?.length || 0;
      });
    }
    
    const unlockedAchievements = achievementsState?.unlockedAchievements?.length || 0;

    return {
      hasProgress: !!progressState && (completedDays > 0 || totalTasks > 0),
      hasAchievements: !!achievementsState && unlockedAchievements > 0,
      hasProfile: !!profileState && profileState.profile?.name !== 'Гость',
      completedDays,
      totalTasks,
      unlockedAchievements
    };
  } catch (error) {
    console.error('Error detecting local data:', error);
    return {
      hasProgress: false,
      hasAchievements: false,
      hasProfile: false,
      completedDays: 0,
      totalTasks: 0,
      unlockedAchievements: 0
    };
  }
}

/**
 * Check if user has any data worth migrating
 */
export function hasDataToMigrate(): boolean {
  const summary = detectLocalData();
  return summary.hasProgress || summary.hasAchievements || summary.hasProfile;
}

/**
 * Get formatted summary message for user
 */
export function getMigrationSummaryMessage(summary: LocalDataSummary): string {
  const parts: string[] = [];
  
  if (summary.hasProgress) {
    parts.push(`${summary.completedDays} завершенных дней`);
    parts.push(`${summary.totalTasks} выполненных задач`);
  }
  
  if (summary.hasAchievements) {
    parts.push(`${summary.unlockedAchievements} достижений`);
  }
  
  if (summary.hasProfile) {
    parts.push('настройки профиля');
  }
  
  if (parts.length === 0) {
    return 'Нет данных для миграции';
  }
  
  return `Найдено: ${parts.join(', ')}`;
}
