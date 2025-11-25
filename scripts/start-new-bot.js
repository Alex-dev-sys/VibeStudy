/**
 * Initialize New Bot
 * 
 * Initialize and start the new modular Telegram bot
 */

const path = require('path');

// Set up TypeScript execution
require('ts-node').register({
    project: path.join(__dirname, '..', 'tsconfig.json'),
    transpileOnly: true,
});

// Import and initialize bot
const { initializeBot } = require('../src/lib/bot/client.ts');

console.log('🤖 Initializing VibeStudy Telegram Bot...\n');

// Initialize the bot
const bot = initializeBot();

if (bot) {
    console.log('✅ Bot is running in polling mode');
    console.log('📱 Waiting for messages...\n');
} else {
    console.error('❌ Failed to initialize bot');
    console.error('⚠️ Make sure TELEGRAM_BOT_TOKEN is set in .env.local');
    process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping bot...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Stopping bot...');
    bot.stopPolling();
    process.exit(0);
});
