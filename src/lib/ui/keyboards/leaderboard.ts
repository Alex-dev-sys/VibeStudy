/**
 * Leaderboard Keyboards
 * 
 * Inline keyboards for leaderboard UI
 */

import TelegramBot from 'node-telegram-bot-api';

export function getLeaderboardKeyboard(): TelegramBot.InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [
                { text: '🌍 Глобальный', callback_data: 'leaderboard_global' },
                { text: '📅 Неделя', callback_data: 'leaderboard_weekly' },
            ],
            [
                { text: '💻 По языкам', callback_data: 'leaderboard_languages' },
            ],
            [{ text: '🔙 Назад', callback_data: 'btn_menu' }],
        ],
    };
}

export function getLanguageLeaderboardKeyboard(): TelegramBot.InlineKeyboardMarkup {
    return {
        inline_keyboard: [
            [
                { text: '🐍 Python', callback_data: 'leaderboard_lang_python' },
                { text: '🟨 JavaScript', callback_data: 'leaderboard_lang_javascript' },
            ],
            [
                { text: '🔷 TypeScript', callback_data: 'leaderboard_lang_typescript' },
                { text: '☕ Java', callback_data: 'leaderboard_lang_java' },
            ],
            [
                { text: '⚡ C++', callback_data: 'leaderboard_lang_cpp' },
                { text: '🎯 C#', callback_data: 'leaderboard_lang_csharp' },
            ],
            [{ text: '🔙 Назад', callback_data: 'btn_leaderboard' }],
        ],
    };
}
