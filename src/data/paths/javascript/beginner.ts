/**
 * JavaScript Beginner Path Content
 * 40 days from zero to JS fundamentals
 */

import type { PathDayContent } from '@/types/learning-paths';
import { JS_BEGINNER } from '../index';

export const path = JS_BEGINNER;

const topics = [
    // Week 1: Basics
    { topic: 'Введение в JavaScript', topicEn: 'Introduction to JavaScript', category: 'basics' },
    { topic: 'Переменные: let, const, var', topicEn: 'Variables: let, const, var', category: 'basics' },
    { topic: 'Типы данных', topicEn: 'Data Types', category: 'basics' },
    { topic: 'Строки и шаблонные литералы', topicEn: 'Strings and Template Literals', category: 'basics' },
    { topic: 'Числа и математика', topicEn: 'Numbers and Math', category: 'basics' },
    { topic: 'Операторы сравнения', topicEn: 'Comparison Operators', category: 'basics' },
    { topic: 'Условные операторы', topicEn: 'Conditional Statements', category: 'basics' },

    // Week 2: Control Flow & Arrays
    { topic: 'Циклы: for, while', topicEn: 'Loops: for, while', category: 'basics' },
    { topic: 'Циклы: for...of, for...in', topicEn: 'Loops: for...of, for...in', category: 'basics' },
    { topic: 'Массивы: создание и доступ', topicEn: 'Arrays: Creation and Access', category: 'data-structures' },
    { topic: 'Методы массивов: push, pop, shift', topicEn: 'Array Methods: push, pop, shift', category: 'data-structures' },
    { topic: 'Методы массивов: map, filter', topicEn: 'Array Methods: map, filter', category: 'data-structures' },
    { topic: 'Методы массивов: reduce, find', topicEn: 'Array Methods: reduce, find', category: 'data-structures' },
    { topic: 'Spread и Rest операторы', topicEn: 'Spread and Rest Operators', category: 'advanced' },

    // Week 3: Functions & Objects
    { topic: 'Функции: объявление', topicEn: 'Functions: Declaration', category: 'basics' },
    { topic: 'Стрелочные функции', topicEn: 'Arrow Functions', category: 'basics' },
    { topic: 'Параметры по умолчанию', topicEn: 'Default Parameters', category: 'basics' },
    { topic: 'Замыкания', topicEn: 'Closures', category: 'advanced' },
    { topic: 'Объекты: создание', topicEn: 'Objects: Creation', category: 'data-structures' },
    { topic: 'Методы объектов', topicEn: 'Object Methods', category: 'data-structures' },
    { topic: 'Деструктуризация', topicEn: 'Destructuring', category: 'advanced' },

    // Week 4: DOM & Events
    { topic: 'DOM: введение', topicEn: 'DOM: Introduction', category: 'web' },
    { topic: 'DOM: выборка элементов', topicEn: 'DOM: Selecting Elements', category: 'web' },
    { topic: 'DOM: изменение элементов', topicEn: 'DOM: Modifying Elements', category: 'web' },
    { topic: 'DOM: создание элементов', topicEn: 'DOM: Creating Elements', category: 'web' },
    { topic: 'События: addEventListener', topicEn: 'Events: addEventListener', category: 'web' },
    { topic: 'События: event object', topicEn: 'Events: Event Object', category: 'web' },
    { topic: 'Формы и валидация', topicEn: 'Forms and Validation', category: 'web' },

    // Week 5: Async & Modern JS
    { topic: 'Callbacks', topicEn: 'Callbacks', category: 'advanced' },
    { topic: 'Promises', topicEn: 'Promises', category: 'advanced' },
    { topic: 'Async/Await', topicEn: 'Async/Await', category: 'advanced' },
    { topic: 'Fetch API', topicEn: 'Fetch API', category: 'web' },
    { topic: 'Error Handling', topicEn: 'Error Handling', category: 'advanced' },
    { topic: 'Модули: import/export', topicEn: 'Modules: import/export', category: 'advanced' },
    { topic: 'LocalStorage и SessionStorage', topicEn: 'LocalStorage and SessionStorage', category: 'web' },

    // Week 6: Practice
    { topic: 'ES6+ фичи обзор', topicEn: 'ES6+ Features Overview', category: 'advanced' },
    { topic: 'Проект: Todo App', topicEn: 'Project: Todo App', category: 'project' },
    { topic: 'Проект: Fetch данные', topicEn: 'Project: Fetch Data', category: 'project' },
    { topic: 'Финальный проект', topicEn: 'Final Project', category: 'project' },
];

export const days: PathDayContent[] = topics.map((t, i) => ({
    day: i + 1,
    topic: t.topic,
    topicEn: t.topicEn,
    description: `JavaScript: ${t.topic}`,
    category: (t as any).category,
    theory: `# День ${i + 1}: ${t.topic}\n\nИзучаем: **${t.topic}**`,
    recap: `Объясни "${t.topic}" своими словами`,
    tasks: [
        { id: `js-b-${i + 1}-1`, pathId: 'javascript-beginner', day: i + 1, difficulty: 'easy', prompt: `Упражнение: ${t.topic}` },
        { id: `js-b-${i + 1}-2`, pathId: 'javascript-beginner', day: i + 1, difficulty: 'easy', prompt: 'Закрепление' },
        { id: `js-b-${i + 1}-3`, pathId: 'javascript-beginner', day: i + 1, difficulty: 'medium', prompt: 'Практика' },
        { id: `js-b-${i + 1}-4`, pathId: 'javascript-beginner', day: i + 1, difficulty: 'medium', prompt: 'Задача' },
        { id: `js-b-${i + 1}-5`, pathId: 'javascript-beginner', day: i + 1, difficulty: 'hard', prompt: 'Мини-проект' },
    ],
    estimatedMinutes: 35,
}));

export default { path, days };
