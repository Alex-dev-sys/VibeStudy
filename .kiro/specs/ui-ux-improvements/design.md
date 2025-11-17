# Design Document

## Overview

This design document outlines the technical approach for implementing UI/UX improvements to the VibeStudy platform. The improvements address user feedback regarding onboarding flow, accessibility, scroll behavior, content persistence, localization, and visual consistency.

The design follows a component-based approach, leveraging the existing Next.js 14 App Router architecture, Zustand state management, and TailwindCSS styling system. All changes maintain backward compatibility and follow the platform's established patterns.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Landing    │  │   Learning   │  │  Analytics   │  │
│  │     Page     │  │  Dashboard   │  │     Page     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│              Component & State Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Onboarding  │  │    Modal     │  │  Navigation  │  │
│  │  Components  │  │  Components  │  │  Components  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Zustand    │  │     i18n     │  │   Content    │  │
│  │    Stores    │  │   Provider   │  │   Storage    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  Styling & Theme Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  TailwindCSS │  │  CSS Custom  │  │  Accessibility│ │
│  │    Config    │  │  Properties  │  │    Utilities  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Onboarding System Redesign

**Current State:**
- Onboarding starts automatically on landing page after 1.5s delay
- Blocks entire viewport with overlay
- Uses `OnboardingProvider` wrapper in layout

**New Design:**
- Onboarding triggers only in learning interface context
- Landing page shows benefit cards instead of blocking overlay
- Separate onboarding flows for different contexts

**Component Changes:**

```typescript
// src/components/onboarding/OnboardingProvider.tsx
interface OnboardingProviderProps {
  children: React.ReactNode;
  context: 'landing' | 'learning' | 'playground';
}

// New behavior:
// - 'landing': No auto-start, benefits shown inline
// - 'learning': Auto-start on first visit to /learn
// - 'playground': Auto-start on first visit to /playground
```

**New Component:**

```typescript
// src/components/landing/BenefitCards.tsx
interface BenefitCard {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function BenefitCards() {
  // Renders onboarding content as static benefit cards
  // Integrated into HeroShowcase layout
}
```

### 2. Accessible Color System

**Current Issues:**
- Semi-transparent white blocks with white borders have low contrast
- Disabled button states use generic `opacity-50` which doesn't meet WCAG AA
- Gradient text may have insufficient contrast

**Design Solution:**

Update CSS custom properties and Tailwind config:

```css
/* src/app/globals.css - Enhanced variables */
:root {
  /* Improved surface colors with better contrast */
  --surface-glass: rgba(12, 6, 28, 0.85); /* Increased opacity */
  --surface-glass-strong: rgba(12, 6, 28, 0.92); /* Increased opacity */
  --surface-border: rgba(255, 255, 255, 0.18); /* Increased opacity */
  --surface-border-soft: rgba(255, 255, 255, 0.10); /* Increased opacity */
  
  /* Disabled state colors */
  --disabled-bg: rgba(60, 30, 80, 0.4);
  --disabled-border: rgba(255, 255, 255, 0.08);
  --disabled-text: rgba(255, 255, 255, 0.35);
  
  /* Accessible gradient with better contrast */
  --text-gradient-accessible: linear-gradient(120deg, #ff2da6 0%, #ffe000 60%, #ff9aff 100%);
}
```

**Button Component Enhancement:**

```typescript
// src/components/ui/Button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/70 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-[#ff0094] via-[#ff5bc8] to-[#ffd200] text-[#25031f] font-semibold shadow-[0_18px_38px_rgba(255,0,148,0.35)] hover:brightness-110 hover:shadow-[0_24px_50px_rgba(255,0,148,0.45)] hover:-translate-y-0.5 disabled:bg-[var(--disabled-bg)] disabled:border disabled:border-[var(--disabled-border)] disabled:text-[var(--disabled-text)] disabled:shadow-none disabled:from-transparent disabled:via-transparent disabled:to-transparent',
        secondary: 'bg-transparent border border-white/5 text-white/90 hover:border-white/15 hover:bg-white/5 shadow-[0_15px_35px_rgba(12,6,28,0.35)] disabled:bg-[var(--disabled-bg)] disabled:border-[var(--disabled-border)] disabled:text-[var(--disabled-text)]',
        ghost: 'bg-transparent text-white/80 hover:bg-white/5 border border-transparent hover:border-white/5 disabled:text-[var(--disabled-text)] disabled:bg-transparent'
      },
      // ... rest of variants
    }
  }
);
```

### 3. Scrollable Modal System

**Current Issue:**
- TaskModal content can overflow viewport without scroll
- Body scroll not properly locked

**Design Solution:**

Enhance modal structure with proper scroll container:

```typescript
// src/components/dashboard/TaskModal.tsx
export function TaskModal({ ... }: TaskModalProps) {
  useScrollLock(isOpen); // Already implemented
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 md:p-6 overflow-hidden">
      <motion.div
        className="glass-panel-foreground relative flex max-h-[95vh] w-full max-w-5xl flex-col gap-3 rounded-2xl p-4 sm:max-h-[90vh] sm:gap-4 sm:rounded-3xl sm:p-6 md:p-8 overflow-y-auto overscroll-contain"
        // Add scroll behavior
      >
        {/* Modal content */}
      </motion.div>
    </div>
  );
}
```

**CSS Enhancement:**

```css
/* Ensure smooth scrolling within modals */
.modal-scroll-container {
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
}

/* Custom scrollbar for modals */
.modal-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.modal-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 0, 148, 0.6);
  border-radius: 999px;
}
```

### 4. Content Persistence System

**Current Issue:**
- Generated content may be lost on navigation
- Content stored in memory only

**Design Solution:**

Enhance storage strategy with multi-layer persistence:

```typescript
// src/lib/db.ts - Enhanced storage
interface GeneratedContentRecord {
  key: string; // {languageId}_day{dayNumber}
  content: TaskSet;
  timestamp: number;
  version: string; // For migration compatibility
}

class ContentStorage {
  private memoryCache: Map<string, GeneratedContentRecord>;
  
  async save(key: string, content: TaskSet): Promise<void> {
    const record: GeneratedContentRecord = {
      key,
      content,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    // 1. Save to memory cache
    this.memoryCache.set(key, record);
    
    // 2. Save to localStorage
    try {
      localStorage.setItem(`vibestudy_content_${key}`, JSON.stringify(record));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
    
    // 3. Save to file system (if available)
    await this.saveToFile(key, record);
    
    // 4. Sync to Supabase (if authenticated)
    await this.syncToCloud(key, record);
  }
  
  async load(key: string): Promise<TaskSet | null> {
    // Try memory first
    const cached = this.memoryCache.get(key);
    if (cached) return cached.content;
    
    // Try localStorage
    try {
      const stored = localStorage.getItem(`vibestudy_content_${key}`);
      if (stored) {
        const record = JSON.parse(stored);
        this.memoryCache.set(key, record);
        return record.content;
      }
    } catch (e) {
      console.warn('localStorage load failed:', e);
    }
    
    // Try file system
    const fileContent = await this.loadFromFile(key);
    if (fileContent) return fileContent;
    
    // Try cloud
    return await this.loadFromCloud(key);
  }
}
```

**Hook Enhancement:**

```typescript
// src/hooks/useTaskGenerator.ts
export function useTaskGenerator({ currentDay, previousDay, languageId, autoLoad }: Props) {
  const [taskSet, setTaskSet] = useState<TaskSet | null>(null);
  const [contentSource, setContentSource] = useState<'pending' | 'ai' | 'database' | 'fallback'>('pending');
  
  useEffect(() => {
    // Load persisted content on mount
    const loadPersistedContent = async () => {
      const key = `${languageId}_day${currentDay.day}`;
      const stored = await contentStorage.load(key);
      
      if (stored) {
        setTaskSet(stored);
        setContentSource('database');
      }
    };
    
    loadPersistedContent();
  }, [languageId, currentDay.day]);
  
  // ... rest of hook
}
```

### 5. Complete Localization System

**Current Issue:**
- Some components not using translation system
- Missing translation keys for navigation and profile sections

**Design Solution:**

Audit and complete translation coverage:

```typescript
// src/lib/i18n/locales/en.ts - Add missing keys
export const en: Translations = {
  // ... existing translations
  
  navigation: {
    learn: 'Learn',
    profile: 'Profile',
    analytics: 'Analytics',
    playground: 'Playground',
    logout: 'Logout',
    day: 'Day',
    days: 'Days',
    completed: 'Completed',
    inProgress: 'In Progress',
    locked: 'Locked'
  },
  
  profile: {
    title: 'Profile',
    subtitle: 'Manage your learning profile',
    language: 'Programming Language',
    changeLanguage: 'Change Language',
    progress: 'Progress',
    achievements: 'Achievements',
    statistics: 'Statistics',
    settings: 'Settings',
    deleteData: 'Delete All Data',
    confirmDelete: 'Are you sure? This action cannot be undone.',
    dataDeleted: 'All data has been deleted'
  },
  
  analytics: {
    title: 'Learning Analytics',
    subtitle: 'Track your progress and get personalized recommendations',
    backToLearning: 'Back to Learning',
    overview: 'Overview',
    detailedStats: 'Detailed Statistics',
    recommendations: 'Recommendations'
  }
};
```

**Component Updates:**

```typescript
// src/components/dashboard/DayNavigation.tsx
export function DayNavigation() {
  const t = useTranslations();
  
  return (
    <nav aria-label={t.navigation.days}>
      <h2>{t.navigation.day} {currentDay}</h2>
      {/* Use t.navigation.* for all labels */}
    </nav>
  );
}
```

### 6. Navigation Enhancement

**Design Solution:**

Add back button to analytics page:

```typescript
// src/app/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0c061c] via-[#1a0b2e] to-[#0c061c] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Back button */}
        <Link 
          href="/learn"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.analytics.backToLearning}</span>
        </Link>
        
        {/* Rest of page */}
      </div>
    </main>
  );
}
```

### 7. Visual Consistency Improvements

**Gradient Background Fix:**

```typescript
// Convert raster gradient to SVG for better quality
// src/components/layout/GradientBackdrop.tsx
export function GradientBackdrop({ blur = false }: { blur?: boolean }) {
  return (
    <div className="absolute inset-0 -z-20">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(55% .45 350)" />
            <stop offset="50%" stopColor="oklch(75% .50 20)" />
            <stop offset="100%" stopColor="oklch(95% .55 85)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-gradient)" />
      </svg>
      {blur && <div className="absolute inset-0 backdrop-blur-3xl" />}
    </div>
  );
}
```

**Flame Icon Positioning:**

```typescript
// Audit and fix flame icon positioning
// Search for flame emoji usage and ensure proper CSS positioning
// Example fix in achievement components:
<div className="relative">
  <span className="absolute -top-1 -right-1 text-2xl animate-bounce-subtle">
    🔥
  </span>
  {/* Achievement content */}
</div>
```

## Data Models

### Enhanced Content Storage Model

```typescript
interface TaskSet {
  theory: string;
  tasks: GeneratedTask[];
  recap?: string;
  recapTask?: GeneratedTask;
  metadata: {
    generatedAt: number;
    languageId: string;
    day: number;
    version: string;
  };
}

interface GeneratedContentRecord {
  key: string;
  content: TaskSet;
  timestamp: number;
  version: string;
  syncStatus: 'local' | 'synced' | 'pending';
}
```

### Onboarding Context Model

```typescript
interface OnboardingContext {
  type: 'landing' | 'learning' | 'playground';
  hasCompleted: boolean;
  lastShownAt?: number;
  skipCount: number;
}

interface OnboardingStore {
  contexts: Record<string, OnboardingContext>;
  shouldShowOnboarding(context: string): boolean;
  markCompleted(context: string): void;
  markSkipped(context: string): void;
}
```

## Error Handling

### Content Persistence Errors

```typescript
class ContentStorageError extends Error {
  constructor(
    message: string,
    public code: 'STORAGE_FULL' | 'NETWORK_ERROR' | 'PARSE_ERROR',
    public recoverable: boolean
  ) {
    super(message);
  }
}

// Error recovery strategy
async function saveWithFallback(key: string, content: TaskSet) {
  try {
    await primaryStorage.save(key, content);
  } catch (error) {
    if (error instanceof ContentStorageError && error.recoverable) {
      // Try fallback storage
      await fallbackStorage.save(key, content);
    } else {
      // Log error and notify user
      console.error('Content save failed:', error);
      showNotification('Failed to save content. Please try again.');
    }
  }
}
```

### Accessibility Errors

```typescript
// Validate contrast ratios at build time
function validateContrast(foreground: string, background: string): boolean {
  const ratio = calculateContrastRatio(foreground, background);
  const meetsAA = ratio >= 4.5;
  
  if (!meetsAA && process.env.NODE_ENV === 'development') {
    console.warn(`Contrast ratio ${ratio} does not meet WCAG AA (4.5:1)`);
  }
  
  return meetsAA;
}
```

## Testing Strategy

### Unit Tests

```typescript
// Test content persistence
describe('ContentStorage', () => {
  it('should save and load content from localStorage', async () => {
    const storage = new ContentStorage();
    const testContent: TaskSet = { /* ... */ };
    
    await storage.save('test_key', testContent);
    const loaded = await storage.load('test_key');
    
    expect(loaded).toEqual(testContent);
  });
  
  it('should fallback to memory when localStorage fails', async () => {
    // Mock localStorage failure
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    
    const storage = new ContentStorage();
    await storage.save('test_key', testContent);
    
    // Should still be accessible from memory
    const loaded = await storage.load('test_key');
    expect(loaded).toEqual(testContent);
  });
});

// Test accessibility
describe('Button accessibility', () => {
  it('should have sufficient contrast in disabled state', () => {
    const { container } = render(<Button disabled>Test</Button>);
    const button = container.querySelector('button');
    
    const styles = window.getComputedStyle(button!);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    
    const ratio = calculateContrastRatio(textColor, bgColor);
    expect(ratio).toBeGreaterThanOrEqual(3.0); // WCAG AA for large text
  });
});
```

### Integration Tests

```typescript
// Test onboarding flow
describe('Onboarding', () => {
  it('should not block landing page on first visit', async () => {
    render(<HomePage />);
    
    // Hero content should be visible immediately
    expect(screen.getByText(/Твой прорыв в/)).toBeVisible();
    
    // Onboarding overlay should not be present
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  
  it('should show onboarding in learning interface', async () => {
    // Mock first-time user
    localStorage.clear();
    
    render(<LearnPage />);
    
    // Wait for onboarding to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});

// Test modal scrolling
describe('TaskModal', () => {
  it('should scroll when content exceeds viewport', async () => {
    // Mock small viewport
    global.innerHeight = 600;
    
    const longTask = {
      prompt: 'Test task with very long content...',
      // ... long content
    };
    
    render(<TaskModal task={longTask} isOpen={true} {...props} />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveStyle({ overflowY: 'auto' });
  });
});
```

### E2E Tests (Playwright)

```typescript
// Test complete user flow
test('user can complete day without losing content', async ({ page }) => {
  await page.goto('/learn');
  
  // Generate content
  await page.click('text=Сгенерировать теорию');
  await page.waitForSelector('text=Контент подготовлен');
  
  // Navigate away
  await page.click('text=Профиль');
  await page.waitForURL('**/profile');
  
  // Navigate back
  await page.click('text=Обучение');
  await page.waitForURL('**/learn');
  
  // Content should still be there
  await expect(page.locator('text=Контент подготовлен')).toBeVisible();
});

// Test accessibility
test('keyboard navigation works in onboarding', async ({ page }) => {
  await page.goto('/learn');
  
  // Wait for onboarding
  await page.waitForSelector('[role="dialog"]');
  
  // Navigate with keyboard
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('text=2 /')).toBeVisible();
  
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

### Visual Regression Tests

```typescript
// Test contrast and visual consistency
test('buttons have correct disabled state styling', async ({ page }) => {
  await page.goto('/learn');
  
  const disabledButton = page.locator('button:disabled').first();
  
  // Take screenshot for visual comparison
  await expect(disabledButton).toHaveScreenshot('disabled-button.png');
  
  // Verify contrast programmatically
  const contrast = await page.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return calculateContrastRatio(styles.color, styles.backgroundColor);
  }, await disabledButton.elementHandle());
  
  expect(contrast).toBeGreaterThanOrEqual(3.0);
});
```

## Implementation Notes

### Phase 1: Critical Fixes (High Priority)
1. Modal scroll behavior
2. Content persistence
3. Disabled button accessibility

### Phase 2: UX Improvements (Medium Priority)
4. Onboarding flow redesign
5. Navigation enhancements
6. Complete localization

### Phase 3: Polish (Lower Priority)
7. Color palette refinement
8. Visual consistency fixes
9. Gradient background optimization

### Migration Strategy

For existing users:
- Content storage version field enables migration
- Old localStorage keys remain compatible
- Gradual migration to new storage format

### Performance Considerations

- Lazy load onboarding components
- Debounce content saves (300ms)
- Use CSS containment for modals
- Optimize gradient rendering with SVG

### Browser Compatibility

- Target: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Fallbacks for older browsers:
  - Raster gradient if SVG not supported
  - Standard scrollbars if custom styling fails
  - Basic opacity for disabled states if CSS variables not supported
