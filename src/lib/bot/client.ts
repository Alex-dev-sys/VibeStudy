    }

if (!botInstance) {
    try {
        botInstance = new TelegramBot(botEnv.TELEGRAM_BOT_TOKEN, {
            polling: botEnv.BOT_POLLING_ENABLED,
        });

        // Setup webhook for production
        if (botEnv.BOT_WEBHOOK_ENABLED && botEnv.TELEGRAM_WEBHOOK_URL) {
            botInstance.setWebHook(`${botEnv.TELEGRAM_WEBHOOK_URL}/api/webhook`)
                .then(() => {
                    console.log('✅ Telegram webhook set successfully');
                })
                .catch((error) => {
                    logError('Failed to set webhook', error as Error, { component: 'bot-client' });
                });
        }

        // Setup error handler
        botInstance.on('error', (error) => {
            logError('Bot error occurred', error as Error, { component: 'bot-client' });
        });

        // Setup polling error handler
        botInstance.on('polling_error', (error) => {
            logError('Polling error occurred', error as Error, { component: 'bot-client' });
        });

        console.log('✅ Telegram bot initialized');
    } catch (error) {
        logError('Failed to initialize bot', error as Error, { component: 'bot-client' });
        return null;
    }
}

return botInstance;
}

/**
 * Initialize bot with commands and handlers
 */
export function initializeBot(): TelegramBot | null {
    const bot = getBot();

    if (!bot) {
        return null;
    }

    // Register basic commands
    registerBasicCommands(bot);

    return bot;
}

/**
 * Register basic bot commands
 */
function registerBasicCommands(bot: TelegramBot) {
    // Import and register all command handlers
    const { registerCommandHandlers } = require('./commands');
    registerCommandHandlers(bot);
}

export default getBot;
