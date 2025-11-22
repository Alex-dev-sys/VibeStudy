-- Migration: Grant Pro+ Subscription
-- Description: Grant Pro+ tier to aleksei.kolganov.2019@gmail.com
-- Date: 2025-11-22

-- Update user tier to pro_plus with lifetime access
UPDATE users
SET 
  tier = 'pro_plus',
  tier_expires_at = '2099-12-31 23:59:59+00'::TIMESTAMPTZ,
  updated_at = NOW()
WHERE email = 'aleksei.kolganov.2019@gmail.com';

-- Log the subscription grant
INSERT INTO payments (
  user_id,
  amount_ton,
  amount_usd,
  tier,
  status,
  payment_comment,
  created_at,
  updated_at
)
SELECT 
  id,
  0,
  0,
  'pro_plus',
  'completed',
  'Admin grant - Lifetime Pro+ subscription',
  NOW(),
  NOW()
FROM users
WHERE email = 'aleksei.kolganov.2019@gmail.com'
ON CONFLICT DO NOTHING;

-- Verify the update
SELECT 
  id,
  email,
  username,
  tier,
  tier_expires_at,
  created_at
FROM users
WHERE email = 'aleksei.kolganov.2019@gmail.com';
