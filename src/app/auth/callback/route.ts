import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/learn';

  console.log('[Auth Callback] Code present:', !!code);

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Auth Callback] Supabase not configured');
      return NextResponse.redirect(`${origin}/login?error=config_missing`);
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('[Auth Callback] Exchange result:', {
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      error: error?.message
    });

    if (!error && data.session) {
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
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email,
              provider,
              created_at: new Date().toISOString(),
            });
            console.log('[Auth Callback] Created profile for new user');
          }
        } catch (profileError) {
          console.error('[Auth Callback] Error creating profile:', profileError);
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      const redirectUrl = new URL(next, origin);
      if (isNewUser) {
        redirectUrl.searchParams.set('new_user', 'true');
      }
      redirectUrl.searchParams.set('migrate_guest', 'true');

      console.log('[Auth Callback] Redirecting to:', redirectUrl.href);

      // Create redirect response
      const response = NextResponse.redirect(redirectUrl);

      // Set cookies on response
      request.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie);
      });

      return response;
    }

    console.error('[Auth Callback] Failed to exchange code:', error?.message);
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
