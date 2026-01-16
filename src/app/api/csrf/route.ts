import { NextResponse } from 'next/server';
import { generateCsrfToken, getCsrfCookieHeader } from '@/lib/security/csrf';

/**
 * API Route: Get CSRF Token
 * 
 * Returns a new CSRF token and sets it as a cookie.
 * This should be called when the page loads to get a token for subsequent requests.
 */
export async function GET() {
    try {
        const token = generateCsrfToken();

        const response = NextResponse.json({
            success: true,
            token,
        });

        // Set the CSRF cookie
        response.headers.set('Set-Cookie', getCsrfCookieHeader(token));

        return response;
    } catch (error) {
        console.error('[csrf] Error generating token:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate CSRF token' },
            { status: 500 }
        );
    }
}
