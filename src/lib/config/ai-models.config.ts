/**
 * AI Models Configuration for GPT Llama API
 * 
 * All models are accessed through GPT Llama API (https://api.gptlama.ru/v1)
 * Only the model parameter changes based on user tier
 */

export type UserTier = 'free' | 'premium' | 'pro_plus';

export interface AIModelConfig {
  name: string;
  model: string;
  description: string;
  maxTokens: number;
  temperature: number;
}

/**
 * Model configurations for different user tiers
 */
export const AI_MODELS: Record<UserTier, AIModelConfig> = {
  free: {
    name: 'Gemini 2.5 Flash',
    model: process.env.AI_MODEL_FREE || 'gemini-1.5-flash',
    description: 'Fast and efficient model for basic tasks',
    maxTokens: 1500,
    temperature: 0.8
  },
  premium: {
    name: 'GPT-4o',
    model: process.env.AI_MODEL_PREMIUM || 'gpt-4o',
    description: 'Advanced model with superior reasoning',
    maxTokens: 2000,
    temperature: 0.8
  },
  pro_plus: {
    name: 'Claude 3.5 Sonnet',
    model: process.env.AI_MODEL_PRO || 'claude-3-5-sonnet',
    description: 'Premium model with best performance',
    maxTokens: 2500,
    temperature: 0.8
  }
};

/**
 * Get model configuration for a specific tier
 */
export function getModelForTier(tier: UserTier): AIModelConfig {
  return AI_MODELS[tier] || AI_MODELS.free;
}

/**
 * Get model name for a specific tier
 */
export function getModelNameForTier(tier: UserTier): string {
  return getModelForTier(tier).model;
}

/**
 * Check if a tier has access to premium models
 */
export function hasPremiumAccess(tier: UserTier): boolean {
  return tier === 'premium' || tier === 'pro_plus';
}

/**
 * Get all available models
 */
export function getAllModels(): Record<UserTier, AIModelConfig> {
  return AI_MODELS;
}
