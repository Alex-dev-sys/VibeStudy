import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration interface
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;
let isConfigured = false;

/**
 * Initialize Supabase client with environment variables
 * Gracefully degrades if environment variables are not set
 */
function initializeSupabase(): SupabaseClient | null {
  // Check if already initialized
  if (supabaseInstance !== null) {
    return supabaseInstance;
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if Supabase is configured
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '⚠️ Supabase not configured. Running in guest mode. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable cloud features.'
    );
    isConfigured = false;
    return null;
  }

  // Create Supabase client
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
    isConfigured = true;
    console.log('✅ Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    isConfigured = false;
    return null;
  }
}

/**
 * Get Supabase client instance (singleton pattern)
 * Returns null if Supabase is not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance === null) {
    return initializeSupabase();
  }
  return supabaseInstance;
}

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseConfigured(): boolean {
  if (supabaseInstance === null) {
    initializeSupabase();
  }
  return isConfigured;
}

/**
 * Get Supabase client or throw error if not configured
 * Use this when Supabase is required for the operation
 */
export function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase is not configured. This feature requires cloud storage. ' +
      'Please sign in or configure Supabase environment variables.'
    );
  }
  return client;
}

// Export the client for convenience
export const supabase = getSupabaseClient();
