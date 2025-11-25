/**
 * Bot Database Repository
 * 
 * Functions for interacting with bot-specific tables in Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// BOT USERS Repository
// ============================================================================

export const botUsersDB = {
    async getUser(telegramId: number) {
        const { data, error } = await supabase
            .from('bot_users')
            .select('*')
            .eq('telegram_id', telegramId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async createUser(userData: {
        telegram_id: number;
        telegram_username?: string;
        first_name: string;
        last_name?: string;
    }) {
        const { data, error } = await supabase
            .from('bot_users')
            .insert([{
                ...userData,
                level: 1,
                xp: 0,
                tasks_solved: 0,
                current_streak: 0,
                created_at: new Date(),
                last_activity: new Date(),
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateUser(telegramId: number, updates: any) {
        const { data, error } = await supabase
            .from('bot_users')
            .update({
                ...updates,
                updated_at: new Date(),
            })
            .eq('telegram_id', telegramId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async incrementXP(telegramId: number, xpAmount: number) {
        const { data, error } = await supabase
            .rpc('update_user_xp', {
                p_telegram_id: telegramId,
                p_xp_amount: xpAmount,
            });

        if (error) throw error;
        return data?.[0];
    },

    async updateStreak(telegramId: number) {
        const { data, error } = await supabase
            .rpc('update_user_streak', {
                p_telegram_id: telegramId,
            });

        if (error) throw error;
        return data;
    },
};

// ============================================================================
// QUESTS Repository
// ============================================================================

export const questsDB = {
    async getDailyQuests(telegramId: number) {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('user_quests')
            .select('*')
            .eq('telegram_id', telegramId)
            .eq('quest_date', today)
            .eq('quest_type', 'daily')
            .eq('is_expired', false);

        if (error) throw error;
        return data || [];
    },

    async createQuest(questData: {
        telegram_id: number;
        quest_id: string;
        quest_type: string;
        name: string;
        description?: string;
        target: number;
        xp_reward: number;
    }) {
        const { data, error } = await supabase
            .from('user_quests')
            .insert([{
                ...questData,
                progress: 0,
                quest_date: new Date().toISOString().split('T')[0],
                created_at: new Date(),
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateQuestProgress(telegramId: number, questId: string, progress: number) {
        const { data, error } = await supabase
            .from('user_quests')
            .update({ progress })
            .eq('telegram_id', telegramId)
            .eq('quest_id', questId)
            .is('completed_at', null)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async completeQuest(telegramId: number, questId: string) {
        // First get the quest to know the target value
        const { data: currentQuest } = await supabase
            .from('user_quests')
            .select('target, xp_reward')
            .eq('telegram_id', telegramId)
            .eq('quest_id', questId)
            .is('completed_at', null)
            .single();

        if (!currentQuest) {
            return null;
        }

        // Update the quest with target progress
        const { data: quest, error } = await supabase
            .from('user_quests')
            .update({
                completed_at: new Date(),
                progress: currentQuest.target, // Set progress to target
            })
            .eq('telegram_id', telegramId)
            .eq('quest_id', questId)
            .is('completed_at', null)
            .select()
            .single();

        if (error) throw error;

        // Award XP
        if (quest?.xp_reward) {
            await botUsersDB.incrementXP(telegramId, quest.xp_reward);
        }

        return quest;
    },
};

// ============================================================================
// LEADERBOARD Repository
// ============================================================================

export const leaderboardDB = {
    async getGlobalLeaderboard(limit: number = 50) {
        const { data, error } = await supabase
            .from('bot_users')
            .select('telegram_id, telegram_username, first_name, level, xp, tasks_solved, current_streak')
            .eq('is_active', true)
            .order('xp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    async getWeeklyLeaderboard(limit: number = 25) {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const { data, error } = await supabase
            .from('bot_users')
            .select('telegram_id, telegram_username, first_name, level, xp, tasks_solved')
            .eq('is_active', true)
            .gte('last_activity', weekAgo.toISOString())
            .order('xp', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    async getUserRank(telegramId: number) {
        const { data: users, error } = await supabase
            .from('bot_users')
            .select('telegram_id, xp')
            .eq('is_active', true)
            .order('xp', { ascending: false });

        if (error) throw error;

        const rank = (users || []).findIndex(u => u.telegram_id === telegramId) + 1;
        const totalUsers = (users || []).length;

        return { rank, totalUsers };
    },
};

// ============================================================================
// BADGES Repository
// ============================================================================

export const badgesDB = {
    async getUserBadges(telegramId: number) {
        const { data, error } = await supabase
            .from('user_badges')
            .select(`
        badge_id,
        earned_at,
        badges (
          name,
          description,
          icon,
          category,
          rarity
        )
      `)
            .eq('telegram_id', telegramId)
            .order('earned_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async awardBadge(telegramId: number, badgeId: string) {
        const { data, error } = await supabase
            .from('user_badges')
            .insert([{
                telegram_id: telegramId,
                badge_id: badgeId,
                earned_at: new Date(),
            }])
            .select()
            .single();

        // Ignore duplicate errors
        if (error && error.code !== '23505') throw error;
        return data;
    },

    async checkAndAwardBadges(telegramId: number) {
        const user = await botUsersDB.getUser(telegramId);
        if (!user) return [];

        const awarded = [];

        // Check task-based badges
        if (user.tasks_solved === 1) {
            await this.awardBadge(telegramId, 'first_steps');
            awarded.push('first_steps');
        }
        if (user.tasks_solved === 10) {
            await this.awardBadge(telegramId, 'task_solver');
            awarded.push('task_solver');
        }
        if (user.tasks_solved === 50) {
            await this.awardBadge(telegramId, 'task_master');
            awarded.push('task_master');
        }

        // Check streak badges
        if (user.current_streak === 7) {
            await this.awardBadge(telegramId, 'week_streak');
            awarded.push('week_streak');
        }
        if (user.current_streak === 30) {
            await this.awardBadge(telegramId, 'month_streak');
            awarded.push('month_streak');
        }

        // Check level badges
        if (user.level === 5) {
            await this.awardBadge(telegramId, 'level_5');
            awarded.push('level_5');
        }
        if (user.level === 10) {
            await this.awardBadge(telegramId, 'level_10');
            awarded.push('level_10');
        }

        return awarded;
    },
};

export default {
    botUsersDB,
    questsDB,
    leaderboardDB,
    badgesDB,
};
