#!/bin/bash

# Скрипт первоначальной настройки бота на VPS
# Запускать ОДИН РАЗ при первом деплое
# Использование: ./scripts/vps-setup-bot.sh

set -e  # Остановка при ошибке

echo "🚀 Настройка VibeStudy бота на VPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Проверка что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден"
    echo "Запусти этот скрипт из корня проекта VibeStudy"
    exit 1
fi

# Проверка .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Ошибка: .env.local не найден"
    echo ""
    echo "Создай файл .env.local со следующим содержимым:"
    echo ""
    echo "TELEGRAM_BOT_TOKEN=твой_токен"
    echo "NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=твой_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=твой_service_key"
    echo "AI_API_TOKEN=твой_ai_токен"
    echo "NEXT_PUBLIC_SITE_URL=https://твой-проект.vercel.app"
    echo "NODE_ENV=production"
    echo ""
    exit 1
fi

echo "✅ .env.local найден"
echo ""

# Создание директории для логов
echo "📁 Создаю директорию для логов..."
mkdir -p logs
echo "✅ Директория logs создана"
echo ""

# Проверка PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 не установлен. Устанавливаю..."
    npm install -g pm2
    echo "✅ PM2 установлен"
else
    echo "✅ PM2 уже установлен"
fi
echo ""

# Установка зависимостей
echo "📦 Устанавливаю зависимости..."
npm install --production
echo "✅ Зависимости установлены"
echo ""

# Удаление webhook (если был настроен)
echo "🔧 Проверяю webhook..."
if [ -n "$TELEGRAM_BOT_TOKEN" ] || grep -q "TELEGRAM_BOT_TOKEN" .env.local; then
    echo "Удаляю webhook (если был настроен)..."
    node scripts/setup-telegram-webhook.js delete 2>/dev/null || echo "Webhook не был настроен или уже удален"
    echo "✅ Webhook удален (бот будет работать в polling режиме)"
else
    echo "⚠️  TELEGRAM_BOT_TOKEN не найден в окружении"
fi
echo ""

# Запуск бота
echo "🚀 Запускаю бота через PM2..."
pm2 start ecosystem.bot-only.config.js
echo "✅ Бот запущен"
echo ""

# Сохранение PM2 конфигурации
echo "💾 Сохраняю PM2 конфигурацию..."
pm2 save
echo "✅ Конфигурация сохранена"
echo ""

# Настройка автозапуска
echo "⚙️  Настройка автозапуска PM2..."
echo ""
echo "Выполни следующую команду вручную:"
echo ""
pm2 startup
echo ""
echo "(Скопируй команду выше и выполни её)"
echo ""

# Статус
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Настройка завершена!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Статус бота:"
pm2 status vibestudy-bot
echo ""

# Делаем скрипты исполняемыми
echo "🔧 Настраиваю вспомогательные скрипты..."
chmod +x scripts/vps-update-bot.sh
chmod +x scripts/vps-check-bot.sh
chmod +x scripts/vps-setup-bot.sh
echo "✅ Скрипты готовы к использованию"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Полезные команды:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ./scripts/vps-check-bot.sh   - Проверить здоровье бота"
echo "  ./scripts/vps-update-bot.sh  - Обновить бота"
echo "  pm2 logs vibestudy-bot       - Логи в реальном времени"
echo "  pm2 monit                    - Мониторинг CPU/RAM"
echo "  pm2 restart vibestudy-bot    - Перезапуск"
echo ""
echo "📝 Смотрю логи (Ctrl+C для выхода)..."
sleep 2
pm2 logs vibestudy-bot
