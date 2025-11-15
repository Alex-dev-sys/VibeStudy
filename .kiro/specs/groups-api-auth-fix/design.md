# Design Document

## Overview

This design addresses the authentication failure in Groups API by replacing the incorrect cookie-based token retrieval approach in `server-auth.ts` with the proper Supabase SSR implementation. The current implementation attempts to manually extract access tokens from cookies, which fails because it doesn't understand Supabase's cookie structure. The solution is to use `@supabase/ssr`'s `createServerClient` with proper cookie handlers, matching the approach already used successfully in `middleware.ts`.

## Architecture

### Current Architecture (Broken)

```
API Route (e.g., /api/groups)
    ↓
getCurrentUser() in server-auth.ts
    ↓
cookies() → Manual search for "access-token" cookie
    ↓
createClient() with Authorization header
    ↓
❌ FAILS: Cookie not found or invalid format
```

### New Architecture (Fixed)

```
API Route (e.g., /api/groups)
    ↓
getCurrentUser() in server-auth.ts
    ↓
cookies() → Cookie store wrapper
    ↓
createServerClient() with cookie handlers
    ↓
supabase.auth.getUser() → Automatic session retrieval
    ↓
✅ SUCCESS: User authenticated
```

## Components and Interfaces

### 1. Server Auth Module (`src/lib/supabase/server-auth.ts`)

**Purpose**: Provide server-side user authentication for API routes and server components

**Key Changes**:
- Replace `createClient` from `@supabase/supabase-js` with `createServerClient` from `@supabase/ssr`
- Implement cookie handlers that work with Next.js `cookies()` API
- Remove manual token extraction logic
- Maintain the same public interface (`getCurrentUser()` returning `User | null`)

**Interface**:
```typescript
export async function getCurrentUser(): Promise<User | null>
```

**Implementation Pattern** (based on Supabase SSR documentation):
```typescript
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { User } from './types';

export async function getCurrentUser(): Promise<User | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[server-auth] Supabase not configured');
    return null;
  }

  try {
    const cookieStore = cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting may fail in API routes - this is expected
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Cookie removal may fail in API routes - this is expected
          }
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('[server-auth] Error getting user:', error.message);
      return null;
    }

    if (data.user) {
      console.log('[server-auth] User authenticated:', data.user.id);
    } else {
      console.log('[server-auth] No user found in session');
    }

    return data.user;
  } catch (error) {
    console.error('[server-auth] Exception getting user:', error);
    return null;
  }
}
```

### 2. Cookie Handlers

**Purpose**: Bridge between Supabase SSR and Next.js cookies API

**Design Decisions**:

1. **Read-only in API Routes**: Cookie `set` and `remove` operations are wrapped in try-catch because they may fail in API route context (cookies are read-only after response headers are sent)

2. **Synchronous Access**: Unlike middleware where we need to track cookie changes, API routes only need to read existing cookies

3. **Error Handling**: Cookie operations that fail are logged but don't throw errors, allowing authentication to proceed

### 3. API Routes Integration

**No Changes Required**: All API routes (`/api/groups`, `/api/groups/[id]/messages`) will continue using `getCurrentUser()` with the same interface. The fix is transparent to consumers.

## Data Models

### User Type

```typescript
// From @supabase/supabase-js
interface User {
  id: string;
  email?: string;
  // ... other Supabase user properties
}
```

**No changes to data models** - the User type remains the same as it's provided by Supabase.

## Error Handling

### Error Scenarios

1. **Supabase Not Configured**
   - Condition: Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Response: Log warning, return `null`
   - Impact: API routes handle null user appropriately (guest mode or 401)

2. **Invalid Session**
   - Condition: Cookie exists but session is expired or invalid
   - Response: Log error message, return `null`
   - Impact: User receives 401 and must re-authenticate

3. **Cookie Operation Failure**
   - Condition: Attempt to set/remove cookie in API route context
   - Response: Catch error silently (expected behavior)
   - Impact: None - cookies are read-only in this context

4. **Network/Database Error**
   - Condition: Supabase API call fails
   - Response: Log error, return `null`
   - Impact: User receives 401 or 500 depending on API route logic

### Error Flow

```
getCurrentUser() called
    ↓
Environment check → Missing vars? → Log warning → Return null
    ↓
Create Supabase client
    ↓
Call getUser() → Error? → Log error → Return null
    ↓
Success → Return user object
```

## Testing Strategy

### Manual Testing

1. **Authenticated User Flow**
   - Login via Google OAuth
   - Verify cookies are set in browser
   - Call `/api/groups` GET endpoint
   - Verify 200 response with groups data
   - Call `/api/groups` POST endpoint with valid data
   - Verify 201 response with created group

2. **Unauthenticated User Flow**
   - Clear cookies/logout
   - Call `/api/groups` GET endpoint
   - Verify 200 response with public groups
   - Call `/api/groups` POST endpoint
   - Verify 401 response

3. **Session Expiry Flow**
   - Login and wait for token expiry (or manually expire)
   - Call `/api/groups` POST endpoint
   - Verify 401 response
   - Re-login and verify success

### Logging Verification

Check server logs for:
- `[server-auth] User authenticated: <user-id>` on success
- `[server-auth] Error getting user: <error>` on auth failure
- `[server-auth] No user found in session` when no session exists
- `[server-auth] Supabase not configured` when env vars missing

### Integration Points

Test that the fix works across all API routes using `getCurrentUser()`:
- `/api/groups` (GET, POST)
- `/api/groups/[id]/messages` (GET, POST)
- Any other routes using server-side auth

## Dependencies

### Existing Dependencies (No Installation Required)

- `@supabase/ssr@^0.7.0` - Already installed, used in middleware
- `@supabase/supabase-js@^2.80.0` - Already installed, provides types
- `next@14.2.8` - Provides `cookies()` API

### Import Changes

**Before**:
```typescript
import { createClient } from '@supabase/supabase-js';
```

**After**:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
```

## Security Considerations

1. **Token Exposure**: Tokens remain in HTTP-only cookies, not exposed to client JavaScript
2. **HTTPS Only**: Cookies should have `secure` flag in production (handled by Supabase SSR)
3. **Same-Site Protection**: Cookies use SameSite attribute to prevent CSRF (handled by Supabase SSR)
4. **No Token Logging**: User IDs are logged, but tokens are never logged
5. **Session Refresh**: Middleware handles automatic session refresh before API routes execute

## Performance Considerations

1. **No Additional Overhead**: The new approach is actually more efficient than manual token extraction
2. **Cookie Parsing**: Supabase SSR handles cookie parsing internally, optimized for performance
3. **Caching**: No caching needed - authentication check is fast and must be current
4. **Middleware Coordination**: Middleware refreshes sessions, API routes read fresh session data

## Migration Notes

### Breaking Changes

**None** - The public interface of `getCurrentUser()` remains unchanged. All consuming code continues to work without modification.

### Rollback Plan

If issues arise, revert `src/lib/supabase/server-auth.ts` to the previous version. However, the previous version is already broken, so rollback is not recommended.

### Deployment

1. Deploy the updated `server-auth.ts` file
2. No database migrations required
3. No environment variable changes required
4. Monitor logs for authentication success/failure patterns
5. Verify API endpoints return expected status codes

## Alternative Approaches Considered

### Alternative 1: Manual Cookie Parsing (Current Broken Approach)

**Rejected because**:
- Requires understanding Supabase's internal cookie structure
- Cookie names vary by project and may change
- Doesn't handle session refresh
- Doesn't handle cookie encryption/signing

### Alternative 2: Pass Token from Client

**Rejected because**:
- Requires client-side changes
- Exposes tokens in request headers
- Doesn't work with server components
- Breaks Next.js SSR patterns

### Alternative 3: Use Service Role Key

**Rejected because**:
- Service role bypasses RLS (Row Level Security)
- Security risk if misused
- Doesn't authenticate actual user
- Not appropriate for user-facing API routes

## Conclusion

The fix is straightforward: replace manual cookie handling with Supabase SSR's `createServerClient`, matching the pattern already proven to work in `middleware.ts`. This provides proper session management, automatic token refresh coordination, and secure cookie handling without any breaking changes to the API.
