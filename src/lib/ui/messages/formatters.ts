/**
 * Message Formatters
 * 
 * Utilities for formatting bot messages
 */

export const EMOJIS = {
    success: '🎉',
    xp: '✨',
    level: '📈',
    streak: '🔥',
    badge: '🏅',
    menu: '📋',
    back: '🔙',
} as const;

export function formatUserStats(stats: {
    level: number;
    xp: number;
    tasks_solved: number;
    current_streak: number;
}): string {
    const nextLevelXP = stats.level * 500;

    return `📊 *Твоя статистика*\n\n` +
        `${EMOJIS.level} Уровень: *${stats.level}*\n` +
        `${EMOJIS.xp} XP: *${stats.xp}* / ${nextLevelXP}\n` +
        `✅ Решено задач: *${stats.tasks_solved}*\n` +
        `${EMOJIS.streak} Серия: *${stats.current_streak}* дней`;
}

export function escapeMarkdown(text: string): string {
    return text
        .replace(/\*/g, '\\*')
        .replace(/_/g, '\\_')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/~/g, '\\~')
        .replace(/`/g, '\\`')
        .replace(/>/g, '\\>');
}
