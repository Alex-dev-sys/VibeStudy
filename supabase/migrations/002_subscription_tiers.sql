-- Migration: Subscription Tiers
-- Description: Add subscription tier system with Free/Premium/Pro+ tiers
-- Date: 2025-11-20

-- ============================================================================
-- 1. Add Tier Fields to Users Table
-- ============================================================================

-- Add tier-related columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'pro_plus')),
ADD COLUMN IF NOT EXISTS ai_requests_today INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_requests_reset_at TIMESTAMPTZ DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN users.tier IS 'Subscription tier: free (5 AI requests/day), premium (GPT-4o, 30 req/min), pro_plus (Claude 3.5, 100 req/min)';
COMMENT ON COLUMN users.ai_requests_today IS 'Number of AI requests made today (resets daily)';
COMMENT ON COLUMN users.ai_requests_reset_at IS 'Timestamp when AI request counter was last reset';
COMMENT ON COLUMN users.tier_expires_at IS 'Expiration date for paid tier (NULL for free tier or lifetime access)';

-- ============================================================================
-- 2. Create Indexes for Tier Queries
-- ============================================================================

-- Index for tier lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- Index for finding users with expiring subscriptions
CREATE INDEX IF NOT EXISTS idx_users_tier_expires ON users(tier_expires_at) 
WHERE tier_expires_at IS NOT NULL;

-- Composite index for AI rate limiting checks
CREATE INDEX IF NOT EXISTS idx_users_tier_ai_requests ON users(id, tier, ai_requests_today, ai_requests_reset_at);

-- ============================================================================
-- 3. Create Payments Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('ton', 'telegram_stars')),
  amount_ton DECIMAL(10, 4), -- Amount in TON
  amount_usd DECIMAL(10, 2), -- Equivalent in USD
  tier TEXT NOT NULL CHECK (tier IN ('premium', 'pro_plus')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  payment_comment TEXT, -- Unique comment for TON payment identification
  transaction_hash TEXT, -- TON transaction hash after confirmation
  ton_sender_address TEXT, -- Sender's TON wallet address
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_comment ON payments(payment_comment) WHERE payment_comment IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(status, created_at) WHERE status = 'pending';

COMMENT ON TABLE payments IS 'Stores payment transactions for tier upgrades';
COMMENT ON COLUMN payments.payment_comment IS 'Unique identifier for TON payments (format: user_{userId}_payment_{timestamp})';
COMMENT ON COLUMN payments.expires_at IS 'Pending payments expire after 24 hours';

-- ============================================================================
-- 4. Create Referrals Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Indexes for referral queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(referrer_id, status);

COMMENT ON TABLE referrals IS 'Tracks referral program: 5 completed referrals = 1 month free Premium';
COMMENT ON COLUMN referrals.status IS 'pending: user registered but not active, completed: user completed first login';

-- ============================================================================
-- 5. Helper Functions
-- ============================================================================

-- Function to reset daily AI request counters
CREATE OR REPLACE FUNCTION reset_daily_ai_requests()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    ai_requests_today = 0,
    ai_requests_reset_at = CURRENT_DATE
  WHERE ai_requests_reset_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION reset_daily_ai_requests IS 'Resets AI request counters for all users (run daily via cron)';

-- Function to check and downgrade expired tiers
CREATE OR REPLACE FUNCTION downgrade_expired_tiers()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    tier = 'free',
    tier_expires_at = NULL
  WHERE 
    tier IN ('premium', 'pro_plus')
    AND tier_expires_at IS NOT NULL
    AND tier_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION downgrade_expired_tiers IS 'Downgrades users to free tier when subscription expires (run daily via cron)';

-- Function to expire old pending payments
CREATE OR REPLACE FUNCTION expire_pending_payments()
RETURNS void AS $$
BEGIN
  UPDATE payments
  SET status = 'expired'
  WHERE 
    status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION expire_pending_payments IS 'Marks pending payments as expired after 24 hours (run hourly via cron)';

-- Function to handle referral completion
CREATE OR REPLACE FUNCTION handle_referral_completion()
RETURNS TRIGGER AS $$
DECLARE
  completed_count INTEGER;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    -- Count completed referrals for this referrer
    SELECT COUNT(*) INTO completed_count
    FROM referrals
    WHERE referrer_id = NEW.referrer_id AND status = 'completed';
    
    -- Every 5 completed referrals grants 1 month of Premium
    IF completed_count % 5 = 0 THEN
      UPDATE users
      SET 
        tier = 'premium',
        tier_expires_at = COALESCE(
          CASE 
            WHEN tier_expires_at > NOW() THEN tier_expires_at + INTERVAL '1 month'
            ELSE NOW() + INTERVAL '1 month'
          END,
          NOW() + INTERVAL '1 month'
        )
      WHERE id = NEW.referrer_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_referral_completion IS 'Automatically grants 1 month Premium for every 5 completed referrals';

-- ============================================================================
-- 6. Triggers
-- ============================================================================

-- Trigger for referral completion
CREATE TRIGGER trigger_referral_completion
AFTER UPDATE ON referrals
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status = 'pending')
EXECUTE FUNCTION handle_referral_completion();

-- ============================================================================
-- 7. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view own referrals as referrer" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own referrals as referred" ON referrals
  FOR SELECT USING (auth.uid() = referred_id);

CREATE POLICY "Users can insert referrals" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update referrals" ON referrals
  FOR UPDATE USING (true);

-- ============================================================================
-- 8. Initial Data
-- ============================================================================

-- Set all existing users to free tier (if not already set)
UPDATE users 
SET 
  tier = 'free',
  ai_requests_today = 0,
  ai_requests_reset_at = CURRENT_DATE
WHERE tier IS NULL;

-- ============================================================================
-- Migration Complete
-- ============================================================================
