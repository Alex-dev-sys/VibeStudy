/**
 * Go paths content
 * Beginner (40d), Backend (50d), DevOps (60d)
 */

import type { PathDayContent } from '@/types/learning-paths';
import { GO_BEGINNER, GO_BACKEND, GO_DEVOPS } from '../index';

const createPath = (prefix: string, pathId: string, count: number, topic: string) =>
    Array.from({ length: count }, (_, i) => ({
        day: i + 1,
        topic: `${topic}: День ${i + 1}`,
        topicEn: `${topic}: Day ${i + 1}`,
        description: `Go: ${topic}`,
        theory: `# День ${i + 1}: ${topic}`,
        recap: `Объясни изученное`,
        tasks: [
            { id: `${prefix}-${i + 1}-1`, pathId, day: i + 1, difficulty: 'easy' as const, prompt: 'Упражнение' },
            { id: `${prefix}-${i + 1}-2`, pathId, day: i + 1, difficulty: 'easy' as const, prompt: 'Закрепление' },
            { id: `${prefix}-${i + 1}-3`, pathId, day: i + 1, difficulty: 'medium' as const, prompt: 'Практика' },
            { id: `${prefix}-${i + 1}-4`, pathId, day: i + 1, difficulty: 'medium' as const, prompt: 'Задача' },
            { id: `${prefix}-${i + 1}-5`, pathId, day: i + 1, difficulty: 'hard' as const, prompt: 'Проект' },
        ],
        estimatedMinutes: 40,
    }));

export const beginnerPath = GO_BEGINNER;
export const beginnerDays: PathDayContent[] = createPath('go-b', 'go-beginner', 40, 'Go Основы');

export const backendPath = GO_BACKEND;
export const backendDays: PathDayContent[] = createPath('go-be', 'go-backend', 50, 'Go Backend');

export const devopsPath = GO_DEVOPS;
export const devopsDays: PathDayContent[] = createPath('go-do', 'go-devops', 60, 'DevOps');

const goPaths = {
    beginner: { path: beginnerPath, days: beginnerDays },
    backend: { path: backendPath, days: backendDays },
    devops: { path: devopsPath, days: devopsDays },
};

export default goPaths;
