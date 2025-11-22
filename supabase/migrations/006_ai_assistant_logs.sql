-- AI Assistant Logs Table
-- Stores analytics and usage data for AI assistant interactions

-- Create ai_assistant_logs table
CREATE TABLE IF NOT EXISTS ai_assistant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'pro_plus')),
  request_type TEXT NOT NULL CHECK (request_type IN ('question', 'code-help', 'advice', 'general')),
  message_length INTEGER NOT NULL,
  response_length INTEGER NOT NULL,
  processing_time INTEGER NOT NULL, -- in milliseconds
  model_used TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT,
  cache_hit BOOLEAN NOT NULL DEFAULT false, -- whether response was served from cache
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_user_id ON ai_assistant_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_created_at ON ai_assistant_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_tier ON ai_assistant_logs(tier);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_request_type ON ai_assistant_logs(request_type);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_success ON ai_assistant_logs(success);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_cache_hit ON ai_assistant_logs(cache_hit);

-- Create composite index for user analytics
CREATE INDEX IF NOT EXISTS idx_ai_assistant_logs_user_date ON ai_assistant_logs(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_assistant_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own logs
CREATE POLICY ai_assistant_logs_select_policy ON ai_assistant_logs
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Service role can insert logs
CREATE POLICY ai_assistant_logs_insert_policy ON ai_assistant_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Service role can view all logs (for analytics)
CREATE POLICY ai_assistant_logs_service_select_policy ON ai_assistant_logs
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Function to get user request count for today
CREATE OR REPLACE FUNCTION get_user_ai_requests_today(p_user_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO request_count
  FROM ai_assistant_logs
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
  
  RETURN COALESCE(request_count, 0);
END;
$$;

-- Function to get user request count in last N minutes
CREATE OR REPLACE FUNCTION get_user_ai_requests_recent(p_user_id TEXT, p_minutes INTEGER DEFAULT 60)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO request_count
  FROM ai_assistant_logs
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_minutes || ' minutes')::INTERVAL;
  
  RETURN COALESCE(request_count, 0);
END;
$$;

-- Function to get AI assistant analytics summary
CREATE OR REPLACE FUNCTION get_ai_assistant_analytics(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_requests BIGINT,
  successful_requests BIGINT,
  failed_requests BIGINT,
  cache_hits BIGINT,
  cache_misses BIGINT,
  cache_hit_rate NUMERIC,
  avg_processing_time NUMERIC,
  avg_message_length NUMERIC,
  avg_response_length NUMERIC,
  requests_by_tier JSONB,
  requests_by_type JSONB,
  models_used JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_requests,
    COUNT(*) FILTER (WHERE success = true)::BIGINT as successful_requests,
    COUNT(*) FILTER (WHERE success = false)::BIGINT as failed_requests,
    COUNT(*) FILTER (WHERE cache_hit = true)::BIGINT as cache_hits,
    COUNT(*) FILTER (WHERE cache_hit = false)::BIGINT as cache_misses,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE cache_hit = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
      ELSE 0
    END as cache_hit_rate,
    ROUND(AVG(processing_time)::NUMERIC, 2) as avg_processing_time,
    ROUND(AVG(message_length)::NUMERIC, 2) as avg_message_length,
    ROUND(AVG(response_length)::NUMERIC, 2) as avg_response_length,
    (
      SELECT jsonb_object_agg(tier, count)
      FROM (
        SELECT tier, COUNT(*) as count
        FROM ai_assistant_logs
        WHERE created_at >= p_start_date AND created_at <= p_end_date
        GROUP BY tier
      ) tier_counts
    ) as requests_by_tier,
    (
      SELECT jsonb_object_agg(request_type, count)
      FROM (
        SELECT request_type, COUNT(*) as count
        FROM ai_assistant_logs
        WHERE created_at >= p_start_date AND created_at <= p_end_date
        GROUP BY request_type
      ) type_counts
    ) as requests_by_type,
    (
      SELECT jsonb_object_agg(model_used, count)
      FROM (
        SELECT model_used, COUNT(*) as count
        FROM ai_assistant_logs
        WHERE created_at >= p_start_date AND created_at <= p_end_date
        GROUP BY model_used
      ) model_counts
    ) as models_used
  FROM ai_assistant_logs
  WHERE created_at >= p_start_date AND created_at <= p_end_date;
END;
$$;

-- Function to clean up old logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_assistant_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_assistant_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create a scheduled job to clean up old logs (if pg_cron is available)
-- This is optional and requires pg_cron extension
-- SELECT cron.schedule('cleanup-ai-logs', '0 2 * * *', 'SELECT cleanup_old_ai_assistant_logs()');

-- Grant necessary permissions
GRANT SELECT ON ai_assistant_logs TO authenticated;
GRANT INSERT ON ai_assistant_logs TO service_role;
GRANT EXECUTE ON FUNCTION get_user_ai_requests_today TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_ai_requests_recent TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_ai_assistant_analytics TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_ai_assistant_logs TO service_role;

-- Add comments for documentation
COMMENT ON TABLE ai_assistant_logs IS 'Stores analytics and usage data for AI assistant interactions';
COMMENT ON COLUMN ai_assistant_logs.user_id IS 'User ID (can be guest ID for non-authenticated users)';
COMMENT ON COLUMN ai_assistant_logs.tier IS 'User subscription tier at time of request';
COMMENT ON COLUMN ai_assistant_logs.request_type IS 'Type of AI assistant request';
COMMENT ON COLUMN ai_assistant_logs.processing_time IS 'Time taken to process request in milliseconds';
COMMENT ON COLUMN ai_assistant_logs.model_used IS 'AI model used for this request';
COMMENT ON COLUMN ai_assistant_logs.cache_hit IS 'Whether the response was served from cache';
COMMENT ON COLUMN ai_assistant_logs.metadata IS 'Additional metadata (e.g., code length, task ID)';

COMMENT ON FUNCTION get_user_ai_requests_today IS 'Get count of AI requests made by user today';
COMMENT ON FUNCTION get_user_ai_requests_recent IS 'Get count of AI requests made by user in last N minutes';
COMMENT ON FUNCTION get_ai_assistant_analytics IS 'Get analytics summary for AI assistant usage';
COMMENT ON FUNCTION cleanup_old_ai_assistant_logs IS 'Delete logs older than 90 days';
