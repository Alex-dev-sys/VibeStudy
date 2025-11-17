# Implementation Plan

- [x] 1. Add locale validation helper to i18n module




  - Create `isValidLocale()` function to validate locale strings
  - Update `getTranslations()` to validate locale and log errors for invalid values
  - Add error logging for invalid locales in development mode
  - _Requirements: 2.5, 4.2_

- [x] 2. Enhance locale store with hydration safety






  - [x] 2.1 Add `hasHydrated` state flag to LocaleStore interface






    - Initialize `hasHydrated` to false in store creation
    - _Requirements: 2.2_
  

  - [x] 2.2 Initialize store with default translations immediately





    - Set initial `locale` to `defaultLocale` ('ru')
    - Set initial `translations` to `getTranslations(defaultLocale)`
    - Ensure translations are never undefined at store creation
    - _Requirements: 1.1, 1.4, 2.1_
  


  - [x] 2.3 Implement `onRehydrateStorage` callback for safe hydration




    - Add `onRehydrateStorage` to persist configuration
    - Handle hydration errors gracefully with error logging
    - Reload translations after locale is restored from localStorage
    - Set `hasHydrated` to true after successful hydration
    - Fall back to default locale if hydration fails
    - _Requirements: 1.2, 1.5, 2.4, 3.3, 4.1_
  
  - [x] 2.4 Add locale validation to `setLocale()` action






    - Validate locale parameter using `isValidLocale()`
    - Log warning and use default locale if invalid
    - Update translations atomically with locale change
    - _Requirements: 2.5, 3.4, 4.2_
  


  - [x] 2.5 Update persist configuration to only persist locale





    - Use `partialize` to persist only `locale` field
    - Ensure translations are derived from locale, not persisted
    - _Requirements: 3.1, 3.2_


- [x] 3. Add safety fallback to useTranslations hook




  - Check if translations is undefined (defensive programming)
  - Return default translations if undefined
  - Add development mode warning when fallback is used
  - Ensure hook always returns valid Translations object
  - _Requirements: 1.3, 2.1, 4.1, 4.5_


- [-] 4. Verify fix in production environment


  - [x] 4.1 Test fresh page load without localStorage






    - Clear browser localStorage
    - Load application
    - Verify no console errors
    - Verify login page renders correctly
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 4.2 Test locale persistence across page reloads







    - Change language to English
    - Reload page
    - Verify English is still selected
    - Verify all translations are in English
    - _Requirements: 3.1, 3.2_
  -

  - [x] 4.3 Test with corrupted localStorage






    - Manually corrupt locale value in localStorage
    - Reload page
    - Verify fallback to default locale
    - Verify no application crash
    - _Requirements: 3.3, 3.4, 4.2_
  -

  - [x] 4.4 Deploy to Vercel and verify fix






    - Deploy changes to Vercel production
    - Test on actual Vercel URL
    - Verify no "Cannot read properties of undefined" error
    - Verify login page loads successfully
    - Check browser console for any errors
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
