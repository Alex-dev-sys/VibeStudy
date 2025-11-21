# Исправление Telegram Бота

## Проблема
Telegram бот работает локально, но не работает на Vercel через webhook.

## Что уже сделано ✅

1. **Webhook установлен:**
   - URL: `https://vibe-study-c3yn.vercel.app/api/telegram/webhook`
   - Secret: `vibestudy_webhook_secret_2025`
   - Проверка: `node scripts/setup-telegram-webhook.js check`

2. **Таблица `user_telegram_profiles` создана в Supabase**
   - Выполнена миграция через MCP
   - RLS политики настроены

3. **Код исправлен:**
   - Используется прямой Supabase клиент вместо серверного
   - Добавлена обработка ошибок БД
   - Бот работает даже если БД недоступна

## Что нужно проверить/исправить 🔧

### 1. Переменные окружения в Vercel

**Обязательно проверь, что ВСЕ эти переменные добавлены в Vercel:**

Перейди: https://vercel.com/your-username/vibe-study-c3yn/settings/environment-variables

#### Telegram (обязательно):
```
TELEGRAM_BOT_TOKEN=8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0
TELEGRAM_WEBHOOK_SECRET=vibestudy_webhook_secret_2025
```

#### Supabase (обязательно):
```
NEXT_PUBLIC_SUPABASE_URL=https://qtswuibugwuvgzppkbtq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0c3d1aWJ1Z3d1dmd6cHBrYnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTc0NjcsImV4cCI6MjA3ODE5MzQ2N30.elUp5IX7YHKJQPQa5SFzhqQVgwZHBfvPw4BuYoIHS6A
SUPABASE_SERVICE_ROLE_KEY=<получи из Supabase Dashboard -> Settings -> API>
```

#### AI (обязательно):
```
AI_API_TOKEN=uFh6FnpT2PCEuvEgppEIPKDRmHQQnrS-XRLsuXp_IlY
AI_API_BASE_URL=https://api.gptlama.ru/v1
AI_MODEL_FREE=gemini-1.5-flash
AI_MODEL_PREMIUM=gpt-4o
AI_MODEL_PRO=claude-3-5-sonnet
```

#### Другие:
```
CRON_SECRET=vibestudy_cron_secret_2025
TON_WALLET_ADDRESS=UQBcz15XtwIFMh9veWAFXjqAIz7oFU25TUKSE7barFpVQTle
TONCENTER_API_KEY=99ddb89183ae1c3707994a93809d9a9fce788fb18130c6c63156f46d3728b562
```

**ВАЖНО:** После добавления переменных Vercel автоматически передеплоит проект!

### 2. Получить SUPABASE_SERVICE_ROLE_KEY

Если не знаешь где взять `SUPABASE_SERVICE_ROLE_KEY`:

1. Перейди: https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq/settings/api
2. Найди раздел "Project API keys"
3. Скопируй ключ "service_role" (НЕ "anon"!)
4. Добавь в Vercel как `SUPABASE_SERVICE_ROLE_KEY`

### 3. Проверка работы бота

После добавления всех переменных и деплоя:

1. Открой бота: https://t.me/study_vibe_bot
2. Отправь `/start`
3. Бот должен ответить приветствием

### 4. Проверка логов (если не работает)

1. Перейди: https://vercel.com/your-username/vibe-study-c3yn
2. Открой вкладку "Logs"
3. Отправь `/start` боту
4. Посмотри логи:
   - Если логов нет → webhook не работает
   - Если есть ошибка "Supabase credentials not configured" → не добавлены переменные Supabase
   - Если есть ошибка при отправке сообщения → не добавлен `TELEGRAM_BOT_TOKEN`

### 5. Переустановка webhook (если нужно)

Если webhook сбросился (например, после локального запуска бота):

```bash
node scripts/setup-telegram-webhook.js set https://vibe-study-c3yn.vercel.app/api/telegram/webhook
```

## Частые проблемы и решения 🐛

### Проблема: "Could not find the table 'user_telegram_profiles'"
**Решение:** Таблица уже создана через MCP. Если ошибка повторяется, проверь что `SUPABASE_SERVICE_ROLE_KEY` добавлен в Vercel.

### Проблема: "TypeError: fetch failed"
**Решение:** Не установлены переменные Supabase в Vercel. Добавь все три переменные (см. выше).

### Проблема: Бот не отвечает, но логов нет
**Решение:** Webhook не установлен или указывает на неправильный URL. Переустанови webhook.

### Проблема: Бот работает локально, но не на Vercel
**Решение:** 
1. Локально бот работает в polling режиме (без webhook)
2. На Vercel бот работает через webhook
3. После локального запуска нужно переустановить webhook на Vercel URL

## Команды для проверки

```bash
# Проверить webhook
node scripts/setup-telegram-webhook.js check

# Установить webhook
node scripts/setup-telegram-webhook.js set https://vibe-study-c3yn.vercel.app/api/telegram/webhook

# Проверить бота
node scripts/setup-telegram-webhook.js info

# Проверить menu button
node scripts/setup-telegram-webhook.js menu-check
```

## Архитектура бота

```
Telegram → Webhook → Vercel API Route → Bot Controller → Commands → Response
                                      ↓
                                  Supabase (профили, аналитика)
```

**Важно:** На Vercel бот работает через webhook - не нужен отдельный процесс!

## Следующие шаги

1. ✅ Добавь все переменные окружения в Vercel
2. ✅ Получи и добавь `SUPABASE_SERVICE_ROLE_KEY`
3. ✅ Дождись деплоя (1-2 минуты)
4. ✅ Проверь webhook: `node scripts/setup-telegram-webhook.js check`
5. ✅ Протестируй бота: отправь `/start` в https://t.me/study_vibe_bot
6. ✅ Если не работает - проверь логи в Vercel

## Контакты для помощи

- Бот: https://t.me/study_vibe_bot
- Vercel: https://vercel.com/your-username/vibe-study-c3yn
- Supabase: https://supabase.com/dashboard/project/qtswuibugwuvgzppkbtq

---

**Последнее обновление:** 2025-11-21

**Статус:** Ожидает добавления переменных окружения в Vercel
