# Design Document

## Overview

This feature enhances the post-registration user experience by implementing a success notification and redirecting users to the learning interface (`/learn`) instead of the landing page. The implementation leverages the existing Sonner toast notification system and modifies the authentication callback flow.

## Architecture

### Current Flow
1. User completes OAuth/magic link authentication
2. Supabase redirects to `/auth/callback` with authorization code
3. Callback route exchanges code for session
4. User is redirected to landing page (`/`)

### New Flow
1. User completes OAuth/magic link authentication
2. Supabase redirects to `/auth/callback` with authorization code
3. Callback route exchanges code for session
4. **NEW**: Success message is displayed via toast notification
5. **NEW**: User is redirected to `/learn` page
6. **NEW**: Toast appears on `/learn` page confirming successful registration

## Components and Interfaces

### 1. Authentication Callback Route (`src/app/auth/callback/route.ts`)

**Current Implementation:**
```typescript
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/`);
}
```

**Design Changes:**
- Add query parameter to indicate successful registration: `?registered=true`
- Change redirect destination from `/` to `/learn`
- Preserve language preference during redirect

**New Implementation Pattern:**
```typescript
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      // Check if this is a new user registration
      const isNewUser = data.user?.created_at === data.user?.last_sign_in_at;
      
      // Redirect to /learn with registration flag
      const redirectUrl = new URL('/learn', origin);
      if (isNewUser) {
        redirectUrl.searchParams.set('registered', 'true');
      }
      
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Fallback to /learn on error
  return NextResponse.redirect(`${origin}/learn`);
}
```

### 2. Learn Page Client Component (`src/app/learn/page.tsx`)

**Design Changes:**
- Add client-side logic to detect `?registered=true` query parameter
- Display success toast notification using Sonner
- Support multilingual messages (Russian/English)
- Remove query parameter from URL after displaying toast

**Implementation Pattern:**
```typescript
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useLocaleStore } from '@/store/locale-store';

export default function LearnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLocaleStore();
  
  useEffect(() => {
    const registered = searchParams.get('registered');
    
    if (registered === 'true') {
      // Show success message
      const message = locale === 'ru' 
        ? 'Вы успешно зарегистрировались! Добро пожаловать в VibeStudy 🎉'
        : 'Successfully registered! Welcome to VibeStudy 🎉';
      
      toast.success(message, {
        duration: 4000,
        position: 'top-center'
      });
      
      // Clean up URL
      router.replace('/learn', { scroll: false });
    }
  }, [searchParams, router, locale]);
  
  // ... rest of component
}
```

### 3. Success Notification Component (Optional Enhancement)

**Purpose:** Create a reusable notification utility for authentication events

**Location:** `src/lib/auth/notifications.ts`

```typescript
import { toast } from 'sonner';

export type AuthNotificationType = 'registration' | 'login' | 'logout';

interface AuthNotificationConfig {
  type: AuthNotificationType;
  locale: 'ru' | 'en';
}

const messages = {
  registration: {
    ru: 'Вы успешно зарегистрировались! Добро пожаловать в VibeStudy 🎉',
    en: 'Successfully registered! Welcome to VibeStudy 🎉'
  },
  login: {
    ru: 'Добро пожаловать! Вы успешно вошли в систему',
    en: 'Welcome back! Successfully logged in'
  },
  logout: {
    ru: 'Вы вышли из системы',
    en: 'Successfully logged out'
  }
};

export function showAuthNotification({ type, locale }: AuthNotificationConfig) {
  const message = messages[type][locale];
  
  toast.success(message, {
    duration: 4000,
    position: 'top-center',
    className: 'auth-success-toast'
  });
}
```

## Data Models

### Query Parameters

**Registration Success Indicator:**
- Parameter: `registered`
- Type: `string`
- Values: `'true'` | `undefined`
- Purpose: Signal that user just completed registration

### User Detection Logic

**New User Identification:**
```typescript
interface UserMetadata {
  created_at: string;
  last_sign_in_at: string;
}

function isNewUser(user: UserMetadata): boolean {
  return user.created_at === user.last_sign_in_at;
}
```

## Error Handling

### Scenarios and Responses

1. **Code Exchange Fails**
   - Fallback: Redirect to `/learn` without success message
   - User can still access the platform in guest mode

2. **Session Creation Fails**
   - Fallback: Redirect to `/learn` without success message
   - No error toast shown (silent failure)

3. **Toast Display Fails**
   - Graceful degradation: User still redirected to `/learn`
   - No blocking behavior

4. **URL Cleanup Fails**
   - Non-critical: Query parameter remains in URL
   - Does not affect functionality

## Testing Strategy

### Unit Tests (Optional)

**Test File:** `src/lib/auth/notifications.test.ts`

1. Test message selection based on locale
2. Test message selection based on notification type
3. Verify toast configuration (duration, position)

### Integration Tests

**Test File:** `tests/e2e/auth-flow.spec.ts`

1. **New User Registration Flow**
   - Complete OAuth flow
   - Verify redirect to `/learn`
   - Verify success toast appears
   - Verify query parameter is removed

2. **Existing User Login Flow**
   - Complete OAuth flow
   - Verify redirect to `/learn`
   - Verify no registration toast appears

3. **Multilingual Support**
   - Set locale to Russian
   - Complete registration
   - Verify Russian message
   - Set locale to English
   - Complete registration
   - Verify English message

4. **Error Scenarios**
   - Invalid authorization code
   - Verify redirect to `/learn`
   - Verify no error toast

### Manual Testing Checklist

- [ ] Google OAuth registration shows success message
- [ ] Magic link registration shows success message
- [ ] Existing user login does not show registration message
- [ ] Success message displays in correct language
- [ ] URL is cleaned after toast appears
- [ ] Redirect happens within 3 seconds
- [ ] Toast is visible for at least 2 seconds
- [ ] Screen reader announces success message

## Design Decisions

### 1. Query Parameter vs Session Storage

**Decision:** Use query parameter (`?registered=true`)

**Rationale:**
- Simpler implementation
- Works across server/client boundary
- No persistence concerns
- Easy to clean up

**Alternative Considered:** Session storage
- More complex
- Requires additional client-side logic
- Potential race conditions

### 2. Toast Position

**Decision:** `top-center`

**Rationale:**
- Consistent with achievement toasts
- High visibility
- Does not interfere with learning content
- Accessible for screen readers

### 3. New User Detection

**Decision:** Compare `created_at` with `last_sign_in_at`

**Rationale:**
- Reliable indicator of first login
- Available in Supabase user metadata
- No additional database queries needed

**Limitation:** If timestamps differ by milliseconds, may not detect new user
- Impact: Low (edge case)
- Mitigation: Acceptable trade-off for simplicity

### 4. Redirect Destination

**Decision:** Always redirect to `/learn` (not landing page)

**Rationale:**
- Reduces friction for new users
- Gets users into learning flow immediately
- Consistent with product goal (learning-first)
- Landing page is primarily for marketing

### 5. Toast Duration

**Decision:** 4000ms (4 seconds)

**Rationale:**
- Long enough to read message (2-3 seconds)
- Short enough to not be intrusive
- Consistent with achievement toast duration (5000ms)
- Meets requirement of "at least 2 seconds"

## Accessibility Considerations

1. **Screen Reader Support**
   - Sonner toasts have built-in `role="status"` or `role="alert"`
   - Success messages announced automatically
   - No additional ARIA labels needed

2. **Keyboard Navigation**
   - Toast does not trap focus
   - User can continue navigating page
   - Toast dismisses automatically

3. **Visual Indicators**
   - Success icon (✓) included in toast
   - High contrast colors
   - Consistent with existing design system

## Performance Considerations

1. **Client-Side Hydration**
   - Toast logic runs after page load
   - No blocking of initial render
   - Query parameter check is lightweight

2. **URL Manipulation**
   - `router.replace()` does not trigger full page reload
   - Preserves scroll position
   - Minimal performance impact

3. **Toast Rendering**
   - Sonner uses efficient animation library
   - No layout shift
   - GPU-accelerated animations

## Security Considerations

1. **Query Parameter Validation**
   - Only check for exact string `'true'`
   - No user input processed
   - No XSS risk

2. **Session Verification**
   - Supabase handles session validation
   - No additional security logic needed
   - Existing middleware protects routes

## Future Enhancements

1. **Personalized Welcome Message**
   - Include user's name in toast
   - Requires additional user metadata

2. **Onboarding Tour**
   - Trigger interactive tour after registration
   - Guide user through key features

3. **Analytics Tracking**
   - Track registration completion rate
   - Measure time to first learning action

4. **A/B Testing**
   - Test different message variations
   - Optimize conversion to first task completion
