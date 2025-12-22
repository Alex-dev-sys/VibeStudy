import { PathDayContent } from '@/types/learning-paths';
import { DayTheme, Difficulty, DayCategory } from './types';

/**
 * Maps PathDayContent to DayTheme format for backward compatibility and theme components.
 * @param days List of day content from a learning path
 * @param defaultCategory Default category if not inferable
 */
export const mapDaysToThemes = (days: PathDayContent[], defaultCategory: DayCategory = 'basics'): DayTheme[] => {
    return days.map(day => {
        // Infer difficulty from tasks if possible, otherwise default to 2
        const avgDifficulty = day.tasks && day.tasks.length > 0
            ? day.tasks.reduce((acc, t) => acc + (t.difficulty === 'hard' ? 3 : t.difficulty === 'medium' ? 2 : 1), 0) / day.tasks.length
            : 2;

        const difficulty = Math.min(Math.ceil(avgDifficulty) + 1, 5) as Difficulty;

        return {
            day: day.day,
            topic: day.topic,
            difficulty,
            category: (day.category as DayCategory) || defaultCategory,
            practiceType: (day.practiceType as any) || 'coding'
        };
    });
};
