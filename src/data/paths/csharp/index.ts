/**
 * C# paths content
 * Beginner (45d), Unity Game Dev (70d), .NET Dev (55d)
 */

import type { PathDayContent } from '@/types/learning-paths';
import { CSHARP_BEGINNER, CSHARP_GAME_UNITY, CSHARP_DOTNET } from '../index';

const createPath = (prefix: string, pathId: string, count: number, topic: string) =>
    Array.from({ length: count }, (_, i) => ({
        day: i + 1,
        topic: `${topic}: День ${i + 1}`,
        topicEn: `${topic}: Day ${i + 1}`,
        description: `C#: ${topic}`,
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

export const beginnerPath = CSHARP_BEGINNER;
export const beginnerDays: PathDayContent[] = createPath('cs-b', 'csharp-beginner', 45, 'C# Основы');

export const unityPath = CSHARP_GAME_UNITY;
export const unityDays: PathDayContent[] = createPath('cs-unity', 'csharp-game-unity', 70, 'Unity');

export const dotnetPath = CSHARP_DOTNET;
export const dotnetDays: PathDayContent[] = createPath('cs-net', 'csharp-dotnet', 55, '.NET');

const csharpPaths = {
    beginner: { path: beginnerPath, days: beginnerDays },
    unity: { path: unityPath, days: unityDays },
    dotnet: { path: dotnetPath, days: dotnetDays },
};

export default csharpPaths;
