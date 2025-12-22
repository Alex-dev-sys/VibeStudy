/**
 * JavaScript Node.js Developer Path
 * 50 days - Backend with Node.js
 */

import type { PathDayContent } from '@/types/learning-paths';
import { JS_NODEJS } from '../index';

export const path = JS_NODEJS;

const topics = [
    // Node.js Core (1-15)
    'Node.js: введение', 'Event Loop', 'Модули CommonJS', 'ES Modules', 'npm/pnpm',
    'File System', 'Streams', 'Buffers', 'Path модуль', 'Process и Environment',
    'Child Processes', 'Worker Threads', 'Cluster', 'HTTP модуль', 'Проект: CLI tool',

    // Express & APIs (16-30)  
    'Express: основы', 'Routing', 'Middleware', 'Error handling', 'Request/Response',
    'CORS', 'Helmet', 'Rate limiting', 'Validation', 'File uploads',
    'REST API design', 'Versioning', 'Documentation: Swagger', 'Testing: Jest', 'Проект: REST API',

    // Databases (31-40)
    'SQL vs NoSQL', 'PostgreSQL', 'Prisma ORM', 'Migrations', 'Relations',
    'MongoDB', 'Mongoose', 'Transactions', 'Indexing', 'Проект: Database API',

    // Advanced (41-50)
    'WebSockets', 'Socket.io', 'Message Queues', 'Redis', 'Caching strategies',
    'Docker', 'CI/CD', 'Logging: Winston', 'Monitoring', 'Карьера Node.js',
];

export const days: PathDayContent[] = topics.map((topic, i) => ({
    day: i + 1,
    topic,
    topicEn: topic,
    description: `Node.js: ${topic}`,
    theory: `# День ${i + 1}: ${topic}`,
    recap: `Объясни "${topic}"`,
    tasks: [
        { id: `js-node-${i + 1}-1`, pathId: 'javascript-nodejs', day: i + 1, difficulty: 'easy', prompt: 'Упражнение' },
        { id: `js-node-${i + 1}-2`, pathId: 'javascript-nodejs', day: i + 1, difficulty: 'easy', prompt: 'Закрепление' },
        { id: `js-node-${i + 1}-3`, pathId: 'javascript-nodejs', day: i + 1, difficulty: 'medium', prompt: 'Практика' },
        { id: `js-node-${i + 1}-4`, pathId: 'javascript-nodejs', day: i + 1, difficulty: 'medium', prompt: 'Задача' },
        { id: `js-node-${i + 1}-5`, pathId: 'javascript-nodejs', day: i + 1, difficulty: 'hard', prompt: 'Проект' },
    ],
    estimatedMinutes: 40,
}));

const nodejsPathData = { path, days };

export default nodejsPathData;
