# ⚡ Шпаргалка команд для VPS

Быстрый справочник команд для управления ботом на VPS.

---

## 🚀 Первоначальная настройка (один раз)

```bash
# 1. Клонируй проект
git clone https://github.com/твой-username/VibeStudy.git
cd VibeStudy

# 2. Создай .env.local
nano .env.local
# (добавь TELEGRAM_BOT_TOKEN, SUPABASE ключи, и т.д.)

# 3. Запусти автоматическую настройку
chmod +x scripts/vps-setup-bot.sh
./scripts/vps-setup-bot.sh

# 4. Настрой автозапуск PM2 (выполни команду которую покажет pm2 startup)
pm2 startup
# Скопируй и выполни показанную команду
```

---

## 📊 Основные команды

### Статус и мониторинг

```bash
# Быстрая проверка всего
./scripts/vps-check-bot.sh

# Статус PM2
pm2 status

# Логи в реальном времени
pm2 logs vibestudy-bot

# Последние 50 строк логов
pm2 logs vibestudy-bot --lines 50

# Мониторинг CPU/RAM
pm2 monit

# Информация о процессе
pm2 show vibestudy-bot
```

### Управление ботом

```bash
# Перезапуск
pm2 restart vibestudy-bot

# Остановка
pm2 stop vibestudy-bot

# Запуск (если остановлен)
pm2 start vibestudy-bot

# Удалить из PM2
pm2 delete vibestudy-bot

# Запустить заново
pm2 start ecosystem.bot-only.config.js
```

### Обновление

```bash
# Автоматическое обновление
./scripts/vps-update-bot.sh

# Или вручную:
git pull origin main
npm install --production
pm2 restart vibestudy-bot
```

---

## 🔧 Системные команды

### Проверка ресурсов

```bash
# RAM и Swap
free -h

# CPU и процессы
htop
# или
top

# Место на диске
df -h

# Размер директории проекта
du -sh ~/VibeStudy
```

### Логи

```bash
# Размер логов
du -sh ~/VibeStudy/logs

# Очистить старые логи (старше 7 дней)
find ~/VibeStudy/logs -name "*.log" -mtime +7 -delete

# Посмотреть логи напрямую
tail -f ~/VibeStudy/logs/bot-out.log
tail -f ~/VibeStudy/logs/bot-error.log
```

---

## 🐛 Troubleshooting

### Бот не работает

```bash
# 1. Проверь статус
pm2 status vibestudy-bot

# 2. Смотри error логи
pm2 logs vibestudy-bot --err --lines 50

# 3. Перезапусти
pm2 restart vibestudy-bot

# 4. Если не помогло - перезапусти с нуля
pm2 delete vibestudy-bot
pm2 start ecosystem.bot-only.config.js
```

### Нехватка памяти

```bash
# Проверь использование
free -h
pm2 monit

# Проверь что swap включен
swapon --show

# Если нет swap - создай
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Ограничь лимит памяти бота
# Отредактируй ecosystem.bot-only.config.js:
# max_memory_restart: '150M'
pm2 restart vibestudy-bot
```

### Webhook конфликт

```bash
# Удали webhook
node scripts/setup-telegram-webhook.js delete

# Или вручную
curl -X POST "https://api.telegram.org/bot<ТОКЕН>/deleteWebhook"
```

---

## 🔐 Безопасность

### Проверка firewall

```bash
# Статус UFW
sudo ufw status

# Включить (если выключен)
sudo ufw allow OpenSSH
sudo ufw enable
```

### Проверка .env.local

```bash
# Убедись что .env.local защищен
ls -la .env.local
# Должно быть: -rw------- (600)

# Если нет:
chmod 600 .env.local

# Проверь что не в git
cat .gitignore | grep .env.local
```

---

## 📈 Полезные алиасы (опционально)

Добавь в `~/.bashrc` для быстрого доступа:

```bash
# Открой .bashrc
nano ~/.bashrc

# Добавь в конец:
alias bot-status='pm2 status vibestudy-bot'
alias bot-logs='pm2 logs vibestudy-bot'
alias bot-restart='pm2 restart vibestudy-bot'
alias bot-check='~/VibeStudy/scripts/vps-check-bot.sh'
alias bot-update='~/VibeStudy/scripts/vps-update-bot.sh'

# Сохрани и перезагрузи
source ~/.bashrc

# Теперь можно использовать:
bot-status
bot-logs
bot-restart
```

---

## 🔄 Автоматизация

### Автоматическое обновление (cron)

```bash
# Открой crontab
crontab -e

# Добавь (обновление каждую ночь в 3:00):
0 3 * * * cd ~/VibeStudy && git pull origin main && npm install --production && pm2 restart vibestudy-bot

# Или используй скрипт:
0 3 * * * ~/VibeStudy/scripts/vps-update-bot.sh >> ~/bot-update.log 2>&1
```

### Очистка логов (cron)

```bash
# Добавь в crontab (каждое воскресенье):
0 0 * * 0 find ~/VibeStudy/logs -name "*.log" -mtime +7 -delete
```

---

## 📞 Быстрая диагностика

Если что-то не работает, выполни по порядку:

```bash
# 1. Проверь все
./scripts/vps-check-bot.sh

# 2. Смотри error логи
pm2 logs vibestudy-bot --err

# 3. Проверь .env.local
cat .env.local | grep TELEGRAM_BOT_TOKEN

# 4. Проверь память
free -h

# 5. Перезапусти
pm2 restart vibestudy-bot

# 6. Если не помогло - проверь webhook
curl "https://api.telegram.org/bot$(grep TELEGRAM_BOT_TOKEN .env.local | cut -d '=' -f2)/getWebhookInfo"
```

---

## 📚 Документация

- **Полная инструкция**: `VPS_BOT_ONLY_GUIDE.md`
- **Команды бота**: `README_BOT.md`
- **Vercel деплой**: `VERCEL_BOT_SETUP.md`

---

**Сохрани эту шпаргалку в закладки!** 🔖
