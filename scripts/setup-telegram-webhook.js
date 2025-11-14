/**
 * Setup Telegram Webhook
 * Usage: node scripts/setup-telegram-webhook.js <webhook_url>
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

// Main
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`
📱 Telegram Webhook Setup

Использование:
  node scripts/setup-telegram-webhook.js <команда> [параметры]

Команды:
  set <url>     - Установить webhook
  check         - Проверить webhook
  delete        - Удалить webhook
  info          - Информация о боте

Примеры:
  node scripts/setup-telegram-webhook.js set https://your-domain.vercel.app/api/telegram/webhook
  node scripts/setup-telegram-webhook.js check
  node scripts/setup-telegram-webhook.js delete
  node scripts/setup-telegram-webhook.js info
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
  
  default:
    console.error(`❌ Неизвестная команда: ${command}`);
    process.exit(1);
}

