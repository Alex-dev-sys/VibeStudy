# Design Document

## Overview

This design document outlines the technical architecture and implementation approach for enhancing VibeStudy with cloud storage, synchronization, and social features. The design maintains backward compatibility with guest mode while adding robust cloud capabilities for authenticated users. The solution uses Supabase as the backend-as-a-service platform, implementing a hybrid local-first architecture with cloud sync.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │   React    │  │   Zustand  │  │  Service Workers   │   │
│  │ Components │◄─┤   Stores   │◄─┤  (Offline Queue)   │   │
│  └────────────┘  └────────────┘  └────────────────────┘   │
│         │              │                    │               │
│         └──────────────┴────────────────────┘               │
│                        │                                     │
│              ┌─────────▼─────────┐                         │
│              │  Sync Manager     │                         │
│              │  - Conflict Res.  │                         │
│              │  - Queue Handler  │                         │
│              └─────────┬─────────┘                         │
│                        │                                     │
│         ┌──────────────┴──────────────┐                    │
│         │                              │                    │
│  ┌──────▼──────┐              ┌───────▼────────┐          │
│  │ localStorage│              │ Supabase Client│          │
│  │  (Guest)    │              │ (Authenticated)│          │
│  └─────────────┘              └───────┬────────┘          │
└────────────────────────────────────────┼───────────────────┘
                                         │
                    ┌────────────────────▼────────────────────┐
                    │         Supabase Backend                │
                    │  ┌──────────┐  ┌──────────────────┐   │
                    │  │PostgreSQL│  │  Authentication  │   │
                    │  │ Database │  │   (Auth.js)      │   │
                    │  └──────────┘  └──────────────────┘   │
                    │  ┌──────────┐  ┌──────────────────┐   │
                    │  │   RLS    │  │  Realtime Subs   │   │
                    │  │ Policies │  │  (WebSockets)    │   │
                    │  └──────────┘  └──────────────────┘   │
                    └─────────────────────────────────────────┘
```

### Data Flow Architecture

**Guest Mode (Local-First):**
```
User Action → Zustand Store → localStorage → UI Update
```

**Authenticated Mode (Hybrid Sync):**
```
User Action → Zustand Store → localStorage (immediate) → Sync Queue
                                    ↓
                              UI Update (instant)
                                    ↓
                         Supabase Sync (background)
                                    ↓
                         Conflict Resolution (if needed)
```

## Components and Interfaces

### 1. Supabase Client Module

**File:** `src/lib/supabase/client.ts`

```typescript
interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

interface SupabaseClientWrapper {
  client: SupabaseClient | null;
  isConfigured: boolean;
  auth: AuthHelpers;
  database: DatabaseHelpers;
}

// Singleton pattern for client instance
export function getSupabaseClient(): SupabaseClientWrapper;
export function initializeSupabase(config: SupabaseConfig): void;
```

**Key Features:**
- Lazy initialization with environment variable detection
- Graceful degradation when not configured
- Singleton pattern to prevent multiple instances
- Type-safe wrappers for auth and database operations

### 2. Authentication Service

**File:** `src/lib/supabase/auth.ts`

```typescript
interface AuthService {
  // Sign in methods
  signInWithGoogle(): Promise<AuthResult>;
  signInWithEmail(email: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  
  // Session management
  getSession(): Promise<Session | null>;
  onAuthStateChange(callback: AuthCallback): Unsubscribe;
  
  // User management
  getCurrentUser(): Promise<User | null>;
  updateUserProfile(updates: ProfileUpdates): Promise<void>;
}

interface AuthResult {
  user: User | null;
  session: Session | null;
  error: Error | null;
}
```

**Implementation Details:**
- Uses Supabase Auth with Google OAuth provider
- Magic link authentication for email
- Session persistence in cookies (SSR-compatible)
- Auth state change listeners for reactive updates

### 3. Data Migration Service

**File:** `src/lib/migration/migrate.ts`

```typescript
interface MigrationService {
  // Detection
  detectLocalData(): LocalDataSummary;
  
  // Migration
  migrateProgressData(userId: string): Promise<MigrationResult>;
  migrateAchievements(userId: string): Promise<MigrationResult>;
  migrateProfile(userId: string): Promise<MigrationResult>;
  migrateKnowledgeProfile(userId: string): Promise<MigrationResult>;
  
  // Full migration
  migrateAllData(userId: string): Promise<CompleteMigrationResult>;
  
  // Cleanup
  clearLocalDataAfterMigration(): Promise<void>;
}

interface LocalDataSummary {
  hasProgress: boolean;
  hasAchievements: boolean;
  hasProfile: boolean;
  completedDays: number;
  totalTasks: number;
  unlockedAchievements: number;
}

interface MigrationResult {
  success: boolean;
  itemsMigrated: number;
  errors: Error[];
}
```

**Migration Strategy:**
1. Detect existing localStorage data
2. Show migration prompt to user
3. Transform localStorage format to Supabase schema
4. Batch insert data to minimize API calls
5. Verify migration success
6. Optionally clear localStorage

### 4. Sync Manager

**File:** `src/lib/sync/sync-manager.ts`

```typescript
interface SyncManager {
  // Sync operations
  syncProgress(data: ProgressData): Promise<SyncResult>;
  syncAchievements(data: AchievementData): Promise<SyncResult>;
  syncProfile(data: ProfileData): Promise<SyncResult>;
  
  // Fetch operations
  fetchProgress(userId: string): Promise<ProgressData>;
  fetchAchievements(userId: string): Promise<AchievementData>;
  fetchProfile(userId: string): Promise<ProfileData>;
  
  // Conflict resolution
  resolveConflict<T>(local: T, remote: T, strategy: ConflictStrategy): T;
  
  // Queue management
  queueOperation(operation: SyncOperation): void;
  processQueue(): Promise<void>;
  clearQueue(): void;
}

type ConflictStrategy = 'last-write-wins' | 'merge' | 'manual';

interface SyncOperation {
  id: string;
  type: 'progress' | 'achievement' | 'profile';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}
```

**Sync Strategy:**
- **Optimistic Updates:** Update UI immediately, sync in background
- **Debouncing:** Batch rapid changes (e.g., code editing)
- **Conflict Resolution:** Last-write-wins based on timestamp
- **Retry Logic:** Exponential backoff for failed syncs
- **Queue Persistence:** Store failed operations in IndexedDB

### 5. Database Helpers

**File:** `src/lib/supabase/database.ts`

```typescript
interface DatabaseHelpers {
  // Progress operations
  progress: {
    upsert(userId: string, data: ProgressData): Promise<void>;
    fetch(userId: string): Promise<ProgressData>;
    fetchDay(userId: string, day: number): Promise<DayData>;
  };
  
  // Achievement operations
  achievements: {
    unlock(userId: string, achievementId: string): Promise<void>;
    fetchAll(userId: string): Promise<Achievement[]>;
    updateStats(userId: string, stats: UserStats): Promise<void>;
  };
  
  // Task attempt operations
  taskAttempts: {
    create(userId: string, attempt: TaskAttempt): Promise<void>;
    fetchForTask(userId: string, taskId: string): Promise<TaskAttempt[]>;
    fetchRecent(userId: string, limit: number): Promise<TaskAttempt[]>;
  };
  
  // Topic mastery operations
  topicMastery: {
    update(userId: string, topic: string, result: boolean): Promise<void>;
    fetch(userId: string): Promise<TopicMastery[]>;
    fetchTopic(userId: string, topic: string): Promise<TopicMastery>;
  };
  
  // Leaderboard operations
  leaderboards: {
    fetchByDays(limit: number): Promise<LeaderboardEntry[]>;
    fetchByStreak(limit: number): Promise<LeaderboardEntry[]>;
    fetchByTasks(limit: number): Promise<LeaderboardEntry[]>;
    fetchUserRank(userId: string, type: LeaderboardType): Promise<number>;
  };
  
  // Community operations
  community: {
    fetchPublicProfile(userId: string): Promise<PublicProfile>;
    updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<void>;
    createStudyGroup(data: StudyGroupData): Promise<StudyGroup>;
    joinStudyGroup(userId: string, groupId: string): Promise<void>;
    fetchStudyGroups(userId: string): Promise<StudyGroup[]>;
  };
  
  // Discussion operations
  discussions: {
    create(data: DiscussionData): Promise<Discussion>;
    reply(discussionId: string, data: ReplyData): Promise<Reply>;
    fetch(filters: DiscussionFilters): Promise<Discussion[]>;
    fetchForDay(day: number): Promise<Discussion[]>;
  };
}
```

### 6. Enhanced Zustand Stores

**Progress Store Enhancement:**

```typescript
interface EnhancedProgressStore extends ProgressStore {
  // Sync state
  isSyncing: boolean;
  lastSyncTime: number;
  syncError: Error | null;
  
  // Sync methods
  syncToCloud(): Promise<void>;
  fetchFromCloud(): Promise<void>;
  
  // Offline queue
  queuedOperations: SyncOperation[];
  addToQueue(operation: SyncOperation): void;
  processQueue(): Promise<void>;
}
```

**Achievement Store Enhancement:**

```typescript
interface EnhancedAchievementsStore extends AchievementsStore {
  // Sync state
  isSyncing: boolean;
  lastSyncTime: number;
  
  // Cloud methods
  syncToCloud(): Promise<void>;
  fetchFromCloud(): Promise<void>;
}
```

**Profile Store Enhancement:**

```typescript
interface EnhancedProfileStore extends ProfileStore {
  // Privacy settings
  privacySettings: PrivacySettings;
  updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<void>;
  
  // Sync methods
  syncToCloud(): Promise<void>;
  fetchFromCloud(): Promise<void>;
}

interface PrivacySettings {
  showOnLeaderboard: boolean;
  showProfile: boolean;
  showProgress: boolean;
  allowMessages: boolean;
}
```

### 7. Leaderboard Component

**File:** `src/components/leaderboard/Leaderboard.tsx`

```typescript
interface LeaderboardProps {
  type: 'days' | 'streak' | 'tasks' | 'achievements';
  limit?: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  value: number;
  isCurrentUser: boolean;
}
```

**Features:**
- Tabbed interface for different leaderboard types
- Pagination (50 users per page)
- Current user highlight
- Real-time updates via Supabase subscriptions
- Skeleton loading states

### 8. Community Components

**Public Profile:**

```typescript
interface PublicProfileProps {
  userId: string;
}

interface PublicProfile {
  username: string;
  avatar?: string;
  bio?: string;
  joinedAt: number;
  stats: {
    completedDays: number;
    currentStreak: number;
    totalTasks: number;
    achievements: Achievement[];
  };
  preferredLanguage: string;
}
```

**Study Groups:**

```typescript
interface StudyGroupProps {
  groupId: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: number;
  members: GroupMember[];
  memberCount: number;
}

interface GroupMember {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: number;
  currentDay: number;
  completedDays: number;
}
```

**Discussion Forum:**

```typescript
interface DiscussionProps {
  day?: number;
  topic?: string;
}

interface Discussion {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  day?: number;
  topic?: string;
  createdAt: number;
  updatedAt: number;
  replyCount: number;
  replies: Reply[];
}

interface Reply {
  id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
}
```

### 9. Offline Support

**Service Worker Strategy:**

```typescript
// Register service worker for offline support
interface OfflineManager {
  // Network detection
  isOnline(): boolean;
  onOnline(callback: () => void): Unsubscribe;
  onOffline(callback: () => void): Unsubscribe;
  
  // Queue management
  queueOperation(operation: SyncOperation): void;
  getQueuedOperations(): SyncOperation[];
  clearQueue(): void;
  
  // Sync when online
  syncWhenOnline(): Promise<void>;
}
```

**Implementation:**
- Use `navigator.onLine` for initial state
- Listen to `online` and `offline` events
- Store queue in IndexedDB for persistence
- Auto-sync when connection restores
- Show offline indicator in UI

### 10. Data Export/Import

**File:** `src/lib/export/data-export.ts`

```typescript
interface DataExportService {
  // Export
  exportAllData(userId: string): Promise<ExportData>;
  downloadExport(data: ExportData, filename: string): void;
  
  // Import
  validateImport(file: File): Promise<ValidationResult>;
  importData(userId: string, data: ExportData): Promise<ImportResult>;
}

interface ExportData {
  version: string;
  exportedAt: number;
  userId: string;
  progress: ProgressData;
  achievements: AchievementData;
  profile: ProfileData;
  taskAttempts: TaskAttempt[];
  topicMastery: TopicMastery[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

## Data Models

### Database Schema Extensions

**Study Groups Table:**

```sql
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
```

**Discussions Table:**

```sql
CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  day INTEGER,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Privacy Settings Table:**

```sql
CREATE TABLE user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  show_on_leaderboard BOOLEAN DEFAULT TRUE,
  show_profile BOOLEAN DEFAULT TRUE,
  show_progress BOOLEAN DEFAULT TRUE,
  allow_messages BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Leaderboard Views:**

```sql
CREATE VIEW leaderboard_by_days AS
SELECT 
  u.id,
  u.username,
  COUNT(DISTINCT up.topic_id) as completed_days,
  ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT up.topic_id) DESC) as rank
FROM users u
JOIN user_progress up ON u.id = up.user_id
JOIN user_privacy_settings ups ON u.id = ups.user_id
WHERE up.completed = TRUE AND ups.show_on_leaderboard = TRUE
GROUP BY u.id, u.username;
```

## Error Handling

### Error Types

```typescript
enum SyncErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

interface SyncError extends Error {
  type: SyncErrorType;
  retryable: boolean;
  retryAfter?: number;
  details?: any;
}
```

### Error Handling Strategy

1. **Network Errors:** Queue operation, retry with exponential backoff
2. **Auth Errors:** Prompt re-authentication, preserve data locally
3. **Validation Errors:** Show user-friendly message, don't retry
4. **Conflict Errors:** Apply conflict resolution strategy
5. **Rate Limit Errors:** Respect retry-after header, queue operations
6. **Unknown Errors:** Log for debugging, show generic message

### Retry Logic

```typescript
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2
};
```

## Testing Strategy

### Unit Tests

- **Supabase Client:** Mock Supabase responses
- **Sync Manager:** Test conflict resolution logic
- **Migration Service:** Test data transformation
- **Database Helpers:** Test query construction

### Integration Tests

- **Auth Flow:** Test Google OAuth and magic link
- **Data Migration:** Test full migration process
- **Sync Operations:** Test bidirectional sync
- **Offline Queue:** Test queue persistence and processing

### End-to-End Tests

- **User Journey:** Guest → Register → Migrate → Sync
- **Multi-Device:** Sync across multiple browser sessions
- **Offline/Online:** Test offline queue and sync
- **Leaderboard:** Test ranking calculations

### Performance Tests

- **Sync Performance:** Measure sync time for various data sizes
- **Query Performance:** Measure database query times
- **UI Responsiveness:** Ensure UI remains responsive during sync
- **Memory Usage:** Monitor memory consumption

## Security Considerations

### Row Level Security (RLS)

All Supabase tables use RLS policies to ensure users can only access their own data:

```sql
-- Example: Users can only read their own progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Example: Users can only update their own progress
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);
```

### Data Validation

- **Client-Side:** Validate data before sending to Supabase
- **Server-Side:** Use Supabase database constraints
- **Type Safety:** Use TypeScript for compile-time checks

### Authentication Security

- **Session Management:** Use HTTP-only cookies for session tokens
- **CSRF Protection:** Implement CSRF tokens for state-changing operations
- **Rate Limiting:** Implement rate limiting on auth endpoints

### Privacy Protection

- **Data Minimization:** Only store necessary data
- **Anonymization:** Anonymize leaderboard entries for private users
- **Consent:** Require explicit consent for data sharing features

## Performance Optimization

### Database Optimization

1. **Indexes:** Create indexes on frequently queried columns
2. **Materialized Views:** Use for leaderboards to reduce computation
3. **Query Optimization:** Use `select` to fetch only needed columns
4. **Batch Operations:** Batch inserts/updates to reduce API calls

### Client-Side Optimization

1. **Debouncing:** Debounce rapid changes (code editing, notes)
2. **Caching:** Cache frequently accessed data (leaderboards, profiles)
3. **Lazy Loading:** Load data on-demand (discussions, task attempts)
4. **Pagination:** Paginate large lists (leaderboards, discussions)

### Network Optimization

1. **Compression:** Enable gzip compression for API responses
2. **CDN:** Use CDN for static assets
3. **Connection Pooling:** Reuse Supabase connections
4. **WebSockets:** Use Supabase Realtime for live updates

## Migration Path

### Phase 1: Foundation (Week 1-2)
- Set up Supabase client
- Implement authentication flow
- Create database helpers
- Add sync manager skeleton

### Phase 2: Core Sync (Week 3-4)
- Implement progress sync
- Implement achievement sync
- Implement profile sync
- Add data migration service

### Phase 3: Advanced Features (Week 5-6)
- Add task attempt history
- Implement topic mastery
- Add offline support
- Implement conflict resolution

### Phase 4: Social Features (Week 7-8)
- Implement leaderboards
- Add public profiles
- Create study groups
- Add discussion forums

### Phase 5: Polish (Week 9-10)
- Add data export/import
- Implement analytics
- Performance optimization
- Comprehensive testing

## Monitoring and Analytics

### Key Metrics

1. **Sync Performance:**
   - Average sync time
   - Sync success rate
   - Queue size

2. **User Engagement:**
   - Daily active users
   - Sync frequency
   - Feature usage

3. **Error Rates:**
   - Sync errors by type
   - Auth failures
   - Migration failures

4. **Performance:**
   - Page load time
   - Database query time
   - API response time

### Logging Strategy

```typescript
interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
  userId?: string;
}

// Example usage
logger.info('sync', 'Progress synced successfully', { itemCount: 5 });
logger.error('auth', 'Authentication failed', { error: err.message });
```

## Rollback Strategy

### Feature Flags

Use feature flags to enable/disable features:

```typescript
interface FeatureFlags {
  enableCloudSync: boolean;
  enableLeaderboards: boolean;
  enableCommunity: boolean;
  enableOfflineMode: boolean;
}
```

### Graceful Degradation

- If Supabase is down, fall back to localStorage
- If sync fails, queue operations for later
- If leaderboards fail, hide the feature
- If community features fail, show cached data

### Data Recovery

- Keep localStorage as backup during migration
- Implement data export before major operations
- Provide manual sync trigger for users
- Log all operations for debugging
