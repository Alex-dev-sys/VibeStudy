# 🚀 Деплой VibeStudy на VPS сервер

Полная инструкция по развёртыванию сайта и Telegram бота на VPS сервере.

---

## 📋 Что понадобится

- ✅ VPS сервер (Ubuntu 20.04+ или Debian 11+)
- ✅ Домен (например: vibestudy.com)
- ✅ SSH доступ к серверу
- ✅ Root или sudo права

**Характеристики сервера (минимальные):**
- CPU: 2 cores
- RAM: 2 GB
- Диск: 20 GB SSD
- Трафик: unlimited

---

## 🎯 Преимущества VPS vs Vercel

| Функция | VPS | Vercel |
|---------|-----|--------|
| Полный контроль | ✅ | ❌ |
| Бот через polling | ✅ | ❌ |
| Фоновые задачи | ✅ | ⚠️ ограничено |
| Стоимость (>1000 users) | 💰 дешевле | 💰💰 дороже |
| База данных локально | ✅ | ❌ |
| Websockets | ✅ | ⚠️ ограничено |
| Настройка сервера | 🔧 нужна | ✅ auto |

---

## 🔧 Часть 1: Подготовка сервера

### Шаг 1.1: Подключись к серверу

```bash
ssh root@твой-ip-адрес
# или
ssh ваш_пользователь@твой-ip-адрес
```

### Шаг 1.2: Обнови систему

```bash
# Обнови пакеты
sudo apt update && sudo apt upgrade -y

# Установи необходимые утилиты
sudo apt install -y curl git build-essential ufw
```

### Шаг 1.3: Создай пользователя для деплоя

```bash
# Создай пользователя (если работаешь под root)
sudo adduser vibestudy

# Добавь в sudo группу
sudo usermod -aG sudo vibestudy

# Переключись на нового пользователя
su - vibestudy
```

### Шаг 1.4: Настрой firewall

```bash
# Разреши SSH
sudo ufw allow OpenSSH

# Разреши HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включи firewall
sudo ufw enable

# Проверь статус
sudo ufw status
```

---

## 📦 Часть 2: Установка необходимого ПО

### Шаг 2.1: Установи Node.js 20.x

```bash
# Добавь NodeSource репозиторий
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Установи Node.js
sudo apt install -y nodejs

# Проверь версии
node --version  # должно быть v20.x.x
npm --version   # должно быть v10.x.x
```

### Шаг 2.2: Установи PM2 (Process Manager)

```bash
# Установи PM2 глобально
sudo npm install -g pm2

# Настрой автозапуск при перезагрузке
pm2 startup systemd
# Выполни команду которую покажет PM2

# Проверь
pm2 --version
```

### Шаг 2.3: Установи Nginx

```bash
# Установи Nginx
sudo apt install -y nginx

# Запусти и добавь в автозагрузку
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверь статус
sudo systemctl status nginx
```

Открой в браузере `http://твой-ip-адрес` - должна появиться страница Nginx.

### Шаг 2.4: Установи PostgreSQL (опционально)

Если хочешь локальную БД вместо Supabase:

```bash
# Установи PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Запусти
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Создай базу данных
sudo -u postgres psql

# В консоли PostgreSQL:
CREATE DATABASE vibestudy;
CREATE USER vibestudy WITH PASSWORD 'твой_пароль';
GRANT ALL PRIVILEGES ON DATABASE vibestudy TO vibestudy;
\q
```

---

## 🌐 Часть 3: Настройка домена и SSL

### Шаг 3.1: Настрой DNS

В панели управления доменом (например, Cloudflare, Namecheap):

```
A     @              твой-ip-адрес
A     www            твой-ip-адрес
CNAME api            @
```

Подожди 5-10 минут пока DNS обновится.

Проверь:
```bash
ping vibestudy.com
```

### Шаг 3.2: Установи Certbot (для SSL)

```bash
# Установи Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получи SSL сертификат
sudo certbot --nginx -d vibestudy.com -d www.vibestudy.com

# Выбери опцию 2 (redirect HTTP to HTTPS)

# Настрой автообновление
sudo certbot renew --dry-run
```

Сертификат будет автоматически обновляться каждые 90 дней.

---

## 🚢 Часть 4: Деплой приложения

### Шаг 4.1: Клонируй проект

```bash
# Перейди в домашнюю директорию
cd ~

# Клонируй репозиторий
git clone https://github.com/твой-username/VibeStudy.git
cd VibeStudy

# Или через SSH (если настроен)
git clone git@github.com:твой-username/VibeStudy.git
cd VibeStudy
```

### Шаг 4.2: Установи зависимости

```bash
# Установи npm пакеты
npm install

# Если есть ошибки, попробуй:
npm install --legacy-peer-deps
```

### Шаг 4.3: Создай .env файл

```bash
# Создай .env.production
nano .env.production
```

Добавь все переменные:

```bash
# App
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://vibestudy.com
NEXT_PUBLIC_APP_URL=https://vibestudy.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=твой_anon_key
SUPABASE_SERVICE_ROLE_KEY=твой_service_role_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=твой_бот_токен
TELEGRAM_WEBHOOK_SECRET=твой_webhook_secret
TELEGRAM_WEBHOOK_URL=https://vibestudy.com/api/telegram/webhook

# AI
AI_API_TOKEN=твой_ai_токен
AI_API_BASE_URL=https://api.gptlama.ru/v1
AI_MODEL_FREE=gemini-1.5-flash
AI_MODEL_PREMIUM=gpt-4o
AI_MODEL_PRO=claude-3-5-sonnet

# TON (если используешь)
TON_WALLET_ADDRESS=твой_ton_адрес
TONCENTER_API_KEY=твой_toncenter_key
TON_API_KEY=твой_ton_api_key

# Cron
CRON_SECRET=сгенерируй_случайную_строку

# PostgreSQL (если используешь локальную БД вместо Supabase)
# DATABASE_URL=postgresql://vibestudy:пароль@localhost:5432/vibestudy
```

Сохрани (Ctrl+O, Enter, Ctrl+X).

### Шаг 4.4: Собери проект

```bash
# Собери Next.js
npm run build

# Проверь что сборка прошла успешно
ls -la .next
```

---

## 🤖 Часть 5: Настройка и запуск

### Вариант A: Next.js + Webhook (рекомендуется)

#### Шаг 5A.1: Создай PM2 конфиг

```bash
nano ecosystem.config.js
```

Добавь:

```javascript
module.exports = {
  apps: [
    {
      name: 'vibestudy',
      script: 'npm',
      args: 'start',
      cwd: '/home/vibestudy/VibeStudy',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
```

#### Шаг 5A.2: Запусти через PM2

```bash
# Создай папку для логов
mkdir -p logs

# Запусти приложение
pm2 start ecosystem.config.js

# Сохрани конфигурацию PM2
pm2 save

# Проверь статус
pm2 status
pm2 logs vibestudy
```

#### Шаг 5A.3: Настрой webhook

```bash
# Установи webhook на твой домен
node scripts/setup-telegram-webhook.js set https://vibestudy.com/api/telegram/webhook

# Проверь
node scripts/setup-telegram-webhook.js check
```

### Вариант B: Next.js + Bot отдельно через Polling

Если хочешь запустить бота отдельным процессом:

#### Шаг 5B.1: Создай PM2 конфиг

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    // Next.js приложение
    {
      name: 'vibestudy-web',
      script: 'npm',
      args: 'start',
      cwd: '/home/vibestudy/VibeStudy',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    // Telegram Bot (polling)
    {
      name: 'vibestudy-bot',
      script: 'node',
      args: 'scripts/telegram-bot-local.js',
      cwd: '/home/vibestudy/VibeStudy',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
```

#### Шаг 5B.2: Запусти

```bash
# Удали webhook (для polling)
node scripts/setup-telegram-webhook.js delete

# Запусти оба процесса
pm2 start ecosystem.config.js

# Сохрани
pm2 save

# Проверь
pm2 status
pm2 logs vibestudy-bot
```

---

## 🌍 Часть 6: Настройка Nginx

### Шаг 6.1: Создай конфиг Nginx

```bash
sudo nano /etc/nginx/sites-available/vibestudy
```

Добавь конфигурацию:

```nginx
# Перенаправление с www на без www
server {
    listen 80;
    listen [::]:80;
    server_name www.vibestudy.com;
    return 301 https://vibestudy.com$request_uri;
}

# Основной сервер
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name vibestudy.com;

    # SSL сертификаты (Certbot их создаст)
    ssl_certificate /etc/letsencrypt/live/vibestudy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vibestudy.com/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Логи
    access_log /var/log/nginx/vibestudy-access.log;
    error_log /var/log/nginx/vibestudy-error.log;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Клиентские файлы
    client_max_body_size 10M;

    # Прокси на Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Кеширование статических файлов Next.js
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Публичные файлы
    location /images {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}

# Перенаправление HTTP на HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name vibestudy.com;
    return 301 https://$server_name$request_uri;
}
```

### Шаг 6.2: Активируй конфиг

```bash
# Создай симлинк
sudo ln -s /etc/nginx/sites-available/vibestudy /etc/nginx/sites-enabled/

# Удали дефолтный конфиг
sudo rm /etc/nginx/sites-enabled/default

# Проверь конфигурацию
sudo nginx -t

# Перезапусти Nginx
sudo systemctl restart nginx
```

---

## ✅ Часть 7: Проверка работы

### Шаг 7.1: Проверь сайт

Открой в браузере:
```
https://vibestudy.com
```

Должен открыться сайт! 🎉

### Шаг 7.2: Проверь бота

```bash
# Проверь логи бота
pm2 logs vibestudy-bot

# Или для webhook:
pm2 logs vibestudy

# Проверь webhook (если используешь)
curl https://vibestudy.com/api/telegram/health
```

Открой бота в Telegram и отправь `/start`

### Шаг 7.3: Проверь PM2

```bash
# Статус всех процессов
pm2 status

# Детальная информация
pm2 show vibestudy

# Мониторинг в реальном времени
pm2 monit

# Логи
pm2 logs --lines 50
```

---

## 🔄 Часть 8: Обновление приложения

### Создай скрипт для деплоя

```bash
nano deploy.sh
```

```bash
#!/bin/bash

echo "🚀 Начинаем деплой..."

# 1. Получаем последние изменения
echo "📥 Получаем код из Git..."
git pull origin main

# 2. Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# 3. Собираем проект
echo "🔨 Собираем проект..."
npm run build

# 4. Перезапускаем PM2
echo "🔄 Перезапускаем приложение..."
pm2 restart ecosystem.config.js

# 5. Сохраняем конфигурацию PM2
pm2 save

echo "✅ Деплой завершён!"

# Показываем статус
pm2 status
```

Сделай исполняемым:
```bash
chmod +x deploy.sh
```

Используй для обновления:
```bash
./deploy.sh
```

---

## 📊 Часть 9: Мониторинг и логи

### Шаг 9.1: Логи PM2

```bash
# Все логи
pm2 logs

# Конкретное приложение
pm2 logs vibestudy

# Последние 100 строк
pm2 logs --lines 100

# Очистить логи
pm2 flush
```

### Шаг 9.2: Мониторинг ресурсов

```bash
# Мониторинг в реальном времени
pm2 monit

# Использование ресурсов
pm2 list
```

### Шаг 9.3: Установи PM2 Web Dashboard (опционально)

```bash
# Установи pm2-web
pm2 install pm2-web

# Открой в браузере
# http://твой-ip:9000
```

---

## 🔐 Часть 10: Безопасность

### Шаг 10.1: Настрой автоматические обновления

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### Шаг 10.2: Настрой Fail2Ban (защита от брутфорса)

```bash
# Установи
sudo apt install -y fail2ban

# Настрой
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Запусти
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### Шаг 10.3: Ограничь SSH доступ

```bash
# Отредактируй конфиг SSH
sudo nano /etc/ssh/sshd_config

# Измени:
PermitRootLogin no
PasswordAuthentication no  # если используешь SSH ключи
Port 2222  # измени порт (не забудь открыть в firewall!)

# Перезапусти SSH
sudo systemctl restart sshd
```

---

## 🎯 Часть 11: Оптимизация производительности

### Шаг 11.1: Настрой swap (если мало RAM)

```bash
# Создай swap файл (2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Добавь в fstab
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Шаг 11.2: Настрой Nginx кеширование

Добавь в `/etc/nginx/nginx.conf` в блок `http`:

```nginx
# Кеш для прокси
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;
```

### Шаг 11.3: Настрой Node.js для production

В `ecosystem.config.js` добавь:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  NODE_OPTIONS: '--max-old-space-size=1024'  // Ограничь память
}
```

---

## 🔄 Часть 12: Backup и восстановление

### Создай скрипт backup

```bash
nano backup.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/home/vibestudy/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Создай директорию для бэкапов
mkdir -p $BACKUP_DIR

# Бэкап кода
tar -czf $BACKUP_DIR/vibestudy_$DATE.tar.gz ~/VibeStudy

# Бэкап БД (если используешь локальную PostgreSQL)
# pg_dump -U vibestudy vibestudy > $BACKUP_DIR/db_$DATE.sql

# Удаляй старые бэкапы (старше 7 дней)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "✅ Backup завершён: $BACKUP_DIR/vibestudy_$DATE.tar.gz"
```

```bash
chmod +x backup.sh
```

Настрой cron для автоматических бэкапов:
```bash
crontab -e

# Добавь (каждый день в 3:00 ночи):
0 3 * * * /home/vibestudy/backup.sh
```

---

## 📝 Часть 13: Полезные команды

```bash
# PM2
pm2 status                  # Статус процессов
pm2 logs                    # Логи
pm2 restart all             # Перезапуск всех
pm2 stop all                # Остановка всех
pm2 delete all              # Удалить все процессы
pm2 monit                   # Мониторинг

# Nginx
sudo nginx -t               # Проверить конфиг
sudo systemctl restart nginx # Перезапуск
sudo systemctl status nginx  # Статус
tail -f /var/log/nginx/vibestudy-error.log  # Логи

# Git
git pull                    # Получить изменения
git status                  # Статус
git log --oneline -5        # История коммитов

# Система
htop                        # Мониторинг системы
df -h                       # Диск
free -h                     # Память
netstat -tulpn              # Открытые порты
```

---

## 🆘 Troubleshooting

### Сайт не открывается

1. Проверь PM2: `pm2 status`
2. Проверь логи: `pm2 logs`
3. Проверь Nginx: `sudo nginx -t`
4. Проверь порт: `netstat -tulpn | grep 3000`

### Бот не отвечает

1. Проверь логи: `pm2 logs vibestudy-bot`
2. Проверь токен в `.env.production`
3. Проверь webhook: `node scripts/setup-telegram-webhook.js check`
4. Перезапусти: `pm2 restart vibestudy-bot`

### 502 Bad Gateway

1. Next.js не запущен: `pm2 status`
2. Проверь порт в Nginx конфиге
3. Проверь логи: `pm2 logs vibestudy`

---

## 💰 Стоимость VPS

**Рекомендуемые провайдеры:**

- **Hetzner (Германия/Финляндия)**: от €4.51/мес
  - 2 vCPU, 4GB RAM, 40GB SSD

- **DigitalOcean**: от $12/мес
  - 2 vCPU, 2GB RAM, 50GB SSD

- **Contabo (Германия)**: от €6.99/мес
  - 4 vCPU, 8GB RAM, 200GB SSD

**Для 1000+ пользователей:** €10-20/мес вместо $20-50 на Vercel Pro

---

## ✅ Checklist деплоя

- [ ] Сервер подключен и обновлён
- [ ] Установлен Node.js 20.x
- [ ] Установлен PM2
- [ ] Установлен Nginx
- [ ] DNS настроен на сервер
- [ ] SSL сертификат получен
- [ ] Проект склонирован
- [ ] Зависимости установлены
- [ ] .env.production создан
- [ ] Проект собран (npm run build)
- [ ] PM2 запущен
- [ ] Nginx настроен
- [ ] Сайт открывается по HTTPS
- [ ] Telegram бот работает
- [ ] Настроен автообновление SSL
- [ ] Настроен backup

---

**Готово! Твой сайт и бот теперь работают на твоём VPS! 🎉**

Нужна помощь с настройкой? Спрашивай!
