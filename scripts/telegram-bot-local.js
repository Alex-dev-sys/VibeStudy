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
  // Handle callback queries (inline button clicks)
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }

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
        `/menu - Главное меню\n` +
        `/stats - Показать статистику обучения\n` +
        `/ask [вопрос] - Спросить AI\n` +
        `/run [код] - Запустить код (Python, JS и др.)\n` +
        `/advice - Получить персональный совет\n` +
        `/remind - Настроить напоминания\n` +
        `/help - Эта справка\n\n` +
        `*Как это работает:*\n` +
        `1. Укажи свой Telegram username в профиле на сайте\n` +
        `2. Бот автоматически свяжется с тобой\n` +
        `3. Получай напоминания и советы!\n\n` +
        `Вопросы? Пиши в поддержку!`;
      break;

    case '/menu':
      // Send menu with inline keyboard
      await sendMessage(chatId, '📋 *Главное меню*\n\nВыбери раздел:', {
        inline_keyboard: [
          [
            { text: '📊 Статистика', callback_data: 'stats' },
            { text: '📚 Прогресс', callback_data: 'progress' }
          ],
          [
            { text: '💻 Code Runner', callback_data: 'run' },
            { text: '🤖 AI помощник', callback_data: 'ask' }
          ],
          [
            { text: '⏰ Напоминания', callback_data: 'remind' },
            { text: '🎓 Советы', callback_data: 'advice' }
          ],
          [
            { text: '⚙️ Настройки', callback_data: 'settings' },
            { text: '❓ Помощь', callback_data: 'help' }
          ]
        ]
      });
      return;

    case '/ask':
      const question = text.replace('/ask', '').trim();
      if (!question) {
        responseText = '🤖 *AI Помощник*\n\nЗадай мне вопрос!\n\nПример:\n`/ask Что такое JavaScript?`';
      } else {
        responseText = '🤖 *Думаю...*';
        await sendMessage(chatId, responseText);

        // Call AI API
        try {
          const AI_API_TOKEN = process.env.AI_API_TOKEN;
          const AI_API_BASE_URL = process.env.AI_API_BASE_URL || 'https://api.gptlama.ru/v1';
          const AI_MODEL_FREE = process.env.AI_MODEL_FREE || 'gemini-1.5-flash';

          if (!AI_API_TOKEN) {
            responseText = '❌ AI API не настроен. Добавь AI_API_TOKEN в .env.local';
            break;
          }

          const res = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${AI_API_TOKEN}`
            },
            body: JSON.stringify({
              model: AI_MODEL_FREE,
              messages: [
                {
                  role: 'system',
                  content: 'Ты - AI помощник для платформы обучения программированию VibeStudy. Отвечай кратко и понятно на русском языке.'
                },
                {
                  role: 'user',
                  content: question
                }
              ],
              max_tokens: 500,
              temperature: 0.7
            })
          });

          const data = await res.json();

          if (data.choices && data.choices[0]?.message?.content) {
            responseText = `🤖 *AI ответ:*\n\n${data.choices[0].message.content}`;
          } else {
            responseText = '❌ Не удалось получить ответ от AI. Попробуй позже.';
          }
        } catch (e) {
          responseText = '❌ Ошибка AI: ' + e.message;
        }
      }
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
      // Get advice from AI
      responseText = '🎓 *Генерирую персональный совет...*';
      await sendMessage(chatId, responseText);

      try {
        const AI_API_TOKEN = process.env.AI_API_TOKEN;
        const AI_API_BASE_URL = process.env.AI_API_BASE_URL || 'https://api.gptlama.ru/v1';
        const AI_MODEL_FREE = process.env.AI_MODEL_FREE || 'gemini-1.5-flash';

        if (!AI_API_TOKEN) {
          responseText = '❌ AI API не настроен';
          break;
        }

        const res = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_API_TOKEN}`
          },
          body: JSON.stringify({
            model: AI_MODEL_FREE,
            messages: [
              {
                role: 'system',
                content: 'Ты - персональный наставник для студента платформы VibeStudy. Дай короткий мотивирующий совет по изучению программирования (максимум 150 слов).'
              },
              {
                role: 'user',
                content: 'Дай мне персональный совет как лучше учить программирование'
              }
            ],
            max_tokens: 300,
            temperature: 0.8
          })
        });

        const data = await res.json();

        if (data.choices && data.choices[0]?.message?.content) {
          responseText = `🎓 *Персональный совет*\n\n${data.choices[0].message.content}\n\n💪 Продолжай учиться!`;
        } else {
          responseText = '❌ Не удалось получить совет. Попробуй /advice позже.';
        }
      } catch (e) {
        responseText = '❌ Ошибка: ' + e.message;
      }
      break;

    case '/remind':
    case '⏰ Напоминания':
      // Send reminders menu with inline keyboard
      await sendMessage(chatId, `⏰ *Умные напоминания*\n\n` +
        `📱 *Настройки:*\n` +
        `• Время: не установлено\n` +
        `• Адаптивный режим: ❌ Выкл\n` +
        `• Защита серии: ❌ Выкл\n\n` +
        `🤖 *Адаптивный режим*\n` +
        `Бот автоматически подберёт лучшее время!\n\n` +
        `🔥 *Защита серии*\n` +
        `Напоминание вечером, если серия под угрозой.\n\n` +
        `Выбери опцию:`, {
        inline_keyboard: [
          [
            { text: '🌅 Утро (9:00)', callback_data: 'remind:09:00' },
            { text: '☀️ День (14:00)', callback_data: 'remind:14:00' }
          ],
          [
            { text: '🌆 Вечер (19:00)', callback_data: 'remind:19:00' },
            { text: '🌙 Ночь (22:00)', callback_data: 'remind:22:00' }
          ],
          [
            { text: '🤖 Адаптивный режим', callback_data: 'remind:adaptive' },
            { text: '🔥 Защита серии', callback_data: 'remind:streak' }
          ],
          [
            { text: '😴 DND режим', callback_data: 'remind:dnd' },
            { text: '🔔 Включить все', callback_data: 'remind:enable' }
          ]
        ]
      });
      return;

    case '📚 Уроки':
      responseText = `📚 *Уроки*\n\nСписок уроков доступен на сайте.`;
      break;

    case '📅 Прогресс':
      responseText = `📅 *Твой прогресс*\n\nТы только в начале пути! Продолжай учиться.`;
      break;

    case '🏆 Рейтинг':
      responseText = `🏆 *Рейтинг*\n\n1. 🥇 User1 - 1000 XP\n2. 🥈 User2 - 800 XP\n3. 🥉 You - 0 XP`;
      break;

    case '/settings':
    case '⚙️ Настройки':
      // Send settings menu with inline keyboard
      await sendMessage(chatId, `⚙️ *Настройки бота*\n\n` +
        `📱 *Текущие настройки:*\n` +
        `• Язык: 🇷🇺 Русский\n` +
        `• Уведомления: ✅ Включены\n` +
        `• Режим DND: ❌ Выключен\n\n` +
        `Выбери что настроить:`, {
        inline_keyboard: [
          [
            { text: '🌐 Язык', callback_data: 'settings:language' },
            { text: '🔔 Уведомления', callback_data: 'settings:notifications' }
          ],
          [
            { text: '😴 DND режим', callback_data: 'settings:dnd' },
            { text: '🔐 Приватность', callback_data: 'settings:privacy' }
          ],
          [
            { text: '📊 Сбросить данные', callback_data: 'settings:reset' },
            { text: '❓ Помощь', callback_data: 'help' }
          ]
        ]
      });
      return;

    default:
      responseText = `❓ Неизвестная команда.\n\nИспользуй /help для списка доступных команд.`;
  }

  // Отправляем ответ
  await sendMessage(chatId, responseText);
}

/**
 * Обработка callback queries (нажатия на inline кнопки)
 */
async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const callbackQueryId = callbackQuery.id;

  // Answer callback query to remove loading state
  await fetch(`${API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: '✅'
    })
  });

  let responseText = '';

  switch (data) {
    case 'stats':
      responseText = `📊 *Твоя статистика VibeStudy*\n\n` +
        `🎯 Текущий день: 1/90\n` +
        `✅ Завершено: 0 дней (0%)\n` +
        `░░░░░░░░░░\n\n` +
        `🔥 Серия: 0 дней\n` +
        `⭐ Средний балл: 0/100\n` +
        `💻 Язык: PYTHON\n\n` +
        `Начни обучение на сайте! 🚀`;
      break;

    case 'progress':
      responseText = `📅 *Твой прогресс*\n\nТы только в начале пути! Продолжай учиться.`;
      break;

    case 'run':
      responseText = '💻 *Code Runner*\n\nОтправь код после команды /run\n\nПример:\n`/run print("Hello")`';
      break;

    case 'ask':
      responseText = '🤖 *AI Помощник*\n\nЗадай мне вопрос!\n\nПример:\n`/ask Что такое JavaScript?`';
      break;

    case 'remind':
      responseText = `⏰ *Настройка напоминаний*\n\n` +
        `Выбери удобное время для напоминаний:\n\n` +
        `🌅 Утро (9:00)\n` +
        `☀️ День (14:00)\n` +
        `🌆 Вечер (19:00)\n` +
        `🌙 Ночь (22:00)\n\n` +
        `Настрой время в профиле на сайте VibeStudy!`;
      break;

    case 'advice':
      responseText = `🎓 *Персональный совет*\n\n` +
        `💡 Начни с основ!\n` +
        `Первый день — самый важный. Не спеши, внимательно изучи теорию.\n\n` +
        `✨ Советы для старта:\n` +
        `• Выбери удобное время для занятий\n` +
        `• Занимайся каждый день хотя бы 30 минут\n` +
        `• Не бойся задавать вопросы ИИ-помощнику\n\n` +
        `Удачи в обучении! 🚀`;
      break;

    case 'settings':
      responseText = `⚙️ *Настройки*\n\nДоступны на веб-платформе.`;
      break;

    case 'help':
      responseText = `📖 *Помощь*\n\n` +
        `*Доступные команды:*\n` +
        `/start - Начать работу с ботом\n` +
        `/menu - Главное меню\n` +
        `/stats - Показать статистику обучения\n` +
        `/ask [вопрос] - Спросить AI\n` +
        `/run [код] - Запустить код\n` +
        `/help - Эта справка`;
      break;

    // Reminder callbacks
    default:
      if (data.startsWith('remind:')) {
        const action = data.split(':')[1];
        switch (action) {
          case '09:00':
          case '14:00':
          case '19:00':
          case '22:00':
            responseText = `✅ Напоминания установлены на ${action}\n\nЯ буду напоминать тебе о занятиях!`;
            break;
          case 'adaptive':
            responseText = `🤖 *Адаптивный режим*\n\nВключен!\nБот будет автоматически подбирать лучшее время на основе твоей активности.`;
            break;
          case 'streak':
            responseText = `🔥 *Защита серии*\n\nВключена!\nПолучишь дополнительное напоминание вечером, если серия под угрозой.`;
            break;
          case 'dnd':
            responseText = `😴 *Do-Not-Disturb*\n\nУстанови период когда не хочешь получать уведомления:\n\nПример: 23:00 - 08:00`;
            break;
          case 'enable':
            responseText = `🔔 Все напоминания включены!\n\nБудешь получать:\n• Ежедневные напоминания\n• Защиту серии\n• Персональные советы`;
            break;
          default:
            responseText = '❓ Неизвестная настройка';
        }
      } else if (data.startsWith('settings:')) {
        const action = data.split(':')[1];
        switch (action) {
          case 'language':
            responseText = `🌐 *Выбор языка*\n\nДоступные языки:\n🇷🇺 Русский (текущий)\n🇬🇧 English\n\nВыбери язык на сайте VibeStudy.`;
            break;
          case 'notifications':
            responseText = `🔔 *Уведомления*\n\nТекущий статус: ✅ Включены\n\nМожешь управлять:\n• Ежедневные напоминания\n• Достижения\n• Системные уведомления`;
            break;
          case 'dnd':
            responseText = `😴 *DND режим*\n\nНе беспокоить:\nПериод: не установлен\n\nУстанови время когда не хочешь получать уведомления.`;
            break;
          case 'privacy':
            responseText = `🔐 *Приватность*\n\nТвои данные защищены согласно GDPR.\n\nМожешь:\n• Экспортировать данные\n• Удалить аккаунт\n• Посмотреть политику`;
            break;
          case 'reset':
            responseText = `⚠️ *Сброс данных*\n\nЭто удалит:\n• Настройки бота\n• Историю сообщений\n\nПрогресс на сайте сохранится!\n\nДля подтверждения напиши: /confirm_reset`;
            break;
          default:
            responseText = '❓ Неизвестная настройка';
        }
      } else {
        responseText = '❓ Неизвестная команда';
      }
  }

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
