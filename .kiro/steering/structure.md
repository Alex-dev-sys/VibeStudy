# Project Structure

## Root Directory

```
VibeStudy/
├── .kiro/                    # Kiro AI configuration
│   ├── specs/               # Feature specifications
│   └── steering/            # AI steering rules
├── src/                     # Source code
├── public/                  # Static assets
├── data/                    # Generated content storage
├── scripts/                 # Utility scripts (dev, bot)
├── supabase/               # Database schemas
└── tests/                  # E2E tests (Playwright)
```

## Source Structure (`src/`)

### App Directory (`src/app/`)

Next.js 14 App Router structure:

- `page.tsx` - Landing page
- `layout.tsx` - Root layout
- `globals.css` - Global styles
- `middleware.ts` - Auth middleware
- **Routes:**
  - `learn/` - Main learning interface
  - `profile/` - User profile
  - `playground/` - Code sandbox
  - `analytics/` - Statistics dashboard
  - `community/` - Community features
  - `auth/` - Authentication pages
  - `login/` - Login page
  - `api/` - API routes (see below)

### API Routes (`src/app/api/`)

RESTful API endpoints:

- `generate-tasks/` - AI task generation
- `get-content/` - Fetch saved content
- `check-code/` - Code validation
- `check-solution/` - Solution checking
- `execute-code/` - Code execution
- `explain-theory/` - AI theory explanations
- `get-hint/` - AI hints
- `regenerate-task/` - Task regeneration
- `adaptive-recommendations/` - Personalized recommendations
- `analytics/` - Analytics tracking
- `groups/` - Community groups
- `telegram/` - Telegram bot webhooks

### Components (`src/components/`)

Organized by feature:

- `ui/` - Reusable UI components (shadcn/ui)
- `dashboard/` - Learning dashboard components
- `achievements/` - Achievement system
- `statistics/` - Analytics visualizations
- `profile/` - Profile components
- `playground/` - Code editor components
- `landing/` - Landing page sections
- `layout/` - Layout components (header, nav)
- `analytics/` - Analytics components
- `community/` - Community features
- `onboarding/` - User onboarding
- `migration/` - Data migration
- `sync/` - Cloud sync UI
- `realtime/` - Real-time features
- `export/` - Data export
- `LocaleSwitcher.tsx` - Language switcher

### Library (`src/lib/`)

Business logic and utilities:

- `curriculum.ts` - 90-day curriculum definition
- `achievements.ts` - Achievement logic
- `languages.ts` - Programming language configs
- `db.ts` - Local file storage
- `telegram-db.ts` - Telegram data storage
- `ai-client.ts` - Hugging Face API client
- `content-formatting.ts` - Content utilities
- `utils.ts` - General utilities
- **Subdirectories:**
  - `i18n/` - Internationalization
  - `supabase/` - Supabase client & queries
  - `sync/` - Cloud sync logic
  - `telegram/` - Telegram bot logic
  - `cache/` - Caching utilities
  - `accessibility/` - A11y helpers
  - `export/` - Data export
  - `migration/` - Data migration
  - `onboarding/` - Onboarding logic
  - `playground/` - Playground utilities
  - `seo/` - SEO utilities

### State Management (`src/store/`)

Zustand stores with persist middleware:

- `progress-store.ts` - Learning progress, day states
- `achievements-store.ts` - Unlocked achievements
- `profile-store.ts` - User profile data
- `locale-store.ts` - Language preference
- `analytics-store.ts` - Analytics data
- `playground-store.ts` - Playground state
- `knowledge-profile-store.ts` - Adaptive learning
- `groups-store.ts` - Community groups
- `onboarding-store.ts` - Onboarding state

### Types (`src/types/`)

TypeScript type definitions:

- `index.ts` - Core types (DayStateSnapshot, ProgressRecord, Task, etc.)
- `achievements.ts` - Achievement types
- `telegram.ts` - Telegram types
- `groups.ts` - Community types

### Hooks (`src/hooks/`)

Custom React hooks:

- `useSync.ts` - Cloud synchronization
- `useOfflineSync.ts` - Offline sync queue
- `useRealtimeAchievements.ts` - Real-time updates
- `useScrollLock.ts` - Scroll locking
- `useTaskGenerator.ts` - Task generation

### Data (`src/data/`)

Static curriculum data:

- `curriculum-content.ts` - 90-day curriculum structure

### Telegram (`src/telegram/`)

Telegram bot implementation:

- `bot.ts` - Bot logic and handlers

## Key Patterns

### State Management Pattern

```typescript
// Zustand store with persist
export const useStore = create<StoreInterface>()(
  persist(
    (set, get) => ({
      // state
      // actions
    }),
    {
      name: 'storage-key',
      partialize: (state) => ({ /* persisted fields */ })
    }
  )
);
```

### API Route Pattern

```typescript
// src/app/api/[endpoint]/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  // logic
  return NextResponse.json(data);
}

export async function GET() {
  return NextResponse.json(data);
}
```

### Component Organization

- Feature-based folders in `components/`
- UI primitives in `components/ui/`
- Co-locate related components
- Use TypeScript interfaces for props

### File Storage Pattern

- Local: `data/generated-content.json`
- Vercel: `/tmp/vibestudy-data/`
- Fallback: In-memory store
- Key format: `{languageId}_day{dayNumber}`

### Sync Pattern

- Local-first: Zustand + localStorage
- Cloud sync: Debounced Supabase updates
- Conflict resolution: Last-write-wins
- Offline queue: Pending operations array
