# Design Document

## Overview

This design addresses production build issues identified in the Vercel deployment logs. The primary issues are:

1. **React Hook Dependency Warnings** - Missing dependencies in useEffect hooks that could cause stale closures and unpredictable behavior
2. **ESLint Best Practice Violations** - Anonymous default exports and non-optimized image usage
3. **Build-time Errors** - Weather API and WeatherSystem errors appear to be from stale build cache (files no longer exist)

The solution focuses on fixing the actual code issues while ensuring the build process completes successfully.

## Architecture

### Component Layer
- **ProfileCard**: Client component managing user profile display and editing
- **useSync Hook**: Custom hook managing data synchronization on app load

### Module Layer
- **telegram-db**: Utility module for Telegram user data management
- **bot**: Telegram bot functionality module

### Build Process
- Next.js 14.2.8 static generation and optimization
- ESLint validation during build
- TypeScript type checking

## Components and Interfaces

### 1. ProfileCard Component Fixes

**Current Issue:**
```typescript
useEffect(() => {
  // ... uses profile.email, profile.name, profile.avatar, updateProfile
}, []); // Missing dependencies
```

**Design Solution:**
- Add all referenced values to dependency array
- Use useCallback for updateProfile to prevent infinite loops
- Ensure effect only runs when necessary values change

**Implementation Pattern:**
```typescript
const updateProfileCallback = useCallback((updates: any) => {
  updateProfile(updates);
}, [updateProfile]);

useEffect(() => {
  // ... logic
}, [profile.email, profile.name, profile.avatar, updateProfileCallback]);
```

### 2. useSync Hook Fixes

**Current Issue:**
```typescript
useEffect(() => {
  // ... calls syncAchievements, syncProfile, syncProgress
}, []); // Missing dependencies
```

**Design Solution:**
- Move sync functions outside useEffect or wrap in useCallback
- Add sync functions to dependency array
- Use ref to prevent re-initialization on dependency changes

**Implementation Pattern:**
```typescript
const syncProgress = useCallback(async () => {
  // ... implementation
}, [progressStore]);

const syncAchievements = useCallback(async () => {
  // ... implementation  
}, [achievementsStore]);

const syncProfile = useCallback(async () => {
  // ... implementation
}, [profileStore]);

useEffect(() => {
  if (initialized.current) return;
  initialized.current = true;
  
  const initializeSync = async () => {
    // ... use callbacks
    await syncProgress();
    await syncAchievements();
    await syncProfile();
  };
  
  initializeSync();
}, [syncProgress, syncAchievements, syncProfile]);
```

### 3. Image Optimization

**Current Issue:**
```tsx
<img src={profile.avatar} alt={profile.name} />
```

**Design Solution:**
- Replace with Next.js Image component for automatic optimization
- Handle external URLs (Google OAuth avatars) properly
- Maintain existing styling and behavior

**Implementation Pattern:**
```tsx
import Image from 'next/image';

<Image
  src={profile.avatar}
  alt={profile.name}
  width={128}
  height={128}
  className="h-full w-full object-cover"
  unoptimized={profile.avatar.startsWith('http')} // For external URLs
/>
```

### 4. Module Export Fixes

**Current Issue:**
```typescript
export default {
  saveTelegramUser,
  // ...
};
```

**Design Solution:**
- Create named constant before export
- Maintains backward compatibility
- Follows ESLint best practices

**Implementation Pattern:**
```typescript
const telegramDb = {
  saveTelegramUser,
  getTelegramUsers,
  // ...
};

export default telegramDb;
```

## Data Models

No data model changes required. All fixes are implementation-level improvements that maintain existing interfaces.

## Error Handling

### Build-Time Errors

**Weather API/WeatherSystem Errors:**
- These files no longer exist in the codebase
- Errors are from stale build cache
- Solution: Vercel will use fresh build cache after deployment

**Auth Session Missing:**
- Expected behavior during static generation
- No fix needed - this is normal for protected routes at build time

### Runtime Error Prevention

**Stale Closure Prevention:**
- Proper dependency arrays prevent accessing stale values
- useCallback ensures function identity stability
- Refs prevent unnecessary re-initialization

## Testing Strategy

### Manual Testing
1. **ProfileCard Component**
   - Verify profile loads correctly on mount
   - Test profile editing functionality
   - Confirm avatar upload works
   - Check that Google OAuth avatars display

2. **Sync Functionality**
   - Verify data syncs on app load
   - Test sync with authenticated user
   - Confirm no infinite loops or re-renders

3. **Build Process**
   - Run `npm run build` locally
   - Verify zero ESLint errors
   - Confirm all pages generate successfully
   - Check build output for warnings

### Validation Steps
1. Run ESLint: `npm run lint`
2. Run TypeScript check: `npx tsc --noEmit`
3. Build locally: `npm run build`
4. Deploy to Vercel and monitor build logs

## Implementation Notes

### Priority Order
1. Fix React hook dependencies (highest impact on runtime behavior)
2. Fix anonymous exports (code quality)
3. Optimize images (performance)

### Backward Compatibility
- All changes maintain existing APIs
- No breaking changes to component interfaces
- Module exports remain compatible with existing imports

### Performance Considerations
- useCallback prevents unnecessary re-renders
- Next.js Image component provides automatic optimization
- Proper dependencies prevent unnecessary effect executions

## Build Configuration

No changes needed to Next.js configuration. The fixes are all at the code level and work within the existing build setup.

### Environment Variables
No new environment variables required. Existing configuration remains unchanged.

## Deployment Strategy

1. Apply all code fixes
2. Test build locally
3. Commit and push to trigger Vercel deployment
4. Monitor Vercel build logs for success
5. Verify production deployment works correctly

## Success Criteria

- ✅ Build completes without errors
- ✅ Zero ESLint errors (warnings acceptable)
- ✅ All static pages generate successfully
- ✅ No runtime errors from stale closures
- ✅ Images load and display correctly
- ✅ Sync functionality works as expected
