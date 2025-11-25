/**
 * Task Completed Webhook
 * 
 * Receives notifications from web app when user completes a task
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/lib/bot/client';
import { botUsersDB } from '@/lib/db/bot-repository';
import questService from '@/lib/modules/quests/service';

export async function POST(req: NextRequest) {
    try {
        const { telegram_id, task_id, xp_earned, time_spent } = await req.json();

        // Validate request
        if (!telegram_id || !task_id || xp_earned === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get bot instance
        const bot = getBot();
        if (!bot) {
            return NextResponse.json(
                { ok: false, error: 'Bot not initialized' },
                { status: 500 }
            );
        }

        // Update user progress
        const user = await botUsersDB.getUser(telegram_id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Add XP
        const xpResult = await botUsersDB.incrementXP(telegram_id, xp_earned);

        // Update quest progress
        const questResult = await questService.onTaskCompleted(telegram_id);

        // Send notification to user
        let message = `🎉 *Отлично сделано!* Задача решена!\n\n`;

        if (xp_earned > 0) {
            message += `✨ +${xp_earned} XP\n`;
        }

        if (xpResult) {
            message += `📈 Уровень: ${xpResult.new_level}\n`;
            message += `✨ XP: ${xpResult.new_xp}/${xpResult.new_level * 500}\n`;

            if (xpResult.level_up) {
                message += `\n🎊 *Поздравляем! Новый уровень ${xpResult.new_level}!* 🎊\n`;
            }
        }

        if (time_spent) {
            message += `⏱ Время: ${time_spent}\n`;
        }

        // Check if quest was completed
        if (questResult?.completed_at) {
            message += `\n🎯 Квест завершен: "${questResult.name}"!`;

            if (questResult.newBadges && questResult.newBadges.length > 0) {
                message += `\n🏅 Новый бейдж получен!`;
            }
        }

        await bot.sendMessage(telegram_id, message, {
            parse_mode: 'Markdown',
        });

        console.log(`✅ Task completion processed for user ${telegram_id}`);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Task completion webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
