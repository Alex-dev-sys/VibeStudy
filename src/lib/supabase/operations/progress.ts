/**
 * Progress Operations
 * Database operations for user progress tracking
 */

import { getSupabaseClient } from '../client';
import type { DatabaseResult } from '../types';
import type { DayStateSnapshot, ProgressRecord } from '@/types';
import type { UserProgressRow } from '../database-types';
import { logWarn } from '@/lib/core/logger';

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

    data.forEach((entry: UserProgressRow) => {
      const day = parseInt(entry.topic_id.replace('day_', ''), 10);

      // Skip invalid entries
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
        if (languageId === 'python') {
          languageId = entry.metadata.languageId;
        }
      }

      // Collect history entries from metadata
      if (entry.metadata?.history && Array.isArray(entry.metadata.history)) {
        entry.metadata.history.forEach((histEntry) => {
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
