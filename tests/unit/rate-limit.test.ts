import { describe, it, expect } from 'vitest';
import { rateLimiter, evaluateRateLimit, RATE_LIMITS } from '@/lib/core/rate-limit';

describe('rate limiter', () => {
  it('allows requests under limit', async () => {
    const request = new Request('http://localhost');
    const state = await evaluateRateLimit(request, RATE_LIMITS.API_GENERAL, { bucketId: 'test' });
    expect(state.allowed).toBe(true);
  });

  it('blocks after exceeding limit', async () => {
    const request = new Request('http://localhost');
    const bucket = { limit: 1, windowMs: 10_000 };
    await evaluateRateLimit(request, bucket, { bucketId: 'limited' });
    const second = await evaluateRateLimit(request, bucket, { bucketId: 'limited' });
    expect(second.allowed).toBe(false);
  });
});

