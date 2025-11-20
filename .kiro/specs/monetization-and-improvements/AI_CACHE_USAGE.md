# AI Cache Usage Guide

## Overview

The AI caching system provides persistent caching of AI-generated content in Supabase to reduce API costs and improve response times. The cache survives server restarts and can be shared across multiple instances.

## Key Features

- **Persistent Storage**: Cache stored in Supabase database
- **Automatic Hit Counting**: Tracks how often cached content is used
- **TTL Support**: Optional expiration for cache entries
- **Cache Invalidation**: Pattern-based cache clearing
- **Fallback**: Gracefully handles Supabase unavailability

## Cache Key Format

For curriculum content, use the format: `{language}-day-{dayNumber}`

Examples:
- `python-day-1`
- `javascript-day-15`
- `typescript-day-90`

## Usage Examples

### 1. Basic Usage with Cache Key

```typescript
import { callChatCompletionWithCache } from '@/lib/ai-client';

// Generate or retrieve cached content for a specific day
const result = await callChatCompletionWithCache(
  [
    { role: 'system', content: 'You are a programming teacher.' },
    { role: 'user', content: 'Explain variables in Python' }
  ],
  {
    cacheKey: 'python-day-2',
    tier: 'free',
    ttlDays: 30 // Cache expires after 30 days
  }
);

console.log(result.raw); // AI response or cached content
```

### 2. Auto-Generated Cache Key

```typescript
import { callChatCompletionWithCache, generateCacheKey } from '@/lib/ai-client';

const language = 'javascript';
const dayNumber = 5;

const result = await callChatCompletionWithCache(
  messages,
  {
    language,
    dayNumber,
    tier: 'premium',
    ttlDays: 60
  }
);

// Cache key is automatically generated as: javascript-day-5
```

### 3. Bypass Cache (Force Regeneration)

```typescript
const result = await callChatCompletionWithCache(
  messages,
  {
    cacheKey: 'python-day-10',
    tier: 'pro_plus',
    bypassCache: true // Skip cache lookup, always generate fresh
  }
);
```

### 4. Cache Invalidation

```typescript
import { invalidateCache } from '@/lib/ai-client';

// Invalidate all Python content
await invalidateCache('python-day-%');

// Invalidate specific day across all languages
await invalidateCache('%-day-15');

// Invalidate all cache
await invalidateCache('%');
```

## Integration in API Routes

### Example: Update generate-tasks API

```typescript
import { callChatCompletionWithCache, generateCacheKey } from '@/lib/ai-client';

export async function POST(request: Request) {
  const { day, languageId } = await request.json();
  
  // Check Supabase cache first, then generate if needed
  const result = await callChatCompletionWithCache(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    {
      language: languageId,
      dayNumber: day,
      tier: 'free',
      ttlDays: 90 // Cache curriculum content for 90 days
    }
  );
  
  return Response.json(result);
}
```

## Cache Management

### View Cache Statistics

```sql
-- Check cache hit counts
SELECT cache_key, model, hit_count, created_at, updated_at
FROM ai_cache
ORDER BY hit_count DESC
LIMIT 10;

-- Check cache size by language
SELECT language, COUNT(*) as entries, SUM(hit_count) as total_hits
FROM ai_cache
WHERE language IS NOT NULL
GROUP BY language;
```

### Manual Cache Cleanup

```sql
-- Remove expired entries
SELECT cleanup_expired_ai_cache();

-- Remove old unused entries (90+ days old with 0 hits)
SELECT cleanup_old_ai_cache(90);

-- Invalidate specific pattern
SELECT invalidate_ai_cache('python-day-%');
```

## Best Practices

1. **Use Descriptive Cache Keys**: Follow the `{language}-day-{dayNumber}` format for curriculum content
2. **Set Appropriate TTL**: 
   - Curriculum content: 90 days (rarely changes)
   - Dynamic content: 7-30 days
   - User-specific: Don't cache or use short TTL
3. **Monitor Hit Rates**: Check `hit_count` to identify popular content
4. **Invalidate on Updates**: Clear cache when curriculum changes
5. **Fallback Gracefully**: The system works without Supabase, falling back to direct AI calls

## Performance Benefits

- **Cost Reduction**: Avoid duplicate AI API calls for same content
- **Faster Response**: Cached content returns instantly
- **Reliability**: Cached content available even if AI API is down
- **Analytics**: Track which content is most requested via hit counts

## Monitoring

Check cache effectiveness:

```typescript
// In your API route
const result = await callChatCompletionWithCache(messages, options);

if (result.model === 'cached') {
  console.log('✅ Cache HIT - saved API call');
} else {
  console.log('❌ Cache MISS - made API call');
}
```

## Migration Path

For existing API routes using in-memory cache:

1. Keep existing `apiCache` for short-term caching (request-level)
2. Add `callChatCompletionWithCache` for long-term caching (persistent)
3. Use both: in-memory cache checks first, then Supabase cache, then AI API

```typescript
// Hybrid approach
const memCacheKey = generateCacheKey('ai:tasks', fingerprint);
let cached = apiCache.get(memCacheKey);

if (!cached) {
  // Check Supabase cache
  const result = await callChatCompletionWithCache(messages, {
    language: languageId,
    dayNumber: day,
    tier: 'free'
  });
  
  cached = result;
  apiCache.set(memCacheKey, cached, CACHE_TTL.AI_CONTENT);
}

return cached;
```
