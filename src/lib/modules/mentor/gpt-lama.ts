/**
 * GPT Lama Client for AI Mentor
 * 
 * Integration with GPT Lama API for AI mentorship features
 */

import botEnv from '@/lib/config/bot-env';
import { logError } from '@/lib/logger';

export interface GptLamaConfig {
    model: string;
    temperature: number;
    top_p: number;
    max_tokens: number;
    system_prompt: string;
}

const DEFAULT_CONFIG: GptLamaConfig = {
    model: botEnv.GPT_LAMA_MODEL,
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 500,
    system_prompt: `Ты - expert programming mentor для платформы VibeStudy. Твоя роль:

1. Объяснять код четко и кратко на русском языке
2. Помогать с отладкой ошибок конструктивными советами
3. Отвечать на концептуальные вопросы с примерами кода
4. Адаптировать объяснения под уровень пользователя
5. Поощрять обучение, не давая прямых ответов на упражнения
6. Использовать простой язык, избегать жаргона где возможно
7. Приводить примеры кода на том же языке, что использует пользователь
8. Быть вдохновляющим и поддерживающим

ВАЖНО: Никогда не помогай со списыванием. Фокусируйся на обучении и понимании.

Отвечай кратко (максимум 200 слов), используй emoji для наглядности.`,
};

// Simple in-memory cache
const cache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export class GptLamaClient {
    private config: GptLamaConfig;
    private apiKey: string;
    private apiUrl: string;

    constructor(config: Partial<GptLamaConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.apiKey = botEnv.GPT_LAMA_API_KEY;
        this.apiUrl = botEnv.GPT_LAMA_API_URL;
    }

    /**
     * Query GPT Lama API
     */
    async query(userMessage: string, cacheKey?: string): Promise<string> {
        // Check cache first
        if (cacheKey) {
            const cached = cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                console.log(`📦 Cache hit for: ${cacheKey.substring(0, 30)}...`);
                return cached.response;
            }
        }

        if (!this.apiKey) {
            return '⚠️ AI Mentor временно недоступен. Пожалуйста, попробуйте позже.';
        }

        try {
            const response = await fetch(`${this.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: [
                        {
                            role: 'system',
                            content: this.config.system_prompt,
                        },
                        {
                            role: 'user',
                            content: userMessage,
                        },
                    ],
                    temperature: this.config.temperature,
                    top_p: this.config.top_p,
                    max_tokens: this.config.max_tokens,
                }),
                signal: AbortSignal.timeout(30000), // 30 sec timeout
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`GPT Lama API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            const answer = data.choices?.[0]?.message?.content;

            if (!answer) {
                throw new Error('Empty response from GPT Lama');
            }

            // Cache the response
            if (cacheKey) {
                cache.set(cacheKey, {
                    response: answer,
                    timestamp: Date.now(),
                });
            }

            return answer;
        } catch (error) {
            logError('GPT Lama query failed', error as Error, { component: 'gpt-lama' });

            if (error instanceof Error && error.name === 'AbortError') {
                return '⏱️ Запрос занял слишком много времени. Попробуйте упростить вопрос.';
            }

            return '❌ Не удалось получить ответ от AI Mentor. Попробуйте еще раз.';
        }
    }

    /**
     * Explain code
     */
    async explainCode(code: string, language: string): Promise<string> {
        const message = `Объясни этот код на ${language}:\n\n\`\`\`${language}\n${code}\n\`\`\``;
        const cacheKey = `explain:${Buffer.from(code).toString('base64').slice(0, 32)}`;
        return this.query(message, cacheKey);
    }

    /**
     * Debug error
     */
    async debugError(error: string, context?: string): Promise<string> {
        const message = `Помоги разобраться с этой ошибкой: ${error}${context ? `\n\nКонтекст: ${context}` : ''}`;
        const cacheKey = `debug:${Buffer.from(error).toString('base64').slice(0, 32)}`;
        return this.query(message, cacheKey);
    }

    /**
     * Answer concept question
     */
    async answerConcept(concept: string, language?: string): Promise<string> {
        const message = `Объясни концепцию "${concept}"${language ? ` в ${language}` : ''} простыми словами с примерами.`;
        const cacheKey = `concept:${Buffer.from(concept).toString('base64').slice(0, 32)}`;
        return this.query(message, cacheKey);
    }

    /**
     * Get hint for task
     */
    async getHint(taskDescription: string, language: string): Promise<string> {
        const message = `Дай небольшую подсказку для задачи (НЕ решение!):\n\n${taskDescription}\n\nЯзык: ${language}`;
        return this.query(message); // Don't cache hints
    }

    /**
     * General question
     */
    async ask(question: string): Promise<string> {
        return this.query(question);
    }
}

// Singleton instance
const gptLamaClient = new GptLamaClient();

export default gptLamaClient;
