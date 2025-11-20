-- Create ai_feedback table for collecting user feedback on AI-generated content
CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'theory', 'hint', 'explanation', 'task'
  content_key TEXT NOT NULL, -- e.g., 'python-day-1-theory', 'javascript-day-5-hint'
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
  metadata JSONB DEFAULT '{}', -- Additional context (language, day, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by user
CREATE INDEX idx_ai_feedback_user_id ON ai_feedback(user_id);

-- Create index for content lookup
CREATE INDEX idx_ai_feedback_content ON ai_feedback(content_type, content_key);

-- Create index for analytics queries
CREATE INDEX idx_ai_feedback_created_at ON ai_feedback(created_at);

-- Enable Row Level Security
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON ai_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON ai_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Service role can view all feedback (for analytics)
CREATE POLICY "Service role can view all feedback"
  ON ai_feedback
  FOR SELECT
  TO service_role
  USING (true);
