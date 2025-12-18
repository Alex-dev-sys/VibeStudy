import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, LogLevel } from '@/lib/core/logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('logs info messages', () => {
    logger.setLevel(LogLevel.INFO);
    logger.info('hello');
    expect(console.info).toHaveBeenCalled();
  });

  it('logs warnings with context', () => {
    logger.warn('warn-msg', { component: 'test' });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('warn-msg')
    );
  });

  it('logs errors with stack', () => {
    const error = new Error('boom');
    logger.error('err', error);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('err'),
      error
    );
  });
});

