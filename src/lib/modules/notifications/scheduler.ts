/**
 * Notification Scheduler
 * 
 * Automated tasks using node-cron:
 * - Daily quest reset
 * - Weekly leaderboard reset
 * - Reminder notifications
 */

import cron from 'node-cron';
import { getBot } from '@/lib/bot/client';
import { questsDB, botUsersDB } from '@/lib/db/bot-repository';
import questService from '@/lib/modules/quests/service';
import leaderboardService from '@/lib/modules/leaderboard/service';

export class NotificationScheduler {
    private jobs: cron.ScheduledTask[] = [];

    /**
     * Start all scheduled jobs
     */
    start() {
        console.log('⏰ Starting notification scheduler...');

        this.startDailyQuestReset();
        this.startWeeklyLeaderboardReset();
        this.startInactivityReminders();

        console.log(`✅ Started ${this.jobs.length} scheduled jobs`);
    }

    /**
     * Stop all scheduled jobs
     */
    stop() {
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        console.log('⏰ Stopped all scheduled jobs');
    }

    /**
     * Daily quest reset at midnight UTC
     */
    private startDailyQuestReset() {
        // Run at 00:00 UTC every day
        const job = cron.schedule('0 0 * * *', async () => {
            console.log('🔄 Running daily quest reset...');

            try {
                const bot = getBot();
                if (!bot) return;

                // Mark old quests as expired
                const { error } = await getSupabase()
                    .from('user_quests')
                    .update({ is_expired: true })
                    .eq('quest_type', 'daily')
                    .is('completed_at', null)
                    .lt('quest_date', new Date().toISOString().split('T')[0]);

                if (error) throw error;

                console.log('✅ Daily quest reset completed');
            } catch (error) {
                console.error('❌ Daily quest reset failed:', error);
            }
        });

        this.jobs.push(job);
        console.log('📅 Scheduled: Daily quest reset (00:00 UTC)');
    }

    /**
     * Weekly leaderboard reset on Monday 00:00 UTC
     */
    private startWeeklyLeaderboardReset() {
        // Run at 00:00 UTC every Monday
        const job = cron.schedule('0 0 * * 1', async () => {
            console.log('🔄 Running weekly leaderboard reset...');

            try {
                // Invalidate weekly leaderboard cache
                leaderboardService.invalidate('weekly');

                console.log('✅ Weekly leaderboard cache cleared');
            } catch (error) {
                console.error('❌ Weekly leaderboard reset failed:', error);
            }
        });

        this.jobs.push(job);
        console.log('📅 Scheduled: Weekly leaderboard reset (Monday 00:00 UTC)');
    }

    /**
     * Send reminders to inactive users
     * Runs every day at 10:00 UTC
     */
    private startInactivityReminders() {
        // Run at 10:00 UTC every day
        const job = cron.schedule('0 10 * * *', async () => {
            console.log('🔔 Checking for inactive users...');

            try {
                const bot = getBot();
                if (!bot) return;

                // Find users inactive for 24+ hours
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

                const { data: inactiveUsers, error } = await getSupabase()
                    .from('bot_users')
                    .select('telegram_id, first_name, current_streak, notifications_enabled')
                    .eq('is_active', true)
                    .eq('notifications_enabled', true)
                    .lt('last_activity', oneDayAgo.toISOString());

                if (error) throw error;

                if (!inactiveUsers || inactiveUsers.length === 0) {
                    console.log('ℹ️ No inactive users found');
                    return;
                }

                // Send reminders
                for (const user of inactiveUsers) {
                    try {
                        const message = this.getReminderMessage(user.first_name, user.current_streak);

                        await bot.sendMessage(user.telegram_id, message, {
                            parse_mode: 'Markdown',
                        });

                        console.log(`📨 Reminder sent to ${user.telegram_id}`);
                    } catch (error) {
                        console.error(`Failed to send reminder to ${user.telegram_id}:`, error);
                    }
                }

                console.log(`✅ Sent ${inactiveUsers.length} reminders`);
            } catch (error) {
                console.error('❌ Inactivity reminders failed:', error);
            }
        });

        this.jobs.push(job);
        console.log('📅 Scheduled: Inactivity reminders (10:00 UTC)');
    }

    /**
     * Generate reminder message
     */
    private getReminderMessage(firstName: string, streak: number): string {
        if (streak > 0) {
            return `👋 ${firstName}, не забудь позаниматься сегодня!\n\n` +
                `🔥 Твоя серия: ${streak} дней\n` +
                `Не потеряй прогресс! Реши хотя бы одну задачу.`;
        }

        return `👋 ${firstName}, давно не виделись!\n\n` +
            `Самое время вернуться к обучению. 💪\n` +
            `Даже 15 минут практики помогут!`;
    }
}

// Import getSupabase
import { getSupabase } from '@/lib/db/bot-repository';

// Singleton instance
const scheduler = new NotificationScheduler();

export default scheduler;
