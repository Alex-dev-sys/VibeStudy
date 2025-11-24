import type { InlineKeyboard } from '@/types/telegram';

export function getMainMenuKeyboard(): InlineKeyboard {
    return {
        inline_keyboard: [
            [
                { text: '📚 Уроки', callback_data: 'btn_lessons' },
                { text: '📊 Статистика', callback_data: 'btn_stats' },
            ],
            [
                { text: '🎯 Следующая задача', callback_data: 'btn_next_task' },
                { text: '🏆 Рейтинг', callback_data: 'btn_leaderboard' },
            ],
            [
                { text: '❓ AI Помощь', callback_data: 'btn_mentor' },
                { text: '⚙️ Настройки', callback_data: 'btn_settings' },
            ],
            [{ text: '👥 Социум', callback_data: 'btn_social' }],
        ],
    };
}

export function getQuestMenuKeyboard(questId: string): InlineKeyboard {
    return {
        inline_keyboard: [
            [
                { text: '✨ Принять квест', callback_data: `quest_accept_${questId}` },
                { text: '📖 Условие', callback_data: `quest_details_${questId}` },
            ],
            [{ text: '🎁 Награда', callback_data: `quest_rewards_${questId}` }],
            [{ text: '🔙 Назад', callback_data: 'btn_menu' }],
        ],
    };
}

export function getLeaderboardKeyboard(): InlineKeyboard {
    return {
        inline_keyboard: [
            [
                { text: '🌍 Глобальный', callback_data: 'leaderboard_global' },
                { text: '📅 Неделя', callback_data: 'leaderboard_weekly' },
            ],
            [
                { text: '💻 По языкам', callback_data: 'leaderboard_languages' },
                { text: '🔝 Топ-100', callback_data: 'leaderboard_top100' },
            ],
            [{ text: '🔙 Назад', callback_data: 'btn_menu' }],
        ],
    };
}

export function getPaginationKeyboard(
    currentPage: number,
    totalPages: number,
    baseCallback: string
): InlineKeyboard {
    const buttons: { text: string; callback_data: string }[][] = [];
    const navigation: { text: string; callback_data: string }[] = [];

    if (currentPage > 1) {
        navigation.push({
            text: '⬅️ Назад',
            callback_data: `${baseCallback}_${currentPage - 1}`,
        });
    }

    navigation.push({
        text: `${currentPage}/${totalPages}`,
        callback_data: 'noop',
    });

    if (currentPage < totalPages) {
        navigation.push({
            text: 'Далее ➡️',
            callback_data: `${baseCallback}_${currentPage + 1}`,
        });
    }

    buttons.push(navigation);
    buttons.push([{ text: '🔙 Назад', callback_data: 'btn_menu' }]);

    return { inline_keyboard: buttons };
}
