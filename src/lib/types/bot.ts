/**
 * Bot TypeScript Type Definitions
 */

export interface BotUser {
    telegram_id: number;
    telegram_username?: string;
    first_name: string;
    last_name?: string;
    level: number;
    xp: number;
    tasks_solved: number;
    current_streak: number;
    main_language?: string;
    created_at: Date;
    last_activity: Date;
    is_active: boolean;
}

export interface BotMessage {
    chatId: number;
    text: string;
    parseMode?: 'Markdown' | 'HTML';
    replyMarkup?: any;
}

export type BotCommand = 'start' | 'help' | 'menu' | 'stats' | 'profile';
