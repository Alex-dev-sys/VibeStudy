/**
 * Bot Environment Configuration
 * 
 * Centralized configuration for bot environment variables
 */

const botEnv = {
    // Telegram Bot Configuration
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL || '',

    // GPT Lama AI Configuration  
    GPT_LAMA_API_KEY: process.env.HF_TOKEN || '',
    GPT_LAMA_API_URL: process.env.HF_API_BASE_URL || 'https://api.gptlama.ru/v1',
    GPT_LAMA_MODEL: process.env.HF_MODEL || 'gpt-4o-mini',

    // App Configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    // Feature Flags
    BOT_WEBHOOK_ENABLED: process.env.NODE_ENV === 'production',
    BOT_POLLING_ENABLED: process.env.NODE_ENV === 'development',

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
} as const;

// Валидация критических переменных
export function validateBotEnv() {
    const requiredVars = {
        TELEGRAM_BOT_TOKEN: botEnv.TELEGRAM_BOT_TOKEN,
    };

    const missing = Object.entries(requiredVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        console.warn(`⚠️ Missing bot environment variables: ${missing.join(', ')}`);
        return false;
    }

    return true;
}

export default botEnv;
