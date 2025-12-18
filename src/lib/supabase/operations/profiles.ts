/**
 * Profile Operations
 * Database operations for user profile management
 */

import { getSupabaseClient } from '../client';
import type { DatabaseResult } from '../types';

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
