import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from '@/lib/error-handler';

describe('errorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('invokes listeners', () => {
    const listener = vi.fn();
    const unsubscribe = errorHandler.addListener(listener);
    errorHandler.handle(new Error('boom'), { component: 'test' });
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it('provides user friendly messages', () => {
    const message = errorHandler.getUserMessage(new Error('network failure'));
    expect(message.title).toBeTruthy();
  });
});

