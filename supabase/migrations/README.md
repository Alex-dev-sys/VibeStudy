# Supabase Migrations

This directory contains database migrations for the VibeStudy Telegram bot.

## Migrations

### 001_telegram_bot_tables.sql

Creates the core database schema for Telegram bot functionality:

**Tables:**
- `user_telegram_profiles` - Links Telegram accounts to VibeStudy users
- `reminder_schedules` - Stores user reminder preferences
- `telegram_messages` - Logs all bot interactions
- `learning_analytics` - Daily learning metrics per user
- `bot_conversations` - Conversation state for context-aware responses
- `ai_question_tracking` - Tracks daily AI question usage

**Views:**
- `user_analytics_summary` - Materialized view for aggregated analytics

**Functions:**
- `refresh_analytics_summary()` - Refreshes the analytics summary view
- `cleanup_old_messages()` - Removes messages older than 90 days
- `reset_daily_ai_limits()` - Resets AI question limits for new day

### 002_subscription_tiers.sql

Adds subscription tier system with monetization features:

**Schema Changes:**
- Adds `tier`, `ai_requests_today`, `ai_requests_reset_at`, `tier_expires_at` columns to `users` table

**New Tables:**
- `payments` - Stores TON and Telegram Stars payment transactions
- `referrals` - Tracks referral program (5 referrals = 1 month Premium)

**Indexes:**
- Optimized indexes for tier lookups, AI rate limiting, and payment queries

**Functions:**
- `reset_daily_ai_requests()` - Resets AI request counters daily
- `downgrade_expired_tiers()` - Downgrades expired subscriptions to free tier
- `expire_pending_payments()` - Marks pending payments as expired after 24 hours
- `handle_referral_completion()` - Automatically grants Premium for completed referrals

**Triggers:**
- `trigger_referral_completion` - Executes when referral status changes to completed

**Tier System:**
- **Free**: 5 AI requests/day, Gemini 2.5 model
- **Premium**: 30 requests/min, GPT-4o model, 5 TON/month (~$12)
- **Pro+**: 100 requests/min, Claude 3.5 Sonnet model, 12 TON/month (~$29)

### 003_ai_cache.sql

Adds AI response caching to reduce API costs and improve performance.

### 004_ai_feedback.sql

Adds user feedback collection for AI-generated content quality.

### 005_daily_challenges.sql

Creates infrastructure for daily coding challenges:

**New Tables:**
- `daily_challenges` - Stores daily coding challenges for each programming language
- `user_challenge_attempts` - Tracks user attempts and solutions

**Indexes:**
- Unique index on `(date, language)` to ensure one challenge per day per language
- Optimized indexes for date and language lookups

**Functions:**
- `get_todays_challenge(language)` - Retrieves today's challenge for a specific language
- `get_user_challenge_stats(user_id)` - Calculates user statistics including streaks
- `update_updated_at_column()` - Automatically updates timestamp on row changes

**Features:**
- One unique challenge per language per day
- Support for 7 programming languages (Python, JavaScript, TypeScript, Java, C++, C#, Go)
- Tracks user attempts with test results and execution time
- Calculates current and longest streaks for gamification
- Row Level Security enabled for data protection

## Running Migrations

### Option 1: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration file content
4. Click "Run"

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Manual SQL Execution

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i supabase/migrations/001_telegram_bot_tables.sql
```

## Verification

After running the migration, verify the tables were created:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%telegram%' OR table_name LIKE '%reminder%';

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('user_telegram_profiles', 'reminder_schedules', 'telegram_messages', 'learning_analytics');

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Scheduled Maintenance

Set up these cron jobs for database maintenance:

### Hourly Tasks

**Refresh Analytics Summary:**
```sql
SELECT refresh_analytics_summary();
```

**Expire Pending Payments:**
```sql
SELECT expire_pending_payments();
```

### Daily Tasks

**Cleanup Old Messages:**
```sql
SELECT cleanup_old_messages();
```

**Reset AI Request Limits:**
```sql
SELECT reset_daily_ai_requests();
```

**Downgrade Expired Tiers:**
```sql
SELECT downgrade_expired_tiers();
```

## Rollback

If you need to rollback the migration:

```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS ai_question_tracking CASCADE;
DROP TABLE IF EXISTS bot_conversations CASCADE;
DROP TABLE IF EXISTS learning_analytics CASCADE;
DROP TABLE IF EXISTS telegram_messages CASCADE;
DROP TABLE IF EXISTS reminder_schedules CASCADE;
DROP TABLE IF EXISTS user_telegram_profiles CASCADE;

-- Drop materialized view
DROP MATERIALIZED VIEW IF EXISTS user_analytics_summary;

-- Drop functions
DROP FUNCTION IF EXISTS refresh_analytics_summary();
DROP FUNCTION IF EXISTS cleanup_old_messages();
DROP FUNCTION IF EXISTS reset_daily_ai_limits();
```

## Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Indexes are optimized for common query patterns
- Materialized view should be refreshed hourly for best performance
- Old messages are automatically cleaned up after 90 days

