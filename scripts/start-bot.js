/**
 * Entry point for PM2 to run the TypeScript bot
 */
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

require('./telegram-bot-polling.ts');
