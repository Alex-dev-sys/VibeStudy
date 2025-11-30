import TelegramBot from 'node-telegram-bot-api';
import { handleCommand } from './command-handler';

export const handleMessage = async (msg: TelegramBot.Message) => {
    if (!msg.text) return;

    if (msg.text.startsWith('/')) {
        await handleCommand(msg);
    } else {
        // Handle regular text messages here
        // For now, just ignore or echo
    }
};
