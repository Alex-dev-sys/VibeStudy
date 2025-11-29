-- Migration: Quests System
-- Description: Quest system with daily/weekly quests and user progress tracking
-- Date: 2025-11-29

-- ============================================================================
-- 1. Create Quests Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_type TEXT NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'achievement')),
  quest_key TEXT UNIQUE NOT NULL, -- eg: 'solve_3_tasks', 'ai_help_5_times'
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  target_value INTEGER NOT NULL DEFAULT 1,
  reward_xp INTEGER NOT NULL DEFAULT 0,
  reward_coins INTEGER DEFAULT 0,
  icon TEXT, -- Emoji icon
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quests_type ON quests(quest_type);
CREATE INDEX idx_quests_active ON quests(is_active);
CREATE INDEX idx_quests_key ON quests(quest_key);

COMMENT ON TABLE quests IS 'Defines all available quests in the system';
COMMENT ON COLUMN quests.quest_type IS 'Type: daily (resets daily), weekly (resets weekly), achievement (one-time)';
COMMENT ON COLUMN quests.quest_key IS 'Unique identifier for tracking progress';
COMMENT ON COLUMN quests.target_value IS 'Target value to complete quest (e.g., 3 for "solve 3 tasks")';

-- ============================================================================
-- 2. Create User Quest Progress Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ, -- When user claimed the reward
  reset_at TIMESTAMPTZ, -- For daily/weekly quests
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id, reset_at)
);

CREATE INDEX idx_user_quest_progress_user_id ON user_quest_progress(user_id);
CREATE INDEX idx_user_quest_progress_quest_id ON user_quest_progress(quest_id);
CREATE INDEX idx_user_quest_progress_completed ON user_quest_progress(user_id, completed_at);

COMMENT ON TABLE user_quest_progress IS 'Tracks user progress on quests';
COMMENT ON COLUMN user_quest_progress.current_value IS 'Current progress value (e.g., 2 out of 3 tasks)';
COMMENT ON COLUMN user_quest_progress.completed_at IS 'When quest was completed';
COMMENT ON COLUMN user_quest_progress.claimed_at IS 'When reward was claimed';
COMMENT ON COLUMN user_quest_progress.reset_at IS 'Next reset time for daily/weekly quests';

-- ============================================================================
-- 3. Insert Default Quests
-- ============================================================================

-- Daily Quests
INSERT INTO quests (quest_key, quest_type, name_en, name_ru, description_en, description_ru, target_value, reward_xp, icon) VALUES
('daily_solve_3', 'daily', 'Solve 3 Tasks', 'Решить 3 задачи', 'Complete 3 coding tasks today', 'Реши 3 задачи по программированию сегодня', 3, 50, '✅'),
('daily_use_ai', 'daily', 'AI Helper', 'Помощь AI', 'Ask AI for help', 'Попроси подсказку у AI ментора', 1, 30, '🤖'),
('daily_study_30min', 'daily', 'Study 30 min', 'Учись 30 минут', 'Study for at least 30 minutes', 'Учись не менее 30 минут сегодня', 30, 40, '⏱️'),
('daily_perfect_score', 'daily', 'Perfect Score', 'Идеально', 'Get 100% on any task', 'Получи 100% за любую задачу', 1, 60, '💯'),
('daily_streak', 'daily', 'Keep the Streak', 'Сохрани серию', 'Continue your daily streak', 'Продолжи свою ежедневную серию', 1, 20, '🔥')
ON CONFLICT (quest_key) DO NOTHING;

-- Weekly Quests
INSERT INTO quests (quest_key, quest_type, name_en, name_ru, description_en, description_ru, target_value, reward_xp, icon) VALUES
('weekly_solve_20', 'weekly', 'Solve 20 Tasks', 'Решить 20 задач', 'Complete 20 tasks this week', 'Реши 20 задач на этой неделе', 20, 200, '🎯'),
('weekly_study_5hours', 'weekly', '5 Hours of Study', '5 часов учёбы', 'Study for 5 hours this week', 'Учись 5 часов на этой неделе', 300, 150, '📚'),
('weekly_7day_streak', 'weekly', '7 Day Streak', 'Серия 7 дней', 'Study every day this week', 'Учись каждый день на этой неделе', 7, 300, '🌟')
ON CONFLICT (quest_key) DO NOTHING;

-- Achievements
INSERT INTO quests (quest_key, quest_type, name_en, name_ru, description_en, description_ru, target_value, reward_xp, icon) VALUES
('achievement_first_task', 'achievement', 'First Steps', 'Первые шаги', 'Complete your first task', 'Реши свою первую задачу', 1, 10, '🎓'),
('achievement_10_tasks', 'achievement', 'Getting Started', 'Начало пути', 'Complete 10 tasks', 'Реши 10 задач', 10, 50, '🌱'),
('achievement_50_tasks', 'achievement', 'Task Master', 'Мастер задач', 'Complete 50 tasks', 'Реши 50 задач', 50, 150, '⚡'),
('achievement_100_tasks', 'achievement', 'Centurion', 'Центурион', 'Complete 100 tasks', 'Реши 100 задач', 100, 500, '💪'),
('achievement_streak_7', 'achievement', 'Week Warrior', 'Недельный воин', '7 day study streak', 'Серия обучения 7 дней', 7, 100, '🔥'),
('achievement_streak_30', 'achievement', 'Monthly Master', 'Мастер месяца', '30 day study streak', 'Серия обучения 30 дней', 30, 500, '👑'),
('achievement_ai_fan', 'achievement', 'AI Enthusiast', 'Фанат AI', 'Use AI help 50 times', 'Используй AI помощь 50 раз', 50, 200, '🤖')
ON CONFLICT (quest_key) DO NOTHING;

-- ============================================================================
-- 4. Helper Functions
-- ============================================================================

-- Get active daily quests for user
CREATE OR REPLACE FUNCTION get_user_daily_quests(p_user_id UUID, p_language TEXT DEFAULT 'ru')
RETURNS TABLE (
  quest_id UUID,
  quest_key TEXT,
  name TEXT,
  description TEXT,
  target_value INTEGER,
  current_value INTEGER,
  reward_xp INTEGER,
  icon TEXT,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.quest_key,
    CASE WHEN p_language = 'en' THEN q.name_en ELSE q.name_ru END,
    CASE WHEN p_language = 'en' THEN q.description_en ELSE q.description_ru END,
    q.target_value,
    COALESCE(uqp.current_value, 0),
    q.reward_xp,
    q.icon,
    uqp.completed_at,
    uqp.claimed_at
  FROM quests q
  LEFT JOIN user_quest_progress uqp ON (
    uqp.quest_id = q.id
    AND uqp.user_id = p_user_id
    AND (uqp.reset_at IS NULL OR uqp.reset_at > NOW())
  )
  WHERE q.quest_type = 'daily'
    AND q.is_active = true
  ORDER BY q.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment quest progress
CREATE OR REPLACE FUNCTION increment_quest_progress(
  p_user_id UUID,
  p_quest_key TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_quest_id UUID;
  v_quest_type TEXT;
  v_target_value INTEGER;
  v_current_value INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  -- Get quest info
  SELECT id, quest_type, target_value
  INTO v_quest_id, v_quest_type, v_target_value
  FROM quests
  WHERE quest_key = p_quest_key AND is_active = true;

  IF v_quest_id IS NULL THEN
    RETURN false;
  END IF;

  -- Calculate reset time
  IF v_quest_type = 'daily' THEN
    v_reset_at := (CURRENT_DATE + INTERVAL '1 day')::TIMESTAMPTZ;
  ELSIF v_quest_type = 'weekly' THEN
    v_reset_at := (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week')::TIMESTAMPTZ;
  ELSE
    v_reset_at := NULL;
  END IF;

  -- Insert or update progress
  INSERT INTO user_quest_progress (user_id, quest_id, current_value, reset_at)
  VALUES (p_user_id, v_quest_id, p_increment, v_reset_at)
  ON CONFLICT (user_id, quest_id, reset_at)
  DO UPDATE SET
    current_value = user_quest_progress.current_value + p_increment,
    updated_at = NOW(),
    completed_at = CASE
      WHEN user_quest_progress.current_value + p_increment >= v_target_value
        AND user_quest_progress.completed_at IS NULL
      THEN NOW()
      ELSE user_quest_progress.completed_at
    END;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_quest_progress IS 'Increments user progress on a quest by key';

-- ============================================================================
-- 5. Triggers
-- ============================================================================

CREATE TRIGGER trigger_user_quest_progress_updated_at
BEFORE UPDATE ON user_quest_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;

-- Quests policies (read-only for all)
CREATE POLICY "Anyone can view active quests" ON quests
  FOR SELECT USING (is_active = true);

-- User quest progress policies
CREATE POLICY "Users can view own quest progress" ON user_quest_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest progress" ON user_quest_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quest progress" ON user_quest_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- Migration Complete
-- ============================================================================
