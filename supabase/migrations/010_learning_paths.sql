-- Migration: Learning Paths System
-- Добавляем поддержку мультиязычных путей обучения

-- =============================================================================
-- ТАБЛИЦА ПРОГРЕССА ПО ПУТЯМ
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  path_id TEXT NOT NULL,
  current_day INTEGER DEFAULT 1,
  completed_days INTEGER[] DEFAULT '{}',
  total_time_spent INTEGER DEFAULT 0, -- секунды
  average_score REAL DEFAULT 0.0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, path_id)
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_user_path_progress_user ON user_path_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_path_progress_path ON user_path_progress(path_id);
CREATE INDEX IF NOT EXISTS idx_user_path_progress_active ON user_path_progress(user_id, last_activity DESC);

-- =============================================================================
-- ДОБАВЛЯЕМ ПОЛЕ ДЛЯ АКТИВНОГО ПУТИ В USERS
-- =============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS active_path_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS completed_path_ids TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_users_active_path ON users(active_path_id) WHERE active_path_id IS NOT NULL;

-- =============================================================================
-- ОБНОВЛЯЕМ TASK_ATTEMPTS ДЛЯ ПОДДЕРЖКИ ПУТЕЙ
-- =============================================================================

ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS path_id TEXT;

CREATE INDEX IF NOT EXISTS idx_task_attempts_path ON task_attempts(path_id) WHERE path_id IS NOT NULL;

-- =============================================================================
-- ОБНОВЛЯЕМ USER_PROGRESS ДЛЯ ПОДДЕРЖКИ ПУТЕЙ
-- =============================================================================

ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS path_id TEXT;

CREATE INDEX IF NOT EXISTS idx_user_progress_path ON user_progress(path_id) WHERE path_id IS NOT NULL;

-- =============================================================================
-- ТРИГГЕР ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ UPDATED_AT
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS update_user_path_progress_updated_at 
  BEFORE UPDATE ON user_path_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- RLS ПОЛИТИКИ
-- =============================================================================

ALTER TABLE user_path_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own path progress" ON user_path_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own path progress" ON user_path_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own path progress" ON user_path_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- МИГРАЦИЯ СУЩЕСТВУЮЩИХ ДАННЫХ (если есть прогресс по 90-дневному курсу)
-- =============================================================================

-- Переносим существующий прогресс Python в python-beginner путь
-- Только для пользователей, у которых есть прогресс
INSERT INTO user_path_progress (user_id, path_id, current_day, started_at)
SELECT DISTINCT 
  user_id, 
  'python-beginner' as path_id,
  COALESCE(MAX(CAST(SPLIT_PART(topic_id, '-day', 2) AS INTEGER)), 1) as current_day,
  MIN(created_at) as started_at
FROM user_progress 
WHERE topic_id LIKE '%day%'
GROUP BY user_id
ON CONFLICT (user_id, path_id) DO NOTHING;

-- Устанавливаем активный путь для существующих пользователей
UPDATE users 
SET active_path_id = 'python-beginner'
WHERE id IN (
  SELECT DISTINCT user_id FROM user_path_progress WHERE path_id = 'python-beginner'
)
AND active_path_id IS NULL;
