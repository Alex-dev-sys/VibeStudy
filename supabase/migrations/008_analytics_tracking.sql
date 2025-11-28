-- Migration: Add analytics tracking fields to task_attempts table
-- This migration adds fields needed for the analytics system while preserving existing code review fields

-- Add new columns for analytics tracking
ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS day INTEGER;
ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT FALSE;
ALTER TABLE task_attempts ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 1;

-- Make code column nullable (for analytics-only entries)
ALTER TABLE task_attempts ALTER COLUMN code DROP NOT NULL;

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_task_attempts_day ON task_attempts(user_id, day);
CREATE INDEX IF NOT EXISTS idx_task_attempts_success ON task_attempts(user_id, success);
CREATE INDEX IF NOT EXISTS idx_task_attempts_time ON task_attempts(user_id, start_time);

-- Add comment
COMMENT ON TABLE task_attempts IS 'Stores both code submissions and analytics tracking data for tasks';
