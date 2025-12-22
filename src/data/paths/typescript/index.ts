/**
 * TypeScript paths content
 * Beginner (35d), Frontend (50d), Full-Stack (70d)
 */

import type { PathDayContent } from '@/types/learning-paths';
import { TS_BEGINNER, TS_FRONTEND, TS_FULLSTACK } from '../index';

// ============= BEGINNER =============
const beginnerTopics = [
    { topic: 'Введение в TypeScript', category: 'basics' },
    { topic: 'Типы: примитивы', category: 'basics' },
    { topic: 'Типы: массивы и объекты', category: 'data-structures' },
    { topic: 'Type vs Interface', category: 'basics' },
    { topic: 'Union и Intersection', category: 'types' },
    { topic: 'Literal Types', category: 'types' },
    { topic: 'Type Aliases', category: 'types' },
    { topic: 'Опциональные свойства', category: 'types' },
    { topic: 'Readonly', category: 'types' },
    { topic: 'Enum', category: 'types' },
    { topic: 'Функции и типы', category: 'basics' },
    { topic: 'Generics: основы', category: 'generics' },
    { topic: 'Generics: ограничения', category: 'generics' },
    { topic: 'Utility Types: Partial, Required', category: 'utils' },
    { topic: 'Utility Types: Pick, Omit', category: 'utils' },
    { topic: 'Utility Types: Record, Exclude', category: 'utils' },
    { topic: 'Type Guards', category: 'advanced' },
    { topic: 'Discriminated Unions', category: 'advanced' },
    { topic: 'Unknown vs Any', category: 'types' },
    { topic: 'Never', category: 'types' },
    { topic: 'Assertion', category: 'types' },
    { topic: 'Декларации типов', category: 'advanced' },
    { topic: 'tsconfig.json', category: 'config' },
    { topic: 'Strict mode', category: 'config' },
    { topic: 'Модули', category: 'basics' },
    { topic: 'Namespace', category: 'advanced' },
    { topic: 'Declaration Files', category: 'advanced' },
    { topic: 'DefinitelyTyped', category: 'ecosystem' },
    { topic: 'Миграция JS → TS', category: 'migration' },
    { topic: 'Отладка', category: 'tools' },
    { topic: 'Best Practices', category: 'best-practices' },
    { topic: 'Проект: библиотека', category: 'project' },
    { topic: 'Проект: CLI', category: 'project' },
    { topic: 'Проект: типизация', category: 'project' },
    { topic: 'Финал', category: 'project' },
];

export const beginnerPath = TS_BEGINNER;
export const beginnerDays: PathDayContent[] = beginnerTopics.map((t, i) => ({
    day: i + 1, topic: t.topic, topicEn: t.topic, description: `TypeScript: ${t.topic}`,
    category: t.category,
    theory: `# День ${i + 1}: ${t.topic}`, recap: `Объясни "${t.topic}"`,
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
        ...Array(15).fill(null).map((_, j) => ({ topic: `React + TypeScript: day ${j + 1}`, category: 'react' })),
        ...Array(10).fill(null).map((_, j) => ({ topic: `Styling: day ${j + 1}`, category: 'styling' })),
        ...Array(10).fill(null).map((_, j) => ({ topic: `State: day ${j + 1}`, category: 'state' })),
        ...Array(10).fill(null).map((_, j) => ({ topic: `Testing: day ${j + 1}`, category: 'testing' })),
        ...Array(5).fill(null).map((_, j) => ({ topic: `Deploy: day ${j + 1}`, category: 'devops' })),
    ];
    return modules[i] || { topic: `Day ${i + 1}`, category: 'frontend' };
});

export const frontendPath = TS_FRONTEND;
export const frontendDays: PathDayContent[] = frontendTopics.map((t, i) => ({
    day: i + 1, topic: t.topic, topicEn: t.topic, description: `TS Frontend: ${t.topic}`,
    category: t.category,
    theory: `# День ${i + 1}: ${t.topic}`, recap: `Объясни "${t.topic}"`,
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
const fullstackTopics = Array.from({ length: 70 }, (_, i) => ({ topic: `Full-Stack TS: Day ${i + 1}`, category: 'fullstack' }));

export const fullstackPath = TS_FULLSTACK;
export const fullstackDays: PathDayContent[] = fullstackTopics.map((t, i) => ({
    day: i + 1, topic: t.topic, topicEn: t.topic, description: t.topic,
    category: t.category,
    theory: `# День ${i + 1}: ${t.topic}`, recap: `Объясни "${t.topic}"`,
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
