# Design Document

## Overview

This design addresses the locale store hydration issue by implementing a robust initialization pattern that ensures translations are always available, even during the SSR/CSR transition and localStorage rehydration. The solution uses Zustand's `onRehydrateStorage` callback and provides default translations immediately upon store creation.

## Architecture

### Current Problem

1. **SSR/CSR Mismatch**: Next.js renders the page on the server with no access to localStorage
2. **Hydration Delay**: Zustand persist middleware takes time to rehydrate from localStorage
3. **Undefined Access**: Components try to access `translations` before hydration completes
4. **Race Condition**: `useTranslations()` hook returns `undefined` during initial render

### Solution Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Server Render (SSR)                   │
│  - Store created with default locale ('ru')              │
│  - Default translations loaded immediately               │
│  - No localStorage access                                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 Client Hydration Start                   │
│  - Store exists with default translations                │
│  - Components can safely access translations             │
│  - Persist middleware begins rehydration                 │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              localStorage Rehydration                    │
│  - Persist middleware reads from localStorage            │
│  - User's locale preference restored                     │
│  - Translations updated atomically                       │
│  - hasHydrated flag set to true                          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Fully Hydrated State                   │
│  - User's preferred locale active                        │
│  - All translations available                            │
│  - No undefined access possible                          │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Enhanced Locale Store

**File**: `src/store/locale-store.ts`

**Changes**:
- Add `hasHydrated` state flag to track hydration status
- Initialize with default translations immediately
- Implement `onRehydrateStorage` callback for safe hydration
- Add validation for locale values
- Ensure translations are never undefined

**Interface**:
```typescript
interface LocaleStore {
  locale: Locale;
  translations: Translations;
  hasHydrated: boolean;
  setLocale: (locale: Locale) => void;
}
```

### 2. Safe Translation Hook

**File**: `src/store/locale-store.ts`

**Changes**:
- Ensure `useTranslations()` always returns valid translations
- Add fallback to default translations if store returns undefined
- Add development mode warnings for debugging

**Implementation Pattern**:
```typescript
export function useTranslations(): Translations {
  const translations = useLocaleStore((state) => state.translations);
  
  // Fallback to default if undefined (should never happen with new design)
  if (!translations) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[locale-store] Translations undefined, using default');
    }
    return getTranslations(defaultLocale);
  }
  
  return translations;
}
```

### 3. Locale Validation

**File**: `src/lib/i18n/index.ts`

**Changes**:
- Add `isValidLocale()` helper function
- Ensure `getTranslations()` always returns valid translations
- Add error logging for invalid locales

**New Functions**:
```typescript
export function isValidLocale(locale: string): locale is Locale {
  return locale === 'ru' || locale === 'en';
}

export function getTranslations(locale: Locale): Translations {
  if (!isValidLocale(locale)) {
    console.error(`[i18n] Invalid locale: ${locale}, falling back to ${defaultLocale}`);
    return locales[defaultLocale];
  }
  return locales[locale] || locales[defaultLocale];
}
```

## Data Models

### LocaleStore State

```typescript
{
  locale: 'ru' | 'en',           // Current locale, default 'ru'
  translations: Translations,     // Always defined, never undefined
  hasHydrated: boolean,          // True after localStorage rehydration
  setLocale: (locale) => void    // Action to change locale
}
```

### Persist Configuration

```typescript
{
  name: 'vibestudy-locale',
  partialize: (state) => ({
    locale: state.locale
    // Only persist locale, not translations (derived from locale)
  }),
  onRehydrateStorage: () => (state, error) => {
    if (error) {
      console.error('[locale-store] Hydration error:', error);
    }
    if (state) {
      // Ensure translations are loaded after hydration
      state.translations = getTranslations(state.locale);
      state.hasHydrated = true;
    }
  }
}
```

## Error Handling

### 1. Hydration Errors

**Scenario**: localStorage is corrupted or unavailable

**Handling**:
- Catch errors in `onRehydrateStorage` callback
- Log error to console
- Fall back to default locale and translations
- Set `hasHydrated` to true to prevent infinite loading

### 2. Invalid Locale

**Scenario**: Persisted locale is not 'ru' or 'en'

**Handling**:
- Validate locale in `setLocale()` action
- Log warning in development mode
- Fall back to default locale
- Update localStorage with valid locale

### 3. Missing Translations

**Scenario**: Translation key doesn't exist

**Handling**:
- Already handled by existing `t()` helper function
- Returns the key path as fallback
- Logs warning in development mode

### 4. Undefined Store Access

**Scenario**: Component tries to access store before initialization

**Handling**:
- Store always initializes with default values
- `useTranslations()` hook provides fallback
- Never returns undefined

## Testing Strategy

### Unit Tests

**File**: `src/store/__tests__/locale-store.test.ts` (optional)

**Test Cases**:
1. Store initializes with default locale and translations
2. `setLocale()` updates locale and translations correctly
3. Invalid locale falls back to default
4. `hasHydrated` starts as false and becomes true after hydration
5. `useTranslations()` never returns undefined

### Integration Tests

**File**: `tests/e2e/locale-hydration.spec.ts` (optional)

**Test Cases**:
1. Page loads without errors on first visit
2. Language preference persists across page reloads
3. Switching language updates all UI text
4. Guest mode works without localStorage
5. No console errors during hydration

### Manual Testing

**Scenarios**:
1. **Fresh Visit**: Clear localStorage, visit site, verify no errors
2. **Locale Persistence**: Change language, reload, verify language persists
3. **SSR**: Disable JavaScript, verify page renders with default locale
4. **Slow Network**: Throttle network, verify no race conditions
5. **Vercel Production**: Deploy and test on actual Vercel environment

## Implementation Notes

### Key Changes

1. **Immediate Initialization**: Store creates with default translations, not undefined
2. **Hydration Callback**: Use `onRehydrateStorage` to safely update after localStorage read
3. **Validation**: Validate locale values before setting
4. **Fallbacks**: Multiple layers of fallbacks ensure translations are always available
5. **Type Safety**: TypeScript ensures translations object structure is correct

### Performance Considerations

- Default translations loaded synchronously (small object, no performance impact)
- Hydration happens asynchronously, doesn't block rendering
- No additional network requests
- Minimal memory overhead (one extra boolean flag)

### Backward Compatibility

- Existing localStorage data remains compatible
- No migration needed
- Users' language preferences preserved
- No breaking changes to API

## Rationale

### Why Not Use Suspense?

Suspense is designed for async data fetching, not for synchronous localStorage hydration. Our solution is simpler and more appropriate for this use case.

### Why Not useEffect?

Using `useEffect` to check hydration status would cause an extra render and potential flash of wrong content. Our solution ensures correct translations from the first render.

### Why Persist Only Locale?

Translations are derived from locale, so persisting them is redundant. This reduces localStorage size and ensures translations are always in sync with the locale.

### Why onRehydrateStorage?

This is the official Zustand pattern for handling post-hydration logic. It's called exactly once after localStorage is read, making it perfect for our use case.

## Migration Path

No migration needed. The changes are backward compatible:

1. Existing users with persisted locale will see their preference restored
2. New users will get default locale
3. No data loss or corruption possible
4. Can be deployed without coordination

## Success Criteria

1. ✅ No "Cannot read properties of undefined" errors in production
2. ✅ Page loads successfully on first visit
3. ✅ Language preference persists across sessions
4. ✅ No console errors during hydration
5. ✅ SSR and CSR render the same content (no hydration mismatch)
6. ✅ All existing functionality continues to work
