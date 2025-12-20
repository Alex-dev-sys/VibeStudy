/**
 * TypeScript paths content
 * Beginner (35d), Frontend (50d), Full-Stack (70d)
 */

import type { PathDayContent } from '@/types/learning-paths';
import { TS_BEGINNER, TS_FRONTEND, TS_FULLSTACK } from '../index';

// ============= BEGINNER =============
const beginnerTopics = [
    'Введение в TypeScript', 'Типы: примитивы', 'Типы: массивы и объекты', 'Type vs Interface',
    'Union и Intersection', 'Literal Types', 'Type Aliases', 'Опциональные свойства',
    'Readonly', 'Enum', 'Функции и типы', 'Generics: основы',
    'Generics: ограничения', 'Utility Types: Partial, Required', 'Utility Types: Pick, Omit',
    'Utility Types: Record, Exclude', 'Type Guards', 'Discriminated Unions', 'Unknown vs Any',
    'Never', 'Assertion', 'Декларации типов', 'tsconfig.json',
    'Strict mode', 'Модули', 'Namespace', 'Declaration Files',
    'DefinitelyTyped', 'Миграция JS → TS', 'Отладка', 'Best Practices',
    'Проект: библиотека', 'Проект: CLI', 'Проект: типизация', 'Финал',
];

export const beginnerPath = TS_BEGINNER;
export const beginnerDays: PathDayContent[] = beginnerTopics.map((topic, i) => ({
    day: i + 1, topic, topicEn: topic, description: `TypeScript: ${topic}`,
    theory: `# День ${i + 1}: ${topic}`, recap: `Объясни "${topic}"`,
    tasks: [
        { id: `ts-b-${i + 1}-1`, pathId: 'typescript-beginner', day: i + 1, difficulty: 'easy', prompt: 'Упражнение' },
        { id: `ts-b-${i + 1}-2`, pathId: 'typescript-beginner', day: i + 1, difficulty: 'easy', prompt: 'Закрепление' },
        { id: `ts-b-${i + 1}-3`, pathId: 'typescript-beginner', day: i + 1, difficulty: 'medium', prompt: 'Практика' },
        { id: `ts-b-${i + 1}-4`, pathId: 'typescript-beginner', day: i + 1, difficulty: 'medium', prompt: 'Задача' },
        { id: `ts-b-${i + 1}-5`, pathId: 'typescript-beginner', day: i + 1, difficulty: 'hard', prompt: 'Проект' },
    ],
    estimatedMinutes: 35,
}));

// ============= FRONTEND =============
const frontendTopics = Array.from({ length: 50 }, (_, i) => {
    const modules = [
        ...Array(15).fill(null).map((_, j) => `React + TypeScript: day ${j + 1}`),
        ...Array(10).fill(null).map((_, j) => `Styling: day ${j + 1}`),
        ...Array(10).fill(null).map((_, j) => `State: day ${j + 1}`),
        ...Array(10).fill(null).map((_, j) => `Testing: day ${j + 1}`),
        ...Array(5).fill(null).map((_, j) => `Deploy: day ${j + 1}`),
    ];
    return modules[i] || `Day ${i + 1}`;
});

export const frontendPath = TS_FRONTEND;
export const frontendDays: PathDayContent[] = frontendTopics.map((topic, i) => ({
    day: i + 1, topic, topicEn: topic, description: `TS Frontend: ${topic}`,
    theory: `# День ${i + 1}: ${topic}`, recap: `Объясни "${topic}"`,
    tasks: [
        { id: `ts-fe-${i + 1}-1`, pathId: 'typescript-frontend', day: i + 1, difficulty: 'easy', prompt: 'Упражнение' },
        { id: `ts-fe-${i + 1}-2`, pathId: 'typescript-frontend', day: i + 1, difficulty: 'easy', prompt: 'Закрепление' },
        { id: `ts-fe-${i + 1}-3`, pathId: 'typescript-frontend', day: i + 1, difficulty: 'medium', prompt: 'Практика' },
        { id: `ts-fe-${i + 1}-4`, pathId: 'typescript-frontend', day: i + 1, difficulty: 'medium', prompt: 'Задача' },
        { id: `ts-fe-${i + 1}-5`, pathId: 'typescript-frontend', day: i + 1, difficulty: 'hard', prompt: 'Проект' },
    ],
    estimatedMinutes: 40,
}));

// ============= FULLSTACK =============
const fullstackTopics = Array.from({ length: 70 }, (_, i) => `Full-Stack TS: Day ${i + 1}`);

export const fullstackPath = TS_FULLSTACK;
export const fullstackDays: PathDayContent[] = fullstackTopics.map((topic, i) => ({
    day: i + 1, topic, topicEn: topic, description: topic,
    theory: `# День ${i + 1}: ${topic}`, recap: `Объясни "${topic}"`,
    tasks: [
        { id: `ts-fs-${i + 1}-1`, pathId: 'typescript-fullstack', day: i + 1, difficulty: 'easy', prompt: 'Упражнение' },
        { id: `ts-fs-${i + 1}-2`, pathId: 'typescript-fullstack', day: i + 1, difficulty: 'easy', prompt: 'Закрепление' },
        { id: `ts-fs-${i + 1}-3`, pathId: 'typescript-fullstack', day: i + 1, difficulty: 'medium', prompt: 'Практика' },
        { id: `ts-fs-${i + 1}-4`, pathId: 'typescript-fullstack', day: i + 1, difficulty: 'medium', prompt: 'Задача' },
        { id: `ts-fs-${i + 1}-5`, pathId: 'typescript-fullstack', day: i + 1, difficulty: 'hard', prompt: 'Проект' },
    ],
    estimatedMinutes: 45,
}));

export default {
    beginner: { path: beginnerPath, days: beginnerDays },
    frontend: { path: frontendPath, days: frontendDays },
    fullstack: { path: fullstackPath, days: fullstackDays },
};
