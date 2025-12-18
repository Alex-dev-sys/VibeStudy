import { getSupabaseClient, isSupabaseConfigured } from "./client";
import type {
  AuthResult,
  AuthCallback,
  Unsubscribe,
  User,
  Session,
  ProfileUpdates,
} from "./types";
import { logWarn, logError } from "@/lib/core/logger";

/**
 * Authentication Service
 * Handles user authentication with Google OAuth and Email Magic Link
 */

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      user: null,
      session: null,
      error: new Error(
        "Supabase is not configured. Please set up environment variables.",
      ),
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      return { user: null, session: null, error };
    }

    // OAuth redirects, so we won't have user/session immediately
    return { user: null, session: null, error: null };
  } catch (error) {
    return {
      user: null,
      session: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error during Google sign in"),
    };
  }
}

/**
 * Sign in with Email (Magic Link)
 */
export async function signInWithEmail(email: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      user: null,
      session: null,
      error: new Error(
        "Supabase is not configured. Please set up environment variables.",
      ),
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { user: null, session: null, error };
    }

    // Magic link sent, user needs to check email
    return { user: null, session: null, error: null };
  } catch (error) {
    return {
      user: null,
      session: null,
      error:
        error instanceof Error
          ? error
          : new Error("Unknown error during email sign in"),
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    logWarn("Supabase not configured, nothing to sign out from");
    return;
  }

  try {
    await supabase.auth.signOut();
  } catch (error) {
    logError("Error signing out", error as Error);
    throw error;
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      logError("Error getting session", error as Error);
      return null;
    }

    return data.session;
  } catch (error) {
    logError("Error getting session", error as Error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      logError("Error getting user", error as Error);
      return null;
    }

    return data.user;
  } catch (error) {
    logError("Error getting user", error as Error);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: AuthCallback): Unsubscribe {
  const supabase = getSupabaseClient();

  if (!supabase) {
    logWarn("Supabase not configured, auth state changes will not be tracked");
    return () => {}; // Return empty unsubscribe function
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Update user profile metadata
 */
export async function updateUserProfile(
  updates: ProfileUpdates,
): Promise<void> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  try {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    logError("Error updating user profile", error as Error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const session = await getSession();
  return session !== null;
}
