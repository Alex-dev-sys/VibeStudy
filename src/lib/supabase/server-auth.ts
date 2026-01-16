import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { User } from './types';

/**
 * Server-side Authentication
 * For use in API routes and server components
 */

/**
 * Get current user from server-side context
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[server-auth] Supabase not configured');
    return null;
  }

  try {
    const cookieStore = cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting may fail in API routes - this is expected
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Cookie removal may fail in API routes - this is expected
          }
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('[server-auth] Error getting user:', error.message);
      return null;
    }

    if (data.user) {
      // Redact user ID for privacy - only log first 8 characters
      console.log('[server-auth] User authenticated:', data.user.id.slice(0, 8) + '...');
    } else {
      console.log('[server-auth] No user found in session');
    }

    return data.user;
  } catch (error) {
    console.error('[server-auth] Exception getting user:', error);
    return null;
  }
}
