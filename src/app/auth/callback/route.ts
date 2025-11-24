import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('[Auth Callback] Request URL:', requestUrl.href);
  console.log('[Auth Callback] Code present:', !!code);

  // Define a default redirect URL. This will be updated later.
  // The response object is created here so that the Supabase client can set cookies on it.
  const response = NextResponse.redirect(`${origin}/login?error=auth_failed`);

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Auth Callback] Supabase not configured');
      response.headers.set('Location', `${origin}/login?error=config_missing`);
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on the response object
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from the response object
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
      const isNewUser = Math.abs(createdAt - lastSignIn) < 5000; // Within 5 seconds

      console.log('[Auth Callback] User info:', {
        userId: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
        isNewUser,
        timeDiff: Math.abs(createdAt - lastSignIn)
      });

      // Create or update profile for new users
      if (isNewUser) {
        try {
          const provider = user.app_metadata?.provider || 'email';

          // Check if profile already exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            // Create new profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                provider,
                created_at: new Date().toISOString(),
              });

            if (profileError) {
              console.error('[Auth Callback] Error creating profile:', profileError);
            } else {
              console.log('[Auth Callback] Created profile for new user:', user.id);
            }
          }
        } catch (profileError) {
          console.error('[Auth Callback] Error in profile creation:', profileError);
        }
      }

      const redirectUrl = new URL('/learn', origin);
      if (isNewUser) {
        redirectUrl.searchParams.set('new_user', 'true');
      }
      // Always set migrate_guest flag to trigger migration check on client
      redirectUrl.searchParams.set('migrate_guest', 'true');

      console.log('[Auth Callback] Redirecting to:', redirectUrl.href);

      // Update the response's redirect location
      response.headers.set('Location', redirectUrl.href);
      return response;
    } else {
      console.error('[Auth Callback] Failed to exchange code:', error?.message);
      response.headers.set('Location', `${origin}/login?error=auth_failed`);
      return response;
    }
  }

  // Fallback to /login?error=no_code if no code is present
  console.log('[Auth Callback] Fallback redirect to /login?error=no_code - no code');
  response.headers.set('Location', `${origin}/login?error=no_code`);
  return response;
}
