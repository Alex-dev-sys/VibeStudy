import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
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
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  // Refresh session if expired - required for Server Components
  const { data: { user }, error } = await supabase.auth.getUser();

  // Debug logging
  console.log('[Middleware] Path:', request.nextUrl.pathname);
  console.log('[Middleware] Cookies:', request.cookies.getAll().map(c => c.name).join(', '));
  console.log('[Middleware] User found:', !!user);
  if (error) console.log('[Middleware] Auth error:', error.message);

  // Auth Redirect Logic
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register';
  const isRootPage = request.nextUrl.pathname === '/';
  const isLearnPage = request.nextUrl.pathname.startsWith('/learn');

  // If user is signed in and tries to access root, login or register page, redirect to /learn
  if (user && (isRootPage || isAuthPage)) {
    return NextResponse.redirect(new URL('/learn', request.url));
  }

  // If user is NOT signed in and tries to access protected pages (like /learn), redirect to /login
  // Note: We might want to allow some public access, but for now /learn is protected
  if (!user && isLearnPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
