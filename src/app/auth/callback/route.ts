import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const origin = requestUrl.origin;

  console.log('[Auth Callback] Request URL:', requestUrl.href);
  console.log('[Auth Callback] Code present:', !!code);
  console.log('[Auth Callback] Error:', error);

  // If there's an error but tokens are in hash (OAuth flow), redirect to learn
  // The client-side Supabase will handle the hash tokens
  if (error === 'no_code' && requestUrl.hash.includes('access_token')) {
    console.log('[Auth Callback] OAuth flow detected, redirecting to /learn for client-side token handling');
    return NextResponse.redirect(`${origin}/learn${requestUrl.hash}`);
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Auth Callback] Supabase not configured');
      return NextResponse.redirect(`${origin}/login?error=config_missing`);
    }

    // Create response first so we can set cookies on it
    const redirectUrl = new URL('/learn', origin);
    let response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on both request and response
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from both request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('[Auth Callback] Exchange result:', {
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      error: error?.message
    });

    if (!error && data.session) {
      // Check if this is a new user registration
      const user = data.user;
      const createdAt = new Date(user.created_at).getTime();
      const lastSignIn = new Date(user.last_sign_in_at || user.created_at).getTime();
      const isNewUser = Math.abs(createdAt - lastSignIn) < 5000;

      console.log('[Auth Callback] User info:', {
        userId: user.id,
        email: user.email,
        isNewUser
      });

      // Create profile for new users
      if (isNewUser) {
        try {
          const provider = user.app_metadata?.provider || 'email';

          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                provider,
                created_at: new Date().toISOString(),
              });

            console.log('[Auth Callback] Created profile for new user:', user.id);
          }
        } catch (profileError) {
          console.error('[Auth Callback] Error in profile creation:', profileError);
        }
      }

      console.log('[Auth Callback] Auth successful, redirecting to /learn');

      // Cookies are already set on the response object, just return it
      return response;
    } else {
      console.error('[Auth Callback] Failed to exchange code:', error?.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  console.log('[Auth Callback] Fallback redirect - no code');
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
