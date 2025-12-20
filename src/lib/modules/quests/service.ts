/**
 * Quest Service
 * 
 * Business logic for quest management
 */

import { questsDB, botUsersDB, badgesDB } from '@/lib/db/bot-repository';

export interface DailyQuestTemplate {
    id: string;
    name: string;
    description: string;
    target: number;
    xpReward: number;
}

// Daily quest templates
const DAILY_QUESTS: DailyQuestTemplate[] = [
    {
        id: 'daily_solve_3',
        name: 'Решить 3 задачи',
        description: 'Реши 3 задачи сегодня',
        target: 3,
        xpReward: 50,
    },
    {
        id: 'daily_use_mentor',
        name: 'Спроси AI Mentor',
        description: 'Используй AI Mentor хотя бы 1 раз',
        target: 1,
        xpReward: 20,
    },
    {
        id: 'daily_streak',
        name: 'Поддержи серию',
        description: 'Занимайся сегодня, чтобы не потерять серию',
        target: 1,
        xpReward: 30,
    },
];

export class QuestService {
    /**
     * Get user's daily quests
     */
    async getDailyQuests(telegramId: number) {
        const quests = await questsDB.getDailyQuests(telegramId);

        // If no quests for today, generate new ones
        if (quests.length === 0) {
            return this.generateDailyQuests(telegramId);
        }

        return quests;
    }

    /**
     * Generate new daily quests for user
     */
    private async generateDailyQuests(telegramId: number) {
        const quests = [];

        for (const template of DAILY_QUESTS) {
            const quest = await questsDB.createQuest({
                telegram_id: telegramId,
                quest_id: template.id,
                quest_type: 'daily',
                name: template.name,
                description: template.description,
                target: template.target,
                xp_reward: template.xpReward,
            });

            quests.push(quest);
        }

        return quests;
    }

    /**
     * Update quest progress
     */
    async updateProgress(telegramId: number, questId: string, increment: number = 1) {
        const quests = await questsDB.getDailyQuests(telegramId);
        const quest = quests.find(q => q.quest_id === questId);

        if (!quest) return null;

        const newProgress = Math.min(quest.progress + increment, quest.target);

        // Update progress
        const updated = await questsDB.updateQuestProgress(telegramId, questId, newProgress);

        // Check if completed
        if (newProgress >= quest.target && !quest.completed_at) {
            return this.completeQuest(telegramId, questId);
        }

        return updated;
    }

    /**
     * Complete quest
     */
    async completeQuest(telegramId: number, questId: string) {
        const completed = await questsDB.completeQuest(telegramId, questId);

        if (completed) {
            // Update streak
            await botUsersDB.updateStreak(telegramId);

            // Check and award badges
            const badges = await badgesDB.checkAndAwardBadges(telegramId);

            return { ...completed, newBadges: badges };
        }

        return completed;
    }

    /**
     * Handle task completion (called from webhook)
     */
    async onTaskCompleted(telegramId: number) {
        // Update "solve 3 tasks" quest
        const result = await this.updateProgress(telegramId, 'daily_solve_3', 1);

        // Update streak quest
        await this.updateProgress(telegramId, 'daily_streak', 1);

        return result;
    }

    /**
     * Handle AI Mentor usage
     */
    async onMentorUsed(telegramId: number) {
        return this.updateProgress(telegramId, 'daily_use_mentor', 1);
    }
}

const questService = new QuestService();

export default questService;
