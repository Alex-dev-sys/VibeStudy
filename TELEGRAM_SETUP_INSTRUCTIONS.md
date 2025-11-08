# 🤖 Инструкция по настройке вашего Telegram бота

## ✅ Что уже сделано:

1. ✅ Токен бота добавлен в `.env.local`
2. ✅ Код бота готов к работе
3. ✅ UI для пользователей создан

---

## 🚀 Следующие шаги:

### Шаг 1: Перезапустите сервер

```bash
# Остановите текущий сервер (Ctrl+C)
npm run dev
```

### Шаг 2: Найдите имя вашего бота

Ваш токен: `8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0`

Чтобы узнать username бота, выполните:

```bash
curl "https://api.telegram.org/bot8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0/getMe"
```

Или просто откройте бота через @BotFather и посмотрите его username.

### Шаг 3: Тестирование локально (опционально)

Для локального тестирования используйте ngrok:

```bash
# Установите ngrok (если ещё не установлен)
# https://ngrok.com/download

# Запустите туннель
ngrok http 3000

# Скопируйте URL (например, https://abc123.ngrok.io)
```

Затем установите webhook:

```bash
curl -X POST "https://api.telegram.org/bot8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-ngrok-url.ngrok.io/api/telegram/webhook"}'
```

### Шаг 4: Деплой на production

После деплоя на Vercel/другой хостинг, установите webhook:

```bash
curl -X POST "https://api.telegram.org/bot8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

Проверьте webhook:

```bash
curl "https://api.telegram.org/bot8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0/getWebhookInfo"
```

---

## 🧪 Как протестировать:

1. **Откройте вашего бота в Telegram** (найдите по username из шага 2)
2. **Нажмите Start**
3. **Отправьте команду** `/help` или `/start`
4. **Бот должен ответить** с информацией о командах

### Доступные команды:

- `/start` — Начать работу с ботом
- `/help` — Справка по командам
- `/stats` — Показать статистику (нужно указать username в профиле)
- `/advice` — Получить персональный совет
- `/remind` — Настроить напоминания

---

## 👤 Как пользователям подключить бота:

1. Зайти в **Профиль** на сайте VibeStudy
2. Найти раздел **"Telegram бот"**
3. Указать свой Telegram username (например, `@username` или просто `username`)
4. Выбрать время напоминаний
5. Нажать **"Сохранить"**
6. Открыть бота в Telegram и нажать **Start**

---

## 📅 Настройка автоматических напоминаний

Для автоматической отправки напоминаний нужно настроить cron job.

### Вариант 1: Vercel Cron (рекомендуется)

Создайте файл `vercel.json` в корне проекта:

```json
{
  "crons": [
    {
      "path": "/api/telegram/send-reminder",
      "schedule": "0 9,14,19,22 * * *"
    }
  ]
}
```

### Вариант 2: GitHub Actions

Создайте `.github/workflows/telegram-reminders.yml`:

```yaml
name: Telegram Reminders

on:
  schedule:
    - cron: '0 9,14,19,22 * * *'

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send reminders
        run: |
          curl -X POST https://your-domain.com/api/telegram/send-reminder \
            -H "Content-Type: application/json" \
            -d '{"secret": "a7f3c9e2b8d4f1a6e5c8b2d9f4a7c3e6b1d8f5a2c9e7b4d1f8a5c2e9b6d3f7a4"}'
```

### Вариант 3: Cron-job.org

1. Зарегистрируйтесь на https://cron-job.org
2. Создайте новую задачу:
   - **URL:** `https://your-domain.com/api/telegram/send-reminder`
   - **Method:** POST
   - **Request Body:**
     ```json
     {"secret": "a7f3c9e2b8d4f1a6e5c8b2d9f4a7c3e6b1d8f5a2c9e7b4d1f8a5c2e9b6d3f7a4"}
     ```
   - **Schedule:** `0 9,14,19,22 * * *` (каждый день в 9:00, 14:00, 19:00, 22:00)

---

## 🔒 Важно:

- **НЕ** публикуйте токен бота в публичных репозиториях
- **НЕ** коммитьте `.env.local` в git
- Используйте переменные окружения на хостинге

---

## 🐛 Troubleshooting:

### Бот не отвечает

```bash
# Проверьте статус бота
curl "https://api.telegram.org/bot8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0/getMe"

# Проверьте webhook
curl "https://api.telegram.org/bot8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0/getWebhookInfo"
```

### Удалить webhook (для локального тестирования)

```bash
curl -X POST "https://api.telegram.org/bot8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0/deleteWebhook"
```

### Отправить тестовое сообщение

```bash
# Замените YOUR_CHAT_ID на ваш Telegram ID
curl -X POST "https://api.telegram.org/bot8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": YOUR_CHAT_ID, "text": "Тест!"}'
```

Чтобы узнать свой chat_id, отправьте боту любое сообщение и выполните:

```bash
curl "https://api.telegram.org/bot8584552955:AAHadQf9Zr4EVEBHsV0-zkj6TREAHHksxD0/getUpdates"
```

---

## 📚 Дополнительные ресурсы:

- [Полная документация](./TELEGRAM_BOT_SETUP.md)
- [Быстрый старт](./TELEGRAM_QUICK_START.md)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

**Готово! Ваш бот настроен и готов к работе! 🎉**

Перезапустите сервер и начните тестирование!

