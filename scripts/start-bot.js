/**
 * Entry point for PM2 to run the TypeScript bot
 */
require('ts-node/register');
require('./telegram-bot-polling.ts');
