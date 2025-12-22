/**
 * JavaScript Full-Stack Developer Path
 * 75 days - MERN stack
 */

import type { PathDayContent } from '@/types/learning-paths';
import { JS_FULLSTACK } from '../index';

export const path = JS_FULLSTACK;

const topics = [
    // Frontend Review & Advanced (1-20)
    'React: повторение основ', 'React: продвинутые хуки', 'TypeScript основы', 'TypeScript с React',
    'State Management', 'React Query', 'Формы: React Hook Form', 'Validation: Zod',
    'Tailwind CSS', 'UI Components', 'Анимации', 'Routing',
    'Auth: клиентская часть', 'Защищённые маршруты', 'Error Handling', 'Loading States',
    'Оптимизация', 'SEO', 'PWA основы', 'Проект: Frontend',

    // Node.js & Express (21-40)
    'Node.js: введение', 'Node.js: модули', 'npm и package.json', 'Express: основы',
    'Express: маршруты', 'Express: middleware', 'REST API дизайн', 'CRUD операции',
    'Валидация запросов', 'Error handling', 'MongoDB: установка', 'MongoDB: CRUD',
    'Mongoose: схемы', 'Mongoose: связи', 'Mongoose: виртуальные поля', 'Pagination',
    'File uploads', 'Image processing', 'API testing', 'Проект: API',

    // Auth & Security (41-50)
    'Аутентификация обзор', 'JWT', 'Passport.js', 'OAuth: Google',
    'Sessions vs Tokens', 'Password hashing', 'Rate limiting', 'CORS',
    'Security best practices', 'Проект: Auth система',

    // Integration & Deploy (51-65)
    'Frontend + Backend', 'Environment variables', 'API integration', 'Real-time: Socket.io',
    'Notifications', 'Email: Nodemailer', 'Payment: Stripe', 'Docker: basics',
    'Docker Compose', 'CI/CD', 'Deploy: Railway/Render', 'Deploy: VPS',
    'Nginx', 'SSL/HTTPS', 'Проект: Full-Stack App',

    // Advanced & Career (66-75)
    'GraphQL: основы', 'GraphQL: Apollo', 'Microservices overview', 'Message queues',
    'Caching: Redis', 'Performance', 'Monitoring', 'Logging',
    'Финальный проект', 'Карьера Full-Stack',
];

export const days: PathDayContent[] = topics.map((topic, i) => ({
    day: i + 1,
    topic,
    topicEn: topic,
    description: `Full-Stack: ${topic}`,
    theory: `# День ${i + 1}: ${topic}`,
    recap: `Объясни "${topic}"`,
    tasks: [
        { id: `js-fs-${i + 1}-1`, pathId: 'javascript-fullstack', day: i + 1, difficulty: 'easy', prompt: 'Упражнение' },
        { id: `js-fs-${i + 1}-2`, pathId: 'javascript-fullstack', day: i + 1, difficulty: 'easy', prompt: 'Закрепление' },
        { id: `js-fs-${i + 1}-3`, pathId: 'javascript-fullstack', day: i + 1, difficulty: 'medium', prompt: 'Практика' },
        { id: `js-fs-${i + 1}-4`, pathId: 'javascript-fullstack', day: i + 1, difficulty: 'medium', prompt: 'Задача' },
        { id: `js-fs-${i + 1}-5`, pathId: 'javascript-fullstack', day: i + 1, difficulty: 'hard', prompt: 'Проект' },
    ],
    estimatedMinutes: 45,
}));

const fullstackPathData = { path, days };

export default fullstackPathData;
