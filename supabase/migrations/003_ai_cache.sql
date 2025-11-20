-- Migration: AI Cache
-- Description: Create table for caching AI-generated content to reduce API costs
-- Date: 2025-11-20

-- ============================================================================
-- 1. Create AI Cache Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  model TEXT NOT NULL,
  language TEXT,
  day_number INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Add comments for documentation
COMMENT ON TABLE ai_cache IS 'Caches AI-generated content to reduce API costs and improve response times';
COMMENT ON COLUMN ai_cache.cache_key IS 'Unique identifier for cached content (format: {language}-day-{dayNumber} or custom key)';
COMMENT ON COLUMN ai_cache.content IS 'Cached AI response in JSON format';
COMMENT ON COLUMN ai_cache.model IS 'AI model used to generate content (e.g., gemini-2.0-flash-exp, gpt-4o, claude-3-5-sonnet)';
COMMENT ON COLUMN ai_cache.language IS 'Programming language for cached content (python, javascript, etc.)';
COMMENT ON COLUMN ai_cache.day_number IS 'Day number in curriculum (1-90) if applicable';
COMMENT ON COLUMN ai_cache.metadata IS 'Additional metadata (prompt hash, generation params, etc.)';
COMMENT ON COLUMN ai_cache.hit_count IS 'Number of times this cache entry was used';
COMMENT ON COLUMN ai_cache.expires_at IS 'Optional expiration timestamp for automatic cleanup';

-- ============================================================================
-- 2. Create Indexes
-- ============================================================================

-- Primary lookup index (most common query)
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);

-- Index for finding cache by language and day
CREATE INDEX IF NOT EXISTS idx_ai_cache_language_day ON ai_cache(language, day_number) 
WHERE language IS NOT NULL AND day_number IS NOT NULL;

-- Index for finding cache by model
CREATE INDEX IF NOT EXISTS idx_ai_cache_model ON ai_cache(model);

-- Index for cleanup of expired entries
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_cache(expires_at) 
WHERE expires_at IS NOT NULL;

-- Index for finding old entries (for manual cleanup)
CREATE INDEX IF NOT EXISTS idx_ai_cache_created ON ai_cache(created_at);

-- ============================================================================
-- 3. Helper Functions
-- ============================================================================

-- Function to get cached content
CREATE OR REPLACE FUNCTION get_ai_cache(p_cache_key TEXT)
RETURNS JSONB AS $$
DECLARE
  cached_content JSONB;
BEGIN
  -- Check if cache exists and is not expired
  SELECT content INTO cached_content
  FROM ai_cache
  WHERE cache_key = p_cache_key
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- Increment hit count if found
  IF cached_content IS NOT NULL THEN
    UPDATE ai_cache
    SET 
      hit_count = hit_count + 1,
      updated_at = NOW()
    WHERE cache_key = p_cache_key;
  END IF;
  
  RETURN cached_content;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_ai_cache IS 'Retrieves cached AI content and increments hit counter';

-- Function to set cached content
CREATE OR REPLACE FUNCTION set_ai_cache(
  p_cache_key TEXT,
  p_content JSONB,
  p_model TEXT,
  p_language TEXT DEFAULT NULL,
  p_day_number INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_ttl_days INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  cache_id UUID;
  expiration TIMESTAMPTZ;
BEGIN
  -- Calculate expiration if TTL provided
  IF p_ttl_days IS NOT NULL THEN
    expiration := NOW() + (p_ttl_days || ' days')::INTERVAL;
  END IF;
  
  -- Insert or update cache entry
  INSERT INTO ai_cache (
    cache_key,
    content,
    model,
    language,
    day_number,
    metadata,
    expires_at
  ) VALUES (
    p_cache_key,
    p_content,
    p_model,
    p_language,
    p_day_number,
    p_metadata,
    expiration
  )
  ON CONFLICT (cache_key) DO UPDATE SET
    content = EXCLUDED.content,
    model = EXCLUDED.model,
    language = EXCLUDED.language,
    day_number = EXCLUDED.day_number,
    metadata = EXCLUDED.metadata,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW()
  RETURNING id INTO cache_id;
  
  RETURN cache_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION set_ai_cache IS 'Stores or updates cached AI content with optional TTL';

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_ai_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_cache
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_ai_cache IS 'Removes expired cache entries (run daily via cron)';

-- Function to clean up old unused cache entries
CREATE OR REPLACE FUNCTION cleanup_old_ai_cache(p_days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_cache
  WHERE 
    created_at < NOW() - (p_days_old || ' days')::INTERVAL
    AND hit_count = 0;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_ai_cache IS 'Removes old unused cache entries (default: 90 days old with 0 hits)';

-- Function to invalidate cache by pattern
CREATE OR REPLACE FUNCTION invalidate_ai_cache(p_pattern TEXT)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_cache
  WHERE cache_key LIKE p_pattern;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION invalidate_ai_cache IS 'Invalidates cache entries matching a pattern (e.g., "python-day-%")';

-- ============================================================================
-- 4. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read cache
CREATE POLICY "Authenticated users can read cache" ON ai_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can write to cache (via API routes)
CREATE POLICY "Service role can write cache" ON ai_cache
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 5. Triggers
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_cache_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_cache_timestamp
BEFORE UPDATE ON ai_cache
FOR EACH ROW
EXECUTE FUNCTION update_ai_cache_timestamp();

-- ============================================================================
-- Migration Complete
-- ============================================================================
