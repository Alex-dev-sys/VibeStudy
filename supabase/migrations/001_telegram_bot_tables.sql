-- Migration: Telegram Bot Tables
-- Description: Add tables for Telegram bot functionality
-- Date: 2025-11-14

-- ============================================================================
-- 1. User Telegram Profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_telegram_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_user_id BIGINT UNIQUE NOT NULL,
  chat_id BIGINT NOT NULL,
  username TEXT,
  first_name TEXT,
  language_code TEXT DEFAULT 'ru',
  timezone TEXT DEFAULT 'Europe/Moscow',
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telegram_user_id ON user_telegram_profiles(telegram_user_id);
CREATE INDEX idx_telegram_user_id_lookup ON user_telegram_profiles(user_id);
CREATE INDEX idx_telegram_active_users ON user_telegram_profiles(is_active) WHERE is_active = true;

COMMENT ON TABLE user_telegram_profiles IS 'Stores Telegram user profiles linked to VibeStudy accounts';
COMMENT ON COLUMN user_telegram_profiles.preferences IS 'JSON object storing user preferences like notification settings';

-- ============================================================================
-- 2. Reminder Schedules
-- ============================================================================

CREATE TABLE IF NOT EXISTS reminder_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('daily_study', 'streak_protection', 'milestone', 'weekly_report', 'daily_digest')),
  scheduled_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Moscow',
  enabled BOOLEAN DEFAULT true,
  adaptive_mode BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  ignore_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminder_user ON reminder_schedules(user_id);
CREATE INDEX idx_reminder_time ON reminder_schedules(scheduled_time) WHERE enabled = true;
CREATE INDEX idx_reminder_type ON reminder_schedules(reminder_type, enabled);

COMMENT ON TABLE reminder_schedules IS 'Stores user reminder preferences and schedules';
COMMENT ON COLUMN reminder_schedules.ignore_count IS 'Number of consecutive ignored reminders';
COMMENT ON COLUMN reminder_schedules.response_count IS 'Number of times user responded positively';


-- ============================================================================
-- 3. Telegram Messages Log
-- ============================================================================

CREATE TABLE IF NOT EXISTS telegram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user_message', 'bot_response', 'reminder', 'notification', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_user ON telegram_messages(user_id);
CREATE INDEX idx_messages_telegram_user ON telegram_messages(telegram_user_id);
CREATE INDEX idx_messages_created ON telegram_messages(created_at DESC);
CREATE INDEX idx_messages_type ON telegram_messages(message_type);

COMMENT ON TABLE telegram_messages IS 'Logs all Telegram bot interactions';
COMMENT ON COLUMN telegram_messages.metadata IS 'Additional data like buttons clicked, voice transcription, command args';

-- ============================================================================
-- 4. Learning Analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  study_duration_minutes INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_attempted INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2),
  weak_topics JSONB DEFAULT '[]'::jsonb,
  peak_hours JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_analytics_user_date ON learning_analytics(user_id, date DESC);
CREATE INDEX idx_analytics_date ON learning_analytics(date DESC);

COMMENT ON TABLE learning_analytics IS 'Daily learning analytics for each user';
COMMENT ON COLUMN learning_analytics.engagement_score IS 'Calculated score from 0-100 based on activity';
COMMENT ON COLUMN learning_analytics.weak_topics IS 'Array of topics with mastery < 70%';
COMMENT ON COLUMN learning_analytics.peak_hours IS 'Array of hours when user is most productive';


-- ============================================================================
-- 5. Bot Conversations
-- ============================================================================

CREATE TABLE IF NOT EXISTS bot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  conversation_context JSONB DEFAULT '{}'::jsonb,
  last_command TEXT,
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON bot_conversations(user_id);
CREATE INDEX idx_conversations_telegram_user ON bot_conversations(telegram_user_id);
CREATE INDEX idx_conversations_last_interaction ON bot_conversations(last_interaction_at DESC);

COMMENT ON TABLE bot_conversations IS 'Stores conversation state for context-aware responses';
COMMENT ON COLUMN bot_conversations.conversation_context IS 'Stores current conversation state, waiting for input, etc.';

-- ============================================================================
-- 6. AI Question Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_question_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  questions_asked INTEGER DEFAULT 0,
  questions_remaining INTEGER DEFAULT 10,
  last_question_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_ai_tracking_user_date ON ai_question_tracking(user_id, date DESC);

COMMENT ON TABLE ai_question_tracking IS 'Tracks daily AI question usage per user';
COMMENT ON COLUMN ai_question_tracking.questions_remaining IS 'Questions remaining for today (max 10)';

-- ============================================================================
-- 7. Materialized View for Analytics Summary
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS user_analytics_summary AS
SELECT 
  user_id,
  COUNT(*) as total_days_tracked,
  AVG(engagement_score) as avg_engagement,
  SUM(study_duration_minutes) as total_study_time,
  SUM(tasks_completed) as total_tasks_completed,
  SUM(tasks_attempted) as total_tasks_attempted,
  MAX(date) as last_activity_date
FROM learning_analytics
GROUP BY user_id;

CREATE UNIQUE INDEX idx_analytics_summary_user ON user_analytics_summary(user_id);

COMMENT ON MATERIALIZED VIEW user_analytics_summary IS 'Aggregated analytics for quick lookups';


-- ============================================================================
-- 8. Triggers for Auto-Update
-- ============================================================================

CREATE TRIGGER update_telegram_profiles_updated_at 
BEFORE UPDATE ON user_telegram_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminder_schedules_updated_at 
BEFORE UPDATE ON reminder_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_analytics_updated_at 
BEFORE UPDATE ON learning_analytics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_tracking_updated_at 
BEFORE UPDATE ON ai_question_tracking
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE user_telegram_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_question_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for user_telegram_profiles
CREATE POLICY "Users can view own telegram profile" ON user_telegram_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own telegram profile" ON user_telegram_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own telegram profile" ON user_telegram_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for reminder_schedules
CREATE POLICY "Users can view own reminders" ON reminder_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON reminder_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminder_schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminder_schedules
  FOR DELETE USING (auth.uid() = user_id);


-- Policies for telegram_messages
CREATE POLICY "Users can view own messages" ON telegram_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON telegram_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for learning_analytics
CREATE POLICY "Users can view own analytics" ON learning_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON learning_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON learning_analytics
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for bot_conversations
CREATE POLICY "Users can view own conversations" ON bot_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON bot_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON bot_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for ai_question_tracking
CREATE POLICY "Users can view own ai tracking" ON ai_question_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai tracking" ON ai_question_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai tracking" ON ai_question_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 10. Helper Functions
-- ============================================================================

-- Function to refresh analytics summary (call hourly via cron)
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_analytics_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old messages (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM telegram_messages 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset daily AI question limits
CREATE OR REPLACE FUNCTION reset_daily_ai_limits()
RETURNS void AS $$
BEGIN
  UPDATE ai_question_tracking
  SET questions_remaining = 10,
      questions_asked = 0
  WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION refresh_analytics_summary IS 'Refreshes materialized view for analytics';
COMMENT ON FUNCTION cleanup_old_messages IS 'Removes messages older than 90 days';
COMMENT ON FUNCTION reset_daily_ai_limits IS 'Resets AI question limits for new day';

-- ============================================================================
-- Migration Complete
-- ============================================================================

