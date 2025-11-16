# Design Document

## Overview

This design document outlines the architecture and implementation approach for achieving complete internationalization (i18n) of the VibeStudy platform. The solution extends the existing i18n infrastructure to cover all user-facing content, including AI-generated responses, and ensures consistent locale-aware behavior across all components.

The design follows a three-pronged approach:
1. **Translation Coverage**: Expand translation files to include all missing UI strings
2. **Component Refactoring**: Replace hardcoded strings with translation key references
3. **AI Localization**: Implement locale-aware prompts for AI-generated content

## Architecture

### Current State

The application has a partial i18n implementation:
- Translation files exist at `src/lib/i18n/locales/ru.ts` and `src/lib/i18n/locales/en.ts`
- A `useLocaleStore` Zustand store manages the current locale
- A `useTranslations` hook provides access to translations
- The `LocaleSwitcher` component allows users to toggle between languages
- Some components use translations, but many contain hardcoded Russian strings

### Target State

The enhanced i18n system will:
- Provide 100% translation coverage for all UI elements
- Pass locale context to all AI API endpoints
- Use locale-specific system prompts for AI content generation
- Maintain type safety through TypeScript for all translation keys
- Support easy addition of new languages in the future

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Components   │  │ Pages        │  │ LocaleSwitcher│      │
│  │ (use hooks)  │  │ (use hooks)  │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   State Management Layer                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           useLocaleStore (Zustand)                   │   │
│  │  - locale: 'ru' | 'en'                              │   │
│  │  - translations: Translations                        │   │
│  │  - setLocale(locale)                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         useTranslations() Hook                       │   │
│  │  Returns: Translations object                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Translation Files Layer                    │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  ru.ts           │         │  en.ts           │          │
│  │  (Russian)       │         │  (English)       │          │
│  └──────────────────┘         └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AI API Endpoints (receive locale parameter)        │   │
│  │  - /api/generate-tasks                              │   │
│  │  - /api/get-hint                                    │   │
│  │  - /api/explain-theory                              │   │
│  │  - /api/check-solution                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Locale-Aware Prompt Builder                        │   │
│  │  - buildPrompt(params, locale)                      │   │
│  │  - Returns prompts in target language               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Enhanced Translation Files

**Location**: `src/lib/i18n/locales/`

**Structure**:
```typescript
export const ru = {
  common: { /* existing */ },
  home: { /* existing */ },
  dashboard: { /* existing + new keys */ },
  profile: { /* existing */ },
  achievements: { /* existing */ },
  statistics: { /* existing */ },
  playground: { /* existing + new keys */ },
  tasks: { /* existing + new keys */ },
  
  // NEW SECTIONS
  editor: {
    loading: string,
    placeholder: string,
    formatCode: string,
    clearCode: string,
    runCode: string,
    running: string,
    saveCode: string
  },
  
  languageSelector: {
    title: string,
    description: string,
    active: string,
    languages: {
      python: { name: string, description: string },
      javascript: { name: string, description: string },
      typescript: { name: string, description: string },
      java: { name: string, description: string },
      cpp: { name: string, description: string },
      csharp: { name: string, description: string },
      go: { name: string, description: string }
    }
  },
  
  taskModal: {
    hint: string,
    getHint: string,
    thinking: string,
    checkSolution: string,
    checking: string,
    clear: string,
    solutionHint: string,
    hintNumber: string
  },
  
  onboarding: {
    next: string,
    previous: string,
    skip: string,
    complete: string,
    steps: Array<{
      title: string,
      description: string
    }>
  },
  
  errors: {
    generic: string,
    networkError: string,
    aiUnavailable: string,
    codeCheckFailed: string,
    loadingFailed: string
  },
  
  notifications: {
    taskCompleted: string,
    dayCompleted: string,
    achievementUnlocked: string,
    progressSaved: string,
    codeCopied: string
  },
  
  validation: {
    required: string,
    invalidEmail: string,
    tooShort: string,
    tooLong: string
  }
};

export type Translations = typeof ru;
```

### 2. Locale-Aware API Endpoints

**Pattern**: All AI-related API endpoints will accept a `locale` parameter

**Interface**:
```typescript
interface LocaleAwareRequest {
  locale: 'ru' | 'en';
  // ... other request parameters
}

interface AIPromptBuilder {
  buildPrompt(params: any, locale: 'ru' | 'en'): string;
}
```

**Affected Endpoints**:
- `/api/generate-tasks` - Theory and task generation
- `/api/get-hint` - Hint generation
- `/api/explain-theory` - Theory explanations
- `/api/check-solution` - Solution validation feedback
- `/api/regenerate-task` - Task regeneration
- `/api/adaptive-recommendations` - Personalized recommendations

### 3. Component Translation Pattern

**Standard Pattern**:
```typescript
'use client';

import { useTranslations } from '@/store/locale-store';

export function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t.section.title}</h1>
      <button>{t.section.buttonLabel}</button>
    </div>
  );
}
```

**For Dynamic Content**:
```typescript
const handleGenerateTasks = async () => {
  const { locale } = useLocaleStore.getState();
  
  const response = await fetch('/api/generate-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      day,
      languageId,
      locale, // Pass locale to API
      // ... other params
    })
  });
};
```

## Data Models

### Translation Key Structure

```typescript
type TranslationKey = 
  | `common.${string}`
  | `home.${string}`
  | `dashboard.${string}`
  | `profile.${string}`
  | `achievements.${string}`
  | `statistics.${string}`
  | `playground.${string}`
  | `tasks.${string}`
  | `editor.${string}`
  | `languageSelector.${string}`
  | `taskModal.${string}`
  | `onboarding.${string}`
  | `errors.${string}`
  | `notifications.${string}`
  | `validation.${string}`;
```

### Locale Store State

```typescript
interface LocaleStore {
  locale: Locale;
  translations: Translations;
  setLocale: (locale: Locale) => void;
}
```

### AI Prompt Templates

```typescript
interface PromptTemplate {
  system: {
    ru: string;
    en: string;
  };
  user: (params: any) => {
    ru: string;
    en: string;
  };
}
```

## Error Handling

### Translation Fallback Strategy

1. **Missing Translation Key**: Return the key path as fallback
2. **Missing Locale**: Fall back to default locale (Russian)
3. **Type Mismatch**: Log warning in development, return empty string in production

**Implementation**:
```typescript
export function t(translations: Translations, path: string): string {
  const keys = path.split('.');
  let result: any = translations;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation key not found: ${path}`);
      }
      return path; // Fallback to key path
    }
  }
  
  return typeof result === 'string' ? result : path;
}
```

### AI API Error Handling

When AI generation fails, display localized error messages:

```typescript
try {
  const response = await callChatCompletion(prompt, locale);
  // ... process response
} catch (error) {
  const errorMessage = locale === 'en' 
    ? 'AI service is temporarily unavailable. Please try again later.'
    : 'Сервис AI временно недоступен. Пожалуйста, попробуйте позже.';
  
  setError(errorMessage);
}
```

## Testing Strategy

### Unit Tests

1. **Translation Coverage Tests**
   - Verify all keys exist in both `ru.ts` and `en.ts`
   - Ensure type consistency between locales
   - Check for missing translations

2. **Hook Tests**
   - Test `useTranslations` returns correct locale
   - Test `setLocale` updates translations
   - Test persistence of locale preference

3. **Helper Function Tests**
   - Test `t()` function with valid keys
   - Test fallback behavior for missing keys
   - Test nested key access

### Integration Tests

1. **Component Rendering Tests**
   - Verify components render with Russian translations
   - Verify components render with English translations
   - Test locale switching updates all visible text

2. **API Endpoint Tests**
   - Test AI endpoints receive locale parameter
   - Test AI responses are in the requested language
   - Test error messages are localized

### E2E Tests (Playwright)

1. **User Flow Tests**
   - User switches to English → all UI updates
   - User generates tasks in English → content is in English
   - User requests hint in English → hint is in English
   - User completes task → success message is in English

2. **Persistence Tests**
   - User sets locale to English → refreshes page → locale persists
   - User switches locale → navigates between pages → locale persists

### Manual Testing Checklist

- [ ] All buttons display correct language
- [ ] All labels and headings display correct language
- [ ] All placeholder text displays correct language
- [ ] All error messages display correct language
- [ ] All loading states display correct language
- [ ] AI-generated theory is in correct language
- [ ] AI-generated tasks are in correct language
- [ ] AI-generated hints are in correct language
- [ ] Task descriptions are in correct language
- [ ] Playground interface is in correct language
- [ ] Onboarding tour is in correct language
- [ ] Achievement notifications are in correct language
- [ ] Profile page is in correct language
- [ ] Statistics page is in correct language
- [ ] Language selector descriptions are in correct language

## Implementation Phases

### Phase 1: Translation File Expansion
- Add all missing translation keys to `ru.ts` and `en.ts`
- Ensure type safety with TypeScript
- Verify no duplicate keys

### Phase 2: Component Refactoring
- Replace hardcoded strings in components with translation keys
- Update all components to use `useTranslations` hook
- Test each component individually

### Phase 3: AI Localization
- Update API endpoints to accept `locale` parameter
- Create locale-specific prompt templates
- Update AI client to use locale-aware prompts
- Test AI responses in both languages

### Phase 4: Testing and Validation
- Run unit tests for translation coverage
- Run integration tests for component rendering
- Run E2E tests for user flows
- Perform manual testing checklist

### Phase 5: Polish and Edge Cases
- Handle edge cases (missing translations, API errors)
- Optimize performance (memoization, lazy loading)
- Add developer documentation
- Update README with i18n information

## Performance Considerations

### Translation Loading
- Translations are loaded synchronously at app initialization
- No lazy loading needed (small file size ~10KB per locale)
- Zustand persist middleware caches locale preference

### Component Re-rendering
- Use `useTranslations` hook to minimize re-renders
- Memoize translation objects in Zustand store
- Avoid inline translation lookups in render functions

### AI API Optimization
- Cache AI responses by locale to avoid duplicate requests
- Implement request debouncing for hint generation
- Use streaming responses for long-form content

## Security Considerations

### Input Validation
- Validate locale parameter in API endpoints
- Sanitize user input before passing to AI prompts
- Prevent injection attacks in translation strings

### Content Security
- Escape HTML in AI-generated content
- Validate AI responses before displaying to users
- Implement rate limiting for AI endpoints

## Accessibility Considerations

### Screen Reader Support
- Ensure `lang` attribute updates when locale changes
- Provide ARIA labels in current locale
- Announce locale changes to screen readers

**Implementation**:
```typescript
useEffect(() => {
  document.documentElement.lang = locale;
  announceLiveRegion(
    locale === 'en' 
      ? 'Language changed to English' 
      : 'Язык изменён на русский'
  );
}, [locale]);
```

### Keyboard Navigation
- Ensure LocaleSwitcher is keyboard accessible
- Maintain focus management during locale changes
- Provide keyboard shortcuts for common actions

## Migration Strategy

### Backward Compatibility
- Existing user data remains compatible
- Locale preference defaults to Russian for existing users
- No database migrations required

### Rollout Plan
1. Deploy translation files and hooks (no user-facing changes)
2. Deploy component refactoring (gradual rollout)
3. Deploy AI localization (feature flag controlled)
4. Monitor error rates and user feedback
5. Full release after validation period

## Future Enhancements

### Additional Languages
- Structure supports easy addition of new locales
- Add `fr.ts`, `de.ts`, `es.ts` for French, German, Spanish
- Update `Locale` type and `LocaleSwitcher` options

### Dynamic Content Translation
- Implement translation API for user-generated content
- Add language detection for code comments
- Support mixed-language code examples

### Locale-Specific Formatting
- Date and time formatting per locale
- Number formatting (decimal separators)
- Currency formatting for future monetization
