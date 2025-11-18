import { describe, it, expect } from 'vitest';
import { rateLimiter, evaluateRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

describe('rate limiter', () => {
  it('allows requests under limit', () => {
    const request = new Request('http://localhost');
    const state = evaluateRateLimit(request, RATE_LIMITS.API_GENERAL, { bucketId: 'test' });
    expect(state.allowed).toBe(true);
  });

  it('blocks after exceeding limit', () => {
    const request = new Request('http://localhost');
    const bucket = { limit: 1, windowMs: 10_000 };
    evaluateRateLimit(request, bucket, { bucketId: 'limited' });
    const second = evaluateRateLimit(request, bucket, { bucketId: 'limited' });
    expect(second.allowed).toBe(false);
  });
});

