// Supabase Server Client

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured, some features may not work');
    // Return a mock client for development
    return createMockClient();
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
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

