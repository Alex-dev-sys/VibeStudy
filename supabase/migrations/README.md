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

### Hourly: Refresh Analytics Summary
```sql
SELECT refresh_analytics_summary();
```

### Daily: Cleanup Old Messages
```sql
SELECT cleanup_old_messages();
```

### Daily: Reset AI Limits
```sql
SELECT reset_daily_ai_limits();
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

