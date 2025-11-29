// Telegram Bot Database Utilities

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type {
  TelegramProfile,
  ReminderSchedule,
  TelegramMessage,
  LearningAnalytics,
  BotConversation,
  AIQuestionTracking,
  UserAnalyticsSummary,
  ReminderType,
  MessageType
} from '@/types/telegram';
import { AI_DAILY_QUESTIONS_LIMIT } from './constants';

// ============================================================================
// Helper: Supabase Client with Connection Pooling
// ============================================================================

/**
 * Singleton Supabase client instance
 * Reuses the same client across multiple requests for better performance
 */
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

function createClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    throw new Error('Supabase credentials not configured');
  }

  // Create and cache the client
  supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return supabaseClient;
}

// ============================================================================
// Telegram Profiles
// ============================================================================

export async function getTelegramProfile(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_telegram_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching telegram profile:', error);
    return { data: null, error };
  }
  
  return { data: data as TelegramProfile, error: null };
}

export async function getTelegramProfileByTelegramId(telegramUserId: number) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_telegram_profiles')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();
  
  if (error) {
    console.error('Error fetching telegram profile by telegram id:', error);
    return { data: null, error };
  }
  
  return { data: data as TelegramProfile, error: null };
}

export async function upsertTelegramProfile(profile: Partial<TelegramProfile>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_telegram_profiles')
    .upsert(profile as any, { onConflict: 'telegram_user_id' })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting telegram profile:', error);
    return { data: null, error };
  }
  
  return { data: data as TelegramProfile, error: null };
}

export async function updateTelegramPreferences(userId: string, preferences: Record<string, any>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_telegram_profiles')
    // @ts-expect-error - Supabase client types are not properly defined for this table
    .update({ preferences } as any)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating telegram preferences:', error);
    return { data: null, error };
  }
  
  return { data: data as TelegramProfile, error: null };
}

// ============================================================================
// Reminder Schedules
// ============================================================================

export async function getReminderSchedules(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reminder_schedules')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_time');
  
  if (error) {
    console.error('Error fetching reminder schedules:', error);
    return { data: null, error };
  }
  
  return { data: data as ReminderSchedule[], error: null };
}

export async function upsertReminderSchedule(schedule: Partial<ReminderSchedule>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('reminder_schedules')
    .upsert(schedule as any)
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting reminder schedule:', error);
    return { data: null, error };
  }
  
  return { data: data as ReminderSchedule, error: null };
}

export async function updateReminderIgnoreCount(scheduleId: string, increment: boolean = true) {
  const supabase = createClient();
  
  const { data: current } = await supabase
    .from('reminder_schedules')
    .select('ignore_count')
    .eq('id', scheduleId)
    .single();
  
  if (!current) return { data: null, error: new Error('Schedule not found') };
  
  // @ts-expect-error - Supabase client types are not properly defined for this table
  const newCount = increment ? (current.ignore_count || 0) + 1 : 0;
  
  const { data, error } = await supabase
    .from('reminder_schedules')
    // @ts-expect-error - Supabase client types are not properly defined for this table
    .update({ ignore_count: newCount, last_sent_at: new Date().toISOString() } as any)
    .eq('id', scheduleId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating reminder ignore count:', error);
    return { data: null, error };
  }
  
  return { data: data as ReminderSchedule, error: null };
}

export async function getDueReminders(currentTime: string, timezone: string = 'Europe/Moscow') {
  const supabase = createClient();
  
  // Get reminders that should be sent now
  const { data, error } = await supabase
    .from('reminder_schedules')
    .select(`
      *,
      user_telegram_profiles!inner(*)
    `)
    .eq('enabled', true)
    .eq('timezone', timezone)
    .lte('scheduled_time', currentTime);
  
  if (error) {
    console.error('Error fetching due reminders:', error);
    return { data: null, error };
  }
  
  return { data, error: null };
}


// ============================================================================
// Telegram Messages
// ============================================================================

export async function logTelegramMessage(
  userId: string,
  telegramUserId: number,
  messageType: MessageType,
  content: string,
  metadata: Record<string, any> = {}
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('telegram_messages')
    .insert({
      user_id: userId,
      telegram_user_id: telegramUserId,
      message_type: messageType,
      content,
      metadata
    } as any)
    .select()
    .single();
  
  if (error) {
    console.error('Error logging telegram message:', error);
    return { data: null, error };
  }
  
  return { data: data as TelegramMessage, error: null };
}

export async function getRecentMessages(userId: string, limit: number = 50) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('telegram_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recent messages:', error);
    return { data: null, error };
  }
  
  return { data: data as TelegramMessage[], error: null };
}

// ============================================================================
// Learning Analytics
// ============================================================================

export async function upsertLearningAnalytics(analytics: Partial<LearningAnalytics>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('learning_analytics')
    .upsert(analytics as any, { onConflict: 'user_id,date' })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting learning analytics:', error);
    return { data: null, error };
  }
  
  return { data: data as LearningAnalytics, error: null };
}

export async function getLearningAnalytics(userId: string, days: number = 30) {
  const supabase = createClient();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('learning_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching learning analytics:', error);
    return { data: null, error };
  }
  
  return { data: data as LearningAnalytics[], error: null };
}

export async function getAnalyticsSummary(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_analytics_summary')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching analytics summary:', error);
    return { data: null, error };
  }
  
  return { data: data as UserAnalyticsSummary, error: null };
}

// ============================================================================
// Bot Conversations
// ============================================================================

export async function getConversation(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('bot_conversations')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // Not found is ok
    console.error('Error fetching conversation:', error);
    return { data: null, error };
  }
  
  return { data: data as BotConversation | null, error: null };
}

export async function upsertConversation(conversation: Partial<BotConversation>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('bot_conversations')
    .upsert(conversation as any, { onConflict: 'user_id' })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting conversation:', error);
    return { data: null, error };
  }
  
  return { data: data as BotConversation, error: null };
}

export async function updateConversationContext(userId: string, context: Record<string, any>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('bot_conversations')
    // @ts-expect-error - Supabase client types are not properly defined for this table
    .update({ 
      conversation_context: context,
      last_interaction_at: new Date().toISOString()
    } as any)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating conversation context:', error);
    return { data: null, error };
  }
  
  return { data: data as BotConversation, error: null };
}

// ============================================================================
// AI Question Tracking
// ============================================================================

export async function getAIQuestionTracking(userId: string) {
  const supabase = createClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('ai_question_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  
  if (error && error.code !== 'PGRST116') { // Not found is ok
    console.error('Error fetching AI question tracking:', error);
    return { data: null, error };
  }
  
  // If no record for today, create one
  if (!data) {
    const { data: newData, error: insertError } = await supabase
      .from('ai_question_tracking')
      .insert({
        user_id: userId,
        date: today,
        questions_asked: 0,
        questions_remaining: AI_DAILY_QUESTIONS_LIMIT
      } as any)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating AI question tracking:', insertError);
      return { data: null, error: insertError };
    }
    
    return { data: newData as AIQuestionTracking, error: null };
  }
  
  return { data: data as AIQuestionTracking, error: null };
}

export async function incrementAIQuestionCount(userId: string) {
  const supabase = createClient();
  
  const today = new Date().toISOString().split('T')[0];
  
  // Get current tracking
  const { data: current } = await getAIQuestionTracking(userId);
  
  if (!current || current.questions_remaining <= 0) {
    return { data: null, error: new Error('No questions remaining') };
  }
  
  const { data, error } = await supabase
    .from('ai_question_tracking')
    // @ts-expect-error - Supabase client types are not properly defined for this table
    .update({
      questions_asked: current.questions_asked + 1,
      questions_remaining: current.questions_remaining - 1,
      last_question_at: new Date().toISOString()
    } as any)
    .eq('user_id', userId)
    .eq('date', today)
    .select()
    .single();
  
  if (error) {
    console.error('Error incrementing AI question count:', error);
    return { data: null, error };
  }
  
  return { data: data as AIQuestionTracking, error: null };
}

// ============================================================================
// Utility Functions
// ============================================================================

export async function refreshAnalyticsSummary() {
  const supabase = createClient();
  
  const { error } = await supabase.rpc('refresh_analytics_summary');
  
  if (error) {
    console.error('Error refreshing analytics summary:', error);
    return { error };
  }
  
  return { error: null };
}

export async function cleanupOldMessages() {
  const supabase = createClient();
  
  const { error } = await supabase.rpc('cleanup_old_messages');
  
  if (error) {
    console.error('Error cleaning up old messages:', error);
    return { error };
  }
  
  return { error: null };
}

export async function resetDailyAILimits() {
  const supabase = createClient();
  
  const { error } = await supabase.rpc('reset_daily_ai_limits');
  
  if (error) {
    console.error('Error resetting daily AI limits:', error);
    return { error };
  }
  
  return { error: null };
}

