import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

export const BOT_CONFIG = {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
    environment: process.env.NODE_ENV || 'development',
    adminIds: (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
};

if (!BOT_CONFIG.token) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set in environment variables');
}
