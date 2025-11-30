import TelegramBot from 'node-telegram-bot-api';
import { bot } from '../core';
import { TEXT } from '../ui/text';
import { KEYBOARDS } from '../ui/keyboards';
import { getTelegramProfileByTelegramId, getAnalyticsSummary } from '../../telegram/database';

export const handleCallback = async (query: TelegramBot.CallbackQuery) => {
    const chatId = query.message?.chat.id;
    const telegramUserId = query.from.id;
    const data = query.data;

    if (!chatId || !data) return;

    // Answer callback to stop loading animation
    await bot.answerCallbackQuery(query.id);

    console.log(`Callback received: ${data}`);

    switch (data) {
        case 'menu_main':
            await bot.editMessageText(TEXT.MENU_HEADER, {
                chat_id: chatId,
                message_id: query.message?.message_id,
                parse_mode: 'Markdown',
                reply_markup: KEYBOARDS.MAIN_MENU
            });
            break;

        case 'menu_help':
            await bot.editMessageText(TEXT.HELP, {
                chat_id: chatId,
                message_id: query.message?.message_id,
                parse_mode: 'Markdown',
                reply_markup: KEYBOARDS.BACK_TO_MENU
            });
            break;

        case 'menu_stats':
            try {
                const { data: profile } = await getTelegramProfileByTelegramId(telegramUserId);

                if (!profile) {
                    await bot.editMessageText(TEXT.NOT_REGISTERED, {
                        chat_id: chatId,
                        message_id: query.message?.message_id,
                        parse_mode: 'Markdown',
                        reply_markup: KEYBOARDS.BACK_TO_MENU
                    });
                    return;
                }

                const { data: stats } = await getAnalyticsSummary(profile.user_id);

                const statsText = stats
                    ? `📊 *Твоя статистика*\n\n📅 Дней обучения: ${stats.total_days_tracked}\n✅ Выполнено заданий: ${stats.total_tasks_completed}\n⏱️ Общее время: ${Math.round(stats.total_study_time / 60)} ч.`
                    : '📊 *Статистика недоступна*';

                await bot.editMessageText(statsText, {
                    chat_id: chatId,
                    message_id: query.message?.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: KEYBOARDS.BACK_TO_MENU
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
                await bot.editMessageText(TEXT.ERROR, {
                    chat_id: chatId,
                    message_id: query.message?.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: KEYBOARDS.BACK_TO_MENU
                });
            }
            break;

        case 'menu_settings':
            await bot.editMessageText('⚙️ *Настройки*\n\nЗдесь скоро появятся настройки уведомлений и языка.', {
                chat_id: chatId,
                message_id: query.message?.message_id,
                parse_mode: 'Markdown',
                reply_markup: KEYBOARDS.BACK_TO_MENU
            });
            break;

        default:
            await bot.sendMessage(chatId, 'Функция в разработке', {
                reply_markup: KEYBOARDS.BACK_TO_MENU
            });
    }
};
