/**
 * Локальный запуск Telegram бота через polling
 * Использовать только для разработки!
 */

require('dotenv').config({ path: '.env.local' });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env.local');
  console.log('\n📝 Создайте файл .env.local и добавьте:');
  console.log('TELEGRAM_BOT_TOKEN=your_bot_token_here\n');
  process.exit(1);
}

const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

let lastUpdateId = 0;

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
  // Если текст начинается с /, считаем это командой
  // Если текст совпадает с текстом кнопки, тоже обрабатываем
  let command = text.split(' ')[0];

  // Маппинг текста кнопок на команды или логику
  if (!text.startsWith('/')) {
    command = text;
  }

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
        `/run - Запустить код\n` +
        `/remind - Настроить напоминания\n` +
        `/help - Помощь\n\n` +
        `Укажи свой Telegram username в профиле VibeStudy для связи!`;

      // Send with persistent keyboard
      await sendMessage(chatId, responseText, {
        keyboard: [
          [{ text: '📊 Статистика' }, { text: '📚 Уроки' }],
          [{ text: '💻 Code Runner' }, { text: '❓ Помощь' }],
          [{ text: '📅 Прогресс' }, { text: '🏆 Рейтинг' }],
          [{ text: '🎓 Совет' }, { text: '⏰ Напоминания' }],
          [{ text: '👤 Профиль' }, { text: '⚙️ Настройки' }]
        ],
        resize_keyboard: true,
        is_persistent: true
      });
      return;

    case '/help':
    case '❓ Помощь':
      responseText = `📖 *Помощь*\n\n` +
        `*Доступные команды:*\n` +
        `/start - Начать работу с ботом\n` +
        `/stats - Показать статистику обучения\n` +
        `/run - Запустить код (Python, JS и др.)\n` +
        `/advice - Получить персональный совет\n` +
        `/remind - Настроить напоминания\n` +
        `/help - Эта справка\n\n` +
        `*Как это работает:*\n` +
        `1. Укажи свой Telegram username в профиле на сайте\n` +
        `2. Бот автоматически свяжется с тобой\n` +
        `3. Получай напоминания и советы!\n\n` +
        `Вопросы? Пиши в поддержку!`;
      break;

    case '/run':
    case '💻 Code Runner':
      const code = text.startsWith('/run') ? text.replace('/run', '').trim() : '';
      if (!code && text !== '💻 Code Runner') {
        // Если просто /run без кода
        responseText = '💻 *Code Runner*\n\nОтправь код после команды /run\n\nПример:\n`/run print("Hello")`\n\nИли просто отправь код в чат!';
      } else if (text === '💻 Code Runner') {
        responseText = '💻 *Code Runner*\n\nОтправь код после команды /run\n\nПример:\n`/run print("Hello")`';
      } else {
        responseText = '⏳ *Выполняю код...*';
        await sendMessage(chatId, responseText);

        // Call local API
        try {
          const res = await fetch('http://localhost:3000/api/execute-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              language: 'python', // Default to python for simplicity in local mode
              userId: 'local-dev-user'
            })
          });
          const data = await res.json();

          if (data.success || data.output) {
            responseText = `✅ *Результат:*\n\`\`\`\n${data.output || data.stdout}\n\`\`\``;
          } else {
            responseText = `❌ *Ошибка:*\n\`\`\`\n${data.error || data.stderr || 'Unknown error'}\n\`\`\``;
          }
        } catch (e) {
          responseText = '❌ Ошибка выполнения: ' + e.message + '\nУбедитесь, что сайт запущен (npm run dev)';
        }
      }
      break;

    case '/stats':
    case '📊 Статистика':
    case '👤 Профиль':
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
    case '🎓 Совет':
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
    case '⏰ Напоминания':
      responseText = `⏰ *Настройка напоминаний*\n\n` +
        `Выбери удобное время для напоминаний:\n\n` +
        `🌅 Утро (9:00)\n` +
        `☀️ День (14:00)\n` +
        `🌆 Вечер (19:00)\n` +
        `🌙 Ночь (22:00)\n\n` +
        `Настрой время в профиле на сайте VibeStudy!`;
      break;

    case '📚 Уроки':
      responseText = `📚 *Уроки*\n\nСписок уроков доступен на сайте.`;
      break;

    case '📅 Прогресс':
      responseText = `📅 *Твой прогресс*\n\nТы только в начале пути! Продолжай учиться.`;
      break;

    case '🏆 Рейтинг':
      responseText = `🏆 *Рейтинг*\n\n1. 🥇 User1 - 1000 XP\n2. 🥈 User2 - 800 XP\n3. 🥉 You - 0 XP`;
      break;

    case '⚙️ Настройки':
      responseText = `⚙️ *Настройки*\n\nДоступны на веб-платформе.`;
      break;

    default:
      responseText = `❓ Неизвестная команда.\n\nИспользуй /help для списка доступных команд.`;
  }

  // Отправляем ответ
  await sendMessage(chatId, responseText);
}

/**
 * Отправка сообщения
 */
async function sendMessage(chatId, text, replyMarkup = undefined) {
  try {
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
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
