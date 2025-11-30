import { InlineKeyboardButton, ReplyKeyboardMarkup } from 'node-telegram-bot-api';

export const KEYBOARDS = {
    MAIN_MENU: {
        inline_keyboard: [
            [
                { text: '📚 Уроки', callback_data: 'menu_lessons' },
                { text: '📊 Статистика', callback_data: 'menu_stats' }
            ],
            [
                { text: '💻 Code Runner', callback_data: 'menu_runner' },
                { text: '🏆 Рейтинг', callback_data: 'menu_leaderboard' }
            ],
            [
                { text: '⚙️ Настройки', callback_data: 'menu_settings' },
                { text: '❓ Помощь', callback_data: 'menu_help' }
            ]
        ]
    },
    BACK_TO_MENU: {
        inline_keyboard: [
            [{ text: '🔙 В меню', callback_data: 'menu_main' }]
        ]
    }
};
