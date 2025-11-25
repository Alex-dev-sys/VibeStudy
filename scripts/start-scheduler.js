/**
 * Start Scheduler
 * 
 * Script to start the notification scheduler independently
 */

const path = require('path');

// Set up TypeScript execution
require('ts-node').register({
    project: path.join(__dirname, '..', 'tsconfig.json'),
    transpileOnly: true,
});

// Import scheduler
const scheduler = require('../src/lib/modules/notifications/scheduler.ts').default;

console.log('⏰ Starting VibeStudy Scheduler...\n');

// Start scheduler
scheduler.start();

console.log('\n✅ Scheduler is running');
console.log('Press Ctrl+C to stop\n');

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping scheduler...');
    scheduler.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Stopping scheduler...');
    scheduler.stop();
    process.exit(0);
});
