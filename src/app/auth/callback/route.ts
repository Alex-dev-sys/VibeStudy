import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // If there's a code, handle it server-side (magic link flow)
  if (code) {
    const { createServerClient } = await import('@supabase/ssr');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(`${origin}/login?error=config_missing`);
    }

    const redirectUrl = new URL('/learn', origin);
    let response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Force path to / and remove domain to avoid issues with Vercel preview URLs
          const cookieOptions = {
            ...options,
            path: '/',
            domain: undefined,
            maxAge: 60 * 60 * 24 * 7, // Force 1 week persistence
          };
          request.cookies.set({ name, value, ...cookieOptions });
          response.cookies.set({ name, value, ...cookieOptions });
        },
        remove(name: string, options: any) {
          const cookieOptions = { ...options, path: '/', domain: undefined };
          request.cookies.set({ name, value: '', ...cookieOptions });
          response.cookies.set({ name, value: '', ...cookieOptions });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const user = data.user;
      const createdAt = new Date(user.created_at).getTime();
      const lastSignIn = new Date(user.last_sign_in_at || user.created_at).getTime();
      const isNewUser = Math.abs(createdAt - lastSignIn) < 5000;

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
          }
        } catch (profileError) {
          console.error('[Auth Callback] Profile error:', profileError);
        }
      }

      return response;
    } else {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }

  // No code - likely OAuth flow with hash tokens
  // Return HTML that will handle hash client-side and redirect
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // OAuth tokens are in the hash, redirect to /learn with the hash
    window.location.replace('/learn' + window.location.hash);
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}
