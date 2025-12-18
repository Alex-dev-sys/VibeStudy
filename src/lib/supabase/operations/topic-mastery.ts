/**
 * Topic Mastery Operations
 * Database operations for topic mastery tracking
 */

import { getSupabaseClient } from '../client';
import type { DatabaseResult } from '../types';
import type { TopicMasteryRow } from '../database-types';

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

    const mastery: TopicMastery[] = data.map((entry: TopicMasteryRow) => ({
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
