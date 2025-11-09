import { supabase } from './client';

type SupabaseInstance = NonNullable<typeof supabase>;

function requireSupabase() {
  if (!supabase) {
    const error = new Error('Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.warn(error.message);
    throw error;
  }
  return supabase as SupabaseInstance;
}

export interface UserProgress {
  topicId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  lastAccessed: string;
}

export interface TaskAttempt {
  taskId: string;
  code: string;
  result: any;
  isCorrect: boolean;
  hintsUsed: number;
  timeSpent: number;
}

export interface TopicMastery {
  topic: string;
  masteryLevel: number;
  totalAttempts: number;
  successfulAttempts: number;
  lastPractice: string;
}

/**
 * Получить или создать пользователя
 */
export async function getOrCreateUser(username: string, email?: string) {
  const client = requireSupabase();

  const { data: existingUser, error: fetchError } = await client
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (existingUser) {
    return { data: existingUser, error: null };
  }

  if (fetchError && fetchError.code !== 'PGRST116') {
    return { data: null, error: fetchError };
  }

  const { data: newUser, error: createError } = await client
    .from('users')
    .insert([{ username, email }])
    .select()
    .single();

  return { data: newUser, error: createError };
}

/**
 * Сохранить прогресс по теме
 */
export async function saveProgress(
  userId: string,
  progress: UserProgress
) {
  const client = requireSupabase();

  const { data, error } = await client
    .from('user_progress')
    .upsert({
      user_id: userId,
      topic_id: progress.topicId,
      completed: progress.completed,
      score: progress.score,
      time_spent: progress.timeSpent,
      last_accessed: progress.lastAccessed,
    }, {
      onConflict: 'user_id,topic_id'
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Получить весь прогресс пользователя
 */
export async function getUserProgress(userId: string) {
  const client = requireSupabase();

  const { data, error } = await client
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  return { data, error };
}

/**
 * Сохранить попытку решения задачи
 */
export async function saveTaskAttempt(
  userId: string,
  attempt: TaskAttempt
) {
  const client = requireSupabase();

  const { data, error } = await client
    .from('task_attempts')
    .insert([{
      user_id: userId,
      task_id: attempt.taskId,
      code: attempt.code,
      result: attempt.result,
      is_correct: attempt.isCorrect,
      hints_used: attempt.hintsUsed,
      time_spent: attempt.timeSpent,
    }])
    .select()
    .single();

  return { data, error };
}

/**
 * Получить попытки решения задачи
 */
export async function getTaskAttempts(userId: string, taskId?: string) {
  const client = requireSupabase();

  let query = client
    .from('task_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (taskId) {
    query = query.eq('task_id', taskId);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Обновить мастерство по теме
 */
export async function updateTopicMastery(
  userId: string,
  topic: string,
  isCorrect: boolean
) {
  const client = requireSupabase();

  // Получить текущее мастерство
  const { data: existing } = await client
    .from('topic_mastery')
    .select('*')
    .eq('user_id', userId)
    .eq('topic', topic)
    .single();

  const totalAttempts = (existing?.total_attempts || 0) + 1;
  const successfulAttempts = (existing?.successful_attempts || 0) + (isCorrect ? 1 : 0);
  const masteryLevel = successfulAttempts / totalAttempts;

  const { data, error } = await client
    .from('topic_mastery')
    .upsert({
      user_id: userId,
      topic,
      mastery_level: masteryLevel,
      total_attempts: totalAttempts,
      successful_attempts: successfulAttempts,
      last_practice: new Date().toISOString(),
    }, {
      onConflict: 'user_id,topic'
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Получить мастерство по всем темам
 */
export async function getTopicMastery(userId: string) {
  const client = requireSupabase();

  const { data, error } = await client
    .from('topic_mastery')
    .select('*')
    .eq('user_id', userId)
    .order('mastery_level', { ascending: false });

  return { data, error };
}

/**
 * Разблокировать достижение
 */
export async function unlockAchievement(userId: string, achievementId: string) {
  const client = requireSupabase();

  const { data, error } = await client
    .from('user_achievements')
    .insert([{
      user_id: userId,
      achievement_id: achievementId,
    }])
    .select()
    .single();

  return { data, error };
}

/**
 * Получить достижения пользователя
 */
export async function getUserAchievements(userId: string) {
  const client = requireSupabase();

  const { data, error } = await client
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  return { data, error };
}

/**
 * Сохранить сгенерированный контент в кэш
 */
export async function cacheGeneratedContent(
  contentType: string,
  topic: string,
  difficulty: string,
  language: string,
  content: any,
  expiresInHours: number = 24
) {
  const client = requireSupabase();

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const { data, error } = await client
    .from('generated_content_cache')
    .insert([{
      content_type: contentType,
      topic,
      difficulty,
      language,
      content,
      expires_at: expiresAt.toISOString(),
    }])
    .select()
    .single();

  return { data, error };
}

/**
 * Получить кэшированный контент
 */
export async function getCachedContent(
  contentType: string,
  topic: string,
  difficulty: string,
  language: string
) {
  const client = requireSupabase();

  const { data, error } = await client
    .from('generated_content_cache')
    .select('*')
    .eq('content_type', contentType)
    .eq('topic', topic)
    .eq('difficulty', difficulty)
    .eq('language', language)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return { data, error };
}

