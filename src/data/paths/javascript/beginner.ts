/**
 * JavaScript Beginner Path Content
 * 40 days from zero to JS fundamentals
 */

import type { PathDayContent } from '@/types/learning-paths';
import { JS_BEGINNER } from '../index';

export const path = JS_BEGINNER;

const topics = [
    // Week 1: Basics
    { topic: 'Введение в JavaScript', topicEn: 'Introduction to JavaScript' },
    { topic: 'Переменные: let, const, var', topicEn: 'Variables: let, const, var' },
    { topic: 'Типы данных', topicEn: 'Data Types' },
    { topic: 'Строки и шаблонные литералы', topicEn: 'Strings and Template Literals' },
    { topic: 'Числа и математика', topicEn: 'Numbers and Math' },
    { topic: 'Операторы сравнения', topicEn: 'Comparison Operators' },
    { topic: 'Условные операторы', topicEn: 'Conditional Statements' },

    // Week 2: Control Flow & Arrays
    { topic: 'Циклы: for, while', topicEn: 'Loops: for, while' },
    { topic: 'Циклы: for...of, for...in', topicEn: 'Loops: for...of, for...in' },
    { topic: 'Массивы: создание и доступ', topicEn: 'Arrays: Creation and Access' },
    { topic: 'Методы массивов: push, pop, shift', topicEn: 'Array Methods: push, pop, shift' },
    { topic: 'Методы массивов: map, filter', topicEn: 'Array Methods: map, filter' },
    { topic: 'Методы массивов: reduce, find', topicEn: 'Array Methods: reduce, find' },
    { topic: 'Spread и Rest операторы', topicEn: 'Spread and Rest Operators' },

    // Week 3: Functions & Objects
    { topic: 'Функции: объявление', topicEn: 'Functions: Declaration' },
    { topic: 'Стрелочные функции', topicEn: 'Arrow Functions' },
    { topic: 'Параметры по умолчанию', topicEn: 'Default Parameters' },
    { topic: 'Замыкания', topicEn: 'Closures' },
    { topic: 'Объекты: создание', topicEn: 'Objects: Creation' },
    { topic: 'Методы объектов', topicEn: 'Object Methods' },
    { topic: 'Деструктуризация', topicEn: 'Destructuring' },

    // Week 4: DOM & Events
    { topic: 'DOM: введение', topicEn: 'DOM: Introduction' },
    { topic: 'DOM: выборка элементов', topicEn: 'DOM: Selecting Elements' },
    { topic: 'DOM: изменение элементов', topicEn: 'DOM: Modifying Elements' },
    { topic: 'DOM: создание элементов', topicEn: 'DOM: Creating Elements' },
    { topic: 'События: addEventListener', topicEn: 'Events: addEventListener' },
    { topic: 'События: event object', topicEn: 'Events: Event Object' },
    { topic: 'Формы и валидация', topicEn: 'Forms and Validation' },

    // Week 5: Async & Modern JS
    { topic: 'Callbacks', topicEn: 'Callbacks' },
    { topic: 'Promises', topicEn: 'Promises' },
    { topic: 'Async/Await', topicEn: 'Async/Await' },
    { topic: 'Fetch API', topicEn: 'Fetch API' },
    { topic: 'Error Handling', topicEn: 'Error Handling' },
    { topic: 'Модули: import/export', topicEn: 'Modules: import/export' },
    { topic: 'LocalStorage и SessionStorage', topicEn: 'LocalStorage and SessionStorage' },

    // Week 6: Practice
    { topic: 'ES6+ фичи обзор', topicEn: 'ES6+ Features Overview' },
    { topic: 'Проект: Todo App', topicEn: 'Project: Todo App' },
    { topic: 'Проект: Fetch данные', topicEn: 'Project: Fetch Data' },
    { topic: 'Финальный проект', topicEn: 'Final Project' },
];

export const days: PathDayContent[] = topics.map((t, i) => ({
    day: i + 1,
    topic: t.topic,
    topicEn: t.topicEn,
    description: `JavaScript: ${t.topic}`,
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
