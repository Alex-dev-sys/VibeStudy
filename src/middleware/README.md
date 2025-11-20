# Tier Check Middleware

## Overview

This middleware implements Free tier limitations for AI API routes, restricting free users to 5 AI requests per day.

## Features

- **Tier-based limits**: Free (5/day), Premium (unlimited), Pro+ (unlimited)
- **Daily reset**: Counters reset at midnight UTC
- **Automatic expiration**: Paid tiers automatically downgrade when expired
- **Guest support**: Gracefully handles unauthenticated users
- **Response headers**: Includes tier info in API responses

## Usage

### Wrap API Routes

```typescript
import { withTierCheck } from '@/middleware/with-tier-check';

export const POST = withTierCheck(async (request, tierInfo) => {
  // Your handler logic here
  // tierInfo contains: { allowed, tier, requestsToday, limit }
  
  return NextResponse.json({ success: true });
});
```

### Error Response Format

When limit is exceeded, returns 403 with:

```json
{
  "error": "TIER_LIMIT_EXCEEDED",
  "message": "You've reached your daily limit of 5 AI requests. Upgrade to Premium for unlimited access.",
  "tier": "free",
  "requestsToday": 5,
  "limit": 5,
  "upgradeUrl": "/pricing"
}
```

## Integrated Routes

The following AI API routes now include tier checking:

1. `/api/check-code` - Code review
2. `/api/explain-theory` - Theory explanations
3. `/api/get-hint` - Hints for tasks
4. `/api/generate-tasks` - Task generation

## Database Schema

Requires the following fields in `users` table:

- `tier`: TEXT ('free', 'premium', 'pro_plus')
- `ai_requests_today`: INTEGER
- `ai_requests_reset_at`: TIMESTAMPTZ
- `tier_expires_at`: TIMESTAMPTZ (nullable)

## Response Headers

All tier-checked responses include:

- `X-User-Tier`: Current user tier
- `X-Requests-Today`: Number of requests made today
- `X-Requests-Limit`: Daily request limit

## Testing

To test the implementation:

1. Make 5 AI requests as a free user
2. 6th request should return 403 with upgrade message
3. Premium/Pro+ users should have unlimited access
4. Counter should reset at midnight UTC

## Notes

- Guest users (unauthenticated) are treated as free tier
- Database errors default to allowing the request (fail-open)
- Expired paid tiers are automatically downgraded to free
- Request counter increments BEFORE the request is processed
