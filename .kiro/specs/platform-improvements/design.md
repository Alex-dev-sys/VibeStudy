# Design Document

## Overview

This document outlines the technical design for implementing comprehensive platform improvements to VibeStudy. The improvements are organized into seven major feature areas, each designed to enhance user experience, performance, and retention while maintaining the existing architecture patterns.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Pages Layer                                                 │
│  ├─ Enhanced Metadata (SEO)                                 │
│  ├─ Onboarding Wrapper                                      │
│  └─ Performance Optimizations                               │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                            │
│  ├─ Onboarding System                                       │
│  ├─ Analytics Dashboard                                     │
│  ├─ Enhanced Playground                                     │
│  └─ Accessible UI Components                                │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                 │
│  ├─ Progress Store (Enhanced)                               │
│  ├─ Analytics Store (New)                                   │
│  ├─ Onboarding Store (New)                                  │
│  └─ Playground Store (New)                                  │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                              │
│  ├─ SEO Service                                             │
│  ├─ Analytics Service                                       │
│  ├─ Persistent Auth Service                                 │
│  └─ Performance Monitor                                     │
├─────────────────────────────────────────────────────────────┤
│  External Services                                           │
│  ├─ Supabase (Auth + Database)                             │
│  ├─ Hugging Face API                                        │
│  └─ Browser APIs (IndexedDB, LocalStorage)                 │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. SEO and Metadata Enhancement

#### 1.1 Metadata Service

**Location:** `src/lib/seo/metadata.ts`

```typescript
interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
  structuredData?: object;
}

interface MetadataService {
  generatePageMetadata(page: string, params?: any): Metadata;
  generateStructuredData(type: 'Course' | 'WebPage' | 'Organization'): object;
  generateOpenGraphTags(metadata: PageMetadata): object;
}
```

**Implementation Details:**
- Dynamic metadata generation based on page type
- Schema.org structured data for educational content
- Open Graph and Twitter Card tags
- Canonical URL management
- Language-specific metadata (ru/en)

#### 1.2 Sitemap Generation

**Location:** `src/app/sitemap.ts`

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: '/', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: '/learn', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: '/playground', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: '/profile', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    // Dynamic pages for each day (1-90)
    ...Array.from({ length: 90 }, (_, i) => ({
      url: `/learn?day=${i + 1}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6
    }))
  ];
}
```

#### 1.3 Robots.txt

**Location:** `src/app/robots.ts`

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/callback']
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`
  };
}
```

### 2. Interactive User Onboarding

#### 2.1 Onboarding Store

**Location:** `src/store/onboarding-store.ts`

```typescript
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingStore {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  hasCompletedOnboarding: boolean;
  
  startOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}
```

#### 2.2 Onboarding Component

**Location:** `src/components/onboarding/OnboardingTour.tsx`

**Features:**
- Modal overlay with spotlight effect on target elements
- Progress indicator (step X of Y)
- Navigation buttons (Next, Previous, Skip)
- Keyboard navigation support (Arrow keys, Escape)
- Responsive positioning
- Animation with Framer Motion

**Onboarding Steps:**
1. Welcome to VibeStudy
2. Choose your programming language
3. Navigate through 90 days
4. Complete tasks and track progress
5. Use the code editor
6. Check your achievements
7. View analytics and statistics
8. Try the Playground

#### 2.3 Contextual Tooltips

**Location:** `src/components/onboarding/Tooltip.tsx`

```typescript
interface TooltipProps {
  content: string;
  targetId: string;
  trigger: 'hover' | 'click' | 'focus';
  position: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
}
```

### 3. Performance Optimization

#### 3.1 Image Optimization

**Strategy:**
- Replace all `<img>` tags with Next.js `<Image>` component
- Use WebP format with fallback
- Implement responsive images with srcset
- Lazy load images below the fold
- Optimize SVG icons

**Implementation:**
```typescript
// src/components/ui/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}
```

#### 3.2 Code Splitting

**Strategy:**
- Dynamic imports for heavy components
- Route-based code splitting (already implemented)
- Lazy load Monaco Editor
- Separate vendor chunks

**Example:**
```typescript
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <EditorSkeleton />
});
```

#### 3.3 Caching Strategy

**Location:** `src/lib/cache/api-cache.ts`

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache: Map<string, CacheEntry<any>>;
  
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttl?: number): void;
  invalidate(key: string): void;
  clear(): void;
}
```

**Caching Rules:**
- AI-generated content: 24 hours
- User progress: No cache (real-time)
- Static curriculum data: 7 days
- Achievement definitions: 7 days

#### 3.4 Loading States

**Components:**
- Skeleton loaders for dashboard
- Spinner for API calls
- Progressive loading for images
- Optimistic UI updates

### 4. Advanced Learning Analytics

#### 4.1 Analytics Store

**Location:** `src/store/analytics-store.ts`

```typescript
interface TaskAttempt {
  taskId: string;
  day: number;
  startTime: number;
  endTime: number;
  success: boolean;
  attempts: number;
}

interface TopicMastery {
  topic: string;
  totalTasks: number;
  completedTasks: number;
  successRate: number;
  averageTime: number;
}

interface LearningVelocity {
  tasksPerDay: number;
  averageSessionDuration: number;
  mostProductiveHour: number;
  weeklyTrend: number[];
}

interface AnalyticsStore {
  taskAttempts: TaskAttempt[];
  topicMastery: Record<string, TopicMastery>;
  learningVelocity: LearningVelocity;
  weakAreas: string[];
  recommendations: string[];
  
  trackTaskStart: (day: number, taskId: string) => void;
  trackTaskComplete: (day: number, taskId: string, success: boolean) => void;
  calculateTopicMastery: () => void;
  generateRecommendations: () => void;
  predictCompletionDate: () => Date;
}
```

#### 4.2 Analytics Dashboard Component

**Location:** `src/components/analytics/AnalyticsDashboard.tsx`

**Sections:**
1. **Learning Velocity**
   - Tasks completed per day (line chart)
   - Average session duration
   - Most productive time of day

2. **Topic Mastery**
   - Radar chart showing mastery across topics
   - Color-coded by proficiency level
   - Drill-down to specific topics

3. **Weak Areas**
   - List of topics with <70% success rate
   - Recommended review materials
   - Practice task suggestions

4. **Progress Prediction**
   - Estimated completion date
   - Days ahead/behind schedule
   - Pace adjustment recommendations

5. **Weekly Summary**
   - Tasks completed this week
   - Streak status
   - Achievement unlocks

#### 4.3 Analytics API Integration

**Location:** `src/app/api/analytics/route.ts`

```typescript
// POST /api/analytics/track
interface TrackEventRequest {
  event: 'task_start' | 'task_complete' | 'session_start' | 'session_end';
  data: any;
}

// GET /api/analytics/insights
interface InsightsResponse {
  topicMastery: TopicMastery[];
  weakAreas: string[];
  recommendations: string[];
  velocity: LearningVelocity;
  prediction: {
    completionDate: string;
    daysRemaining: number;
    onTrack: boolean;
  };
}
```

### 5. Accessibility Compliance

#### 5.1 Accessibility Audit Checklist

**WCAG 2.1 Level AA Compliance:**

1. **Perceivable**
   - Alt text for all images
   - Color contrast ratio ≥ 4.5:1
   - Text resizable to 200%
   - No information conveyed by color alone

2. **Operable**
   - Keyboard navigation for all interactive elements
   - Visible focus indicators
   - No keyboard traps
   - Skip navigation links

3. **Understandable**
   - Consistent navigation
   - Clear error messages
   - Form labels and instructions
   - Language attribute on HTML

4. **Robust**
   - Valid HTML
   - ARIA landmarks
   - Compatible with assistive technologies

#### 5.2 Accessible Components

**Location:** `src/components/ui/accessible/`

**Components to enhance:**
- Button: ARIA labels, keyboard support
- Modal: Focus trap, Escape key, ARIA dialog
- Dropdown: ARIA combobox, keyboard navigation
- Tabs: ARIA tablist, arrow key navigation
- Toast: ARIA live region, auto-dismiss option

**Example:**
```typescript
// src/components/ui/accessible/Button.tsx
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}
```

#### 5.3 Focus Management

**Location:** `src/lib/accessibility/focus-manager.ts`

```typescript
class FocusManager {
  trapFocus(element: HTMLElement): () => void;
  restoreFocus(previousElement: HTMLElement): void;
  moveFocusToFirstElement(container: HTMLElement): void;
  announceLiveRegion(message: string, priority: 'polite' | 'assertive'): void;
}
```

#### 5.4 Keyboard Shortcuts

**Location:** `src/hooks/useKeyboardShortcuts.ts`

```typescript
interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

// Global shortcuts
const shortcuts: KeyboardShortcut[] = [
  { key: '/', action: () => focusSearch(), description: 'Focus search' },
  { key: 'n', action: () => nextDay(), description: 'Next day' },
  { key: 'p', action: () => previousDay(), description: 'Previous day' },
  { key: 'r', action: () => runCode(), description: 'Run code', ctrl: true },
  { key: '?', action: () => showShortcuts(), description: 'Show shortcuts' }
];
```

### 6. Enhanced Code Playground

#### 6.1 Playground Store

**Location:** `src/store/playground-store.ts`

```typescript
interface CodeSnippet {
  id: string;
  name: string;
  language: string;
  code: string;
  createdAt: number;
  updatedAt: number;
  collectionId?: string;
}

interface SnippetCollection {
  id: string;
  name: string;
  description: string;
  snippetIds: string[];
}

interface PlaygroundStore {
  snippets: Record<string, CodeSnippet>;
  collections: Record<string, SnippetCollection>;
  activeSnippetId: string | null;
  consoleOutput: ConsoleMessage[];
  
  saveSnippet: (snippet: Omit<CodeSnippet, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSnippet: (id: string, updates: Partial<CodeSnippet>) => void;
  deleteSnippet: (id: string) => void;
  createCollection: (name: string, description: string) => string;
  addToCollection: (snippetId: string, collectionId: string) => void;
  generateShareUrl: (snippetId: string) => Promise<string>;
  exportSnippet: (snippetId: string) => void;
  clearConsole: () => void;
  addConsoleMessage: (message: ConsoleMessage) => void;
}
```

#### 6.2 Console Component

**Location:** `src/components/playground/Console.tsx`

```typescript
interface ConsoleMessage {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

interface ConsoleProps {
  messages: ConsoleMessage[];
  onClear: () => void;
  maxMessages?: number;
}
```

**Features:**
- Syntax highlighting for logged objects
- Collapsible object inspection
- Filter by message type
- Clear console button
- Copy message to clipboard
- Timestamp display

#### 6.3 Snippet Sharing

**Location:** `src/app/api/snippets/share/route.ts`

```typescript
// POST /api/snippets/share
interface ShareSnippetRequest {
  code: string;
  language: string;
  name?: string;
}

interface ShareSnippetResponse {
  id: string;
  url: string;
  expiresAt: string;
}

// GET /api/snippets/[id]
interface GetSnippetResponse {
  code: string;
  language: string;
  name: string;
  createdAt: string;
}
```

**Implementation:**
- Store shared snippets in Supabase
- Generate short IDs (7 characters)
- 7-day expiration
- View-only mode for shared snippets
- "Fork" button to copy to own playground

#### 6.4 Code Formatting

**Location:** `src/lib/playground/formatter.ts`

```typescript
interface FormatterOptions {
  language: string;
  tabSize: number;
  useTabs: boolean;
}

async function formatCode(code: string, options: FormatterOptions): Promise<string>;
```

**Implementation:**
- Use Prettier for JavaScript/TypeScript
- Language-specific formatters for Python, Java, etc.
- Format on save option
- Format on paste option

### 7. Persistent Authentication

#### 7.1 Enhanced Auth Service

**Location:** `src/lib/supabase/persistent-auth.ts`

```typescript
interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  hash: string;
}

interface SessionInfo {
  deviceFingerprint: string;
  deviceName: string;
  lastActive: number;
  ipAddress?: string;
  location?: string;
}

interface PersistentAuthService {
  generateDeviceFingerprint(): DeviceFingerprint;
  storeDeviceFingerprint(fingerprint: DeviceFingerprint): void;
  verifyDeviceFingerprint(): boolean;
  getActiveSessions(): Promise<SessionInfo[]>;
  revokeSession(fingerprint: string): Promise<void>;
  refreshToken(): Promise<void>;
}
```

#### 7.2 Session Management

**Database Schema:**
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_active ON user_sessions(last_active);
```

#### 7.3 Auto Token Refresh

**Location:** `src/lib/supabase/token-refresh.ts`

```typescript
class TokenRefreshManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  
  startAutoRefresh(): void {
    // Refresh token 5 minutes before expiration
    const expiresIn = this.getTokenExpirationTime();
    const refreshTime = expiresIn - (5 * 60 * 1000);
    
    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }
  
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  }
  
  async refreshToken(): Promise<void> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession();
    
    if (!error && data.session) {
      this.startAutoRefresh(); // Schedule next refresh
    }
  }
}
```

#### 7.4 Session UI Component

**Location:** `src/components/profile/SessionManager.tsx`

**Features:**
- List all active sessions
- Show device name, last active time, location
- Highlight current session
- Revoke button for each session
- "Revoke all other sessions" button
- Confirmation modal before revoking

## Data Models

### Analytics Data Model

```typescript
interface UserAnalytics {
  userId: string;
  taskAttempts: TaskAttempt[];
  sessionHistory: SessionRecord[];
  topicMastery: Record<string, TopicMastery>;
  learningVelocity: LearningVelocity;
  lastCalculated: number;
}

interface SessionRecord {
  id: string;
  startTime: number;
  endTime: number;
  tasksCompleted: number;
  dayAccessed: number;
}
```

### Playground Data Model

```typescript
interface PlaygroundData {
  userId: string;
  snippets: CodeSnippet[];
  collections: SnippetCollection[];
  settings: {
    theme: string;
    fontSize: number;
    tabSize: number;
    autoFormat: boolean;
  };
}
```

### Onboarding Data Model

```typescript
interface OnboardingState {
  userId: string;
  hasCompletedOnboarding: boolean;
  completedAt: number | null;
  skippedSteps: string[];
  currentStep: number;
}
```

## Error Handling

### Error Types

```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR'
}

interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  recoverable: boolean;
}
```

### Error Handling Strategy

1. **Network Errors**: Retry with exponential backoff
2. **Auth Errors**: Redirect to login, preserve return URL
3. **Validation Errors**: Show inline error messages
4. **Rate Limits**: Show cooldown timer
5. **Server Errors**: Show generic error, log to console

### Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Testing Strategy

### Unit Tests

**Tools:** Jest, React Testing Library

**Coverage:**
- Utility functions (formatters, validators)
- Store actions and selectors
- Pure components
- API response handlers

### Integration Tests

**Tools:** Playwright

**Scenarios:**
- Complete onboarding flow
- Save and load code snippet
- Complete a task and check analytics
- Sign in and verify persistent session
- Navigate with keyboard only

### Accessibility Tests

**Tools:** axe-core, Pa11y

**Checks:**
- ARIA attributes
- Color contrast
- Keyboard navigation
- Screen reader compatibility

### Performance Tests

**Tools:** Lighthouse CI

**Metrics:**
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Time to Interactive < 3.5s
- Cumulative Layout Shift < 0.1
- Performance Score > 90

## Security Considerations

### Authentication Security

1. **Token Storage**: HTTP-only cookies for refresh tokens
2. **CSRF Protection**: SameSite cookie attribute
3. **Device Fingerprinting**: Non-invasive, privacy-respecting
4. **Session Timeout**: 30 days inactivity
5. **Secure Communication**: HTTPS only

### Data Privacy

1. **Local Storage**: Encrypted sensitive data
2. **Analytics**: No PII in tracking events
3. **Shared Snippets**: No user identification
4. **GDPR Compliance**: Data export and deletion

### XSS Prevention

1. **Input Sanitization**: Sanitize user-generated content
2. **Content Security Policy**: Strict CSP headers
3. **React**: Automatic XSS protection via JSX

## Performance Targets

### Load Time Targets

- **Initial Page Load**: < 2 seconds (3G)
- **Time to Interactive**: < 3.5 seconds
- **API Response Time**: < 500ms (p95)

### Bundle Size Targets

- **Initial Bundle**: < 200KB (gzipped)
- **Total JavaScript**: < 500KB (gzipped)
- **CSS**: < 50KB (gzipped)

### Runtime Performance

- **Frame Rate**: 60 FPS during animations
- **Memory Usage**: < 100MB for typical session
- **CPU Usage**: < 30% during idle

## Deployment Strategy

### Phased Rollout

**Phase 1: Foundation (Week 1)**
- SEO enhancements
- Performance optimizations
- Accessibility improvements

**Phase 2: User Experience (Week 2)**
- Onboarding system
- Enhanced playground
- Console implementation

**Phase 3: Intelligence (Week 3)**
- Analytics system
- Recommendations engine
- Persistent authentication

### Feature Flags

```typescript
interface FeatureFlags {
  enableOnboarding: boolean;
  enableAdvancedAnalytics: boolean;
  enableSnippetSharing: boolean;
  enableDeviceFingerprinting: boolean;
}
```

### Monitoring

**Metrics to Track:**
- Page load times
- API response times
- Error rates
- User engagement (onboarding completion, snippet saves)
- Authentication success rate
- Session duration

## Migration Plan

### Existing Data Migration

1. **Progress Data**: No migration needed (compatible)
2. **Achievements**: No migration needed (compatible)
3. **Profile**: Add new fields (non-breaking)

### Backward Compatibility

- All new features are additive
- Existing functionality remains unchanged
- Graceful degradation for unsupported browsers

## Future Enhancements

### Potential Additions

1. **Collaborative Playground**: Real-time code collaboration
2. **AI Code Review**: Automated feedback on solutions
3. **Video Tutorials**: Embedded video content
4. **Community Forum**: Discussion boards
5. **Mobile App**: Native iOS/Android apps
6. **Offline Mode**: Full PWA with offline support
7. **Gamification**: Leaderboards, badges, competitions
8. **Certification**: Generate completion certificates
