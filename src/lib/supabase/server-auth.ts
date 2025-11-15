import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
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
    
    // Find the access token from cookies
    const accessTokenCookie = allCookies.find(
      cookie => cookie.name.includes('access-token') || cookie.name.includes('access_token')
    );
    
    if (!accessTokenCookie) {
      console.log('[server-auth] No access token found in cookies');
      return null;
    }
    
    console.log('[server-auth] Found access token cookie:', accessTokenCookie.name);
    
    // Create Supabase client with the access token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessTokenCookie.value}`
        }
      }
    });

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
