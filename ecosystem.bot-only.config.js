/**
 * PM2 конфигурация для запуска ТОЛЬКО Telegram бота на VPS
 *
 * Используется когда:
 * - Сайт работает на Vercel
 * - Бот работает на VPS в polling режиме
 * - Ограниченные ресурсы (1GB RAM)
 *
 * Запуск: pm2 start ecosystem.bot-only.config.js
 */

module.exports = {
  apps: [{
    // Имя процесса в PM2
    name: 'vibestudy-bot',

    // Скрипт для запуска
    script: 'scripts/telegram-bot-polling.js',

    // Количество инстансов (1 для экономии памяти)
    instances: 1,

    // Режим выполнения (fork для single instance)
    exec_mode: 'fork',

    // Автоматический перезапуск при превышении лимита памяти
    max_memory_restart: '200M',

    // Аргументы для Node.js (ограничение heap)
    node_args: '--max-old-space-size=256',

    // Переменные окружения
    env: {
      NODE_ENV: 'production'
    },

    // Логирование
    error_file: './logs/bot-error.log',
    out_file: './logs/bot-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,

    // Автоперезапуск при крашах
    autorestart: true,

    // Не следить за изменениями файлов (в продакшене)
    watch: false,

    // Максимум 10 перезапусков в течение min_uptime
    max_restarts: 10,
    min_uptime: '10s',

    // Задержка между перезапусками
    restart_delay: 4000,

    // Убить процесс если не остановился за 10 секунд
    kill_timeout: 10000,

    // Время ожидания перед force kill
    wait_ready: false,
  }]
};
