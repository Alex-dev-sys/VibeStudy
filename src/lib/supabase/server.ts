// Supabase Server Client

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, some features may not work');
    // Return a mock client for development
    return createMockClient();
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

// Mock client for when Supabase is not configured
function createMockClient() {
  return {
    from: (table: string) => ({
      select: () => ({ 
        eq: () => ({ 
          single: async () => ({ data: null, error: null }),
          order: () => ({ data: [], error: null }),
          limit: () => ({ data: [], error: null })
        }),
        gte: () => ({ 
          order: () => ({ data: [], error: null })
        }),
        order: () => ({ data: [], error: null })
      }),
      insert: () => ({ 
        select: () => ({ 
          single: async () => ({ data: null, error: null })
        })
      }),
      update: () => ({ 
        eq: () => ({ 
          select: () => ({ 
            single: async () => ({ data: null, error: null })
          })
        })
      }),
      upsert: () => ({ 
        select: () => ({ 
          single: async () => ({ data: null, error: null })
        })
      })
    }),
    rpc: async () => ({ error: null })
  } as any;
}

