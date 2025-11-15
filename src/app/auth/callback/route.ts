import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      // Check if this is a new user registration
      // New users have created_at equal to last_sign_in_at (within a small time window)
      const user = data.user;
      const createdAt = new Date(user.created_at).getTime();
      const lastSignIn = new Date(user.last_sign_in_at || user.created_at).getTime();
      const isNewUser = Math.abs(createdAt - lastSignIn) < 5000; // Within 5 seconds
      
      // Redirect to /learn with registration flag if new user
      const redirectUrl = new URL('/learn', origin);
      if (isNewUser) {
        redirectUrl.searchParams.set('registered', 'true');
      }
      
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Fallback to /learn on error or missing code
  return NextResponse.redirect(`${origin}/learn`);
}
