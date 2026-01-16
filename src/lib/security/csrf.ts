/**
 * CSRF Protection Utility
 * Protects against Cross-Site Request Forgery attacks
 * Uses double-submit cookie pattern with cryptographic signing
 */

import { createHmac, randomBytes } from 'crypto';
import { NextRequest } from 'next/server';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Generate a CSRF token with cryptographic signature
 */
export function generateCsrfToken(): string {
  const randomToken = randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
  const timestamp = Date.now().toString();
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(`${randomToken}:${timestamp}`)
    .digest('hex')
    .slice(0, 16);

  return `${randomToken}.${timestamp}.${signature}`;
}

/**
 * Verify CSRF token signature and expiration
 */
export function verifyCsrfToken(token: string): boolean {
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

    // Verify signature
    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(`${randomToken}:${timestamp}`)
      .digest('hex')
      .slice(0, 16);

    return providedSignature === expectedSignature;
  } catch {
    return false;
  }
}

/**
 * Extract CSRF token from request
 */
export function extractCsrfToken(request: NextRequest): string | null {
  // Try header first (for API requests)
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  // Try cookie (for form submissions)
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Validate CSRF token from request
 * Compares header token with cookie token (double-submit pattern)
 */
export function validateCsrfToken(request: NextRequest): boolean {
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
  return verifyCsrfToken(headerToken);
}

/**
 * Check if request needs CSRF protection
 * Only state-changing methods (POST, PUT, DELETE, PATCH) need CSRF protection
 */
export function needsCsrfProtection(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
}

/**
 * Middleware wrapper for API routes that require CSRF protection
 */
export function withCsrfProtection<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  options?: { skipValidation?: boolean }
): T {
  return (async (...args: any[]) => {
    const request = args[0] as NextRequest;

    // Skip CSRF check for safe methods
    if (!needsCsrfProtection(request)) {
      return handler(...args);
    }

    // Skip validation if explicitly disabled (for testing)
    if (options?.skipValidation) {
      return handler(...args);
    }

    // Validate CSRF token
    if (!validateCsrfToken(request)) {
      return new Response(
        JSON.stringify({
          error: 'CSRF_TOKEN_INVALID',
          message: 'Invalid or missing CSRF token',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return handler(...args);
  }) as T;
}

/**
 * Generate Set-Cookie header for CSRF token
 */
export function getCsrfCookieHeader(token: string): string {
  return `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`;
}

export { CSRF_HEADER_NAME, CSRF_COOKIE_NAME };
