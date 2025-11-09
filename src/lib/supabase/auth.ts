import { supabase } from './client';

/**
 * Вход через Email (Magic Link)
 */
export async function signInWithEmail(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) {
    console.error('Ошибка входа через Email:', error);
    return { error };
  }

  return { data };
}

/**
 * Вход через Google
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Ошибка входа через Google:', error);
    return { error };
  }

  return { data };
}


/**
 * Выход
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Ошибка выхода:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Ошибка получения пользователя:', error);
    return { user: null, error };
  }

  return { user, error: null };
}

/**
 * Подписаться на изменения аутентификации
 */
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}

