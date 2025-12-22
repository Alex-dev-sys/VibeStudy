/**
 * AI Assistant Service
 * Main service orchestrating AI assistant functionality
 */

import { AssistantRequest, AssistantResponse, AssistantContext, Message } from './types';
import { ContextAggregator } from './context-aggregator';
import { PromptBuilder } from './prompt-builder';
import { ResponseParser } from './response-parser';
import { SessionManager } from './session-manager';
import { callChatCompletion, type ChatMessage } from '@/lib/ai-client';
import { apiCache, CACHE_TTL, generateCacheKey } from '@/lib/cache/api-cache';
import type { UserTier } from '@/types';

/**
 * Configuration for AIAssistantService
 */
interface AIAssistantServiceConfig {
  maxRetries: number;
  retryDelay: number;
  locale: 'ru' | 'en';
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AIAssistantServiceConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  locale: 'ru',
};

/**
 * Analytics log entry
 */
interface AnalyticsLog {
  userId: string;
  tier: UserTier;
  requestType: string;
  messageLength: number;
  responseLength: number;
  processingTime: number;
  modelUsed: string;
  timestamp: number;
  success: boolean;
  error?: string;
  cacheHit?: boolean;
}

/**
 * AIAssistantService class
 * Orchestrates the complete flow: context → prompt → AI → parse
 */
export class AIAssistantService {
  private contextAggregator: ContextAggregator;
  private promptBuilder: PromptBuilder;
  private responseParser: ResponseParser;
  private sessionManager: SessionManager;
  private config: AIAssistantServiceConfig;

  constructor(config: Partial<AIAssistantServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.contextAggregator = new ContextAggregator();
    this.promptBuilder = new PromptBuilder({ locale: this.config.locale });
    this.responseParser = new ResponseParser();
    this.sessionManager = new SessionManager();
  }

  /**
   * Send message to AI assistant
   */
  async sendMessage(request: AssistantRequest): Promise<AssistantResponse> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;
    let modelUsed = 'unknown';
    let cacheHit = false;

    try {
      // Generate cache key based on message, day, and language
      const cacheKey = this.generateCacheKey(
        request.message,
        request.context.currentDay,
        request.context.languageId,
        request.requestType
      );

      // Try to get cached response
      const cachedResponse = apiCache.get<AssistantResponse>(cacheKey);
      if (cachedResponse) {
        cacheHit = true;
        modelUsed = 'cached';

        // Log cache hit
        this.logAnalytics({
          userId: request.context.userId,
          tier: request.context.tier,
          requestType: request.requestType,
          messageLength: request.message.length,
          responseLength: cachedResponse.message.length,
          processingTime: Date.now() - startTime,
          modelUsed,
          timestamp: Date.now(),
          success: true,
          cacheHit: true,
        });

        return cachedResponse;
      }

      // Cache miss - proceed with AI request
      // Build prompt with context
      const prompt = this.promptBuilder.buildPrompt(request);

      // Prepare messages for AI
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: prompt.split('\n\n')[0], // System prompt
        },
        {
          role: 'user',
          content: prompt.split('\n\n').slice(1).join('\n\n'), // User prompt
        },
      ];

      // Call AI with retry logic
      const aiResponse = await this.callAIWithRetry(
        messages,
        request.context.tier
      );

      modelUsed = aiResponse.model || 'unknown';

      console.log('[AIService] AI response received, length:', aiResponse.raw?.length || 0);
      console.log('[AIService] First 200 chars:', aiResponse.raw?.substring(0, 200));

      // Check if response is empty
      if (!aiResponse.raw || aiResponse.raw.trim().length === 0) {
        console.error('[AIService] Empty response from AI');
        throw new Error('AI returned empty response');
      }

      // Parse response
      const parsedResponse = this.responseParser.parseResponse(aiResponse.raw);

      // Validate response
      if (!this.responseParser.validateResponse(parsedResponse)) {
        console.error('[AIService] Invalid response format:', parsedResponse);
        throw new Error('Invalid AI response format');
      }

      console.log('[AIService] Response validated successfully');

      // Cache the response (5 minute TTL for AI assistant responses)
      apiCache.set(cacheKey, parsedResponse, CACHE_TTL.DEFAULT);

      success = true;

      // Log analytics
      this.logAnalytics({
        userId: request.context.userId,
        tier: request.context.tier,
        requestType: request.requestType,
        messageLength: request.message.length,
        responseLength: parsedResponse.message.length,
        processingTime: Date.now() - startTime,
        modelUsed,
        timestamp: Date.now(),
        success: true,
        cacheHit: false,
      });

      return parsedResponse;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      success = false;

      // Log failed request
      this.logAnalytics({
        userId: request.context.userId,
        tier: request.context.tier,
        requestType: request.requestType,
        messageLength: request.message.length,
        responseLength: 0,
        processingTime: Date.now() - startTime,
        modelUsed,
        timestamp: Date.now(),
        success: false,
        error,
        cacheHit: false,
      });

      throw err;
    }
  }

  /**
   * Generate cache key for AI assistant responses
   * Uses hash of message + day + language + requestType
   */
  private generateCacheKey(
    message: string,
    day: number,
    languageId: string,
    requestType: string
  ): string {
    // Normalize message (lowercase, trim, remove extra spaces)
    const normalizedMessage = message.toLowerCase().trim().replace(/\s+/g, ' ');

    // Create simple hash of the normalized message using string manipulation
    // This avoids the need for crypto module which may not be available in all environments
    let hash = 0;
    for (let i = 0; i < normalizedMessage.length; i++) {
      const char = normalizedMessage.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const messageHash = Math.abs(hash).toString(36).substring(0, 16);

    // Generate cache key: ai-assistant:{languageId}:day{day}:{requestType}:{messageHash}
    return generateCacheKey(
      'ai-assistant',
      languageId,
      `day${day}`,
      requestType,
      messageHash
    );
  }

  /**
   * Call AI with retry logic
   */
  private async callAIWithRetry(
    messages: ChatMessage[],
    tier: UserTier,
    attempt: number = 1
  ): Promise<{ raw: string; model?: string }> {
    try {
      console.log(`[AIService] Calling AI (attempt ${attempt}/${this.config.maxRetries})`);

      const result = await callChatCompletion({
        messages,
        temperature: 0.7,
        maxTokens: 1000,
      });

      console.log('[AIService] AI call successful');

      return {
        raw: result.raw,
        model: result.model,
      };
    } catch (error) {
      console.error(`[AIService] AI call failed (attempt ${attempt}):`, error);

      if (attempt < this.config.maxRetries) {
        // Wait before retry
        await this.delay(this.config.retryDelay * attempt);

        // Retry
        return this.callAIWithRetry(messages, tier, attempt + 1);
      }

      // Max retries reached
      throw error;
    }
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Aggregate context for a user
   */
  async aggregateContext(userId: string, tier: UserTier): Promise<AssistantContext> {
    return this.contextAggregator.getUserContext(userId, tier);
  }

  /**
   * Generate welcome message
   */
  generateWelcomeMessage(context: AssistantContext): string {
    const { currentDay, languageId, currentStreak } = context;

    if (this.config.locale === 'ru') {
      let message = `Привет! 👋 Я твой AI-помощник по изучению программирования.\n\n`;
      message += `Сегодня у тебя **День ${currentDay}** изучения ${this.getLanguageName(languageId)}. `;

      if (currentStreak > 0) {
        message += `Отличная работа! Твоя серия: **${currentStreak} ${this.getDaysWord(currentStreak)}**! 🔥\n\n`;
      } else {
        message += `Давай начнём! 💪\n\n`;
      }

      message += `Я могу помочь тебе:\n`;
      message += `• Объяснить сложные концепции\n`;
      message += `• Разобраться с кодом\n`;
      message += `• Дать подсказку к задаче\n`;
      message += `• Посоветовать, как лучше учиться\n\n`;
      message += `Просто напиши свой вопрос или используй быстрые действия ниже! 😊`;

      return message;
    } else {
      let message = `Hi! 👋 I'm your AI programming learning assistant.\n\n`;
      message += `Today is **Day ${currentDay}** of learning ${this.getLanguageName(languageId)}. `;

      if (currentStreak > 0) {
        message += `Great work! Your streak: **${currentStreak} days**! 🔥\n\n`;
      } else {
        message += `Let's get started! 💪\n\n`;
      }

      message += `I can help you:\n`;
      message += `• Explain complex concepts\n`;
      message += `• Debug your code\n`;
      message += `• Give hints for tasks\n`;
      message += `• Advise on learning strategies\n\n`;
      message += `Just type your question or use quick actions below! 😊`;

      return message;
    }
  }

  /**
   * Get human-readable language name
   */
  private getLanguageName(languageId: string): string {
    const names: Record<string, string> = {
      python: 'Python',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      java: 'Java',
      cpp: 'C++',
      csharp: 'C#',
      go: 'Go',
    };
    return names[languageId] || languageId;
  }

  /**
   * Get correct word form for days in Russian
   */
  private getDaysWord(count: number): string {
    if (this.config.locale !== 'ru') return 'days';

    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'дней';
    }

    if (lastDigit === 1) {
      return 'день';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'дня';
    }

    return 'дней';
  }

  /**
   * Log analytics data
   * Only logs to console - database logging happens in API route
   */
  private async logAnalytics(log: AnalyticsLog): Promise<void> {
    // Log to console for immediate feedback
    console.log('[AI Assistant Analytics]', {
      timestamp: new Date(log.timestamp).toISOString(),
      userId: log.userId,
      tier: log.tier,
      requestType: log.requestType,
      messageLength: log.messageLength,
      responseLength: log.responseLength,
      processingTime: `${log.processingTime}ms`,
      modelUsed: log.modelUsed,
      success: log.success,
      cacheHit: log.cacheHit ? '✅ CACHE HIT' : '🔄 CACHE MISS',
      error: log.error,
    });

    // Note: Database logging is handled by the API route
    // to avoid importing server-side code in client components
  }

  /**
   * Invalidate cache for specific context
   * Useful when day content or language changes
   */
  invalidateCache(languageId: string, day: number): void {
    const pattern = `ai-assistant:${languageId}:day${day}:*`;
    apiCache.invalidatePattern(pattern);
  }

  /**
   * Clear all AI assistant caches
   */
  clearAllCaches(): void {
    apiCache.invalidatePattern('ai-assistant:*');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    contextCacheStats: ReturnType<ContextAggregator['getCacheStats']>;
  } {
    return {
      size: apiCache.size(),
      contextCacheStats: this.contextAggregator.getCacheStats(),
    };
  }

  /**
   * Get session manager instance
   */
  getSessionManager(): SessionManager {
    return this.sessionManager;
  }
}

/**
 * Singleton instance
 */
let serviceInstance: AIAssistantService | null = null;

/**
 * Get AI Assistant Service singleton
 */
export function getAIAssistantService(): AIAssistantService {
  if (!serviceInstance) {
    serviceInstance = new AIAssistantService({ locale: 'ru' });
  }
  return serviceInstance;
}

/**
 * Reset service instance (useful for testing)
 */
export function resetAIAssistantService(): void {
  serviceInstance = null;
}
