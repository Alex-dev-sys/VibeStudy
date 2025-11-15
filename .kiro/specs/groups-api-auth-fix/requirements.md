# Requirements Document

## Introduction

This specification addresses the authentication failure in the Groups API endpoints. Currently, authenticated users receive 401 UNAUTHORIZED errors when attempting to create groups or access group-related endpoints, despite being successfully authenticated on the client side. The root cause is improper server-side session handling in API routes - the `server-auth.ts` module uses an incorrect approach to retrieve Supabase authentication tokens from cookies, while the middleware correctly uses `@supabase/ssr` package.

## Glossary

- **Server Auth Module**: The `src/lib/supabase/server-auth.ts` file responsible for retrieving authenticated user information in API routes
- **Groups API**: REST API endpoints at `/api/groups` and `/api/groups/[id]/messages` for community group operations
- **Supabase SSR**: The `@supabase/ssr` package that provides proper server-side session management for Next.js
- **Cookie Store**: Next.js cookies() API for accessing HTTP cookies in server components and API routes
- **Access Token**: JWT token stored in cookies that authenticates user requests to Supabase

## Requirements

### Requirement 1

**User Story:** As an authenticated user, I want to create groups through the API, so that I can participate in the community features

#### Acceptance Criteria

1. WHEN an authenticated user sends a POST request to `/api/groups`, THE Server Auth Module SHALL retrieve the user's session from Supabase cookies
2. WHEN the user session is valid, THE Groups API SHALL return a 201 status with the created group data
3. IF the user session is invalid or missing, THEN THE Groups API SHALL return a 401 status with an appropriate error message
4. THE Server Auth Module SHALL use the `@supabase/ssr` package for cookie-based session management
5. THE Server Auth Module SHALL return the authenticated user object when a valid session exists

### Requirement 2

**User Story:** As an authenticated user, I want to fetch groups with my membership information, so that I can see which groups I belong to

#### Acceptance Criteria

1. WHEN an authenticated user sends a GET request to `/api/groups`, THE Server Auth Module SHALL retrieve the user's session
2. WHEN the user is authenticated, THE Groups API SHALL return groups with membership information for that user
3. WHEN the user is not authenticated, THE Groups API SHALL return public groups without membership information
4. THE Server Auth Module SHALL handle session retrieval errors gracefully without throwing exceptions

### Requirement 3

**User Story:** As an authenticated user, I want to send messages to groups I'm a member of, so that I can communicate with other members

#### Acceptance Criteria

1. WHEN an authenticated user sends a POST request to `/api/groups/[id]/messages`, THE Server Auth Module SHALL retrieve the user's session
2. WHEN the user session is valid, THE Messages API SHALL validate the message content and send it to the group
3. IF the user is not authenticated, THEN THE Messages API SHALL return a 401 status
4. THE Server Auth Module SHALL provide consistent authentication behavior across all API routes

### Requirement 4

**User Story:** As a developer, I want the server-side authentication to use the same Supabase SSR approach as middleware, so that session handling is consistent

#### Acceptance Criteria

1. THE Server Auth Module SHALL use `createServerClient` from `@supabase/ssr` instead of `createClient` from `@supabase/supabase-js`
2. THE Server Auth Module SHALL implement cookie handlers compatible with Next.js cookies() API
3. THE Server Auth Module SHALL call `supabase.auth.getUser()` to retrieve the authenticated user
4. THE Server Auth Module SHALL return null when Supabase is not configured, allowing graceful degradation
5. THE Server Auth Module SHALL log authentication status for debugging purposes

### Requirement 5

**User Story:** As a system administrator, I want detailed logging of authentication attempts, so that I can troubleshoot authentication issues

#### Acceptance Criteria

1. WHEN the Server Auth Module attempts to retrieve a user session, THE Server Auth Module SHALL log the authentication attempt
2. WHEN authentication succeeds, THE Server Auth Module SHALL log the user ID
3. WHEN authentication fails, THE Server Auth Module SHALL log the error reason
4. WHERE Supabase is not configured, THE Server Auth Module SHALL log a warning message
5. THE Server Auth Module SHALL not log sensitive information such as tokens or passwords
