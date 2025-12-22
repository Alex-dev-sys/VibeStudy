/**
 * Improved Telegram Bot with Polling
 * Uses the new node-telegram-bot-api structure
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We need to register ts-node to run typescript files directly if we are running this with node
// But usually this script is run with ts-node
// If running with node, we might need to compile first or use ts-node/register

import { startBot } from '../src/lib/bot/core';

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Остановка бота...');
  process.exit(0);
});

// Start the bot
console.log('📝 Available env keys:', Object.keys(process.env).filter(key =>
  key.includes('BOT') || key.includes('TOKEN') || key.includes('SUPABASE')
));

startBot().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
