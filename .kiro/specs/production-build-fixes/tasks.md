# Implementation Plan

- [x] 1. Fix React Hook dependencies in ProfileCard component


  - Update the useEffect hook that loads user data to include all referenced dependencies (profile.email, profile.name, profile.avatar, updateProfile)
  - Wrap updateProfile in useCallback to maintain stable reference
  - Test that profile loads correctly and editing still works
  - _Requirements: 2.1_

- [x] 2. Fix React Hook dependencies in useSync hook


  - [x] 2.1 Wrap sync functions in useCallback with proper dependencies


    - Wrap syncProgress, syncAchievements, and syncProfile in useCallback
    - Include store references in dependency arrays
    - _Requirements: 2.2_
  
  - [x] 2.2 Update main useEffect to include sync function dependencies

    - Add syncProgress, syncAchievements, syncProfile to the dependency array
    - Ensure initialized ref prevents re-initialization
    - _Requirements: 2.2_
  
  - [x] 2.3 Update useSyncOnAuth hook dependencies


    - Add sync functions to the useEffect dependency array
    - _Requirements: 2.3_

- [x] 3. Replace img tag with Next.js Image component in ProfileCard

  - Import Next.js Image component
  - Replace the img tag with Image component
  - Add width and height props (128x128)
  - Use unoptimized prop for external URLs (Google OAuth avatars)
  - Maintain existing className and styling
  - _Requirements: 3.1_

- [x] 4. Fix anonymous default exports


  - [x] 4.1 Fix telegram-db module export


    - Create named constant 'telegramDb' before export
    - Export the named constant as default
    - _Requirements: 3.2_
  
  - [x] 4.2 Fix bot module export


    - Create named constant 'botFunctions' before export
    - Export the named constant as default
    - _Requirements: 3.3_

- [x] 5. Verify build success



  - Run local build with `npm run build`
  - Verify zero ESLint errors
  - Confirm all pages generate successfully
  - Check that no new warnings are introduced
  - _Requirements: 4.1, 4.2, 4.4_
