/**
 * Improved Telegram Bot with Polling
 * Uses the new node-telegram-bot-api structure
 */

require('dotenv').config({ path: '.env.local' });

const tsConfig = require('../tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

// Register tsconfig-paths
tsConfigPaths.register({
    baseUrl: tsConfig.compilerOptions.baseUrl || '.',
    paths: tsConfig.compilerOptions.paths || {}
});

// Register ts-node with CommonJS to avoid ESM issues
require('ts-node').register({
    compilerOptions: {
        module: 'commonjs'
    }
});

// Now we can require TypeScript files
const { startBot } = require('../src/lib/bot/core.ts');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Остановка бота...');
    process.exit(0);
});

// Start the bot
startBot().catch((error) => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
});
