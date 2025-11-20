# TON Payment Verification System

## Overview

This document describes the TON payment verification system that automatically checks blockchain transactions and upgrades user tiers.

## Components

### 1. Verify Payment API (`/api/ton/verify-payment`)

Manual verification endpoint that users can call to check if their payment has been confirmed on the blockchain.

**Endpoint:** `POST /api/ton/verify-payment`

**Authentication:** Required (user must be logged in)

**Request Body:**
```json
{
  "paymentId": "uuid-of-payment-record"
}
```

**Response (Success - Verified):**
```json
{
  "success": true,
  "verified": true,
  "tier": "premium",
  "expiresAt": "2024-12-20T10:30:00Z"
}
```

**Response (Success - Not Yet Verified):**
```json
{
  "success": true,
  "verified": false,
  "error": "Transaction not found on blockchain"
}
```

**Response (Error - Expired):**
```json
{
  "success": false,
  "verified": false,
  "error": "Payment has expired. Please create a new payment."
}
```

**Status Codes:**
- `200` - Request processed successfully (check `verified` field)
- `400` - Invalid request (missing paymentId)
- `401` - Not authenticated
- `404` - Payment not found
- `410` - Payment expired
- `500` - Server error

### 2. Cron Job (`/api/cron/verify-pending-payments`)

Automated background job that periodically checks all pending payments and updates user tiers when transactions are confirmed.

**Endpoint:** `GET /api/cron/verify-pending-payments`

**Authentication:** Bearer token with `CRON_SECRET`

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "success": true,
  "processed": 15,
  "verified": 3,
  "expired": 2,
  "errors": 0,
  "results": [
    {
      "paymentId": "uuid-1",
      "userId": "user-uuid-1",
      "status": "verified"
    },
    {
      "paymentId": "uuid-2",
      "userId": "user-uuid-2",
      "status": "expired"
    }
  ]
}
```

**Status Codes:**
- `200` - Cron job completed
- `401` - Invalid or missing CRON_SECRET
- `500` - Server error

## Vercel Cron Configuration

The cron job is configured in `vercel.json` to run every 10 minutes:

```json
{
  "crons": [
    {
      "path": "/api/cron/verify-pending-payments",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

**Schedule Format:** Standard cron syntax
- `*/10 * * * *` = Every 10 minutes
- `*/5 * * * *` = Every 5 minutes (more frequent)
- `0 * * * *` = Every hour

## Payment Flow

### User Journey

1. **Create Payment**
   - User calls `/api/ton/create-payment` with desired tier
   - System generates unique payment comment
   - Payment record created with status `pending`
   - User receives wallet address, amount, and comment

2. **Make Payment**
   - User sends TON to the wallet address
   - User includes the payment comment in the transaction
   - Transaction is broadcast to TON blockchain

3. **Verification (Two Methods)**

   **Method A: Manual Check**
   - User clicks "Check Payment Status" button
   - Frontend calls `/api/ton/verify-payment`
   - System checks blockchain for transaction
   - If found, user tier is upgraded immediately

   **Method B: Automatic Check**
   - Cron job runs every 10 minutes
   - Checks all pending payments
   - Upgrades tiers automatically when transactions are found
   - User sees tier update on next page refresh

4. **Tier Activation**
   - Payment status updated to `completed`
   - User tier updated in database
   - `tier_expires_at` set to +30 days
   - Transaction hash and sender address recorded

### Database Updates

When a payment is verified, the system performs two updates:

**1. Update Payment Record:**
```sql
UPDATE payments SET
  status = 'completed',
  completed_at = NOW(),
  transaction_hash = '<hash>',
  ton_sender_address = '<sender>'
WHERE id = '<payment_id>';
```

**2. Update User Tier:**
```sql
UPDATE users SET
  tier = '<premium|pro_plus>',
  tier_expires_at = NOW() + INTERVAL '30 days'
WHERE id = '<user_id>';
```

## Error Handling

### Payment Expiration

Payments expire after 24 hours if not completed:
- Status automatically updated to `expired`
- User must create a new payment
- No refunds (user should not send TON after expiration)

### Transaction Not Found

If transaction is not found on blockchain:
- Payment remains `pending`
- User can check again later
- Cron job will continue checking until expiration

### Verification Failures

If verification fails due to errors:
- Payment remains `pending`
- Error is logged
- Cron job will retry on next run
- User can manually retry verification

## Testing

### Testnet Testing

1. **Configure Testnet:**
   ```env
   NODE_ENV=development
   TON_WALLET_ADDRESS=<testnet-wallet>
   TONCENTER_API_KEY=<testnet-api-key>
   ```

2. **Get Testnet TON:**
   - Use TON testnet faucet
   - Send test TON to your testnet wallet

3. **Test Payment Flow:**
   - Create payment via API
   - Send testnet TON with comment
   - Call verify-payment endpoint
   - Check user tier update

### Manual Cron Testing

Test the cron job locally:

```bash
# Set CRON_SECRET in .env.local
CRON_SECRET=your-secret-key

# Call the endpoint
curl -X GET http://localhost:3000/api/cron/verify-pending-payments \
  -H "Authorization: Bearer your-secret-key"
```

## Environment Variables

Required environment variables:

```env
# TON Configuration
TON_WALLET_ADDRESS=UQBcz15XtwIFMh9veWAFXjqAIz7oFU25TUKSE7barFpVQTle
TONCENTER_API_KEY=your-toncenter-api-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cron Security
CRON_SECRET=your-random-secret-key

# Environment
NODE_ENV=production  # or development for testnet
```

## Security Considerations

1. **Cron Secret:** Always use a strong random secret for `CRON_SECRET`
2. **Service Role Key:** Keep `SUPABASE_SERVICE_ROLE_KEY` secure (only for cron job)
3. **Payment Expiration:** 24-hour expiration prevents stale payments
4. **Transaction Verification:** Always verify amount matches expected price
5. **Comment Matching:** Use unique comments to prevent payment confusion

## Monitoring

### Key Metrics to Monitor

1. **Pending Payments:** Number of payments awaiting verification
2. **Verification Rate:** Percentage of payments verified within 10 minutes
3. **Expiration Rate:** Percentage of payments that expire without verification
4. **Error Rate:** Number of verification errors

### Logs to Watch

```
[verify-payment] Successfully upgraded user <id> to <tier>
[cron] Processing <n> pending payments
[cron] Completed: <n> verified, <n> expired, <n> errors
[cron] Successfully verified payment <id> for user <id>
```

### Supabase Queries

**Check pending payments:**
```sql
SELECT COUNT(*) FROM payments WHERE status = 'pending';
```

**Check recent verifications:**
```sql
SELECT * FROM payments 
WHERE status = 'completed' 
ORDER BY completed_at DESC 
LIMIT 10;
```

**Check expired payments:**
```sql
SELECT COUNT(*) FROM payments 
WHERE status = 'expired' 
AND created_at > NOW() - INTERVAL '7 days';
```

## Troubleshooting

### Payment Not Verifying

1. **Check transaction on blockchain:**
   - Use TON Explorer to verify transaction exists
   - Confirm amount is correct
   - Verify comment matches payment record

2. **Check payment status:**
   - Query `payments` table for payment record
   - Verify status is `pending` (not `expired`)
   - Check `expires_at` timestamp

3. **Check cron job:**
   - Verify cron job is running (check Vercel logs)
   - Check for errors in cron job logs
   - Manually trigger cron job for testing

4. **Check TON API:**
   - Verify `TONCENTER_API_KEY` is valid
   - Check API rate limits
   - Test API connection manually

### User Tier Not Updating

1. **Check payment completion:**
   - Verify payment status is `completed`
   - Check `completed_at` timestamp

2. **Check user record:**
   - Query `users` table for user
   - Verify `tier` field updated
   - Check `tier_expires_at` is in future

3. **Check for rollback:**
   - Look for error logs indicating rollback
   - Verify both payment and user updates succeeded

## Future Improvements

1. **Webhook Support:** Add TON webhook for instant notifications
2. **Retry Logic:** Implement exponential backoff for failed verifications
3. **Notification System:** Send email/Telegram notification on successful payment
4. **Refund Handling:** Add support for refund requests
5. **Multiple Currencies:** Support other cryptocurrencies
6. **Payment History:** Add UI for viewing payment history
