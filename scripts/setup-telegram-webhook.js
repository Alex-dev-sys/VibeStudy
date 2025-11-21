/**
 * Setup Telegram Webhook & Menu Button
 * 
 * This script manages Telegram Bot API configuration including:
 * - Webhook setup for receiving bot updates
 * - Menu button configuration for launching Mini App
 * 
 * Usage: node scripts/setup-telegram-webhook.js <command> [parameters]
 * 
 * Commands:
 * - set <url>: Set webhook URL
 * - check: Check webhook status
 * - delete: Delete webhook
 * - info: Get bot information
 * - menu <url>: Set menu button with Mini App URL
 * - menu-check: Check current menu button
 * - menu-delete: Delete menu button
 */

const TELEGRAM_BOT_TOKEN = '8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0';
const TELEGRAM_WEBHOOK_SECRET = 'vibestudy_webhook_secret_2025';

async function setupWebhook(webhookUrl) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
  
  console.log('🔧 Настройка webhook...\n');
  console.log(`URL: ${webhookUrl}`);
  console.log(`Secret: ${TELEGRAM_WEBHOOK_SECRET}\n`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ['message', 'callback_query']
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Webhook установлен успешно!\n');
      console.log('Проверка webhook...\n');
      await checkWebhook();
    } else {
      console.error('❌ Ошибка установки webhook:', data);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

async function checkWebhook() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.ok) {
      console.log('📊 Информация о webhook:');
      console.log(`   URL: ${data.result.url}`);
      console.log(`   Pending updates: ${data.result.pending_update_count}`);
      console.log(`   Last error: ${data.result.last_error_message || 'нет'}`);
      console.log(`   Last error date: ${data.result.last_error_date ? new Date(data.result.last_error_date * 1000).toLocaleString() : 'нет'}\n`);
    }
  } catch (error) {
    console.error('❌ Ошибка проверки webhook:', error);
  }
}

async function deleteWebhook() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`;
  
  console.log('🗑️  Удаление webhook...\n');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_pending_updates: true })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Webhook удален успешно!\n');
    } else {
      console.error('❌ Ошибка удаления webhook:', data);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

async function getBotInfo() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
  
  console.log('🤖 Информация о боте:\n');
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.ok) {
      const bot = data.result;
      console.log(`   Имя: ${bot.first_name}`);
      console.log(`   Username: @${bot.username}`);
      console.log(`   ID: ${bot.id}`);
      console.log(`   Ссылка: https://t.me/${bot.username}\n`);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

async function setMenuButton(miniAppUrl) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton`;
  
  console.log('🎯 Настройка menu button...\n');
  console.log(`Mini App URL: ${miniAppUrl}\n`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: '🚀 Открыть VibeStudy',
          web_app: {
            url: miniAppUrl
          }
        }
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Menu button установлен успешно!\n');
      console.log('Теперь пользователи увидят кнопку "🚀 Открыть VibeStudy" в меню бота.\n');
      await getMenuButton();
    } else {
      console.error('❌ Ошибка установки menu button:', data);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

async function getMenuButton() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMenuButton`;
  
  console.log('📊 Текущий menu button:\n');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    if (data.ok) {
      const button = data.result;
      if (button.type === 'web_app') {
        console.log(`   Тип: Web App`);
        console.log(`   Текст: ${button.text}`);
        console.log(`   URL: ${button.web_app.url}\n`);
      } else if (button.type === 'commands') {
        console.log(`   Тип: Commands (список команд)\n`);
      } else {
        console.log(`   Тип: ${button.type}\n`);
      }
    }
  } catch (error) {
    console.error('❌ Ошибка проверки menu button:', error);
  }
}

async function deleteMenuButton() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton`;
  
  console.log('🗑️  Удаление menu button...\n');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'commands'
        }
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Menu button удален (возвращен к списку команд)!\n');
    } else {
      console.error('❌ Ошибка удаления menu button:', data);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Main
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`
📱 Telegram Webhook & Menu Button Setup

Использование:
  node scripts/setup-telegram-webhook.js <команда> [параметры]

Команды:
  set <url>           - Установить webhook
  check               - Проверить webhook
  delete              - Удалить webhook
  info                - Информация о боте
  menu <url>          - Установить menu button с Mini App
  menu-check          - Проверить текущий menu button
  menu-delete         - Удалить menu button

Примеры:
  node scripts/setup-telegram-webhook.js set https://your-domain.vercel.app/api/telegram/webhook
  node scripts/setup-telegram-webhook.js check
  node scripts/setup-telegram-webhook.js delete
  node scripts/setup-telegram-webhook.js info
  node scripts/setup-telegram-webhook.js menu https://your-domain.vercel.app/telegram-mini
  node scripts/setup-telegram-webhook.js menu-check
  node scripts/setup-telegram-webhook.js menu-delete
`);
  process.exit(0);
}

switch (command) {
  case 'set':
    if (!args[1]) {
      console.error('❌ Укажи URL webhook');
      process.exit(1);
    }
    setupWebhook(args[1]);
    break;
  
  case 'check':
    checkWebhook();
    break;
  
  case 'delete':
    deleteWebhook();
    break;
  
  case 'info':
    getBotInfo();
    break;
  
  case 'menu':
    if (!args[1]) {
      console.error('❌ Укажи URL Mini App');
      console.log('Пример: node scripts/setup-telegram-webhook.js menu https://your-domain.vercel.app/telegram-mini');
      process.exit(1);
    }
    setMenuButton(args[1]);
    break;
  
  case 'menu-check':
    getMenuButton();
    break;
  
  case 'menu-delete':
    deleteMenuButton();
    break;
  
  default:
    console.error(`❌ Неизвестная команда: ${command}`);
    process.exit(1);
}

