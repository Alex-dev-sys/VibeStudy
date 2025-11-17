# Implementation Plan

- [x] 1. Enhance accessibility with improved color contrast and disabled states


  - Update CSS custom properties in `src/app/globals.css` to increase opacity for surface colors and borders
  - Add new CSS variables for disabled states (`--disabled-bg`, `--disabled-border`, `--disabled-text`)
  - Modify Button component (`src/components/ui/Button.tsx`) to apply explicit disabled state styling with proper contrast
  - Update glass panel classes to use higher opacity values for better visibility
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_



- [x] 2. Fix modal scroll behavior

  - Add `overflow-y-auto` and `overscroll-contain` classes to TaskModal container in `src/components/dashboard/TaskModal.tsx`
  - Ensure `useScrollLock` hook is properly preventing body scroll when modal is open
  - Add custom scrollbar styling for modal scroll containers in `src/app/globals.css`



  - Test modal scrolling with content that exceeds viewport height
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Implement robust content persistence system


- [x] 3.1 Create enhanced ContentStorage class in `src/lib/db.ts`


  - Implement multi-layer storage strategy (memory cache, localStorage, file system, cloud)
  - Add `GeneratedContentRecord` interface with timestamp and version fields
  - Implement `save()` method with fallback chain
  - Implement `load()` method that tries each storage layer in order
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3.2 Update useTaskGenerator hook to use persistent storage

  - Modify `src/hooks/useTaskGenerator.ts` to load persisted content on mount
  - Ensure content is saved after successful generation
  - Update `contentSource` state to reflect storage source
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Redesign onboarding flow to be non-blocking


- [x] 4.1 Create BenefitCards component for landing page


  - Create new file `src/components/landing/BenefitCards.tsx`
  - Convert onboarding content to static benefit cards
  - Integrate into HeroShowcase layout without blocking viewport
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4.2 Update OnboardingProvider with context awareness


  - Modify `src/components/onboarding/OnboardingProvider.tsx` to accept context prop
  - Implement context-specific onboarding logic (landing, learning, playground)
  - Only auto-start onboarding in learning interface, not on landing page
  - Update onboarding store to track context-specific completion
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Complete localization coverage


- [x] 5.1 Add missing translation keys


  - Add navigation translations to `src/lib/i18n/locales/en.ts` and `src/lib/i18n/locales/ru.ts`
  - Add profile section translations
  - Add analytics page translations
  - Add day navigation translations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5.2 Update components to use translation system


  - Update day navigation components to use `t.navigation.*` keys
  - Update profile page components to use `t.profile.*` keys
  - Update analytics page to use `t.analytics.*` keys
  - Audit all components for hardcoded strings and replace with translation keys
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Add navigation controls to analytics page

  - Add back button with ArrowLeft icon to `src/app/analytics/page.tsx`
  - Link back button to `/learn` route
  - Use translation key for button label
  - Style button to match platform design system
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 7. Fix visual consistency issues


- [x] 7.1 Convert gradient background to SVG


  - Update `src/components/layout/GradientBackdrop.tsx` to use SVG gradient instead of raster
  - Use oklch color space for smooth gradient transitions
  - Ensure gradient renders without banding artifacts
  - _Requirements: 7.1, 7.3, 7.4_

- [x] 7.2 Fix flame icon positioning


  - Search codebase for flame emoji usage (🔥)
  - Ensure proper CSS positioning with relative/absolute positioning
  - Add animation classes where appropriate
  - Test positioning across different screen sizes
  - _Requirements: 7.2, 7.4_

- [x] 8. Improve AI content generation quality


  - Update AI generation prompts in `src/app/api/generate-tasks/route.ts` to explicitly request task information in theory
  - Add content validation before storing generated content
  - Implement retry logic with improved prompts if content is incomplete
  - Add logging for content generation failures
  - _Requirements: 8.1, 8.2, 8.3, 8.4_
