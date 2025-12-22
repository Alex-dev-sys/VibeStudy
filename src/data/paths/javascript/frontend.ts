/**
 * JavaScript Frontend Developer Path
 * 55 days - React and modern frontend
 */

import type { PathDayContent } from '@/types/learning-paths';
import { JS_FRONTEND } from '../index';

export const path = JS_FRONTEND;

const topics = [
    // React Basics (1-15)
    { topic: 'Введение в React', topicEn: 'Introduction to React' },
    { topic: 'JSX синтаксис', topicEn: 'JSX Syntax' },
    { topic: 'Компоненты', topicEn: 'Components' },
    { topic: 'Props', topicEn: 'Props' },
    { topic: 'useState', topicEn: 'useState' },
    { topic: 'Обработка событий', topicEn: 'Event Handling' },
    { topic: 'Условный рендеринг', topicEn: 'Conditional Rendering' },
    { topic: 'Списки и ключи', topicEn: 'Lists and Keys' },
    { topic: 'Формы в React', topicEn: 'Forms in React' },
    { topic: 'useEffect', topicEn: 'useEffect' },
    { topic: 'Fetch в React', topicEn: 'Fetch in React' },
    { topic: 'useRef', topicEn: 'useRef' },
    { topic: 'Custom Hooks', topicEn: 'Custom Hooks' },
    { topic: 'Context API', topicEn: 'Context API' },
    { topic: 'Проект: React App', topicEn: 'Project: React App' },

    // Styling & UI (16-25)
    { topic: 'CSS Modules', topicEn: 'CSS Modules' },
    { topic: 'Styled Components', topicEn: 'Styled Components' },
    { topic: 'Tailwind CSS', topicEn: 'Tailwind CSS' },
    { topic: 'Анимации: Framer Motion', topicEn: 'Animations: Framer Motion' },
    { topic: 'Компонентные библиотеки', topicEn: 'Component Libraries' },
    { topic: 'Адаптивный дизайн', topicEn: 'Responsive Design' },
    { topic: 'Доступность (a11y)', topicEn: 'Accessibility' },
    { topic: 'Темы и CSS переменные', topicEn: 'Theming and CSS Variables' },
    { topic: 'Иконки и ассеты', topicEn: 'Icons and Assets' },
    { topic: 'Проект: UI Kit', topicEn: 'Project: UI Kit' },

    // State Management (26-35)
    { topic: 'Проблема Prop Drilling', topicEn: 'Prop Drilling Problem' },
    { topic: 'Zustand', topicEn: 'Zustand' },
    { topic: 'Redux Toolkit', topicEn: 'Redux Toolkit' },
    { topic: 'Redux: slices', topicEn: 'Redux: Slices' },
    { topic: 'Redux: async thunks', topicEn: 'Redux: Async Thunks' },
    { topic: 'React Query', topicEn: 'React Query' },
    { topic: 'Кэширование данных', topicEn: 'Data Caching' },
    { topic: 'Оптимистичные обновления', topicEn: 'Optimistic Updates' },
    { topic: 'Выбор state management', topicEn: 'Choosing State Management' },
    { topic: 'Проект: Redux App', topicEn: 'Project: Redux App' },

    // Routing & Advanced (36-45)
    { topic: 'React Router', topicEn: 'React Router' },
    { topic: 'Вложенные маршруты', topicEn: 'Nested Routes' },
    { topic: 'Защищённые маршруты', topicEn: 'Protected Routes' },
    { topic: 'Lazy Loading', topicEn: 'Lazy Loading' },
    { topic: 'Error Boundaries', topicEn: 'Error Boundaries' },
    { topic: 'useMemo и useCallback', topicEn: 'useMemo and useCallback' },
    { topic: 'React DevTools', topicEn: 'React DevTools' },
    { topic: 'Performance оптимизация', topicEn: 'Performance Optimization' },
    { topic: 'Suspense', topicEn: 'Suspense' },
    { topic: 'Проект: SPA', topicEn: 'Project: SPA' },

    // Testing & Production (46-55)
    { topic: 'Jest: основы', topicEn: 'Jest: Basics' },
    { topic: 'React Testing Library', topicEn: 'React Testing Library' },
    { topic: 'Тестирование компонентов', topicEn: 'Component Testing' },
    { topic: 'E2E: Playwright', topicEn: 'E2E: Playwright' },
    { topic: 'Vite: настройка', topicEn: 'Vite: Setup' },
    { topic: 'Build и деплой', topicEn: 'Build and Deploy' },
    { topic: 'Vercel/Netlify', topicEn: 'Vercel/Netlify' },
    { topic: 'SEO для SPA', topicEn: 'SEO for SPA' },
    { topic: 'Финальный проект', topicEn: 'Final Project' },
    { topic: 'Карьера Frontend', topicEn: 'Frontend Career' },
];

export const days: PathDayContent[] = topics.map((t, i) => ({
    day: i + 1,
    topic: t.topic,
    topicEn: t.topicEn,
    description: `Frontend: ${t.topic}`,
    theory: `# День ${i + 1}: ${t.topic}\n\nИзучаем: **${t.topic}**`,
    recap: `Объясни "${t.topic}"`,
    tasks: [
        { id: `js-fe-${i + 1}-1`, pathId: 'javascript-frontend', day: i + 1, difficulty: 'easy', prompt: `Упражнение` },
        { id: `js-fe-${i + 1}-2`, pathId: 'javascript-frontend', day: i + 1, difficulty: 'easy', prompt: 'Закрепление' },
        { id: `js-fe-${i + 1}-3`, pathId: 'javascript-frontend', day: i + 1, difficulty: 'medium', prompt: 'Практика' },
        { id: `js-fe-${i + 1}-4`, pathId: 'javascript-frontend', day: i + 1, difficulty: 'medium', prompt: 'Компонент' },
        { id: `js-fe-${i + 1}-5`, pathId: 'javascript-frontend', day: i + 1, difficulty: 'hard', prompt: 'Проект' },
    ],
    estimatedMinutes: 40,
}));

const frontendPathData = { path, days };

export default frontendPathData;
