import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../core';
import { TEXT } from '../ui/text';
import { KEYBOARDS } from '../ui/keyboards';

export const handleCommand = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const command = text.split(' ')[0].toLowerCase();

    console.log(`Command received: ${command} from ${msg.from?.username}`);

    switch (command) {
        case '/start':
            await bot.sendMessage(chatId, TEXT.WELCOME, {
                parse_mode: 'Markdown',
                reply_markup: KEYBOARDS.MAIN_MENU
            });
            break;

        case '/menu':
            await bot.sendMessage(chatId, TEXT.MENU_HEADER, {
                parse_mode: 'Markdown',
                reply_markup: KEYBOARDS.MAIN_MENU
            });
            break;

        case '/help':
            await bot.sendMessage(chatId, TEXT.HELP, {
                parse_mode: 'Markdown',
                reply_markup: KEYBOARDS.BACK_TO_MENU
            });
            break;

        default:
            await bot.sendMessage(chatId, TEXT.UNKNOWN_COMMAND, {
                parse_mode: 'Markdown'
            });
    }
};
