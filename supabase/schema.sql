-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'pro_plus')),
  ai_requests_today INTEGER DEFAULT 0,
  ai_requests_reset_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_DATE,
  tier_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица прогресса пользователя
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- в секундах
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Таблица попыток решения задач
CREATE TABLE IF NOT EXISTS task_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  code TEXT NOT NULL,
  result JSONB, -- результат проверки от AI
  is_correct BOOLEAN DEFAULT FALSE,
  hints_used INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица достижений
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Таблица мастерства по темам (для адаптивного обучения)
CREATE TABLE IF NOT EXISTS topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  mastery_level REAL DEFAULT 0.0, -- от 0 до 1
  total_attempts INTEGER DEFAULT 0,
  successful_attempts INTEGER DEFAULT 0,
  last_practice TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- Таблица для кэширования сгенерированного контента
CREATE TABLE IF NOT EXISTS generated_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'task', 'theory', 'hint'
  topic TEXT NOT NULL,
  difficulty TEXT,
  language TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Таблица для кэширования AI контента (новая система)
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  model TEXT NOT NULL,
  language TEXT,
  day_number INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Таблица платежей
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('ton', 'telegram_stars')),
  amount_ton DECIMAL(10, 4),
  amount_usd DECIMAL(10, 2),
  tier TEXT NOT NULL CHECK (tier IN ('premium', 'pro_plus')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  payment_comment TEXT,
  transaction_hash TEXT,
  ton_sender_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Таблица рефералов
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_task_attempts_user_id ON task_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_task_attempts_task_id ON task_attempts(task_id);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_user_id ON topic_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_cache_lookup ON generated_content_cache(content_type, topic, difficulty, language);

-- Индексы для тарифов
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_tier_expires ON users(tier_expires_at) WHERE tier_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_tier_ai_requests ON users(id, tier, ai_requests_today, ai_requests_reset_at);

-- Индексы для платежей
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_comment ON payments(payment_comment) WHERE payment_comment IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(status, created_at) WHERE status = 'pending';

-- Индексы для рефералов
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(referrer_id, status);

-- Индексы для AI кэша
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_language_day ON ai_cache(language, day_number) WHERE language IS NOT NULL AND day_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_cache_model ON ai_cache(model);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_cache(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_cache_created ON ai_cache(created_at);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_mastery_updated_at BEFORE UPDATE ON topic_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_mastery ENABLE ROW LEVEL SECURITY;

-- Политики доступа (пользователи видят только свои данные)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own attempts" ON task_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON task_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own mastery" ON topic_mastery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mastery" ON topic_mastery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mastery" ON topic_mastery
  FOR UPDATE USING (auth.uid() = user_id);

-- Публичный доступ к кэшу контента (только чтение)
CREATE POLICY "Anyone can view content cache" ON generated_content_cache
  FOR SELECT USING (true);

-- Политики для AI кэша
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cache" ON ai_cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can write cache" ON ai_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Политики для платежей
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политики для рефералов
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals as referrer" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own referrals as referred" ON referrals
  FOR SELECT USING (auth.uid() = referred_id);

CREATE POLICY "Users can insert referrals" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update referrals" ON referrals
  FOR UPDATE USING (true);

