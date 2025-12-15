/**
 * Mock for @/lib/ai-client
 * Centralized mock to be used across all tests
 */

import { vi } from 'vitest';

export const mockCallChatCompletion = vi.fn().mockResolvedValue({
  raw: 'This is a test response from AI',
  model: 'test-model',
  data: null,
});

export const mockCallChatCompletionWithTier = vi.fn().mockResolvedValue({
  raw: 'This is a test response from AI',
  model: 'test-model',
  data: null,
});

export const mockIsAiConfigured = vi.fn().mockReturnValue(true);
export const mockIsAiConfiguredAsync = vi.fn().mockResolvedValue(true);
export const mockGenerateCacheKey = vi.fn((language: string, dayNumber: number) => `${language}-${dayNumber}`);
export const mockInvalidateCache = vi.fn().mockResolvedValue(0);

export const aiClientMock = {
  callChatCompletion: mockCallChatCompletion,
  callChatCompletionWithTier: mockCallChatCompletionWithTier,
  isAiConfigured: mockIsAiConfigured,
  isAiConfiguredAsync: mockIsAiConfiguredAsync,
  generateCacheKey: mockGenerateCacheKey,
  invalidateCache: mockInvalidateCache,
};
