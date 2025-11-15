import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
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
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('[server-auth] Cookies count:', allCookies.length);
    console.log('[server-auth] Cookie names:', allCookies.map(c => c.name));
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              console.warn('[server-auth] Could not set cookies:', error);
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('[server-auth] Error getting user:', error.message);
      return null;
    }

    if (data.user) {
      console.log('[server-auth] User authenticated:', data.user.id);
    } else {
      console.log('[server-auth] No user found in session');
    }

    return data.user;
  } catch (error) {
    console.error('[server-auth] Exception getting user:', error);
    return null;
  }
}
