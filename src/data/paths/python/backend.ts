/**
 * Python Backend Developer Path Content
 * 50 days - from Python basics to backend development
 */

import type { PathDayContent } from '@/types/learning-paths';
import { PYTHON_BACKEND } from '../index';

export const path = PYTHON_BACKEND;

const generateDays = (): PathDayContent[] => {
    const topics = [
        // Module 1: Web Fundamentals (Days 1-8)
        { topic: 'Введение в веб-разработку', topicEn: 'Introduction to Web Development', category: 'web' },
        { topic: 'HTTP протокол', topicEn: 'HTTP Protocol', category: 'web' },
        { topic: 'REST API основы', topicEn: 'REST API Basics', category: 'api' },
        { topic: 'JSON и сериализация', topicEn: 'JSON and Serialization', category: 'api' },
        { topic: 'Виртуальные окружения', topicEn: 'Virtual Environments', category: 'tools' },
        { topic: 'pip и управление зависимостями', topicEn: 'pip and Dependency Management', category: 'tools' },
        { topic: 'Структура проекта', topicEn: 'Project Structure', category: 'tools' },
        { topic: 'Git для backend разработки', topicEn: 'Git for Backend Development', category: 'tools' },

        // Module 2: FastAPI (Days 9-20)
        { topic: 'FastAPI: первое приложение', topicEn: 'FastAPI: First Application', category: 'fastapi' },
        { topic: 'FastAPI: маршруты и методы', topicEn: 'FastAPI: Routes and Methods', category: 'fastapi' },
        { topic: 'FastAPI: Path и Query параметры', topicEn: 'FastAPI: Path and Query Parameters', category: 'fastapi' },
        { topic: 'FastAPI: Request Body и Pydantic', topicEn: 'FastAPI: Request Body and Pydantic', category: 'fastapi' },
        { topic: 'FastAPI: валидация данных', topicEn: 'FastAPI: Data Validation', category: 'fastapi' },
        { topic: 'FastAPI: Response моделей', topicEn: 'FastAPI: Response Models', category: 'fastapi' },
        { topic: 'FastAPI: обработка ошибок', topicEn: 'FastAPI: Error Handling', category: 'fastapi' },
        { topic: 'FastAPI: зависимости (Dependency Injection)', topicEn: 'FastAPI: Dependencies', category: 'fastapi' },
        { topic: 'FastAPI: middleware', topicEn: 'FastAPI: Middleware', category: 'fastapi' },
        { topic: 'FastAPI: файлы и загрузка', topicEn: 'FastAPI: Files and Uploads', category: 'fastapi' },
        { topic: 'FastAPI: документация API', topicEn: 'FastAPI: API Documentation', category: 'fastapi' },
        { topic: 'Проект: REST API', topicEn: 'Project: REST API', category: 'project' },

        // Module 3: Databases (Days 21-32)
        { topic: 'SQL: основы запросов', topicEn: 'SQL: Query Basics', category: 'database' },
        { topic: 'SQL: JOIN и связи', topicEn: 'SQL: JOIN and Relations', category: 'database' },
        { topic: 'PostgreSQL установка', topicEn: 'PostgreSQL Setup', category: 'database' },
        { topic: 'SQLAlchemy: ORM основы', topicEn: 'SQLAlchemy: ORM Basics', category: 'database' },
        { topic: 'SQLAlchemy: модели и миграции', topicEn: 'SQLAlchemy: Models and Migrations', category: 'database' },
        { topic: 'SQLAlchemy: отношения', topicEn: 'SQLAlchemy: Relationships', category: 'database' },
        { topic: 'Alembic: миграции БД', topicEn: 'Alembic: Database Migrations', category: 'database' },
        { topic: 'FastAPI + SQLAlchemy', topicEn: 'FastAPI + SQLAlchemy', category: 'database' },
        { topic: 'CRUD операции', topicEn: 'CRUD Operations', category: 'database' },
        { topic: 'Пагинация и фильтрация', topicEn: 'Pagination and Filtering', category: 'database' },
        { topic: 'Redis: кэширование', topicEn: 'Redis: Caching', category: 'database' },
        { topic: 'Проект: API с БД', topicEn: 'Project: API with Database', category: 'project' },

        // Module 4: Auth & Security (Days 33-40)
        { topic: 'Аутентификация vs Авторизация', topicEn: 'Authentication vs Authorization', category: 'security' },
        { topic: 'JWT токены', topicEn: 'JWT Tokens', category: 'security' },
        { topic: 'OAuth2 и FastAPI', topicEn: 'OAuth2 and FastAPI', category: 'security' },
        { topic: 'Хеширование паролей', topicEn: 'Password Hashing', category: 'security' },
        { topic: 'Роли и права доступа', topicEn: 'Roles and Permissions', category: 'security' },
        { topic: 'Rate Limiting', topicEn: 'Rate Limiting', category: 'security' },
        { topic: 'CORS и безопасность', topicEn: 'CORS and Security', category: 'security' },
        { topic: 'Проект: система авторизации', topicEn: 'Project: Authorization System', category: 'project' },

        // Module 5: Deploy & Production (Days 41-50)
        { topic: 'Docker: основы', topicEn: 'Docker: Basics', category: 'deploy' },
        { topic: 'Docker Compose', topicEn: 'Docker Compose', category: 'deploy' },
        { topic: 'Тестирование API: pytest', topicEn: 'API Testing: pytest', category: 'testing' },
        { topic: 'CI/CD: GitHub Actions', topicEn: 'CI/CD: GitHub Actions', category: 'deploy' },
        { topic: 'Логирование и мониторинг', topicEn: 'Logging and Monitoring', category: 'production' },
        { topic: 'Переменные окружения', topicEn: 'Environment Variables', category: 'production' },
        { topic: 'Деплой на VPS', topicEn: 'Deploy to VPS', category: 'deploy' },
        { topic: 'Nginx и reverse proxy', topicEn: 'Nginx and Reverse Proxy', category: 'deploy' },
        { topic: 'Финальный проект', topicEn: 'Final Project', category: 'project' },
        { topic: 'Карьера Backend разработчика', topicEn: 'Backend Developer Career', category: 'career' },
    ];

    return topics.map((t, i) => ({
        day: i + 1,
        topic: t.topic,
        topicEn: t.topicEn,
        description: `Backend: ${t.topic}`,
        theory: `# День ${i + 1}: ${t.topic}\n\nИзучаем: **${t.topic}**\n\nПодробная теория будет добавлена.`,
        recap: `Что ты узнал о "${t.topic}"?`,
        tasks: [
            { id: `py-be-${i + 1}-1`, pathId: 'python-backend', day: i + 1, difficulty: 'easy', prompt: `Базовое упражнение: ${t.topic}` },
            { id: `py-be-${i + 1}-2`, pathId: 'python-backend', day: i + 1, difficulty: 'easy', prompt: 'Закрепление' },
            { id: `py-be-${i + 1}-3`, pathId: 'python-backend', day: i + 1, difficulty: 'medium', prompt: 'Практика' },
            { id: `py-be-${i + 1}-4`, pathId: 'python-backend', day: i + 1, difficulty: 'medium', prompt: 'Задача' },
            { id: `py-be-${i + 1}-5`, pathId: 'python-backend', day: i + 1, difficulty: 'hard', prompt: 'Проект' },
        ],
        estimatedMinutes: 45,
    }));
};

export const days: PathDayContent[] = generateDays();
export default { path, days };
