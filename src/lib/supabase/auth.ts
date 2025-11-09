import { supabase } from './client';

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:3000';
};

/**
 * Вход через Email (Magic Link)
 */
export async function signInWithEmail(email: string) {
  if (!supabase) {
    return { error: new Error('Supabase не настроен') };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getBaseUrl()}/learn`,
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
  if (!supabase) {
    return { error: new Error('Supabase не настроен') };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
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
  if (!supabase) {
    // В гостевом режиме просто очищаем localStorage
    localStorage.removeItem('guestMode');
    return { error: null };
  }

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
  if (!supabase) {
    // В гостевом режиме возвращаем null
    return { user: null, error: null };
  }

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
  if (!supabase) {
    // В гостевом режиме сразу вызываем callback с null
    callback(null);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}

