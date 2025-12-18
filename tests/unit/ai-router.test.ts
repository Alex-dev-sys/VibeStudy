/**
 * Tests for AI Router
 */

import { describe, it, expect } from 'vitest';
import { AIRouter, createAIRouter, getModelForUserTier } from '@/lib/routing/ai-router';
import { getModelForTier, getModelNameForTier, hasPremiumAccess } from '@/lib/config/ai-models.config';

describe('AI Models Config', () => {
  it('should return correct model for free tier', () => {
    const model = getModelForTier('free');
    expect(model.model).toBe(process.env.AI_MODEL_FREE || 'gemini-1.5-flash');
    expect(model.name).toBe('Gemini 2.5 Flash');
  });

  it('should return correct model for premium tier', () => {
    const model = getModelForTier('premium');
    expect(model.model).toBe(process.env.AI_MODEL_PREMIUM || 'gpt-4o');
    expect(model.name).toBe('GPT-4o');
  });

  it('should return correct model for pro_plus tier', () => {
    const model = getModelForTier('pro_plus');
    expect(model.model).toBe(process.env.AI_MODEL_PRO || 'claude-3-5-sonnet');
    expect(model.name).toBe('Claude 3.5 Sonnet');
  });

  it('should return correct model name for tier', () => {
    expect(getModelNameForTier('free')).toBe(process.env.AI_MODEL_FREE || 'gemini-1.5-flash');
    expect(getModelNameForTier('premium')).toBe(process.env.AI_MODEL_PREMIUM || 'gpt-4o');
    expect(getModelNameForTier('pro_plus')).toBe(process.env.AI_MODEL_PRO || 'claude-3-5-sonnet');
  });

  it('should correctly identify premium access', () => {
    expect(hasPremiumAccess('free')).toBe(false);
    expect(hasPremiumAccess('premium')).toBe(true);
    expect(hasPremiumAccess('pro_plus')).toBe(true);
  });
});

describe('AIRouter', () => {
  it('should create router with correct tier', () => {
    const router = new AIRouter('premium');
    expect(router.getTier()).toBe('premium');
  });

  it('should default to free tier', () => {
    const router = new AIRouter();
    expect(router.getTier()).toBe('free');
  });

  it('should return correct model config', () => {
    const router = new AIRouter('pro_plus');
    const config = router.getModelConfig();
    expect(config.model).toBe(process.env.AI_MODEL_PRO || 'claude-3-5-sonnet');
  });

  it('should return correct model name', () => {
    const router = new AIRouter('premium');
    expect(router.getModelName()).toBe(process.env.AI_MODEL_PREMIUM || 'gpt-4o');
  });

  it('should create router using static methods', () => {
    expect(AIRouter.forFree().getTier()).toBe('free');
    expect(AIRouter.forPremium().getTier()).toBe('premium');
    expect(AIRouter.forProPlus().getTier()).toBe('pro_plus');
    expect(AIRouter.forTier('premium').getTier()).toBe('premium');
  });

  it('should create router using helper function', () => {
    const router = createAIRouter('premium');
    expect(router.getTier()).toBe('premium');
  });

  it('should get model for user tier using helper', () => {
    expect(getModelForUserTier('free')).toBe(process.env.AI_MODEL_FREE || 'gemini-1.5-flash');
    expect(getModelForUserTier('premium')).toBe(process.env.AI_MODEL_PREMIUM || 'gpt-4o');
    expect(getModelForUserTier('pro_plus')).toBe(process.env.AI_MODEL_PRO || 'claude-3-5-sonnet');
  });
});
