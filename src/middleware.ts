import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// CSRF token validation using Web Crypto API (Edge Runtime compatible)
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf_token';

function getCsrfSecret(): string | null {
  return process.env.CSRF_SECRET || null;
}
// Convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Create HMAC-SHA256 signature using Web Crypto API
async function createHmacSignature(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret) as BufferSource;
  const dataToSign = encoder.encode(data) as BufferSource;

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    dataToSign
  );

  return arrayBufferToHex(signature).slice(0, 16);
}

async function verifyCsrfToken(token: string): Promise<boolean> {
  const secret = getCsrfSecret();
  if (!secret) {
    // No secret configured - skip validation in development
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    return true;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const [randomToken, timestamp, providedSignature] = parts;

    // Check token expiration (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return false;
    }

    // Verify signature using Web Crypto
    const expectedSignature = await createHmacSignature(secret, `${randomToken}:${timestamp}`);

    return providedSignature === expectedSignature;
  } catch {
    return false;
  }
}

async function validateCsrfForRequest(request: NextRequest): Promise<boolean> {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  // Both must exist
  if (!headerToken || !cookieToken) {
    return false;
  }

  // Both must match
  if (headerToken !== cookieToken) {
    return false;
  }

  // Token must be valid
  return await verifyCsrfToken(headerToken);
}

// Endpoints exempt from CSRF protection (webhooks, external callbacks)
const CSRF_EXEMPT_PATHS = [
  '/api/webhook',
  '/api/telegram/webhook',
  '/api/cron/',
  '/api/health',
  '/api/ton/create-payment', // Initial payment creation needs no CSRF
];

function needsCsrfProtection(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return false;
  }

  const pathname = request.nextUrl.pathname;

  // Check if path is exempt
  for (const exemptPath of CSRF_EXEMPT_PATHS) {
    if (pathname.startsWith(exemptPath)) {
      return false;
    }
  }

  return true;
}

export async function middleware(request: NextRequest) {
  // Mobile detection - redirect to mobile-redirect page
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Exclude API routes, static files, and mobile-redirect page itself
  const isMobileRedirectPage = request.nextUrl.pathname === '/mobile-redirect';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isStaticFile = request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/);

  if (isMobile && !isMobileRedirectPage && !isApiRoute && !isStaticFile) {
    return NextResponse.redirect(new URL('/mobile-redirect', request.url));
  }

  // CSRF Protection for API mutation endpoints
  if (isApiRoute && needsCsrfProtection(request)) {
    const isValidCsrf = await validateCsrfForRequest(request);
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: 'CSRF_TOKEN_INVALID', message: 'Invalid or missing CSRF token' },
        { status: 403 }
      );
    }
  }

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
  const { data: { user } } = await supabase.auth.getUser();

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

