/**
 * Локальный запуск Telegram бота через polling
 * Использовать только для разработки!
 */

const TELEGRAM_BOT_TOKEN = '8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0';
const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

let lastUpdateId = 0;

// Импортируем обработчик команд
const { handleBotCommand } = require('../src/telegram/bot.ts');

/**
 * Получение новых сообщений
 */
async function getUpdates() {
  try {
    const response = await fetch(`${API_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        await handleUpdate(update);
      }
    }
  } catch (error) {
    // Тихо игнорируем ошибки сети
  }
}

/**
 * Обработка входящего сообщения
 */
async function handleUpdate(update) {
  if (!update.message || !update.message.text) {
    return;
  }

  const message = update.message;
  const chatId = message.chat.id;
  const text = message.text;
  const username = message.from.username;
  const firstName = message.from.first_name;

  console.log(`📨 ${firstName}: ${text}`);

  // Обработка команд
  if (text.startsWith('/')) {
    const command = text.split(' ')[0];
    
    // Получаем ответ от обработчика
    let responseText;
    
    switch (command) {
      case '/start':
        responseText = `👋 Привет, ${firstName}! Я бот VibeStudy.\n\n` +
                      `Помогу тебе:\n` +
                      `• Напоминать о занятиях\n` +
                      `• Отслеживать прогресс\n` +
                      `• Давать персональные советы\n\n` +
                      `Команды:\n` +
                      `/stats - Твоя статистика\n` +
                      `/advice - Персональный совет\n` +
                      `/remind - Настроить напоминания\n` +
                      `/help - Помощь\n\n` +
                      `Укажи свой Telegram username в профиле VibeStudy для связи!`;
        break;
      
      case '/help':
        responseText = `📖 *Помощь*\n\n` +
                      `*Доступные команды:*\n` +
                      `/start - Начать работу с ботом\n` +
                      `/stats - Показать статистику обучения\n` +
                      `/advice - Получить персональный совет\n` +
                      `/remind - Настроить напоминания\n` +
                      `/help - Эта справка\n\n` +
                      `*Как это работает:*\n` +
                      `1. Укажи свой Telegram username в профиле на сайте\n` +
                      `2. Бот автоматически свяжется с тобой\n` +
                      `3. Получай напоминания и советы!\n\n` +
                      `Вопросы? Пиши в поддержку!`;
        break;
      
      case '/stats':
        responseText = `📊 *Твоя статистика VibeStudy*\n\n` +
                      `🎯 Текущий день: 1/90\n` +
                      `✅ Завершено: 0 дней (0%)\n` +
                      `░░░░░░░░░░\n\n` +
                      `🔥 Серия: 0 дней\n` +
                      `⭐ Средний балл: 0/100\n` +
                      `💻 Язык: PYTHON\n\n` +
                      `Начни обучение на сайте! 🚀`;
        break;
      
      case '/advice':
        responseText = `🎓 *Персональный совет*\n\n` +
                      `💡 Начни с основ!\n` +
                      `Первый день — самый важный. Не спеши, внимательно изучи теорию.\n\n` +
                      `✨ Советы для старта:\n` +
                      `• Выбери удобное время для занятий\n` +
                      `• Занимайся каждый день хотя бы 30 минут\n` +
                      `• Не бойся задавать вопросы ИИ-помощнику\n\n` +
                      `Удачи в обучении! 🚀`;
        break;
      
      case '/remind':
        responseText = `⏰ *Настройка напоминаний*\n\n` +
                      `Выбери удобное время для напоминаний:\n\n` +
                      `🌅 Утро (9:00)\n` +
                      `☀️ День (14:00)\n` +
                      `🌆 Вечер (19:00)\n` +
                      `🌙 Ночь (22:00)\n\n` +
                      `Настрой время в профиле на сайте VibeStudy!`;
        break;
      
      default:
        responseText = `❓ Неизвестная команда.\n\nИспользуй /help для списка доступных команд.`;
    }
    
    // Отправляем ответ
    await sendMessage(chatId, responseText);
  }
}

/**
 * Отправка сообщения
 */
async function sendMessage(chatId, text) {
  try {
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error(`❌ Ошибка отправки:`, data);
    }
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
  }
}

/**
 * Запуск бота
 */
async function startBot() {
  console.log('🤖 Запуск Telegram бота...\n');
  
  // Проверяем бота
  try {
    const response = await fetch(`${API_URL}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      console.log(`✅ Бот подключен: @${data.result.username}`);
      console.log(`🔗 https://t.me/${data.result.username}`);
      console.log(`⏳ Ожидание сообщений...\n`);
    } else {
      console.error('❌ Ошибка подключения к боту:', data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Не удалось подключиться к Telegram API:', error);
    process.exit(1);
  }
  
  // Удаляем webhook если был установлен
  await fetch(`${API_URL}/deleteWebhook`);
  
  // Запускаем polling
  while (true) {
    await getUpdates();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Обработка выхода
process.on('SIGINT', () => {
  console.log('\n\n👋 Остановка бота...');
  process.exit(0);
});

// Запуск
startBot().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});

