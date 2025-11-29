/**
 * Bot Command Handlers
 * 
 * Handlers for bot commands and callback queries
 */

import TelegramBot from 'node-telegram-bot-api';
import { botUsersDB, questsDB } from '@/lib/db/bot-repository';
import questService from '@/lib/modules/quests/service';
import gptLamaClient from '@/lib/modules/mentor/gpt-lama';
import { getMainMenuKeyboard } from '@/lib/ui/keyboards/main-menu';
import { formatUserStats } from '@/lib/ui/messages/formatters';

/**
 * Register all bot command handlers
 */
export function registerCommandHandlers(bot: TelegramBot) {
    // /start command
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const telegramId = msg.from!.id;
        const firstName = msg.from?.first_name || 'друг';

        // Create or get user
        let user = await botUsersDB.getUser(telegramId);

        if (!user) {
            user = await botUsersDB.createUser({
                telegram_id: telegramId,
                telegram_username: msg.from?.username,
                first_name: msg.from!.first_name,
                last_name: msg.from?.last_name,
            });

            console.log(`✅ New bot user registered: ${telegramId}`);
        }

        await bot.sendMessage(
            chatId,
            `👋 Привет, ${firstName}! Добро пожаловать в VibeStudy!\n\n` +
            `Я твой персональный помощник в обучении программированию.\n\n` +
            `🎯 Что я умею:\n` +
            `• Следить за твоим прогрессом\n` +
            `• Давать ежедневные квесты\n` +
            `• Помогать с кодом через AI Mentor\n` +
            `• Показывать рейтинги\n\n` +
            `Используй меню ниже для навигации! 👇`,
            { reply_markup: getMainMenuKeyboard() }
        );
    });

    // /menu command
    bot.onText(/\/menu/, async (msg) => {
        const chatId = msg.chat.id;

        await bot.sendMessage(
            chatId,
            '📋 *Главное меню*\n\nВыбери действие:',
            {
                parse_mode: 'Markdown',
                reply_markup: getMainMenuKeyboard(),
            }
        );
    });

    // /stats command
    bot.onText(/\/stats/, async (msg) => {
        const chatId = msg.chat.id;
        const telegramId = msg.from!.id;

        const user = await botUsersDB.getUser(telegramId);

        if (!user) {
            await bot.sendMessage(chatId, '⚠️ Пользователь не найден. Используй /start');
            return;
        }

        const statsMessage = formatUserStats({
            level: user.level,
            xp: user.xp,
            tasks_solved: user.tasks_solved,
            current_streak: user.current_streak,
        });

        await bot.sendMessage(chatId, statsMessage, {
            parse_mode: 'Markdown',
            reply_markup: getMainMenuKeyboard(),
        });
    });

    // /quests command
    bot.onText(/\/quests/, async (msg) => {
        const chatId = msg.chat.id;
        const telegramId = msg.from!.id;

        const quests = await questService.getDailyQuests(telegramId);

        const questLines = quests.map(q => {
            const progress = `${q.progress}/${q.target}`;
            const status = q.completed_at ? '✅' : '⏳';
            return `${status} *${q.name}*\n   ${q.description}\n   Прогресс: ${progress} | Награда: ${q.xp_reward} XP`;
        });

        const message = `🎯 *Твои квесты на сегодня*\n\n${questLines.join('\n\n')}`;

        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: getMainMenuKeyboard(),
        });
    });

    // Handle callback queries (button clicks)
    bot.on('callback_query', async (query) => {
        const chatId = query.message!.chat.id;
        const telegramId = query.from.id;
        const data = query.data!;

        // Answer callback to remove loading state
        await bot.answerCallbackQuery(query.id);

        switch (data) {
            case 'btn_stats':
                const user = await botUsersDB.getUser(telegramId);
                if (user) {
                    const statsMessage = formatUserStats({
                        level: user.level,
                        xp: user.xp,
                        tasks_solved: user.tasks_solved,
                        current_streak: user.current_streak,
                    });
                    await bot.sendMessage(chatId, statsMessage, {
                        parse_mode: 'Markdown',
                        reply_markup: getMainMenuKeyboard(),
                    });
                }
                break;

            case 'btn_quests':
                const quests = await questService.getDailyQuests(telegramId);
                const questLines = quests.map(q => {
                    const progress = `${q.progress}/${q.target}`;
                    const status = q.completed_at ? '✅' : '⏳';
                    return `${status} *${q.name}*\n   ${q.description}\n   Прогресс: ${progress} | +${q.xp_reward} XP`;
                });

                await bot.sendMessage(chatId, `🎯 *Твои квесты*\n\n${questLines.join('\n\n')}`, {
                    parse_mode: 'Markdown',
                    reply_markup: getMainMenuKeyboard(),
                });
                break;

            default:
                await bot.sendMessage(chatId, '⚠️ В разработке...', {
                    reply_markup: getMainMenuKeyboard(),
                });
        }
    });

    // Handle text messages (for AI Mentor)
    bot.on('message', async (msg) => {
        // Ignore commands
        if (msg.text?.startsWith('/')) return;

        const chatId = msg.chat.id;
        const telegramId = msg.from!.id;
        const text = msg.text;

        if (!text) return;

        // Send "typing" action
        await bot.sendChatAction(chatId, 'typing');

        try {
            // Query AI Mentor
            const response = await gptLamaClient.ask(text);

            // Track mentor usage for quest
            await questService.onMentorUsed(telegramId);

            await bot.sendMessage(chatId, `🤖 *AI Mentor:*\n\n${response}`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '👍 Полезно', callback_data: 'mentor_helpful' },
                            { text: '👎 Не помогло', callback_data: 'mentor_not_helpful' },
                        ],
                        [{ text: '🔙 Назад', callback_data: 'btn_menu' }],
                    ],
                },
            });
        } catch (error) {
            console.error('AI Mentor error:', error);
            await bot.sendMessage(
                chatId,
                '❌ Не удалось получить ответ от AI Mentor. Попробуйте еще раз.',
                { reply_markup: getMainMenuKeyboard() }
            );
        }
    });

    console.log('✅ Command handlers registered');
}
