/**
 * Main Menu Inline Keyboards
 * 
 * Keyboard builders for the bot UI
 */

import TelegramBot from 'node-telegram-bot-api';

export function getMainMenuKeyboard(): TelegramBot.InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [
                { text: '📚 Мои уроки', callback_data: 'btn_lessons' },
                { text: '📊 Статистика', callback_data: 'btn_stats' },
            ],
            [
                { text: '🎯 Квесты', callback_data: 'btn_quests' },
                { text: '🏆 Рейтинг', callback_data: 'btn_leaderboard' },
            ],
            [
                { text: '🤖 AI Помощь', callback_data: 'btn_mentor' },
                { text: '👤 Профиль', callback_data: 'btn_profile' },
            ],
        ],
    };
}

export function getBackButton(): TelegramBot.InlineKeyboardButton[][] {
    return [[{ text: '🔙 Назад', callback_data: 'btn_menu' }]];
}
