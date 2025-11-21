# Design Document

## Overview

This design addresses a critical production build failure caused by case-sensitivity mismatches between file names and import statements. The issue manifests as webpack "Module not found" errors during Vercel deployment, specifically:

```
Module not found: Can't resolve '@/components/ui/button'
Module not found: Can't resolve '@/components/ui/card'
Module not found: Can't resolve '@/components/ui/badge'
```

The root cause is that UI component files use PascalCase naming (Button.tsx, Card.tsx, Badge.tsx) while import statements throughout the codebase use lowercase (button, card, badge). This works on Windows (case-insensitive) but fails on Linux (case-sensitive), which Vercel uses for builds.

## Architecture

### File System Layer
- **Source**: `src/components/ui/` directory containing UI components
- **Affected Files**: Button.tsx, Card.tsx, Badge.tsx
- **Import Pattern**: `@/components/ui/[component-name]`

### Build System
- **Next.js 14.2.8**: Webpack-based module bundler
- **Module Resolution**: TypeScript path aliases (@/* → src/*)
- **Platform**: Linux (case-sensitive) on Vercel

### Impact Scope
Based on grep search results, the following files are affected:
- **button imports**: 50+ files across the codebase
- **card imports**: Multiple files (exact count to be determined)
- **badge imports**: Multiple files (exact count to be determined)

## Components and Interfaces

### 1. File Naming Convention

**Current State:**
```
src/components/ui/
├── Button.tsx          ← PascalCase
├── Card.tsx            ← PascalCase
├── Badge.tsx           ← PascalCase
└── [other files]
```

**Target State:**
```
src/components/ui/
├── button.tsx          ← lowercase
├── card.tsx            ← lowercase
├── badge.tsx           ← lowercase
└── [other files]
```

**Rationale:**
- Matches existing import statements throughout the codebase
- Follows common convention for utility/primitive components
- Aligns with other UI files (modal.tsx, skeleton.tsx already use lowercase)
- Minimizes code changes (only file renames, no import updates needed)

### 2. Affected Components

#### Button Component (Button.tsx → button.tsx)
- **Location**: `src/components/ui/Button.tsx`
- **Exports**: `Button` component, `ButtonProps` interface
- **Import Pattern**: `import { Button } from '@/components/ui/button'`
- **Usage**: 50+ files across landing, dashboard, profile, playground, etc.

#### Card Component (Card.tsx → card.tsx)
- **Location**: `src/components/ui/Card.tsx`
- **Exports**: `Card`, `CardHeader`, `CardTitle`, `CardDescription` components
- **Import Pattern**: `import { Card, CardHeader, ... } from '@/components/ui/card'`
- **Usage**: Multiple files across the application

#### Badge Component (Badge.tsx → badge.tsx)
- **Location**: `src/components/ui/Badge.tsx`
- **Exports**: `Badge` component, `BadgeProps` interface
- **Import Pattern**: `import { Badge } from '@/components/ui/badge'`
- **Usage**: Multiple files for status indicators, difficulty levels, etc.

### 3. Other UI Components Analysis

**Already Using Lowercase:**
- modal.tsx
- skeleton.tsx
- animated-gradient-text.tsx
- magic-card.tsx

**Using PascalCase (may need review):**
- EmptyState.tsx
- FloatingActionButton.tsx
- Form.tsx
- LoadingSpinner.tsx
- LoadingState.tsx
- MicroInteractionsDemo.tsx
- OptimizedImage.tsx
- TaskCompletionAnimation.tsx
- VisualFeedback.tsx

**Decision:** Focus on the three critical files (Button, Card, Badge) causing build failures. Other PascalCase files can be addressed in a future refactoring if needed, as they don't currently have import mismatches.

## Data Models

No data model changes required. This is purely a file system organization fix.

## Error Handling

### Build-Time Error Prevention

**Before Fix:**
```
Failed to compile.

./src/app/challenges/page.tsx
Module not found: Can't resolve '@/components/ui/button'
```

**After Fix:**
```
✓ Compiled successfully
```

### Verification Strategy

1. **Local Build Test**: Run `npm run build` on Windows to ensure no regressions
2. **Case-Sensitive Test**: Use Git to verify file renames are tracked correctly
3. **Import Validation**: Verify all imports resolve correctly
4. **Vercel Deployment**: Monitor build logs for successful compilation

## Testing Strategy

### Pre-Rename Verification
1. Document current file names and their exact casing
2. Identify all import statements for affected components
3. Verify import patterns match target file names

### Rename Process
1. Use Git to rename files (preserves history)
2. Verify Git recognizes the rename (not delete + add)
3. Check that no file contents are modified

### Post-Rename Verification
1. **Local Build**: `npm run build` should succeed
2. **Type Check**: `npx tsc --noEmit` should pass
3. **Lint Check**: `npm run lint` should pass
4. **Import Resolution**: All imports should resolve correctly
5. **Vercel Build**: Deployment should succeed without module errors

### Test Cases

**Test 1: Button Component Resolution**
```typescript
// Should resolve successfully
import { Button } from '@/components/ui/button';
```

**Test 2: Card Component Resolution**
```typescript
// Should resolve successfully
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
```

**Test 3: Badge Component Resolution**
```typescript
// Should resolve successfully
import { Badge } from '@/components/ui/badge';
```

## Implementation Notes

### Git Rename Strategy

Use Git's rename detection to preserve file history:

```bash
# Windows (case-insensitive workaround)
git mv src/components/ui/Button.tsx src/components/ui/button-temp.tsx
git mv src/components/ui/button-temp.tsx src/components/ui/button.tsx

# Repeat for Card and Badge
```

**Why this approach:**
- Preserves Git history
- Ensures proper rename tracking
- Avoids accidental file deletion
- Works on case-insensitive file systems

### Alternative: Direct File System Rename

If Git rename doesn't work on Windows:
1. Delete the PascalCase file
2. Create new lowercase file with same content
3. Commit as rename (Git should detect similarity)

### No Code Changes Required

**Important:** No import statements need to be updated because they already use lowercase. This is purely a file rename operation.

## Build Configuration

No changes needed to:
- `tsconfig.json` (path aliases remain the same)
- `next.config.mjs` (no configuration changes)
- `package.json` (no dependency changes)

## Deployment Strategy

1. **Rename Files**: Use Git to rename Button.tsx, Card.tsx, Badge.tsx to lowercase
2. **Verify Locally**: Run build and type checks
3. **Commit Changes**: Commit with clear message about case-sensitivity fix
4. **Push to GitHub**: Trigger Vercel deployment
5. **Monitor Build**: Watch Vercel logs for successful compilation
6. **Verify Production**: Test deployed application

## Success Criteria

- ✅ Button.tsx renamed to button.tsx
- ✅ Card.tsx renamed to card.tsx
- ✅ Badge.tsx renamed to badge.tsx
- ✅ Local build succeeds: `npm run build` exits with 0
- ✅ Type check passes: `npx tsc --noEmit` exits with 0
- ✅ Vercel build succeeds without module resolution errors
- ✅ All imports resolve correctly on case-sensitive file systems
- ✅ No runtime errors in production deployment

## Future Considerations

### Standardize All UI Components

Consider standardizing all UI component file names to lowercase in a future refactoring:
- EmptyState.tsx → empty-state.tsx
- FloatingActionButton.tsx → floating-action-button.tsx
- LoadingSpinner.tsx → loading-spinner.tsx
- etc.

**Benefits:**
- Consistent naming convention
- Prevents future case-sensitivity issues
- Aligns with common React/Next.js conventions

**Approach:**
- Create separate spec for comprehensive UI naming standardization
- Update imports across codebase
- Use automated refactoring tools where possible

### Linting Rule

Consider adding ESLint rule to enforce lowercase file names for components:
```json
{
  "rules": {
    "unicorn/filename-case": ["error", { "case": "kebabCase" }]
  }
}
```

This would prevent future case-sensitivity issues at development time.
