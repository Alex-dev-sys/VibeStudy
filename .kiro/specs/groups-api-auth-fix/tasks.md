# Implementation Plan

- [x] 1. Update server-auth.ts to use Supabase SSR



  - Replace `createClient` import with `createServerClient` and `CookieOptions` from `@supabase/ssr`
  - Remove manual cookie search logic that looks for "access-token" or "access_token"
  - Implement cookie handlers (get, set, remove) that work with Next.js `cookies()` API
  - Wrap cookie set/remove operations in try-catch blocks to handle API route context
  - Maintain existing logging for authentication status
  - Keep the same function signature for `getCurrentUser()` to avoid breaking changes
  - _Requirements: 1.4, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 2. Verify API routes work with updated authentication
  - Test POST `/api/groups` with authenticated user (should return 201)
  - Test POST `/api/groups` without authentication (should return 401)
  - Test GET `/api/groups` with authenticated user (should return groups with membership)
  - Test GET `/api/groups` without authentication (should return public groups)
  - Test POST `/api/groups/[id]/messages` with authenticated user (should return 201)
  - Test POST `/api/groups/[id]/messages` without authentication (should return 401)
  - Check server logs for proper authentication status messages
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3_
