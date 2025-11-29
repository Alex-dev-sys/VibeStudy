#!/bin/bash

# Скрипт для обновления бота на VPS
# Использование: ./scripts/vps-update-bot.sh

set -e  # Остановка при ошибке

echo "🚀 Обновление VibeStudy бота..."
echo ""

# Переход в директорию проекта
cd ~/VibeStudy || cd "$(dirname "$0")/.." || exit 1

echo "📥 Скачиваю обновления из GitHub..."
git fetch origin
git pull origin main

echo ""
echo "📦 Устанавливаю зависимости..."
npm install --production

echo ""
echo "🔄 Перезапускаю бота..."
pm2 restart vibestudy-bot

echo ""
echo "✅ Бот успешно обновлен!"
echo ""
echo "📊 Статус:"
pm2 status vibestudy-bot

echo ""
echo "📝 Последние логи (Ctrl+C для выхода):"
sleep 2
pm2 logs vibestudy-bot --lines 20
