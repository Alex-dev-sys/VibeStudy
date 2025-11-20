/**
 * AI Router - Routes AI requests to appropriate models based on user tier
 * 
 * This router selects the appropriate AI model based on the user's subscription tier:
 * - Free: Gemini 2.5 Flash
 * - Premium: GPT-4o
 * - Pro+: Claude 3.5 Sonnet
 * 
 * All models are accessed through GPT Llama API
 */

import { callChatCompletion, ChatMessage, extractMessageContent, isAiConfigured } from './ai-client';
import { getModelForTier, getModelNameForTier, type UserTier, type AIModelConfig } from './ai-models.config';

export interface AIRouterOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' | 'text' | string };
}

export interface AIRouterResult {
  data: unknown;
  raw: string;
  model: string;
  tier: UserTier;
}

export class AIRouter {
  private tier: UserTier;
  private modelConfig: AIModelConfig;

  constructor(tier: UserTier = 'free') {
    this.tier = tier;
    this.modelConfig = getModelForTier(tier);
  }

  /**
   * Get the current tier
   */
  getTier(): UserTier {
    return this.tier;
  }

  /**
   * Get the current model configuration
   */
  getModelConfig(): AIModelConfig {
    return this.modelConfig;
  }

  /**
   * Get the model name being used
   */
  getModelName(): string {
    return this.modelConfig.model;
  }

  /**
   * Check if AI is configured
   */
  isConfigured(): boolean {
    return isAiConfigured();
  }

  /**
   * Call chat completion with the appropriate model for the user's tier
   */
  async chatCompletion(
    messages: ChatMessage[],
    options: AIRouterOptions = {}
  ): Promise<AIRouterResult> {
    if (!this.isConfigured()) {
      throw new Error('AI is not configured. Please set AI_API_TOKEN environment variable.');
    }

    const {
      temperature = this.modelConfig.temperature,
      maxTokens = this.modelConfig.maxTokens,
      responseFormat
    } = options;

    const startTime = Date.now();
    
    try {
      console.log(`[AIRouter] Using ${this.modelConfig.name} (${this.modelConfig.model}) for tier: ${this.tier}`);
      
      const result = await callChatCompletion({
        messages,
        temperature,
        maxTokens,
        model: this.modelConfig.model,
        responseFormat
      });

      const duration = Date.now() - startTime;
      console.log(`[AIRouter] Request completed in ${duration}ms using model: ${result.model || this.modelConfig.model}`);
      
      // Log analytics
      this.logModelUsage(result.model || this.modelConfig.model, true, result.usedFallback || false);

      return {
        data: result.data,
        raw: result.raw,
        model: result.model || this.modelConfig.model,
        tier: this.tier
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[AIRouter] Request failed after ${duration}ms:`, error);
      
      // If premium model fails and user is on premium tier, fallback to free tier
      if (this.tier !== 'free' && error instanceof Error) {
        console.warn(`[AIRouter] Premium model ${this.modelConfig.model} failed, falling back to free tier model`);
        
        try {
          const freeTierRouter = new AIRouter('free');
          const fallbackResult = await freeTierRouter.chatCompletion(messages, options);
          
          // Log successful fallback
          this.logModelUsage(fallbackResult.model, true, true);
          
          return {
            ...fallbackResult,
            tier: this.tier // Keep original tier in response
          };
        } catch (fallbackError) {
          console.error(`[AIRouter] Fallback to free tier also failed:`, fallbackError);
          // Log failed fallback
          this.logModelUsage(this.modelConfig.model, false, true);
          throw error; // Throw original error
        }
      }
      
      // Log failed request
      this.logModelUsage(this.modelConfig.model, false, false);
      
      throw error;
    }
  }

  /**
   * Log model usage for analytics
   */
  private logModelUsage(model: string, success: boolean, usedFallback: boolean) {
    const timestamp = new Date().toISOString();
    console.log(`[AI Analytics] ${timestamp} - Model: ${model}, Tier: ${this.tier}, Success: ${success}, Fallback: ${usedFallback}`);
    
    // TODO: Send to analytics service (e.g., Supabase analytics_events table)
    // This can be implemented when the analytics infrastructure is ready
    // Example:
    // await supabase.from('analytics_events').insert({
    //   event_type: 'ai_request',
    //   metadata: { model, tier: this.tier, success, usedFallback },
    //   created_at: timestamp
    // });
  }

  /**
   * Extract message content from AI response
   */
  extractContent(payload: unknown): string {
    return extractMessageContent(payload);
  }

  /**
   * Create a new AIRouter instance for a specific tier
   */
  static forTier(tier: UserTier): AIRouter {
    return new AIRouter(tier);
  }

  /**
   * Create a new AIRouter instance for free tier
   */
  static forFree(): AIRouter {
    return new AIRouter('free');
  }

  /**
   * Create a new AIRouter instance for premium tier
   */
  static forPremium(): AIRouter {
    return new AIRouter('premium');
  }

  /**
   * Create a new AIRouter instance for pro+ tier
   */
  static forProPlus(): AIRouter {
    return new AIRouter('pro_plus');
  }
}

/**
 * Helper function to create an AI router for a user's tier
 */
export function createAIRouter(tier: UserTier = 'free'): AIRouter {
  return new AIRouter(tier);
}

/**
 * Helper function to get the model name for a tier
 */
export function getModelForUserTier(tier: UserTier): string {
  return getModelNameForTier(tier);
}
