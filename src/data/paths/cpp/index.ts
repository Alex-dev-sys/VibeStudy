/**
 * C++ paths content
 * Beginner (55d), Game Dev (80d), Systems (70d)
 */

import type { PathDayContent } from '@/types/learning-paths';
import { CPP_BEGINNER, CPP_GAME_DEV, CPP_SYSTEMS } from '../index';

const createPath = (prefix: string, pathId: string, count: number, topic: string) =>
    Array.from({ length: count }, (_, i) => ({
        day: i + 1,
        topic: `${topic}: День ${i + 1}`,
        topicEn: `${topic}: Day ${i + 1}`,
        description: `C++: ${topic}`,
        theory: `# День ${i + 1}: ${topic}`,
        recap: `Объясни изученное`,
        tasks: [
            { id: `${prefix}-${i + 1}-1`, pathId, day: i + 1, difficulty: 'easy' as const, prompt: 'Упражнение' },
            { id: `${prefix}-${i + 1}-2`, pathId, day: i + 1, difficulty: 'easy' as const, prompt: 'Закрепление' },
            { id: `${prefix}-${i + 1}-3`, pathId, day: i + 1, difficulty: 'medium' as const, prompt: 'Практика' },
            { id: `${prefix}-${i + 1}-4`, pathId, day: i + 1, difficulty: 'medium' as const, prompt: 'Задача' },
            { id: `${prefix}-${i + 1}-5`, pathId, day: i + 1, difficulty: 'hard' as const, prompt: 'Проект' },
        ],
        estimatedMinutes: 45,
    }));

export const beginnerPath = CPP_BEGINNER;
export const beginnerDays: PathDayContent[] = createPath('cpp-b', 'cpp-beginner', 55, 'C++ Основы');

export const gameDevPath = CPP_GAME_DEV;
export const gameDevDays: PathDayContent[] = createPath('cpp-gd', 'cpp-game-dev', 80, 'Game Dev');

export const systemsPath = CPP_SYSTEMS;
export const systemsDays: PathDayContent[] = createPath('cpp-sys', 'cpp-systems', 70, 'Systems');

export default {
    beginner: { path: beginnerPath, days: beginnerDays },
    gameDev: { path: gameDevPath, days: gameDevDays },
    systems: { path: systemsPath, days: systemsDays },
};
