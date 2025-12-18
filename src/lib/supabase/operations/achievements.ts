/**
 * Achievement Operations
 * Database operations for user achievements and stats
 */

import { getSupabaseClient } from '../client';
import type { DatabaseResult } from '../types';
import type { UserStats, Achievement } from '@/types/achievements';
import type { UserAchievementRow } from '../database-types';

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

    // Transform to Achievement format
    const achievements = data.map((entry: UserAchievementRow) => ({
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
 * Update user stats
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
