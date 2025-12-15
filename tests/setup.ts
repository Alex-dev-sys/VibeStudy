/**
 * Vitest setup file
 * Runs before all tests
 */

import { vi, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock localStorage for Node environment BEFORE any imports
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };
};

// Set up storage mocks globally
const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
  configurable: true,
});

// Reset storage before each test
beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock achievement toast to avoid React/DOM dependencies in tests
vi.mock('@/components/achievements/AchievementToast', () => ({
  showAchievementToast: vi.fn(),
  AchievementToast: vi.fn(() => null),
}));

// Mock AI client globally
vi.mock('@/lib/ai-client', () => ({
  callChatCompletion: vi.fn().mockResolvedValue({
    raw: 'This is a test response from AI',
    model: 'test-model',
    data: null,
  }),
  callChatCompletionWithTier: vi.fn().mockResolvedValue({
    raw: 'This is a test response from AI',
    model: 'test-model',
    data: null,
  }),
  isAiConfigured: vi.fn().mockReturnValue(true),
  isAiConfiguredAsync: vi.fn().mockResolvedValue(true),
  generateCacheKey: vi.fn((language: string, dayNumber: number) => `${language}-${dayNumber}`),
  invalidateCache: vi.fn().mockResolvedValue(0),
}));
