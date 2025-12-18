/**
 * Task Attempt Operations
 * Database operations for task attempts and submissions
 */

import { getSupabaseClient } from '../client';
import type { DatabaseResult } from '../types';
import type { TaskAttemptRow } from '../database-types';

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

    const attempts: TaskAttempt[] = data.map((entry: TaskAttemptRow) => ({
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

    const attempts: TaskAttempt[] = data.map((entry: TaskAttemptRow) => ({
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
