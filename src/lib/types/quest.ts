/**
 * Quest Types
 */

export interface Quest {
    id: string;
    telegram_id: number;
    quest_id: string;
    quest_type: 'daily' | 'weekly' | 'special' | 'seasonal';
    name: string;
    description?: string;
    progress: number;
    target: number;
    xp_reward: number;
    badge_reward?: string;
    quest_date: string;
    accepted_at?: Date;
    completed_at?: Date;
    expires_at?: Date;
    created_at: Date;
    is_expired: boolean;
}

export interface QuestReward {
    xp: number;
    badge?: string;
    newBadges?: string[];
}
