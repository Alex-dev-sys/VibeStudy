/**
 * Database Schema for Bot Features
 * 
 * SQL migrations to create tables for:
 * - Bot users
 * - Quests
 * - Badges
 * - Leaderboards
 */

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- BOT USERS TABLE
-- ============================================================================
-- Stores Telegram bot user data (separate from web app users)
CREATE TABLE IF NOT EXISTS bot_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  
  -- Progress tracking
  level INT DEFAULT 1 CHECK (level >= 1),
  xp INT DEFAULT 0 CHECK (xp >= 0),
  tasks_solved INT DEFAULT 0 CHECK (tasks_solved >= 0),
  current_streak INT DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INT DEFAULT 0 CHECK (longest_streak >= 0),
  
  -- User preferences
  main_language VARCHAR(50) DEFAULT 'python',
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  is_active BOOLEAN DEFAULT true
);

-- Indexes for bot_users
CREATE INDEX IF NOT EXISTS idx_bot_users_telegram_id ON bot_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_xp ON bot_users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_bot_users_level ON bot_users(level DESC);
CREATE INDEX IF NOT EXISTS idx_bot_users_main_language ON bot_users(main_language);

-- ============================================================================
-- USER QUESTS TABLE
-- ============================================================================
-- Tracks user quest progress
CREATE TABLE IF NOT EXISTS user_quests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  telegram_id BIGINT NOT NULL REFERENCES bot_users(telegram_id) ON DELETE CASCADE,
  
  quest_id VARCHAR(255) NOT NULL,
  quest_type VARCHAR(50) NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'special', 'seasonal')),
  
  -- Quest details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Progress
  progress INT DEFAULT 0 CHECK (progress >= 0),
  target INT NOT NULL CHECK (target > 0),
  
  -- Rewards
  xp_reward INT DEFAULT 0 CHECK (xp_reward >= 0),
  badge_reward VARCHAR(255),
  
  -- Timestamps
  quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  accepted_at TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  is_expired BOOLEAN DEFAULT false,
  
  UNIQUE(telegram_id, quest_id, quest_date)
);

-- Indexes for user_quests
CREATE INDEX IF NOT EXISTS idx_user_quests_telegram_id ON user_quests(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_quest_date ON user_quests(quest_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_quests_type ON user_quests(quest_type);
CREATE INDEX IF NOT EXISTS idx_user_quests_completed ON user_quests(completed_at);

-- ============================================================================
-- BADGES TABLE
-- ============================================================================
-- Master list of all available badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  badge_id VARCHAR(255) UNIQUE NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10), -- Emoji
  category VARCHAR(50) CHECK (category IN ('progress', 'streak', 'tasks', 'special')),
  
  -- Requirements
  requirement_type VARCHAR(50), -- 'xp', 'tasks_solved', 'streak', 'special'
  requirement_value INT,
  
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Index for badges
CREATE INDEX IF NOT EXISTS idx_badges_badge_id ON badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);

-- ============================================================================
-- USER BADGES TABLE
-- ============================================================================
-- Junction table for users and their earned badges
CREATE TABLE IF NOT EXISTS user_badges (
  telegram_id BIGINT NOT NULL REFERENCES bot_users(telegram_id) ON DELETE CASCADE,
  badge_id VARCHAR(255) NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
  
  earned_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (telegram_id, badge_id)
);

-- Index for user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_telegram_id ON user_badges(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- ============================================================================
-- SEASONAL EVENTS TABLE
-- ============================================================================
-- Tracks seasonal events (e.g., Halloween, New Year)
CREATE TABLE IF NOT EXISTS seasonal_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Event period
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  
  -- Multipliers
  xp_multiplier FLOAT DEFAULT 1.0 CHECK (xp_multiplier >= 1.0),
  
  -- Special quests JSON
  special_quests JSONB DEFAULT '[]'::jsonb,
  
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for seasonal_events
CREATE INDEX IF NOT EXISTS idx_seasonal_events_active ON seasonal_events(is_active, start_date, end_date);

-- ============================================================================
-- SEED DATA - Basic Badges
-- ============================================================================
INSERT INTO badges (badge_id, name, description, icon, category, requirement_type, requirement_value, rarity) VALUES
  ('first_steps', 'Первые шаги', 'Решил первую задачу', '🌱', 'progress', 'tasks_solved', 1, 'common'),
  ('week_streak', 'Неделя силы', 'Серия 7 дней подряд', '🔥', 'streak', 'streak', 7, 'rare'),
  ('month_streak', 'Месяц упорства', 'Серия 30 дней подряд', '🔥🔥', 'streak', 'streak', 30, 'epic'),
  ('task_solver', 'Решатель', 'Решил 10 задач', '💪', 'tasks', 'tasks_solved', 10, 'common'),
  ('task_master', 'Мастер задач', 'Решил 50 задач', '🏆', 'tasks', 'tasks_solved', 50, 'rare'),
  ('level_5', 'Уровень 5', 'Достиг 5 уровня', '⭐', 'progress', 'level', 5, 'common'),
  ('level_10', 'Уровень 10', 'Достиг 10 уровня', '⭐⭐', 'progress', 'level', 10, 'rare')
ON CONFLICT (badge_id) DO NOTHING;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update user XP and level
CREATE OR REPLACE FUNCTION update_user_xp(
  p_telegram_id BIGINT,
  p_xp_amount INT
)
RETURNS TABLE(new_level INT, new_xp INT, level_up BOOLEAN) AS $$
DECLARE
  v_current_xp INT;
  v_current_level INT;
  v_new_xp INT;
  v_new_level INT;
  v_level_up BOOLEAN := false;
BEGIN
  -- Get current values
  SELECT xp, level INTO v_current_xp, v_current_level
  FROM bot_users
  WHERE telegram_id = p_telegram_id;
  
  -- Calculate new values
  v_new_xp := v_current_xp + p_xp_amount;
  v_new_level := FLOOR(v_new_xp / 500) + 1;
  
  IF v_new_level > v_current_level THEN
    v_level_up := true;
  END IF;
  
  -- Update user
  UPDATE bot_users
  SET 
    xp = v_new_xp,
    level = v_new_level,
    updated_at = NOW()
  WHERE telegram_id = p_telegram_id;
  
  RETURN QUERY SELECT v_new_level, v_new_xp, v_level_up;
END;
$$ LANGUAGE plpgsql;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_telegram_id BIGINT)
RETURNS INT AS $$
DECLARE
  v_last_activity TIMESTAMP;
  v_current_streak INT;
  v_longest_streak INT;
  v_new_streak INT;
  v_hours_since_activity FLOAT;
BEGIN
  -- Get current values
  SELECT last_activity, current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM bot_users
  WHERE telegram_id = p_telegram_id;
  
  -- Calculate hours since last activity
  v_hours_since_activity := EXTRACT(EPOCH FROM (NOW() - v_last_activity)) / 3600;
  
  -- Determine new streak
  IF v_hours_since_activity <= 24 THEN
    -- Same day or next day - continue streak
    v_new_streak := v_current_streak + 1;
  ELSIF v_hours_since_activity <= 48 THEN
    -- Within 48 hours - keep streak
    v_new_streak := v_current_streak;
  ELSE
    -- Streak broken - reset
    v_new_streak := 1;
  END IF;
  
  -- Update user
  UPDATE bot_users
  SET 
    current_streak = v_new_streak,
    longest_streak = GREATEST(v_longest_streak, v_new_streak),
    last_activity = NOW(),
    updated_at = NOW()
  WHERE telegram_id = p_telegram_id;
  
  RETURN v_new_streak;
END;
$$ LANGUAGE plpgsql;
