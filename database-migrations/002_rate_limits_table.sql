-- Migration: Add rate_limits table for distributed rate limiting
-- This table stores rate limit counters for multi-instance deployments

CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_access TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_access ON rate_limits(last_access);

-- Auto cleanup expired entries (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE reset_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup periodically
-- Run this manually via pg_cron or Supabase scheduler:
-- SELECT cleanup_expired_rate_limits();

COMMENT ON TABLE rate_limits IS 'Distributed rate limiting storage for multi-instance deployments';
COMMENT ON COLUMN rate_limits.identifier IS 'Unique identifier (user:id or ip:address)';
COMMENT ON COLUMN rate_limits.count IS 'Number of requests in current window';
COMMENT ON COLUMN rate_limits.reset_at IS 'When the counter resets';
COMMENT ON COLUMN rate_limits.last_access IS 'Last request timestamp for LRU cleanup';
