/**
 * Test Telegram Bot Locally with Polling
 * Usage: node scripts/test-bot-local.js
 */

const TELEGRAM_BOT_TOKEN = '8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0';
const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

let lastUpdateId = 0;

/**
 * Get bot info
 */
async function getBotInfo() {
  try {
    const response = await fetch(`${API_URL}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('🤖 Бот подключен:');
      console.log(`   Имя: ${data.result.first_name}`);
      console.log(`   Username: @${data.result.username}`);
      console.log(`   Ссылка: https://t.me/${data.result.username}\n`);
      return true;
    } else {
      console.error('❌ Ошибка подключения к боту:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Не удалось подключиться к Telegram API:', error);
    return false;
  }
}

/**
 * Get updates
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
    // Ignore network errors
  }
}

/**
 * Handle update
 */
async function handleUpdate(update) {
  // Handle callback queries (button clicks)
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }

  if (!update.message || !update.message.text) {
    return;
  }

  const message = update.message;
  const chatId = message.chat.id;
  const text = message.text;
  const firstName = message.from.first_name;

  console.log(`📨 ${firstName}: ${text}`);

  // Handle commands
  if (text.startsWith('/')) {
    const command = text.split(' ')[0];
    await handleCommand(command, chatId, firstName);
  }
}

/**
 * Handle callback query (button click)
 */
async function handleCallback(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const firstName = callbackQuery.from.first_name;

  console.log(`🔘 ${firstName} нажал: ${data}`);

  // Answer callback to remove loading state
  await fetch(`${API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQuery.id
    })
  });

  // Handle button actions
  if (data.startsWith('cmd_')) {
    const command = '/' + data.replace('cmd_', '');
    await handleCommand(command, chatId, firstName);
  } else if (data.startsWith('remind_')) {
    const time = data.replace('remind_', '');
    const times = {
      morning: '9:00',
      afternoon: '14:00',
      evening: '19:00',
      night: '22:00',
      off: 'отключены'
    };
    await sendMessage(chatId, `✅ Напоминания установлены на ${times[time]}!`);
  } else if (data.startsWith('lang_')) {
    const lang = data.replace('lang_', '');
    const langs = { ru: 'Русский', en: 'English' };
    await sendMessage(chatId, `✅ Язык изменен на ${langs[lang]}!`);
  } else if (data.startsWith('challenge_')) {
    if (data === 'challenge_accept') {
      await sendMessage(chatId, `🎯 Отлично! Челлендж принят!\n\nОткрой сайт VibeStudy и начни выполнение. Удачи! 💪`);
    }
  } else if (data.startsWith('community_')) {
    await sendMessage(chatId, `🚧 Этот раздел сообщества скоро будет доступен!`);
  }
}

/**
 * Handle command
 */
async function handleCommand(command, chatId, firstName) {
  let responseText;

  switch (command) {
    case '/start':
      responseText = `👋 Привет, ${firstName}! Я бот VibeStudy.

Помогу тебе:
• Напоминать о занятиях
• Отслеживать прогресс
• Давать персональные советы

Выбери действие ниже или используй команды! 🚀`;
      
      const startKeyboard = {
        inline_keyboard: [
          [
            { text: '🚀 Открыть VibeStudy', url: 'https://vibestudy.ru' }
          ],
          [
            { text: '📊 Моя статистика', callback_data: 'cmd_stats' },
            { text: '📈 Прогресс', callback_data: 'cmd_progress' }
          ],
          [
            { text: '💡 Получить совет', callback_data: 'cmd_advice' },
            { text: '🎯 Челлендж', callback_data: 'cmd_challenge' }
          ],
          [
            { text: '📚 Все команды', callback_data: 'cmd_help' },
            { text: '⚙️ Настройки', callback_data: 'cmd_settings' }
          ]
        ]
      };
      
      await sendMessage(chatId, responseText, startKeyboard);
      return;
      break;

    case '/help':
      responseText = `📖 *Помощь по командам*

*📊 Статистика:*
/stats - Текущая статистика
/progress - Детальный прогресс
/topics - Мастерство по темам
/predict - Прогноз завершения
/plan - План обучения

*💡 AI Помощник:*
/advice - Персональный совет
/ask [вопрос] - Задать вопрос
/hint [task] - Получить подсказку

*⚙️ Настройки:*
/remind - Напоминания
/schedule [время] - Запланировать
/language - Сменить язык
/settings - Все настройки

*🎯 Дополнительно:*
/challenge - Ежедневный челлендж
/privacy - Приватность
/export - Экспорт данных

Выбери категорию:`;

      const helpKeyboard = {
        inline_keyboard: [
          [
            { text: '📊 Статистика', callback_data: 'cmd_stats' },
            { text: '💡 AI Помощник', callback_data: 'cmd_advice' }
          ],
          [
            { text: '🎯 Челлендж', callback_data: 'cmd_challenge' }
          ],
          [
            { text: '⚙️ Настройки', callback_data: 'cmd_settings' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, helpKeyboard);
      return;
      break;

    case '/stats':
      responseText = `📊 *Твоя статистика VibeStudy*

🎯 Текущий день: 1/90
✅ Завершено: 0 дней (0%)
░░░░░░░░░░

🔥 Серия: 0 дней
⭐ Средний балл: 0/100
💻 Язык: PYTHON

Начни обучение на сайте! 🚀`;

      const statsKeyboard = {
        inline_keyboard: [
          [
            { text: '🚀 Открыть VibeStudy', url: 'https://vibestudy.ru/learn' }
          ],
          [
            { text: '◀️ Назад', callback_data: 'cmd_start' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, statsKeyboard);
      return;
      break;

    case '/progress':
      responseText = `📈 *Детальный прогресс*

*Эта неделя:*
Дней завершено: 0/7
Задач выполнено: 0

Начни обучение чтобы увидеть прогресс! 💪`;

      const progressKeyboard = {
        inline_keyboard: [
          [
            { text: '🚀 Начать обучение', url: 'https://vibestudy.ru/learn' }
          ],
          [
            { text: '◀️ Назад', callback_data: 'cmd_start' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, progressKeyboard);
      return;
      break;

    case '/topics':
      responseText = `📚 *Мастерство по темам*

Пока нет данных. Начни обучение чтобы увидеть свой прогресс по темам!

Удачи! 🚀`;

      const topicsKeyboard = {
        inline_keyboard: [
          [
            { text: '🚀 Начать обучение', url: 'https://vibestudy.ru/learn' }
          ],
          [
            { text: '◀️ Назад', callback_data: 'cmd_start' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, topicsKeyboard);
      return;
      break;

    case '/settings':
      responseText = `⚙️ *Настройки бота*

Выбери что хочешь настроить:`;

      const settingsKeyboard = {
        inline_keyboard: [
          [
            { text: '⏰ Напоминания', callback_data: 'cmd_remind' },
            { text: '🌍 Язык', callback_data: 'cmd_language' }
          ],
          [
            { text: '🔒 Приватность', callback_data: 'cmd_privacy' },
            { text: '📤 Экспорт данных', callback_data: 'cmd_export' }
          ],
          [
            { text: '◀️ Назад', callback_data: 'cmd_start' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, settingsKeyboard);
      return;
      break;

    case '/advice':
      responseText = `🎓 *Персональный совет*

💡 Начни с основ! Первый день — самый важный.

*Советы для старта:*
• Выбери удобное время для занятий
• Занимайся каждый день хотя бы 30 минут
• Не бойся задавать вопросы (/ask)

Удачи в обучении! 🚀`;

      const adviceKeyboard = {
        inline_keyboard: [
          [
            { text: '🚀 Начать обучение', url: 'https://vibestudy.ru/learn' }
          ],
          [
            { text: '◀️ Назад', callback_data: 'cmd_start' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, adviceKeyboard);
      return;
      break;

    case '/ask':
      responseText = `💡 *AI Помощник*

Используй: /ask [твой вопрос]

*Примеры:*
/ask Как работают циклы?
/ask Что такое переменная?

*Лимит:* 10 вопросов в день

Задай свой вопрос! 🤖`;
      break;

    case '/hint':
      responseText = `💡 *Система подсказок*

Используй: /hint [номер_задачи]

*Пример:* /hint task1

*Уровни:*
1️⃣ Тонкая подсказка
2️⃣ Средняя подсказка
3️⃣ Детальная подсказка

⚠️ За подсказки снимаются баллы`;
      break;

    case '/predict':
      responseText = `🔮 *Прогноз завершения курса*

📅 Ожидаемая дата: через 90 дней
📊 Уверенность: 0%

Начни обучение чтобы получить точный прогноз!`;

      const predictKeyboard = {
        inline_keyboard: [
          [
            { text: '🚀 Начать обучение', url: 'https://vibestudy.ru/learn' }
          ],
          [
            { text: '◀️ Назад', callback_data: 'cmd_start' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, predictKeyboard);
      return;
      break;

    case '/plan':
      responseText = `📅 *Персональный план обучения*

*Рекомендуемый темп:*
5 дней в неделю

*Оптимальное время:*
Пока нет данных

*Длительность сессии:*
30-60 минут

Начни обучение чтобы получить персональный план! 💪`;

      const planKeyboard = {
        inline_keyboard: [
          [
            { text: '🚀 Начать обучение', url: 'https://vibestudy.ru/learn' }
          ],
          [
            { text: '◀️ Назад', callback_data: 'cmd_start' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, planKeyboard);
      return;
      break;

    case '/remind':
      responseText = `⏰ *Настройка напоминаний*

Выбери удобное время для напоминаний о занятиях:`;

      const remindKeyboard = {
        inline_keyboard: [
          [
            { text: '🌅 Утро (9:00)', callback_data: 'remind_morning' },
            { text: '☀️ День (14:00)', callback_data: 'remind_afternoon' }
          ],
          [
            { text: '🌆 Вечер (19:00)', callback_data: 'remind_evening' },
            { text: '🌙 Ночь (22:00)', callback_data: 'remind_night' }
          ],
          [
            { text: '🔕 Отключить', callback_data: 'remind_off' },
            { text: '◀️ Назад', callback_data: 'cmd_settings' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, remindKeyboard);
      return;
      break;

    case '/challenge':
      responseText = `🎯 *Ежедневный челлендж*

*Быстрый код*
Напиши функцию за 5 минут

📊 Сложность: Легко
⭐ Награда: 10 баллов

Принимаешь вызов?`;

      const challengeKeyboard = {
        inline_keyboard: [
          [
            { text: '🚀 Начать на сайте', url: 'https://vibestudy.ru/learn' }
          ],
          [
            { text: '✅ Принять челлендж', callback_data: 'challenge_accept' },
            { text: '🔄 Другой', callback_data: 'cmd_challenge' }
          ],
          [
            { text: '◀️ Назад', callback_data: 'cmd_start' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, challengeKeyboard);
      return;
      break;

    case '/schedule':
      responseText = `📆 *Планирование сессий*

Используй: /schedule [время]

*Примеры:*
/schedule 14:00
/schedule 19:30

Я напомню за 10 минут! ⏰`;
      break;

    case '/language':
      responseText = `🌍 *Выбор языка / Language Selection*

Выбери язык интерфейса бота:
Choose bot interface language:`;

      const languageKeyboard = {
        inline_keyboard: [
          [
            { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
            { text: '🇬🇧 English', callback_data: 'lang_en' }
          ],
          [
            { text: '◀️ Назад', callback_data: 'cmd_settings' }
          ]
        ]
      };

      await sendMessage(chatId, responseText, languageKeyboard);
      return;
      break;

    case '/privacy':
      responseText = `🔒 *Приватность и данные*

*Мы храним:*
• Прогресс обучения
• Статистику задач
• Настройки

*Твои права:*
✅ Экспортировать данные
✅ Удалить данные
✅ Контролировать видимость

Все данные защищены! 🔐`;
      break;

    case '/export':
      responseText = `📤 *Экспорт данных*

Генерирую файл с твоими данными...

*Включено:*
✅ Прогресс обучения
✅ Статистика
✅ Достижения
✅ Настройки

Файл будет готов через минуту!`;
      break;

    default:
      responseText = `❓ Неизвестная команда: ${command}

Используй /help для списка всех команд.

*Доступно 18 команд!* 🚀`;
  }

  await sendMessage(chatId, responseText);
}

/**
 * Send message with optional inline keyboard
 */
async function sendMessage(chatId, text, replyMarkup = null) {
  try {
    const body = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    };

    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    const response = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!data.ok) {
      console.error(`❌ Ошибка отправки:`, data);
    }
  } catch (error) {
    console.error('❌ Ошибка отправки сообщения:', error);
  }
}

/**
 * Start bot
 */
async function startBot() {
  console.log('🚀 Запуск Telegram бота...\n');

  // Check bot
  const connected = await getBotInfo();
  if (!connected) {
    process.exit(1);
  }

  // Delete webhook if set
  await fetch(`${API_URL}/deleteWebhook`);

  console.log('⏳ Ожидание сообщений...\n');
  console.log('💡 Найди бота в Telegram и отправь /start\n');

  // Start polling
  while (true) {
    await getUpdates();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Handle exit
process.on('SIGINT', () => {
  console.log('\n\n👋 Остановка бота...');
  process.exit(0);
});

// Start
startBot().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});

