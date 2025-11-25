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
    console.error('❌ Ошибка запуска бота:', error);
});

bot.on('exit', (code) => {
  if (code !== 0) {
    console.log(`\n⚠️ Бот остановлен с кодом ${code}`);
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
  nextDev.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Остановка сервера и бота...');
  nextDev.kill();
  process.exit(0);
});

