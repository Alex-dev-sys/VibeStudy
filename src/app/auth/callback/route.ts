import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('[Auth Callback] Request URL:', requestUrl.href);
  console.log('[Auth Callback] Code present:', !!code);

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    console.log('[Auth Callback] Exchange result:', { 
      hasSession: !!data?.session, 
      hasUser: !!data?.user,
      error: error?.message 
    });
    
    if (!error && data.session) {
      // Check if this is a new user registration
      // New users have created_at equal to last_sign_in_at (within a small time window)
      const user = data.user;
      const createdAt = new Date(user.created_at).getTime();
      const lastSignIn = new Date(user.last_sign_in_at || user.created_at).getTime();
      const isNewUser = Math.abs(createdAt - lastSignIn) < 5000; // Within 5 seconds
      
      console.log('[Auth Callback] User info:', {
        userId: user.id,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
        isNewUser,
        timeDiff: Math.abs(createdAt - lastSignIn)
      });
      
      // Redirect to /learn with registration flag if new user
      const redirectUrl = new URL('/learn', origin);
      if (isNewUser) {
        redirectUrl.searchParams.set('registered', 'true');
        
        // Pass referral code to the client if present in session
        // The client will handle creating the referral record
        redirectUrl.searchParams.set('new_user', 'true');
      }
      
      console.log('[Auth Callback] Redirecting to:', redirectUrl.href);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Fallback to /learn on error or missing code
  console.log('[Auth Callback] Fallback redirect to /learn');
  return NextResponse.redirect(`${origin}/learn`);
}
