import type { DayTheme } from './types';

export const javascriptThemes: DayTheme[] = [
  // Основы (Дни 1-15)
  { day: 1, topic: "Переменные (let, const) и типы данных", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 2, topic: "Числа и математические методы", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 3, topic: "Работа со строками и шаблонные строки", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 4, topic: "Логические операторы и преобразование типов", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 5, topic: "Условные конструкции (if/else, тернарный оператор)", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 6, topic: "Конструкция switch", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 7, topic: "Цикл while", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 8, topic: "Цикл for", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 9, topic: "Функции: function declaration", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 10, topic: "Функции: function expression", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 11, topic: "Стрелочные функции (arrow functions)", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 12, topic: "Область видимости и замыкания", difficulty: 3, category: 'basics', practiceType: 'coding' },
  { day: 13, topic: "Объекты: создание и доступ к свойствам", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 14, topic: "Методы объектов и ключевое слово this", difficulty: 3, category: 'basics', practiceType: 'coding' },
  { day: 15, topic: "Массивы: создание и базовые методы", difficulty: 2, category: 'basics', practiceType: 'coding' },
  
  // Массивы и методы (Дни 16-22)
  { day: 16, topic: "Методы массивов: push, pop, shift, unshift", difficulty: 2, category: 'data-structures', practiceType: 'coding' },
  { day: 17, topic: "Цикл for...of и for...in", difficulty: 2, category: 'data-structures', practiceType: 'coding' },
  { day: 18, topic: "Метод forEach", difficulty: 2, category: 'data-structures', practiceType: 'coding' },
  { day: 19, topic: "Методы map и filter", difficulty: 2, category: 'data-structures', practiceType: 'coding' },
  { day: 20, topic: "Методы reduce и find", difficulty: 3, category: 'data-structures', practiceType: 'coding' },
  { day: 21, topic: "Деструктуризация объектов и массивов", difficulty: 2, category: 'data-structures', practiceType: 'coding' },
  { day: 22, topic: "Spread и rest операторы", difficulty: 2, category: 'data-structures', practiceType: 'coding' },
  
  // DOM и события (Дни 23-28)
  { day: 23, topic: "Работа с DOM: поиск элементов", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 24, topic: "Изменение содержимого и стилей элементов", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 25, topic: "Слушатели событий (addEventListener)", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 26, topic: "Всплытие и погружение событий", difficulty: 3, category: 'web', practiceType: 'theory' },
  { day: 27, topic: "Планирование задач: setTimeout и setInterval", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 28, topic: "Работа с формами и валидация", difficulty: 2, category: 'web', practiceType: 'coding' },
  
  // Асинхронность (Дни 29-35)
  { day: 29, topic: "Промисы (Promise): resolve и reject", difficulty: 3, category: 'advanced', practiceType: 'coding' },
  { day: 30, topic: "Мини-проект: Интерактивная веб-страница", difficulty: 3, category: 'project', practiceType: 'project' },
  { day: 31, topic: "Цепочки промисов (.then, .catch)", difficulty: 3, category: 'advanced', practiceType: 'coding' },
  { day: 32, topic: "Async / Await синтаксис", difficulty: 3, category: 'advanced', practiceType: 'coding' },
  { day: 33, topic: "Обработка ошибок try...catch", difficulty: 2, category: 'advanced', practiceType: 'coding' },
  { day: 34, topic: "Работа с API: fetch", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 35, topic: "Понятие Event Loop и микрозадач", difficulty: 4, category: 'advanced', practiceType: 'theory' },
  
  // ООП в JS (Дни 36-42)
  { day: 36, topic: "Прототипное наследование", difficulty: 4, category: 'oop', practiceType: 'theory' },
  { day: 37, topic: "Классы в JS: class, constructor", difficulty: 3, category: 'oop', practiceType: 'coding' },
  { day: 38, topic: "Классы: extends и super", difficulty: 3, category: 'oop', practiceType: 'coding' },
  { day: 39, topic: "Геттеры и сеттеры", difficulty: 2, category: 'oop', practiceType: 'coding' },
  { day: 40, topic: "Статические методы классов", difficulty: 3, category: 'oop', practiceType: 'coding' },
  { day: 41, topic: "Модули (ES Modules): import и export", difficulty: 2, category: 'oop', practiceType: 'coding' },
  { day: 42, topic: "Методы функций: call, apply, bind", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  
  // Дополнительные возможности (Дни 43-50)
  { day: 43, topic: "Хранилища: localStorage и sessionStorage", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 44, topic: "Формат JSON и его методы", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 45, topic: "Регулярные выражения в JS", difficulty: 3, category: 'advanced', practiceType: 'coding' },
  { day: 46, topic: "Работа с датами (Date)", difficulty: 2, category: 'advanced', practiceType: 'coding' },
  { day: 47, topic: "WeakMap и WeakSet", difficulty: 4, category: 'data-structures', practiceType: 'theory' },
  { day: 48, topic: "Генераторы и итераторы", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 49, topic: "Proxy и Reflect", difficulty: 5, category: 'advanced', practiceType: 'theory' },
  { day: 50, topic: "Рекурсия в JS", difficulty: 3, category: 'data-structures', practiceType: 'coding' },
  
  // React (Дни 51-62)
  { day: 51, topic: "Введение в React: компоненты и JSX", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 52, topic: "Props и передача данных", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 53, topic: "State и useState hook", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 54, topic: "Обработка событий в React", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 55, topic: "Условный рендеринг и списки", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 56, topic: "useEffect: жизненный цикл и side effects", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 57, topic: "Формы в React и контролируемые компоненты", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 58, topic: "useContext и глобальное состояние", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 59, topic: "useRef и useReducer", difficulty: 4, category: 'web', practiceType: 'coding' },
  { day: 60, topic: "Мини-проект: React приложение", difficulty: 4, category: 'project', practiceType: 'project' },
  { day: 61, topic: "React Router: маршрутизация", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 62, topic: "Кастомные хуки", difficulty: 4, category: 'web', practiceType: 'coding' },
  
  // Next.js (Дни 63-70)
  { day: 63, topic: "Введение в Next.js: структура проекта", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 64, topic: "App Router и файловая маршрутизация", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 65, topic: "Server Components vs Client Components", difficulty: 4, category: 'web', practiceType: 'theory' },
  { day: 66, topic: "Data Fetching в Next.js", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 67, topic: "API Routes в Next.js", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 68, topic: "Middleware и аутентификация", difficulty: 4, category: 'security', practiceType: 'coding' },
  { day: 69, topic: "SEO и метаданные", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 70, topic: "Деплой Next.js приложения", difficulty: 3, category: 'devops', practiceType: 'coding' },
  
  // Node.js (Дни 71-76)
  { day: 71, topic: "Основы Node.js: глобальные объекты", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 72, topic: "Node.js: работа с модулем fs", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 73, topic: "Создание HTTP сервера", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 74, topic: "Express.js: роутинг и middleware", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 75, topic: "REST API с Express", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 76, topic: "WebSocket: двустороннее соединение", difficulty: 4, category: 'web', practiceType: 'coding' },
  
  // База данных (Дни 77-80)
  { day: 77, topic: "SQL: SELECT, WHERE, JOIN", difficulty: 3, category: 'database', practiceType: 'coding' },
  { day: 78, topic: "SQL: INSERT, UPDATE, DELETE", difficulty: 2, category: 'database', practiceType: 'coding' },
  { day: 79, topic: "Работа с БД через ORM (Prisma)", difficulty: 4, category: 'database', practiceType: 'coding' },
  { day: 80, topic: "MongoDB и Mongoose", difficulty: 3, category: 'database', practiceType: 'coding' },
  
  // Безопасность (Дни 81-83)
  { day: 81, topic: "Аутентификация: JWT токены", difficulty: 4, category: 'security', practiceType: 'coding' },
  { day: 82, topic: "Хеширование паролей (bcrypt)", difficulty: 3, category: 'security', practiceType: 'coding' },
  { day: 83, topic: "OWASP Top 10 и защита от атак", difficulty: 4, category: 'security', practiceType: 'theory' },
  
  // AI интеграция (Дни 84-86)
  { day: 84, topic: "Работа с AI API (OpenAI, Anthropic)", difficulty: 3, category: 'ai-ml', practiceType: 'coding' },
  { day: 85, topic: "Streaming ответов от AI", difficulty: 4, category: 'ai-ml', practiceType: 'coding' },
  { day: 86, topic: "Построение AI чат-бота", difficulty: 4, category: 'ai-ml', practiceType: 'coding' },
  
  // DevOps и тестирование (Дни 87-90)
  { day: 87, topic: "Тестирование: Jest и Vitest", difficulty: 3, category: 'testing', practiceType: 'coding' },
  { day: 88, topic: "E2E тестирование с Playwright", difficulty: 4, category: 'testing', practiceType: 'coding' },
  { day: 89, topic: "Docker для JS приложений", difficulty: 4, category: 'devops', practiceType: 'coding' },
  { day: 90, topic: "Финальный проект: Full-stack приложение", difficulty: 5, category: 'project', practiceType: 'project' },
];
