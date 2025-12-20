/**
 * Learning Paths Configuration
 * All paths for all languages with their metadata
 */

import type { LearningPath, LanguagePaths } from '@/types/learning-paths';

// Re-export types for convenience
export type { LearningPath, LanguagePaths } from '@/types/learning-paths';

// =============================================================================
// PYTHON PATHS
// =============================================================================

export const PYTHON_BEGINNER: LearningPath = {
    id: 'python-beginner',
    languageId: 'python',
    name: 'Python с нуля',
    nameEn: 'Python Fundamentals',
    description: 'Основы Python: от переменных до ООП. Идеально для начинающих.',
    descriptionEn: 'Python basics: from variables to OOP. Perfect for beginners.',
    duration: 45,
    type: 'beginner',
    icon: '🐍',
    color: '#ffd166',
    skills: ['Синтаксис Python', 'Структуры данных', 'Функции', 'ООП основы'],
    order: 0
};

export const PYTHON_DATA_SCIENTIST: LearningPath = {
    id: 'python-data-scientist',
    languageId: 'python',
    name: 'Data Scientist',
    nameEn: 'Data Scientist',
    description: 'Анализ данных, визуализация, pandas, numpy, машинное обучение.',
    descriptionEn: 'Data analysis, visualization, pandas, numpy, machine learning.',
    duration: 60,
    type: 'career',
    icon: '📊',
    color: '#06d6a0',
    prerequisitePathId: 'python-beginner',
    careerCategory: 'data-science',
    careers: ['Data Scientist', 'Data Analyst', 'BI Analyst'],
    skills: ['Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn', 'SQL'],
    order: 1
};

export const PYTHON_BACKEND: LearningPath = {
    id: 'python-backend',
    languageId: 'python',
    name: 'Backend Developer',
    nameEn: 'Backend Developer',
    description: 'Веб-разработка на Django/FastAPI, REST API, базы данных.',
    descriptionEn: 'Web development with Django/FastAPI, REST API, databases.',
    duration: 50,
    type: 'career',
    icon: '⚙️',
    color: '#118ab2',
    prerequisitePathId: 'python-beginner',
    careerCategory: 'backend',
    careers: ['Backend Developer', 'Python Developer', 'API Developer'],
    skills: ['Django', 'FastAPI', 'PostgreSQL', 'REST API', 'Docker'],
    order: 2
};

export const PYTHON_ML_ENGINEER: LearningPath = {
    id: 'python-ml-engineer',
    languageId: 'python',
    name: 'ML Engineer',
    nameEn: 'ML Engineer',
    description: 'Глубокое обучение, TensorFlow, PyTorch, развёртывание моделей.',
    descriptionEn: 'Deep learning, TensorFlow, PyTorch, model deployment.',
    duration: 70,
    type: 'career',
    icon: '🤖',
    color: '#ef476f',
    prerequisitePathId: 'python-beginner',
    careerCategory: 'ml-ai',
    careers: ['ML Engineer', 'AI Developer', 'Deep Learning Engineer'],
    skills: ['TensorFlow', 'PyTorch', 'Neural Networks', 'MLOps', 'Computer Vision'],
    order: 3
};

// =============================================================================
// JAVASCRIPT PATHS
// =============================================================================

export const JS_BEGINNER: LearningPath = {
    id: 'javascript-beginner',
    languageId: 'javascript',
    name: 'JavaScript с нуля',
    nameEn: 'JavaScript Fundamentals',
    description: 'Основы JS: переменные, DOM, асинхронность, ES6+.',
    descriptionEn: 'JS basics: variables, DOM, async, ES6+.',
    duration: 40,
    type: 'beginner',
    icon: '🌐',
    color: '#f9a03f',
    skills: ['ES6+', 'DOM', 'Async/Await', 'Fetch API'],
    order: 0
};

export const JS_FRONTEND: LearningPath = {
    id: 'javascript-frontend',
    languageId: 'javascript',
    name: 'Frontend Developer',
    nameEn: 'Frontend Developer',
    description: 'React, современные UI библиотеки, адаптивная вёрстка.',
    descriptionEn: 'React, modern UI libraries, responsive design.',
    duration: 55,
    type: 'career',
    icon: '🎨',
    color: '#61dafb',
    prerequisitePathId: 'javascript-beginner',
    careerCategory: 'frontend',
    careers: ['Frontend Developer', 'React Developer', 'UI Developer'],
    skills: ['React', 'CSS/SCSS', 'Redux', 'TypeScript', 'Testing'],
    order: 1
};

export const JS_FULLSTACK: LearningPath = {
    id: 'javascript-fullstack',
    languageId: 'javascript',
    name: 'Full-Stack Developer',
    nameEn: 'Full-Stack Developer',
    description: 'MERN стек: MongoDB, Express, React, Node.js.',
    descriptionEn: 'MERN stack: MongoDB, Express, React, Node.js.',
    duration: 75,
    type: 'career',
    icon: '🔄',
    color: '#68d391',
    prerequisitePathId: 'javascript-beginner',
    careerCategory: 'fullstack',
    careers: ['Full-Stack Developer', 'MERN Developer', 'Web Developer'],
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API'],
    order: 2
};

export const JS_NODEJS: LearningPath = {
    id: 'javascript-nodejs',
    languageId: 'javascript',
    name: 'Node.js Developer',
    nameEn: 'Node.js Developer',
    description: 'Серверная разработка, API, микросервисы на Node.js.',
    descriptionEn: 'Server-side development, API, microservices with Node.js.',
    duration: 50,
    type: 'career',
    icon: '🟢',
    color: '#339933',
    prerequisitePathId: 'javascript-beginner',
    careerCategory: 'backend',
    careers: ['Node.js Developer', 'Backend Developer', 'API Developer'],
    skills: ['Node.js', 'Express', 'NestJS', 'PostgreSQL', 'Redis'],
    order: 3
};

// =============================================================================
// TYPESCRIPT PATHS
// =============================================================================

export const TS_BEGINNER: LearningPath = {
    id: 'typescript-beginner',
    languageId: 'typescript',
    name: 'TypeScript с нуля',
    nameEn: 'TypeScript Fundamentals',
    description: 'Типизация, интерфейсы, дженерики, интеграция с JS.',
    descriptionEn: 'Types, interfaces, generics, JS integration.',
    duration: 35,
    type: 'beginner',
    icon: '📘',
    color: '#3178c6',
    skills: ['Типы', 'Интерфейсы', 'Дженерики', 'Утилитарные типы'],
    order: 0
};

export const TS_FRONTEND: LearningPath = {
    id: 'typescript-frontend',
    languageId: 'typescript',
    name: 'Frontend Developer',
    nameEn: 'Frontend Developer',
    description: 'React + TypeScript, продвинутые паттерны, тестирование.',
    descriptionEn: 'React + TypeScript, advanced patterns, testing.',
    duration: 50,
    type: 'career',
    icon: '🎨',
    color: '#61dafb',
    prerequisitePathId: 'typescript-beginner',
    careerCategory: 'frontend',
    careers: ['Frontend Developer', 'React Developer'],
    skills: ['React', 'Next.js', 'Testing', 'State Management'],
    order: 1
};

export const TS_FULLSTACK: LearningPath = {
    id: 'typescript-fullstack',
    languageId: 'typescript',
    name: 'Full-Stack Developer',
    nameEn: 'Full-Stack Developer',
    description: 'Next.js, NestJS, Prisma, полный TypeScript стек.',
    descriptionEn: 'Next.js, NestJS, Prisma, full TypeScript stack.',
    duration: 70,
    type: 'career',
    icon: '🔄',
    color: '#68d391',
    prerequisitePathId: 'typescript-beginner',
    careerCategory: 'fullstack',
    careers: ['Full-Stack Developer', 'TypeScript Developer'],
    skills: ['Next.js', 'NestJS', 'Prisma', 'tRPC', 'PostgreSQL'],
    order: 2
};

// =============================================================================
// JAVA PATHS
// =============================================================================

export const JAVA_BEGINNER: LearningPath = {
    id: 'java-beginner',
    languageId: 'java',
    name: 'Java с нуля',
    nameEn: 'Java Fundamentals',
    description: 'Основы Java: ООП, коллекции, исключения, потоки.',
    descriptionEn: 'Java basics: OOP, collections, exceptions, streams.',
    duration: 50,
    type: 'beginner',
    icon: '☕',
    color: '#f06543',
    skills: ['ООП', 'Коллекции', 'Stream API', 'Исключения'],
    order: 0
};

export const JAVA_BACKEND: LearningPath = {
    id: 'java-backend',
    languageId: 'java',
    name: 'Backend Developer',
    nameEn: 'Backend Developer',
    description: 'Spring Boot, микросервисы, корпоративная разработка.',
    descriptionEn: 'Spring Boot, microservices, enterprise development.',
    duration: 60,
    type: 'career',
    icon: '🍃',
    color: '#6db33f',
    prerequisitePathId: 'java-beginner',
    careerCategory: 'backend',
    careers: ['Java Developer', 'Backend Developer', 'Spring Developer'],
    skills: ['Spring Boot', 'Spring Security', 'JPA/Hibernate', 'Kafka'],
    order: 1
};

export const JAVA_ANDROID: LearningPath = {
    id: 'java-android',
    languageId: 'java',
    name: 'Android Developer',
    nameEn: 'Android Developer',
    description: 'Разработка мобильных приложений для Android.',
    descriptionEn: 'Mobile app development for Android.',
    duration: 65,
    type: 'career',
    icon: '📱',
    color: '#3ddc84',
    prerequisitePathId: 'java-beginner',
    careerCategory: 'mobile',
    careers: ['Android Developer', 'Mobile Developer'],
    skills: ['Android SDK', 'Jetpack', 'Room', 'Retrofit', 'MVVM'],
    order: 2
};

// =============================================================================
// C++ PATHS
// =============================================================================

export const CPP_BEGINNER: LearningPath = {
    id: 'cpp-beginner',
    languageId: 'cpp',
    name: 'C++ с нуля',
    nameEn: 'C++ Fundamentals',
    description: 'Основы C++: указатели, память, ООП, STL.',
    descriptionEn: 'C++ basics: pointers, memory, OOP, STL.',
    duration: 55,
    type: 'beginner',
    icon: '⚡',
    color: '#5e81ac',
    skills: ['Указатели', 'Управление памятью', 'STL', 'ООП'],
    order: 0
};

export const CPP_GAME_DEV: LearningPath = {
    id: 'cpp-game-dev',
    languageId: 'cpp',
    name: 'Game Developer',
    nameEn: 'Game Developer',
    description: 'Разработка игр на Unreal Engine, графика, физика.',
    descriptionEn: 'Game development with Unreal Engine, graphics, physics.',
    duration: 80,
    type: 'career',
    icon: '🎮',
    color: '#8b5cf6',
    prerequisitePathId: 'cpp-beginner',
    careerCategory: 'game-dev',
    careers: ['Game Developer', 'Unreal Developer', 'Graphics Programmer'],
    skills: ['Unreal Engine', 'Game Physics', '3D Math', 'Rendering'],
    order: 1
};

export const CPP_SYSTEMS: LearningPath = {
    id: 'cpp-systems',
    languageId: 'cpp',
    name: 'Systems Programmer',
    nameEn: 'Systems Programmer',
    description: 'Системное программирование, оптимизация, низкоуровневый код.',
    descriptionEn: 'Systems programming, optimization, low-level code.',
    duration: 70,
    type: 'career',
    icon: '🔧',
    color: '#0ea5e9',
    prerequisitePathId: 'cpp-beginner',
    careerCategory: 'systems',
    careers: ['Systems Programmer', 'Embedded Developer', 'Performance Engineer'],
    skills: ['Многопоточность', 'Оптимизация', 'Embedded', 'Сети'],
    order: 2
};

// =============================================================================
// GO PATHS  
// =============================================================================

export const GO_BEGINNER: LearningPath = {
    id: 'go-beginner',
    languageId: 'go',
    name: 'Go с нуля',
    nameEn: 'Go Fundamentals',
    description: 'Основы Go: горутины, каналы, интерфейсы.',
    descriptionEn: 'Go basics: goroutines, channels, interfaces.',
    duration: 40,
    type: 'beginner',
    icon: '🐹',
    color: '#00add8',
    skills: ['Горутины', 'Каналы', 'Интерфейсы', 'Модули'],
    order: 0
};

export const GO_BACKEND: LearningPath = {
    id: 'go-backend',
    languageId: 'go',
    name: 'Backend Developer',
    nameEn: 'Backend Developer',
    description: 'Микросервисы, gRPC, высоконагруженные системы.',
    descriptionEn: 'Microservices, gRPC, high-load systems.',
    duration: 50,
    type: 'career',
    icon: '⚙️',
    color: '#118ab2',
    prerequisitePathId: 'go-beginner',
    careerCategory: 'backend',
    careers: ['Go Developer', 'Backend Developer', 'Platform Engineer'],
    skills: ['Gin/Echo', 'gRPC', 'PostgreSQL', 'Redis', 'Kubernetes'],
    order: 1
};

export const GO_DEVOPS: LearningPath = {
    id: 'go-devops',
    languageId: 'go',
    name: 'DevOps Engineer',
    nameEn: 'DevOps Engineer',
    description: 'CLI инструменты, автоматизация, Kubernetes операторы.',
    descriptionEn: 'CLI tools, automation, Kubernetes operators.',
    duration: 60,
    type: 'career',
    icon: '🚀',
    color: '#326ce5',
    prerequisitePathId: 'go-beginner',
    careerCategory: 'devops',
    careers: ['DevOps Engineer', 'SRE', 'Platform Engineer'],
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Prometheus'],
    order: 2
};

// =============================================================================
// C# PATHS
// =============================================================================

export const CSHARP_BEGINNER: LearningPath = {
    id: 'csharp-beginner',
    languageId: 'csharp',
    name: 'C# с нуля',
    nameEn: 'C# Fundamentals',
    description: 'Основы C#: .NET, LINQ, async/await, ООП.',
    descriptionEn: 'C# basics: .NET, LINQ, async/await, OOP.',
    duration: 45,
    type: 'beginner',
    icon: '💜',
    color: '#9b5de5',
    skills: ['.NET', 'LINQ', 'Async/Await', 'ООП'],
    order: 0
};

export const CSHARP_GAME_UNITY: LearningPath = {
    id: 'csharp-game-unity',
    languageId: 'csharp',
    name: 'Game Developer (Unity)',
    nameEn: 'Game Developer (Unity)',
    description: 'Разработка игр на Unity, 2D/3D, мультиплеер.',
    descriptionEn: 'Game development with Unity, 2D/3D, multiplayer.',
    duration: 70,
    type: 'career',
    icon: '🎮',
    color: '#000000',
    prerequisitePathId: 'csharp-beginner',
    careerCategory: 'game-dev',
    careers: ['Unity Developer', 'Game Developer', 'XR Developer'],
    skills: ['Unity', 'C# для игр', 'Физика', 'UI', 'Networking'],
    order: 1
};

export const CSHARP_DOTNET: LearningPath = {
    id: 'csharp-dotnet',
    languageId: 'csharp',
    name: '.NET Developer',
    nameEn: '.NET Developer',
    description: 'ASP.NET Core, Entity Framework, корпоративные приложения.',
    descriptionEn: 'ASP.NET Core, Entity Framework, enterprise apps.',
    duration: 55,
    type: 'career',
    icon: '🏢',
    color: '#512bd4',
    prerequisitePathId: 'csharp-beginner',
    careerCategory: 'backend',
    careers: ['.NET Developer', 'Backend Developer', 'Enterprise Developer'],
    skills: ['ASP.NET Core', 'Entity Framework', 'Azure', 'Blazor'],
    order: 2
};

// =============================================================================
// ALL PATHS REGISTRY
// =============================================================================

export const ALL_PATHS: LearningPath[] = [
    // Python
    PYTHON_BEGINNER, PYTHON_DATA_SCIENTIST, PYTHON_BACKEND, PYTHON_ML_ENGINEER,
    // JavaScript
    JS_BEGINNER, JS_FRONTEND, JS_FULLSTACK, JS_NODEJS,
    // TypeScript
    TS_BEGINNER, TS_FRONTEND, TS_FULLSTACK,
    // Java
    JAVA_BEGINNER, JAVA_BACKEND, JAVA_ANDROID,
    // C++
    CPP_BEGINNER, CPP_GAME_DEV, CPP_SYSTEMS,
    // Go
    GO_BEGINNER, GO_BACKEND, GO_DEVOPS,
    // C#
    CSHARP_BEGINNER, CSHARP_GAME_UNITY, CSHARP_DOTNET
];

// =============================================================================
// LANGUAGE PATHS MAPPING
// =============================================================================

export const LANGUAGE_PATHS: Record<string, LanguagePaths> = {
    python: {
        languageId: 'python',
        beginner: PYTHON_BEGINNER,
        careers: [PYTHON_DATA_SCIENTIST, PYTHON_BACKEND, PYTHON_ML_ENGINEER]
    },
    javascript: {
        languageId: 'javascript',
        beginner: JS_BEGINNER,
        careers: [JS_FRONTEND, JS_FULLSTACK, JS_NODEJS]
    },
    typescript: {
        languageId: 'typescript',
        beginner: TS_BEGINNER,
        careers: [TS_FRONTEND, TS_FULLSTACK]
    },
    java: {
        languageId: 'java',
        beginner: JAVA_BEGINNER,
        careers: [JAVA_BACKEND, JAVA_ANDROID]
    },
    cpp: {
        languageId: 'cpp',
        beginner: CPP_BEGINNER,
        careers: [CPP_GAME_DEV, CPP_SYSTEMS]
    },
    go: {
        languageId: 'go',
        beginner: GO_BEGINNER,
        careers: [GO_BACKEND, GO_DEVOPS]
    },
    csharp: {
        languageId: 'csharp',
        beginner: CSHARP_BEGINNER,
        careers: [CSHARP_GAME_UNITY, CSHARP_DOTNET]
    }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all paths for a language
 */
export function getPathsForLanguage(languageId: string): LanguagePaths | undefined {
    return LANGUAGE_PATHS[languageId];
}

/**
 * Get path by ID
 */
export function getPathById(pathId: string): LearningPath | undefined {
    return ALL_PATHS.find(p => p.id === pathId);
}

/**
 * Get beginner path for a language
 */
export function getBeginnerPath(languageId: string): LearningPath | undefined {
    return LANGUAGE_PATHS[languageId]?.beginner;
}

/**
 * Get career paths for a language
 */
export function getCareerPaths(languageId: string): LearningPath[] {
    return LANGUAGE_PATHS[languageId]?.careers ?? [];
}

/**
 * Check if path is completed prerequisite for career paths
 */
export function canAccessCareerPaths(languageId: string, completedPathIds: string[]): boolean {
    const beginner = getBeginnerPath(languageId);
    return beginner ? completedPathIds.includes(beginner.id) : false;
}

/**
 * Get total learning time for a full stack (beginner + career)
 */
export function getTotalPathDuration(beginnerPath: LearningPath, careerPath: LearningPath): number {
    return beginnerPath.duration + careerPath.duration;
}
