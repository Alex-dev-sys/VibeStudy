/**
 * Improved Telegram Bot with Polling
 * Uses the real bot controller and command handlers
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { BotController } from '../src/lib/telegram/bot-controller.js';
import type { TelegramUpdate } from '../src/types/telegram.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env.local');
  process.exit(1);
}

const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
let lastUpdateId = 0;

const botController = new BotController();

/**
 * Get updates from Telegram
 */
async function getUpdates(): Promise<void> {
  try {
    const response = await fetch(
      `${API_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`
    );
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        await handleUpdate(update);
      }
    }
  } catch (error) {
    // Silently ignore network errors
  }
}

/**
 * Handle incoming update
 */
async function handleUpdate(update: TelegramUpdate): Promise<void> {
  try {
    // Log incoming message
    if (update.message?.text) {
      const userName = update.message.from.first_name || 'Unknown';
      console.log(`📨 ${userName}: ${update.message.text}`);
    }

    // Use the bot controller to handle the update
    await botController.handleMessage(update);
  } catch (error) {
    console.error('❌ Error handling update:', error);
  }
}

/**
 * Start the bot
 */
async function startBot(): Promise<void> {
  console.log('🤖 Запуск Telegram бота (улучшенная версия)...\n');

  // Check bot connection
  try {
    const response = await fetch(`${API_URL}/getMe`);
    const data = await response.json();

    if (data.ok) {
      console.log(`✅ Бот подключен: @${data.result.username}`);
      console.log(`🔗 https://t.me/${data.result.username}`);
      console.log(`📦 Используются настоящие команды из src/lib/telegram/commands/`);
      console.log(`⏳ Ожидание сообщений...\n`);
    } else {
      console.error('❌ Ошибка подключения к боту:', data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Не удалось подключиться к Telegram API:', error);
    process.exit(1);
  }

  // Delete webhook if set
  await fetch(`${API_URL}/deleteWebhook`);

  // Start polling
  while (true) {
    await getUpdates();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Остановка бота...');
  process.exit(0);
});

// Start the bot
startBot().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
