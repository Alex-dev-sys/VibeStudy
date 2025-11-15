# Implementation Plan

- [x] 1. Update authentication callback route to redirect to /learn


  - Modify `src/app/auth/callback/route.ts` to change redirect destination from `/` to `/learn`
  - Add logic to detect new user registration by comparing `created_at` with `last_sign_in_at` timestamps
  - Append `?registered=true` query parameter when new user is detected
  - Ensure redirect works correctly for both successful and failed authentication attempts
  - _Requirements: 2.1, 2.2, 2.3, 3.3_





- [ ] 2. Implement success notification on learn page
  - [x] 2.1 Add client-side logic to detect registration query parameter

    - Read `?registered=true` from URL search params in learn page component
    - Implement useEffect hook to check for query parameter on component mount
    - _Requirements: 1.1, 2.1_
  
  - [x] 2.2 Display success toast notification

    - Import and use Sonner toast library to show success message
    - Configure toast with 4-second duration and top-center position
    - Include emoji (🎉) in success message for visual appeal
    - _Requirements: 1.1, 1.2_
  

  - [ ] 2.3 Add multilingual support for success message
    - Read current locale from locale store
    - Display Russian message: "Вы успешно зарегистрировались! Добро пожаловать в VibeStudy 🎉"
    - Display English message: "Successfully registered! Welcome to VibeStudy 🎉"


    - _Requirements: 1.3, 2.4_
  
  - [ ] 2.4 Clean up URL after displaying toast
    - Use Next.js router.replace() to remove query parameter from URL
    - Preserve scroll position during URL cleanup





    - Ensure cleanup happens after toast is displayed
    - _Requirements: 2.1_

- [ ] 3. Create reusable authentication notification utility (optional)
  - Create `src/lib/auth/notifications.ts` file with showAuthNotification function

  - Define message mappings for registration, login, and logout events
  - Support both Russian and English locales
  - Export typed interfaces for notification configuration
  - _Requirements: 1.3, 3.2_


- [ ] 4. Add integration tests for registration flow
  - [ ] 4.1 Write test for new user registration flow
    - Test OAuth flow completion
    - Verify redirect to `/learn` page
    - Verify success toast appears with correct message

    - Verify query parameter is removed from URL
    - _Requirements: 1.1, 2.1, 2.2_
  
  - [ ] 4.2 Write test for existing user login flow
    - Test OAuth flow for returning user
    - Verify redirect to `/learn` page
    - Verify no registration toast appears
    - _Requirements: 3.1, 3.2_
  
  - [ ] 4.3 Write test for multilingual support
    - Test registration with Russian locale
    - Test registration with English locale
    - Verify correct message language in each case
    - _Requirements: 1.3, 2.4_
  
  - [ ] 4.4 Write test for error scenarios
    - Test invalid authorization code handling
    - Verify graceful fallback to `/learn` page
    - Verify no error toast is displayed
    - _Requirements: 2.1_
