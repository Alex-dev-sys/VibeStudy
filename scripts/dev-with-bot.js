/**
 * Запуск Next.js dev сервера и Telegram бота одновременно
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск VibeStudy с Telegram ботом...\n');

// Запуск Next.js dev сервера
const nextDev = spawn('npm', ['run', 'dev:next'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

// Wait a bit for Next.js to start, then start bot
setTimeout(() => {
  console.log('\n🤖 Запуск бота...');
  const bot = spawn('npm', ['run', 'bot'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });

  bot.on('error', (error) => {
    console.error('❌ Ошибка запуска бота:', error);
  });

  bot.on('exit', (code) => {
    if (code !== 0) {
      console.log(`\n⚠️ Бот остановлен с кодом ${code}`);
    }
  });

  // Handle cleanup for bot
  process.on('SIGINT', () => {
    try {
      bot.kill();
    } catch (e) {
      // ignore
    }
  });
  process.on('SIGTERM', () => {
    try {
      bot.kill();
    } catch (e) {
      // ignore
    }
  });

}, 2000);

nextDev.on('error', (error) => {
  console.error('❌ Ошибка запуска Next.js:', error);
  process.exit(1);
});

nextDev.on('exit', (code) => {
  console.log(`\n👋 Next.js остановлен`);
  process.exit(code);
});

// Обработка Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Остановка сервера и бота...');
  try {
    nextDev.kill();
  } catch (e) {
    // ignore
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Остановка сервера и бота...');
  try {
    nextDev.kill();
  } catch (e) {
    // ignore
  }
  process.exit(0);
});
