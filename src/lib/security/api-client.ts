/**
 * Secure API Client
 * 
 * Handles CSRF tokens and secure API calls.
 * Use this utility for all API mutations (POST, PUT, DELETE, PATCH).
 */

const CSRF_TOKEN_KEY = 'csrf_token';
let cachedCsrfToken: string | null = null;

/**
 * Fetch a new CSRF token from the server
 */
export async function fetchCsrfToken(): Promise<string> {
    try {
        const response = await fetch('/api/csrf', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token');
        }

        const data = await response.json();
        cachedCsrfToken = data.token;
        return data.token;
    } catch (error) {
        console.error('[api-client] Failed to get CSRF token:', error);
        throw error;
    }
}

/**
 * Get the current CSRF token, fetching a new one if needed
 */
export async function getCsrfToken(): Promise<string> {
    if (cachedCsrfToken) {
        return cachedCsrfToken;
    }
    return fetchCsrfToken();
}

/**
 * Clear the cached CSRF token (call after logout or session expiry)
 */
export function clearCsrfToken(): void {
    cachedCsrfToken = null;
}

/**
 * Make a secure API request with CSRF protection
 */
export async function secureApiRequest<T = unknown>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();

    // Add CSRF token for mutation requests
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        const csrfToken = await getCsrfToken();
        headers['x-csrf-token'] = csrfToken;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Always include cookies
    });

    // If CSRF token is invalid, refresh and retry once
    if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.error === 'CSRF_TOKEN_INVALID') {
            console.warn('[api-client] CSRF token expired, refreshing...');
            cachedCsrfToken = null;
            const newToken = await fetchCsrfToken();
            headers['x-csrf-token'] = newToken;

            const retryResponse = await fetch(url, {
                ...options,
                headers,
                credentials: 'include',
            });

            if (!retryResponse.ok) {
                const retryErrorData = await retryResponse.json();
                throw new Error(retryErrorData.error || retryErrorData.message || 'Request failed');
            }

            return retryResponse.json();
        }
        throw new Error(errorData.error || errorData.message || 'Forbidden');
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Request failed');
    }

    return response.json();
}

/**
 * Convenience methods for common HTTP verbs
 */
export const secureApi = {
    get: <T = unknown>(url: string) =>
        secureApiRequest<T>(url, { method: 'GET' }),

    post: <T = unknown>(url: string, data?: unknown) =>
        secureApiRequest<T>(url, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        }),

    put: <T = unknown>(url: string, data?: unknown) =>
        secureApiRequest<T>(url, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        }),

    patch: <T = unknown>(url: string, data?: unknown) =>
        secureApiRequest<T>(url, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined
        }),

    delete: <T = unknown>(url: string) =>
        secureApiRequest<T>(url, { method: 'DELETE' }),
};
