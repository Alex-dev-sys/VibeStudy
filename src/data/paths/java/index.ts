/**
 * Java paths content
 * Beginner (50d), Backend (60d), Android (65d)
 */

import type { PathDayContent } from '@/types/learning-paths';
import { JAVA_BEGINNER, JAVA_BACKEND, JAVA_ANDROID } from '../index';

const createPath = (prefix: string, pathId: string, count: number, topicFn: (i: number) => string) =>
    Array.from({ length: count }, (_, i) => ({
        day: i + 1,
        topic: topicFn(i),
        topicEn: topicFn(i),
        description: `Java: ${topicFn(i)}`,
        theory: `# День ${i + 1}: ${topicFn(i)}`,
        recap: `Объясни "${topicFn(i)}"`,
        tasks: [
            { id: `${prefix}-${i + 1}-1`, pathId, day: i + 1, difficulty: 'easy' as const, prompt: 'Упражнение' },
            { id: `${prefix}-${i + 1}-2`, pathId, day: i + 1, difficulty: 'easy' as const, prompt: 'Закрепление' },
            { id: `${prefix}-${i + 1}-3`, pathId, day: i + 1, difficulty: 'medium' as const, prompt: 'Практика' },
            { id: `${prefix}-${i + 1}-4`, pathId, day: i + 1, difficulty: 'medium' as const, prompt: 'Задача' },
            { id: `${prefix}-${i + 1}-5`, pathId, day: i + 1, difficulty: 'hard' as const, prompt: 'Проект' },
        ],
        estimatedMinutes: 40,
    }));

const beginnerTopics = [
    'Введение в Java', 'JDK и IDE', 'Переменные', 'Типы данных', 'Операторы',
    'Условия', 'Циклы', 'Массивы', 'Методы', 'Классы и объекты',
    'Конструкторы', 'this', 'Инкапсуляция', 'Наследование', 'Полиморфизм',
    'Абстракция', 'Интерфейсы', 'Исключения', 'Коллекции: List', 'Коллекции: Set',
    'Коллекции: Map', 'Generics', 'Stream API', 'Lambda', 'Optional',
    'Файлы и I/O', 'Сериализация', 'Многопоточность', 'Synchronized', 'ExecutorService',
    'CompletableFuture', 'JDBC', 'Maven', 'Gradle', 'JUnit',
    'Mockito', 'Логирование', 'Паттерны: Singleton', 'Паттерны: Factory', 'Паттерны: Builder',
    'Clean Code', 'SOLID', 'Рефакторинг', 'Git', 'Проект: Console App',
    'Проект: CLI', 'Проект: Library', 'Проект: Game', 'Финал', 'Карьера',
];

export const beginnerPath = JAVA_BEGINNER;
export const beginnerDays: PathDayContent[] = createPath('java-b', 'java-beginner', 50, i => beginnerTopics[i] || `Day ${i + 1}`);

export const backendPath = JAVA_BACKEND;
export const backendDays: PathDayContent[] = createPath('java-be', 'java-backend', 60, i => `Spring Boot: Day ${i + 1}`);

export const androidPath = JAVA_ANDROID;
export const androidDays: PathDayContent[] = createPath('java-and', 'java-android', 65, i => `Android: Day ${i + 1}`);

export default {
    beginner: { path: beginnerPath, days: beginnerDays },
    backend: { path: backendPath, days: backendDays },
    android: { path: androidPath, days: androidDays },
};
