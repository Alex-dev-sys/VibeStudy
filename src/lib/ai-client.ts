// GPT Llama API configuration
const DEFAULT_API_BASE_URL = 'https://api.gptlama.ru/v1';
const FALLBACK_API_BASE_URL = 'https://router.huggingface.co/v1';
const DEFAULT_MODEL = 'gemini-1.5-flash';
const FALLBACK_MODEL = 'MiniMaxAI/MiniMax-M2:novita';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  responseFormat?: { type: 'json_object' | 'text' | string };
}

interface CallChatCompletionParams extends ChatCompletionOptions {
  messages: ChatMessage[];
}

export interface ChatCompletionResult {
  data: unknown;
  raw: string;
  model?: string;
  usedFallback?: boolean;
}

const resolveConfig = () => {
  // Primary: AI_API_TOKEN for GPT Llama API
  // Fallback: HF_TOKEN for Hugging Face
  const apiKey = process.env.AI_API_TOKEN ?? process.env.HF_TOKEN ?? process.env.HF_API_KEY ?? '';

  // Primary: AI_API_BASE_URL (GPT Llama API)
  // Fallback: HF_API_BASE_URL (Hugging Face)
  const baseUrl = (
    process.env.AI_API_BASE_URL ??
    process.env.HF_API_BASE_URL ??
    DEFAULT_API_BASE_URL
  ).replace(/\/+$/, '');

  const rawModel = process.env.HF_MODEL ?? DEFAULT_MODEL;
  const model = rawModel.trim();

  return {
    apiKey: apiKey.trim(),
    baseUrl,
    model
  };
};

export const isAiConfigured = () => {
  const { apiKey } = resolveConfig();
  return apiKey.length > 0;
};

/**
 * Log model usage for analytics
 */
const logModelUsage = (model: string, tier: string, success: boolean, usedFallback: boolean = false) => {
  const timestamp = new Date().toISOString();
  console.log(`[AI Analytics] ${timestamp} - Model: ${model}, Tier: ${tier}, Success: ${success}, Fallback: ${usedFallback}`);

  // TODO: Send to analytics service (e.g., Supabase analytics_events table)
  // This can be implemented when the analytics infrastructure is ready
};

interface SseParseResult {
  chunks: Array<Record<string, any>>;
  aggregatedContent: string;
  responseLike: Record<string, any>;
}

const parseSsePayload = (payload: string): SseParseResult | null => {
  const dataLines = payload
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trim())
    .filter((line) => line && line !== '[DONE]');

  if (dataLines.length === 0) {
    return null;
  }

  const parsedChunks = dataLines
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter((chunk): chunk is Record<string, any> => Boolean(chunk));

  if (parsedChunks.length === 0) {
    return null;
  }

  const aggregatedContent = parsedChunks
    .map((chunk) => {
      const choice = chunk.choices?.[0];
      if (!choice) return '';
      if (typeof choice.delta?.content === 'string') return choice.delta.content;
      if (typeof choice.message?.content === 'string') return choice.message.content;
      return '';
    })
    .join('');

  const lastChunk = parsedChunks[parsedChunks.length - 1];
  const firstChunk = parsedChunks.find((chunk) => typeof chunk.choices?.[0]?.delta?.role === 'string');
  const role = (firstChunk?.choices?.[0]?.delta?.role as string | undefined) ?? 'assistant';

  return {
    chunks: parsedChunks,
    aggregatedContent,
    responseLike: {
      id: lastChunk?.id ?? 'hf-sse',
      object: 'chat.completion',
      created: lastChunk?.created ?? Date.now(),
      model: lastChunk?.model,
      choices: [
        {
          index: 0,
          finish_reason: lastChunk?.choices?.[0]?.finish_reason ?? null,
          message: {
            role,
            content: aggregatedContent
          }
        }
      ],
      usage: lastChunk?.usage ?? null,
      raw_chunks: parsedChunks
    }
  };
};

const parseResponsePayload = (payload: string) => {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return parseSsePayload(payload);
  }
};

export const callChatCompletion = async ({ messages, temperature, maxTokens, model, responseFormat }: CallChatCompletionParams): Promise<ChatCompletionResult> => {
  const { apiKey, baseUrl, model: defaultModel } = resolveConfig();

  if (!apiKey) {
    throw new Error('AI_API_TOKEN or HF_TOKEN is not defined');
  }

  const targetModel = model ?? defaultModel;
  const body: Record<string, unknown> = {
    model: targetModel,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: false
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд таймаут (было 90)

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Connection': 'close' // Изменено с keep-alive на close
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Обработка ошибок сети
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.error('[AI Client] Request timeout after 30s');
          throw new Error('Request timeout - server took too long to respond');
        }
        if (fetchError.message.includes('ECONNRESET') || fetchError.message.includes('socket hang up') || fetchError.message.includes('other side closed') || fetchError.message.includes('terminated')) {
          console.error('[AI Client] Connection error:', fetchError.message);
          throw new Error('Connection reset by server - please try again');
        }
      }
      throw fetchError;
    }

    const rawBody = await response.text();
    console.log('🔍 Raw API Response (first 500 chars):', rawBody.slice(0, 500));
    const parsedBody = parseResponsePayload(rawBody);

    if (!response.ok) {
      const errorPayload = parsedBody && 'responseLike' in parsedBody ? (parsedBody as SseParseResult).responseLike : parsedBody;
      const message =
        typeof (errorPayload as any)?.error?.message === 'string'
          ? (errorPayload as any).error.message
          : response.statusText;
      const error = new Error(`ai_request_failed: ${message}`);
      (error as Error & { status?: number }).status = response.status;

      // Log failed request
      logModelUsage(targetModel, 'unknown', false, false);

      throw error;
    }

    // Log successful request
    logModelUsage(targetModel, 'unknown', true, false);

    if (parsedBody && 'responseLike' in parsedBody) {
      const sseResult = parsedBody as SseParseResult;
      const aggregated = sseResult.aggregatedContent.trim();
      return {
        data: sseResult.responseLike,
        raw: aggregated,
        model: targetModel,
        usedFallback: false
      };
    }

    const raw = extractMessageContent(parsedBody ?? rawBody);

    return {
      data: parsedBody ?? rawBody,
      raw,
      model: targetModel,
      usedFallback: false
    };
  } catch (error) {
    // If using premium model and it fails, try fallback to Gemini
    const isPremiumModel = targetModel !== DEFAULT_MODEL && targetModel !== FALLBACK_MODEL;

    if (isPremiumModel) {
      console.warn(`Premium model ${targetModel} failed, attempting fallback to ${DEFAULT_MODEL}`, error);

      try {
        // Retry with Gemini (free tier model)
        const fallbackBody = {
          ...body,
          model: DEFAULT_MODEL
        };

        const fallbackController = new AbortController();
        const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 30000); // 30 секунд

        let fallbackResponse: Response;
        try {
          fallbackResponse = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              'Connection': 'close'
            },
            body: JSON.stringify(fallbackBody),
            signal: fallbackController.signal
          });
          clearTimeout(fallbackTimeoutId);
        } catch (fallbackFetchError) {
          clearTimeout(fallbackTimeoutId);
          if (fallbackFetchError instanceof Error) {
            if (fallbackFetchError.name === 'AbortError') {
              console.error('[AI Client] Fallback timeout after 30s');
              throw new Error('Fallback request timeout');
            }
            if (fallbackFetchError.message.includes('ECONNRESET') || fallbackFetchError.message.includes('socket hang up') || fallbackFetchError.message.includes('other side closed') || fallbackFetchError.message.includes('terminated')) {
              console.error('[AI Client] Fallback connection error:', fallbackFetchError.message);
              throw new Error('Fallback connection reset by server');
            }
          }
          throw fallbackFetchError;
        }

        const fallbackRawBody = await fallbackResponse.text();
        console.log('🔍 Fallback API Response (first 500 chars):', fallbackRawBody.slice(0, 500));
        const fallbackParsedBody = parseResponsePayload(fallbackRawBody);

        if (!fallbackResponse.ok) {
          const errorPayload = fallbackParsedBody && 'responseLike' in fallbackParsedBody ? (fallbackParsedBody as SseParseResult).responseLike : fallbackParsedBody;
          const message =
            typeof (errorPayload as any)?.error?.message === 'string'
              ? (errorPayload as any).error.message
              : fallbackResponse.statusText;

          // Log failed fallback
          logModelUsage(DEFAULT_MODEL, 'unknown', false, true);

          const fallbackError = new Error(`ai_fallback_failed: ${message}`);
          (fallbackError as Error & { status?: number }).status = fallbackResponse.status;
          throw fallbackError;
        }

        // Log successful fallback
        logModelUsage(DEFAULT_MODEL, 'unknown', true, true);
        console.log(`✅ Successfully used fallback model ${DEFAULT_MODEL}`);

        if (fallbackParsedBody && 'responseLike' in fallbackParsedBody) {
          const sseResult = fallbackParsedBody as SseParseResult;
          const aggregated = sseResult.aggregatedContent.trim();
          return {
            data: sseResult.responseLike,
            raw: aggregated,
            model: DEFAULT_MODEL,
            usedFallback: true
          };
        }

        const raw = extractMessageContent(fallbackParsedBody ?? fallbackRawBody);

        return {
          data: fallbackParsedBody ?? fallbackRawBody,
          raw,
          model: DEFAULT_MODEL,
          usedFallback: true
        };
      } catch (fallbackError) {
        console.error('Fallback to Gemini also failed:', fallbackError);
        // Re-throw original error if fallback also fails
        throw error;
      }
    }

    // If not a premium model or fallback disabled, just throw the error
    throw error;
  }
};

export const extractMessageContent = (payload: unknown) => {
  const extractFromChoice = (choice: any) => {
    const rawContent = choice?.message?.content;

    if (Array.isArray(rawContent)) {
      return rawContent
        .map((part) => {
          if (typeof part === 'string') return part;
          if (part && typeof part === 'object') {
            if ('text' in part && typeof part.text === 'string') {
              return part.text;
            }
            if ('text' in part && part.text && typeof part.text === 'object' && 'value' in part.text && typeof part.text.value === 'string') {
              return part.text.value;
            }
          }
          return '';
        })
        .filter(Boolean)
        .join('\n');
    }

    return typeof rawContent === 'string' ? rawContent : '';
  };

  const choice = (payload as any)?.choices?.[0];
  const rawContent = choice?.message?.content;

  if (typeof choice?.delta?.content === 'string') {
    return choice.delta.content;
  }

  if (!choice && typeof payload === 'string') {
    return payload;
  }

  if (Array.isArray(rawContent)) {
    return rawContent
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object') {
          if ('text' in part && typeof part.text === 'string') {
            return part.text;
          }
          if ('text' in part && part.text && typeof part.text === 'object' && 'value' in part.text && typeof part.text.value === 'string') {
            return part.text.value;
          }
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  return typeof rawContent === 'string' ? rawContent : '';
};

/**
 * Enhanced chat completion with tier-based routing and fallback
 * This is the recommended way to call AI models with automatic tier-based model selection
 * 
 * @param messages - Chat messages
 * @param tier - User tier (free, premium, pro_plus)
 * @param options - Additional options
 * @returns Chat completion result with model info
 */
export interface TierBasedChatCompletionOptions extends ChatCompletionOptions {
  tier?: 'free' | 'premium' | 'pro_plus';
}

export const callChatCompletionWithTier = async (
  messages: ChatMessage[],
  options: TierBasedChatCompletionOptions = {}
): Promise<ChatCompletionResult> => {
  const { tier = 'free', ...chatOptions } = options;

  // Import AIRouter dynamically to avoid circular dependencies
  const { createAIRouter } = await import('./ai-router');
  const router = createAIRouter(tier);

  try {
    const result = await router.chatCompletion(messages, chatOptions);

    // Log with tier information
    logModelUsage(result.model, tier, true, result.model !== router.getModelName());

    return {
      data: result.data,
      raw: result.raw,
      model: result.model,
      usedFallback: result.model !== router.getModelName()
    };
  } catch (error) {
    console.error(`AI request failed for tier ${tier}:`, error);
    throw error;
  }
};

// ============================================================================
// AI Cache Integration
// ============================================================================

export interface CachedChatCompletionOptions extends TierBasedChatCompletionOptions {
  cacheKey?: string;
  language?: string;
  dayNumber?: number;
  ttlDays?: number;
  bypassCache?: boolean;
}

/**
 * Get cached AI content from Supabase
 * @param cacheKey - Unique cache key (format: {language}-day-{dayNumber})
 * @returns Cached content or null if not found
 */
async function getCachedContent(cacheKey: string): Promise<any | null> {
  try {
    // Import server client dynamically
    const { createClient } = await import('./supabase/server');
    const supabase = createClient();

    // Use the helper function from the migration
    const { data, error } = await supabase.rpc('get_ai_cache', {
      p_cache_key: cacheKey
    });

    if (error) {
      console.warn(`Cache lookup failed for key ${cacheKey}:`, error);
      return null;
    }

    if (data) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return data;
    }

    console.log(`❌ Cache MISS for key: ${cacheKey}`);
    return null;
  } catch (error) {
    console.warn('Cache lookup error:', error);
    return null;
  }
}

/**
 * Save AI content to cache in Supabase
 * @param cacheKey - Unique cache key
 * @param content - Content to cache
 * @param model - Model used to generate content
 * @param language - Programming language (optional)
 * @param dayNumber - Day number (optional)
 * @param ttlDays - Time to live in days (optional)
 */
async function setCachedContent(
  cacheKey: string,
  content: any,
  model: string,
  language?: string,
  dayNumber?: number,
  ttlDays?: number
): Promise<void> {
  try {
    // Import server client dynamically
    const { createClient } = await import('./supabase/server');
    const supabase = createClient();

    // Use the helper function from the migration
    const { error } = await supabase.rpc('set_ai_cache', {
      p_cache_key: cacheKey,
      p_content: content,
      p_model: model,
      p_language: language || null,
      p_day_number: dayNumber || null,
      p_metadata: {},
      p_ttl_days: ttlDays || null
    });

    if (error) {
      console.warn(`Failed to cache content for key ${cacheKey}:`, error);
    } else {
      console.log(`✅ Content cached successfully for key: ${cacheKey}`);
    }
  } catch (error) {
    console.warn('Cache save error:', error);
  }
}

/**
 * Generate cache key from language and day number
 * @param language - Programming language
 * @param dayNumber - Day number
 * @returns Cache key in format: {language}-day-{dayNumber}
 */
export function generateCacheKey(language: string, dayNumber: number): string {
  return `${language}-day-${dayNumber}`;
}

/**
 * Invalidate cache entries matching a pattern
 * @param pattern - SQL LIKE pattern (e.g., "python-day-%")
 * @returns Number of invalidated entries
 */
export async function invalidateCache(pattern: string): Promise<number> {
  try {
    const { createClient } = await import('./supabase/server');
    const supabase = createClient();

    const { data, error } = await supabase.rpc('invalidate_ai_cache', {
      p_pattern: pattern
    });

    if (error) {
      console.error('Cache invalidation failed:', error);
      return 0;
    }

    console.log(`✅ Invalidated ${data} cache entries matching pattern: ${pattern}`);
    return data || 0;
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return 0;
  }
}

/**
 * Chat completion with automatic caching
 * Checks cache before making AI request and saves result to cache
 * 
 * @param messages - Chat messages
 * @param options - Options including cache configuration
 * @returns Chat completion result
 */
export const callChatCompletionWithCache = async (
  messages: ChatMessage[],
  options: CachedChatCompletionOptions = {}
): Promise<ChatCompletionResult> => {
  const {
    cacheKey: providedCacheKey,
    language,
    dayNumber,
    ttlDays,
    bypassCache = false,
    ...chatOptions
  } = options;

  // Generate cache key if language and dayNumber provided
  const cacheKey = providedCacheKey ||
    (language && dayNumber ? generateCacheKey(language, dayNumber) : null);

  // Check cache if key is available and not bypassing
  if (cacheKey && !bypassCache) {
    const cachedContent = await getCachedContent(cacheKey);

    if (cachedContent) {
      // Return cached content
      return {
        data: cachedContent,
        raw: typeof cachedContent === 'string' ? cachedContent : JSON.stringify(cachedContent),
        model: cachedContent.model || 'cached',
        usedFallback: false
      };
    }
  }

  // Cache miss or bypass - make actual AI request
  const result = await callChatCompletionWithTier(messages, chatOptions);

  // Save to cache if key is available
  if (cacheKey && result.raw) {
    await setCachedContent(
      cacheKey,
      result.data,
      result.model || 'unknown',
      language,
      dayNumber,
      ttlDays
    );
  }

  return result;
};


import { z } from 'zod';

export const extractAndParseJSON = <T>(result: ChatCompletionResult, schema: z.ZodType<T>): T => {
  const content = extractMessageContent(result);
  if (!content) {
    throw new Error('No content in AI response');
  }

  const sanitized = content.replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(sanitized);
    return schema.parse(parsed);
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}`);
  }
};
