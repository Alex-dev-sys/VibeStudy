import TelegramBot from 'node-telegram-bot-api';
import { BOT_CONFIG } from './config';
import { handleMessage } from './handlers/message-handler';
import { handleCallback } from './handlers/callback-handler';

// Create bot instance
// polling: true is used for local development
// For production with webhook, we might need a different setup, but this works for the polling script
export const bot = new TelegramBot(BOT_CONFIG.token, { polling: false }); // Polling will be started manually in the script

// Register handlers
bot.on('message', handleMessage);
bot.on('callback_query', handleCallback);

export const startBot = async () => {
    console.log('🚀 Starting Telegram Bot...');

    if (BOT_CONFIG.environment === 'development') {
        console.log('📡 Starting polling mode...');
        await bot.startPolling();
        console.log('✅ Bot is polling for updates');
    } else {
        // Webhook setup would go here for production if needed
        // But for now we stick to polling or let the webhook script handle it
        console.log('ℹ️ Production mode: Webhook should be set separately');
    }
};

export const stopBot = async () => {
    console.log('🛑 Stopping bot...');
    await bot.stopPolling();
    console.log('✅ Bot stopped');
};
