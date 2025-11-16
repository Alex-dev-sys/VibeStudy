# Implementation Plan

- [x] 1. Expand translation files with all missing UI strings


  - Add all missing translation keys to both `ru.ts` and `en.ts` files
  - Include translations for: editor controls, language selector, task modal, onboarding, errors, notifications, validation messages
  - Ensure type consistency between Russian and English translation files
  - _Requirements: 1.3, 1.4, 1.5, 8.3, 8.4_






- [x] 2. Refactor Playground component to use translations



  - [x] 2.1 Replace hardcoded strings in Playground page







    - Update language selection heading, button labels (Run Code, Format, Clear, Save)


    - Replace loading and status messages with translation keys




    - Update tips section with localized content
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 2.2 Update Console component with translations

    - Replace "Очистить" button with translation key
    - Add localized output placeholder text
    - _Requirements: 4.2, 4.4_



- [x] 3. Refactor TaskModal component to use translations



  - [x] 3.1 Update TaskModal UI elements


    - Replace button labels (Hint, Check Solution, Clear) with translation keys
    - Update loading states ("Думаю...", "Проверка...", "Загрузка редактора...")
    - Replace hint-related text with translation keys


    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1_
  
  - [x] 3.2 Update task display and feedback messages







    - Localize solution hint display



    - Update completion messages
    - Add error message translations
    - _Requirements: 3.2, 3.3, 3.5, 5.2_

- [x] 4. Refactor LanguageSelector component to use translations




  - Replace heading "Выбери язык обучения" with translation key
  - Update description text with translation key
  - Add localized programming language descriptions
  - Update "АКТИВНО" status indicator with translation key
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
- [x] 5. Refactor OnboardingTour component to use translations

- [x] 5. Refactor OnboardingTour component to use translations




  - Replace button labels (Next, Previous, Skip, Complete) with translation keys
  - Update all onboarding step titles and descriptions
  - Add localized tooltips and help text
  - _Requirements: 6.1, 6.2, 6.3, 6.4_
- [x] 6. Update Login page with translations

- [x] 6. Update Login page with translations



  - Replace error logging messages with translation keys
  - Update loading state text
  - Add localized validation messages
  - _Requirements: 5.1, 5.4_

- [x] 7. Implement locale-aware AI prompt system





  - [x] 7.1 Create locale-specific prompt templates


    - Create `buildPromptWithLocale` function that accepts locale parameter
    - Define Russian and English versions of system prompts
    - Ensure prompts instruct AI to respond in target language
    - _Requirements: 2.5_
  
  - [x] 7.2 Update generate-tasks API endpoint

    - Accept `locale` parameter in request body
    - Pass locale to prompt builder
    - Use locale-specific system prompts
    - _Requirements: 2.1, 2.2_
  
  - [x] 7.3 Update get-hint API endpoint


    - Accept `locale` parameter in request body
    - Generate hints in requested language
    - _Requirements: 2.3_

  
  - [x] 7.4 Update explain-theory API endpoint

    - Accept `locale` parameter in request body
    - Generate explanations in requested language
    - _Requirements: 2.4_
  
  - [x] 7.5 Update check-solution API endpoint


    - Accept `locale` parameter in request body
    - Return feedback in requested language
    - _Requirements: 2.4, 3.3_

- [x] 8. Update frontend components to pass locale to API calls


  - [x] 8.1 Update TaskModal API calls


    - Pass locale to hint generation requests
    - Pass locale to solution checking requests
    - _Requirements: 2.3, 2.4_
  
  - [x] 8.2 Update Dashboard API calls


    - Pass locale to task generation requests
    - Pass locale to theory generation requests
    - _Requirements: 2.1, 2.2_
  
  - [x] 8.3 Update Playground API calls (if applicable)

    - Pass locale to code execution requests
    - Pass locale to any AI-assisted features
    - _Requirements: 2.4_

- [x] 9. Add locale change handler to update document language


  - Update `document.documentElement.lang` attribute when locale changes
  - Announce locale changes to screen readers using ARIA live regions
  - Ensure proper accessibility support
  - _Requirements: 8.1, 8.2_

- [x] 10. Add error handling for missing translations


  - Implement fallback mechanism in translation helper function
  - Log warnings in development mode for missing keys
  - Return key path as fallback in production
  - _Requirements: 8.3, 8.4_

- [x] 11. Create translation coverage validation



  - Write script to verify all keys exist in both locales
  - Check for type consistency between ru.ts and en.ts
  - Identify any missing or extra keys
  - _Requirements: 8.3, 8.4, 8.5_

- [ ] 12. Add E2E tests for locale switching
  - Test complete user flow with English locale
  - Verify AI-generated content is in correct language
  - Test locale persistence across page refreshes
  - Verify all UI elements update when locale changes
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_

- [ ] 13. Update remaining components with hardcoded strings
  - Search codebase for any remaining hardcoded Russian strings
  - Replace with appropriate translation keys
  - Verify all user-facing text is localized
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 14. Polish and final validation
  - Perform manual testing of all features in both languages
  - Verify AI responses are consistently in correct language
  - Check for any edge cases or missed translations
  - Update documentation with i18n guidelines
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 6.1, 7.1_
