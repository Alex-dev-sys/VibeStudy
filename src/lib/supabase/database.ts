import { getSupabaseClient } from './client';
import type { DatabaseResult } from './types';
import type { DayStateSnapshot, ProgressRecord } from '@/types';
import type { UserStats, Achievement } from '@/types/achievements';
import { logWarn, logError } from '@/lib/logger';

/**
 * Database Helper Functions
 * Provides type-safe wrappers for Supabase database operations
 */

// ============================================================================
// Progress Operations
// ============================================================================

export interface ProgressData {
  userId: string;
  dayStates: Record<number, DayStateSnapshot>;
  record: ProgressRecord;
  languageId: string;
  activeDay: number;
}

async function getTimeSpentMap(
  supabase: ReturnType<typeof getSupabaseClient>,
  userId: string,
  dayKeys: number[]
): Promise<Map<number, number>> {
  const map = new Map<number, number>();
  const daySet = new Set(dayKeys);

  try {
    const { data, error } = await supabase
      .from('task_attempts')
      .select('time_spent, task_id')
      .eq('user_id', userId);

    if (error || !data) {
      return map;
    }

    data.forEach((attempt: any) => {
      if (!attempt?.task_id) {
        return;
      }
      const match = attempt.task_id.match(/day(\d+)_/);
      if (!match) {
        return;
      }
      const day = parseInt(match[1], 10);
      if (!daySet.has(day)) {
        return;
      }
      const current = map.get(day) ?? 0;
      map.set(day, current + (attempt.time_spent || 0));
    });
  } catch {
    // no-op
  }

  return map;
}

/**
 * Upsert user progress data
 */
export async function upsertProgress(data: ProgressData): Promise<DatabaseResult<void>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    // Get time spent for each day from task attempts
    const dayKeys = Object.keys(data.dayStates).map(Number);
    const timeSpentMap = await getTimeSpentMap(supabase, data.userId, dayKeys);

    // Store progress for each day
    const progressEntries = Object.entries(data.dayStates).map(([day, state]) => {
      const dayNum = Number(day);
      return {
        user_id: data.userId,
        topic_id: `day_${dayNum}`,
        completed: data.record.completedDays.includes(dayNum),
        score: state.completedTasks.length * 20, // Simple scoring
        time_spent: timeSpentMap.get(dayNum) || 0,
        last_accessed: new Date(state.lastUpdated).toISOString(),
        metadata: {
          code: state.code,
          notes: state.notes,
          completedTasks: state.completedTasks,
          recapAnswer: state.recapAnswer,
          languageId: data.languageId,
          history: data.record.history || []
        }
      };
    });

    const { error } = await supabase
      .from('user_progress')
      .upsert(progressEntries, { onConflict: 'user_id,topic_id' });

    if (error) {
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch user progress data
 */
export async function fetchProgress(userId: string): Promise<DatabaseResult<ProgressData | null>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('topic_id, completed, last_accessed, metadata')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      return { data: null, error: null };
    }

    // Transform database format to app format
    const dayStates: Record<number, DayStateSnapshot> = {};
    const completedDays: number[] = [];

    // Extract language and history from entries
    let languageId = 'python';
    const historyMap = new Map<number, { day: number; timestamp: number; notes?: string }>();

    data.forEach((entry: any) => {
      const day = parseInt(entry.topic_id.replace('day_', ''), 10);
      
      // Пропускаем невалидные записи
      if (isNaN(day)) {
        logWarn(`Invalid topic_id: ${entry.topic_id}, skipping entry`, {
          component: 'database',
          action: 'fetchProgress',
          metadata: { topic_id: entry.topic_id }
        });
        return;
      }
      
      // Extract languageId from metadata (use first valid entry)
      if (entry.metadata?.languageId) {
        // Only update if we haven't found a language yet, or use the first one found
        if (languageId === 'python') {
          languageId = entry.metadata.languageId;
        }
      }
      
      // Collect history entries from metadata
      // History is stored per day, so we merge all history entries
      if (entry.metadata?.history && Array.isArray(entry.metadata.history)) {
        entry.metadata.history.forEach((histEntry: { day: number; timestamp: number; notes?: string }) => {
          // Use the most recent entry for each day
          const existing = historyMap.get(histEntry.day);
          if (!existing || histEntry.timestamp > existing.timestamp) {
            historyMap.set(histEntry.day, histEntry);
          }
        });
      }
      
      dayStates[day] = {
        code: entry.metadata?.code || '',
        notes: entry.metadata?.notes || '',
        completedTasks: entry.metadata?.completedTasks || [],
        isLocked: false,
        lastUpdated: entry.last_accessed ? new Date(entry.last_accessed).getTime() : Date.now(),
        recapAnswer: entry.metadata?.recapAnswer || ''
      };

      if (entry.completed) {
        completedDays.push(day);
      }
    });

    // Convert history map to sorted array
    const history = Array.from(historyMap.values()).sort((a, b) => a.day - b.day);

    const progressData: ProgressData = {
      userId,
      dayStates,
      record: {
        completedDays: completedDays.sort((a, b) => a - b),
        lastActiveDay: completedDays.length > 0 ? Math.max(...completedDays) : 1,
        streak: completedDays.length,
        history: history
      },
      languageId: languageId,
      activeDay: completedDays.length > 0 ? Math.max(...completedDays) : 1
    };

    return { data: progressData, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch progress for a specific day
 */
export async function fetchDayProgress(
  userId: string,
  day: number
): Promise<DatabaseResult<DayStateSnapshot | null>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('metadata, last_accessed')
      .eq('user_id', userId)
      .eq('topic_id', `day_${day}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return { data: null, error: null };
      }
      return { data: null, error };
    }

    const dayState: DayStateSnapshot = {
      code: data.metadata?.code || '',
      notes: data.metadata?.notes || '',
      completedTasks: data.metadata?.completedTasks || [],
      isLocked: false,
      lastUpdated: data.last_accessed ? new Date(data.last_accessed).getTime() : Date.now(),
      recapAnswer: data.metadata?.recapAnswer || ''
    };

    return { data: dayState, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// ============================================================================
// Achievement Operations
// ============================================================================

/**
 * Unlock an achievement for a user
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<DatabaseResult<void>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString()
      });

    if (error) {
      // Ignore duplicate key errors (achievement already unlocked)
      if (error.code === '23505') {
        return { data: undefined, error: null };
      }
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch all unlocked achievements for a user
 */
export async function fetchAchievements(
  userId: string
): Promise<DatabaseResult<Achievement[]>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error };
    }

    if (!data || !Array.isArray(data)) {
      return { data: [], error: null };
    }

    // Transform to Achievement format (will need to merge with ACHIEVEMENTS constant)
    const achievements = data.map((entry: any) => ({
      id: entry.achievement_id,
      unlockedAt: entry.unlocked_at ? new Date(entry.unlocked_at).getTime() : Date.now()
    })) as Achievement[];

    return { data: achievements, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Update user stats (stored in user_progress metadata or separate table)
 */
export async function updateUserStats(
  userId: string,
  stats: UserStats
): Promise<DatabaseResult<void>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    // Store stats in a metadata row
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        topic_id: '_stats',
        completed: false,
        metadata: stats
      }, { onConflict: 'user_id,topic_id' });

    if (error) {
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch user stats
 */
export async function fetchUserStats(userId: string): Promise<DatabaseResult<UserStats | null>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('metadata')
      .eq('user_id', userId)
      .eq('topic_id', '_stats')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }

    if (!data || !data.metadata) {
      return { data: null, error: null };
    }

    return { data: data.metadata as UserStats, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// ============================================================================
// Profile Operations
// ============================================================================

export interface ProfileData {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  joinedAt: number;
  preferredLanguage: string;
  interfaceLanguage: string;
  telegramUsername?: string;
  telegramChatId?: number;
  telegramNotifications: boolean;
  reminderTime: string;
}

/**
 * Upsert user profile
 */
export async function upsertProfile(profile: ProfileData): Promise<DatabaseResult<void>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: profile.id,
        username: profile.name,
        email: profile.email,
        metadata: {
          avatar: profile.avatar,
          bio: profile.bio,
          preferredLanguage: profile.preferredLanguage,
          interfaceLanguage: profile.interfaceLanguage,
          telegramUsername: profile.telegramUsername,
          telegramChatId: profile.telegramChatId,
          telegramNotifications: profile.telegramNotifications,
          reminderTime: profile.reminderTime
        }
      }, { onConflict: 'id' });

    if (error) {
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch user profile
 */
export async function fetchProfile(userId: string): Promise<DatabaseResult<ProfileData | null>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, created_at, metadata')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }

    const profile: ProfileData = {
      id: data.id,
      name: data.username,
      email: data.email,
      avatar: data.metadata?.avatar,
      bio: data.metadata?.bio,
      joinedAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      preferredLanguage: data.metadata?.preferredLanguage || 'python',
      interfaceLanguage: data.metadata?.interfaceLanguage || 'ru',
      telegramUsername: data.metadata?.telegramUsername,
      telegramChatId: data.metadata?.telegramChatId,
      telegramNotifications: data.metadata?.telegramNotifications ?? true,
      reminderTime: data.metadata?.reminderTime || '19:00'
    };

    return { data: profile, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// ============================================================================
// Task Attempt Operations
// ============================================================================

export interface TaskAttempt {
  id?: string;
  userId: string;
  taskId: string;
  topicId: string;
  code: string;
  result: string;
  isCorrect: boolean;
  hintsUsed: number;
  timeSpent: number;
  attemptedAt: number;
}

/**
 * Create a new task attempt
 */
export async function createTaskAttempt(
  attempt: TaskAttempt
): Promise<DatabaseResult<void>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('task_attempts')
      .insert({
        user_id: attempt.userId,
        task_id: attempt.taskId,
        topic_id: attempt.topicId,
        code: attempt.code,
        result: attempt.result,
        is_correct: attempt.isCorrect,
        hints_used: attempt.hintsUsed,
        time_spent: attempt.timeSpent,
        attempted_at: new Date(attempt.attemptedAt).toISOString()
      });

    if (error) {
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch attempts for a specific task
 */
export async function fetchTaskAttempts(
  userId: string,
  taskId: string
): Promise<DatabaseResult<TaskAttempt[]>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('task_attempts')
      .select('id, user_id, task_id, topic_id, code, result, is_correct, hints_used, time_spent, attempted_at')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .order('attempted_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    if (!data || !Array.isArray(data)) {
      return { data: [], error: null };
    }

    const attempts: TaskAttempt[] = data.map((entry: any) => ({
      id: entry.id,
      userId: entry.user_id,
      taskId: entry.task_id,
      topicId: entry.topic_id,
      code: entry.code,
      result: entry.result,
      isCorrect: entry.is_correct,
      hintsUsed: entry.hints_used,
      timeSpent: entry.time_spent,
      attemptedAt: entry.attempted_at ? new Date(entry.attempted_at).getTime() : Date.now()
    }));

    return { data: attempts, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch recent attempts (limit to most recent N)
 */
export async function fetchRecentAttempts(
  userId: string,
  limit: number = 20
): Promise<DatabaseResult<TaskAttempt[]>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('task_attempts')
      .select('id, user_id, task_id, topic_id, code, result, is_correct, hints_used, time_spent, attempted_at')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    if (!data || !Array.isArray(data)) {
      return { data: [], error: null };
    }

    const attempts: TaskAttempt[] = data.map((entry: any) => ({
      id: entry.id,
      userId: entry.user_id,
      taskId: entry.task_id,
      topicId: entry.topic_id,
      code: entry.code,
      result: entry.result,
      isCorrect: entry.is_correct,
      hintsUsed: entry.hints_used,
      timeSpent: entry.time_spent,
      attemptedAt: entry.attempted_at ? new Date(entry.attempted_at).getTime() : Date.now()
    }));

    return { data: attempts, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// ============================================================================
// Topic Mastery Operations
// ============================================================================

export interface TopicMastery {
  userId: string;
  topic: string;
  totalAttempts: number;
  successfulAttempts: number;
  masteryLevel: number;
  lastPracticed: number;
}

/**
 * Update topic mastery based on attempt result
 */
export async function updateTopicMastery(
  userId: string,
  topic: string,
  isSuccess: boolean
): Promise<DatabaseResult<void>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    // Fetch current mastery
    const { data: current, error: fetchError } = await supabase
      .from('topic_mastery')
      .select('total_attempts, successful_attempts')
      .eq('user_id', userId)
      .eq('topic', topic)
      .single();

    let totalAttempts = 1;
    let successfulAttempts = isSuccess ? 1 : 0;

    if (!fetchError && current) {
      totalAttempts = current.total_attempts + 1;
      successfulAttempts = current.successful_attempts + (isSuccess ? 1 : 0);
    }

    const masteryLevel = totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;

    const { error } = await supabase
      .from('topic_mastery')
      .upsert({
        user_id: userId,
        topic,
        total_attempts: totalAttempts,
        successful_attempts: successfulAttempts,
        mastery_level: masteryLevel,
        last_practiced: new Date().toISOString()
      }, { onConflict: 'user_id,topic' });

    if (error) {
      return { data: null, error };
    }

    return { data: undefined, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch all topic mastery data for a user
 */
export async function fetchTopicMastery(
  userId: string
): Promise<DatabaseResult<TopicMastery[]>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('topic_mastery')
      .select('user_id, topic, total_attempts, successful_attempts, mastery_level, last_practiced')
      .eq('user_id', userId)
      .order('mastery_level', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    if (!data || !Array.isArray(data)) {
      return { data: [], error: null };
    }

    const mastery: TopicMastery[] = data.map((entry: any) => ({
      userId: entry.user_id,
      topic: entry.topic,
      totalAttempts: entry.total_attempts,
      successfulAttempts: entry.successful_attempts,
      masteryLevel: entry.mastery_level,
      lastPracticed: entry.last_practiced ? new Date(entry.last_practiced).getTime() : Date.now()
    }));

    return { data: mastery, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Fetch mastery for a specific topic
 */
export async function fetchTopicMasteryByTopic(
  userId: string,
  topic: string
): Promise<DatabaseResult<TopicMastery | null>> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase
      .from('topic_mastery')
      .select('user_id, topic, total_attempts, successful_attempts, mastery_level, last_practiced')
      .eq('user_id', userId)
      .eq('topic', topic)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }

    const mastery: TopicMastery = {
      userId: data.user_id,
      topic: data.topic,
      totalAttempts: data.total_attempts,
      successfulAttempts: data.successful_attempts,
      masteryLevel: data.mastery_level,
      lastPracticed: new Date(data.last_practiced).getTime()
    };

    return { data: mastery, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}
