# Task 7: Referral System Database

## Status: COMPLETED

The referral system database structure has been successfully implemented in migration 002_subscription_tiers.sql.

## Implementation Details

### 1. Referrals Table
- Tracks referrer and referred user relationships
- Status: pending (registered) or completed (first login)
- Prevents duplicate referrals with unique constraint
- Automatic cleanup on user deletion

### 2. Indexes
- idx_referrals_referrer: Fast lookups by referrer
- idx_referrals_referred: Fast lookups by referred user
- idx_referrals_status: Composite index for status filtering

### 3. Handle Referral Completion Function
Logic:
1. Triggers when status changes from pending to completed
2. Counts total completed referrals for the referrer
3. Every 5 completed referrals = 1 month Premium tier
4. Smart expiration handling:
   - Active subscription: extends by 1 month
   - Expired subscription: starts new 1-month period
   - No subscription: starts 1-month Premium

### 4. Trigger
- trigger_referral_completion on referrals table
- Executes AFTER UPDATE when status changes to completed
- Runs per-row for batch updates

### 5. Row Level Security
- Users can view referrals where they are referrer or referred
- Anyone can create referrals (for registration flow)
- System can update referrals (for status changes)

## Referral Program Rules

1. User signs up with referral link ?ref=userId
2. Referral created with status=pending
3. Status changes to completed after first login
4. Every 5 completed referrals = 1 month Premium tier
5. Multiple rewards stack (10 referrals = 2 months)
6. If user has Premium, expiration extends by 1 month

## Migration Status

Migration file: supabase/migrations/002_subscription_tiers.sql

Apply using:
- Supabase Dashboard: SQL Editor
- Supabase CLI: supabase db push
- Direct SQL: psql connection

## Next Steps

Database ready for:
- Task 8: Referral UI (completed)
- Task 9: Registration flow implementation
