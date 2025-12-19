import type { DayTheme } from './types';

export const goThemes: DayTheme[] = [
  // Основы (Дни 1-15)
  { day: 1, topic: "Структура программы, пакет main", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 2, topic: "Переменные и константы", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 3, topic: "Базовые типы данных", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 4, topic: "Арифметические операции", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 5, topic: "Условный оператор if", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 6, topic: "Цикл for (единственный цикл в Go)", difficulty: 1, category: 'basics', practiceType: 'coding' },
  { day: 7, topic: "Оператор switch", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 8, topic: "Функции: объявление и параметры", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 9, topic: "Возврат нескольких значений из функции", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 10, topic: "Анонимные функции и замыкания", difficulty: 3, category: 'basics', practiceType: 'coding' },
  { day: 11, topic: "Массивы (arrays)", difficulty: 2, category: 'data-structures', practiceType: 'coding' },
  { day: 12, topic: "Слайсы (slices): основы", difficulty: 2, category: 'data-structures', practiceType: 'coding' },
  { day: 13, topic: "Слайсы: append, copy, make", difficulty: 2, category: 'data-structures', practiceType: 'coding' },
  { day: 14, topic: "Карты (maps)", difficulty: 2, category: 'data-structures', practiceType: 'coding' },
  { day: 15, topic: "Указатели (pointers): основы", difficulty: 3, category: 'basics', practiceType: 'coding' },
  
  // Структуры и интерфейсы (Дни 16-28)
  { day: 16, topic: "Указатели в функциях", difficulty: 3, category: 'basics', practiceType: 'coding' },
  { day: 17, topic: "Структуры (struct)", difficulty: 2, category: 'oop', practiceType: 'coding' },
  { day: 18, topic: "Вложенные структуры", difficulty: 3, category: 'oop', practiceType: 'coding' },
  { day: 19, topic: "Методы структур", difficulty: 3, category: 'oop', practiceType: 'coding' },
  { day: 20, topic: "Методы с ресивером-указателем", difficulty: 3, category: 'oop', practiceType: 'coding' },
  { day: 21, topic: "Интерфейсы: основы", difficulty: 3, category: 'oop', practiceType: 'coding' },
  { day: 22, topic: "Пустой интерфейс interface{} / any", difficulty: 3, category: 'oop', practiceType: 'coding' },
  { day: 23, topic: "Утверждение типов (Type Assertion)", difficulty: 3, category: 'oop', practiceType: 'coding' },
  { day: 24, topic: "Обработка ошибок (error type)", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 25, topic: "Кастомные ошибки", difficulty: 3, category: 'basics', practiceType: 'coding' },
  { day: 26, topic: "Паника (panic) и восстановление (recover)", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 27, topic: "Отложенный вызов defer", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 28, topic: "Работа со строками и рунами (rune)", difficulty: 3, category: 'basics', practiceType: 'coding' },
  
  // Пакеты и файлы (Дни 29-35)
  { day: 29, topic: "Форматирование строк (fmt пакет)", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 30, topic: "Мини-проект: CLI утилита", difficulty: 3, category: 'project', practiceType: 'project' },
  { day: 31, topic: "Модули Go (go mod)", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 32, topic: "Чтение и запись файлов", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 33, topic: "Работа с JSON", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 34, topic: "Работа с датой и временем", difficulty: 2, category: 'basics', practiceType: 'coding' },
  { day: 35, topic: "Generics в Go", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  
  // Конкурентность (Дни 36-48)
  { day: 36, topic: "Горутины (goroutines): основы", difficulty: 3, category: 'advanced', practiceType: 'coding' },
  { day: 37, topic: "Каналы (channels): передача данных", difficulty: 3, category: 'advanced', practiceType: 'coding' },
  { day: 38, topic: "Буферизированные каналы", difficulty: 3, category: 'advanced', practiceType: 'coding' },
  { day: 39, topic: "Закрытие каналов и range по каналам", difficulty: 3, category: 'advanced', practiceType: 'coding' },
  { day: 40, topic: "Оператор select", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 41, topic: "Синхронизация: WaitGroup", difficulty: 3, category: 'advanced', practiceType: 'coding' },
  { day: 42, topic: "Синхронизация: Mutex и RWMutex", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 43, topic: "Пакет context: отмена операций", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 44, topic: "Таймеры и тикеры", difficulty: 3, category: 'advanced', practiceType: 'coding' },
  { day: 45, topic: "Паттерны конкурентности: Worker Pool", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 46, topic: "Паттерны конкурентности: Fan-out/Fan-in", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 47, topic: "Race conditions и их предотвращение", difficulty: 4, category: 'advanced', practiceType: 'theory' },
  { day: 48, topic: "Graceful shutdown", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  
  // HTTP и Web (Дни 49-58)
  { day: 49, topic: "HTTP клиент в Go", difficulty: 2, category: 'web', practiceType: 'coding' },
  { day: 50, topic: "HTTP сервер: основы net/http", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 51, topic: "Обработка URL и параметров запроса", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 52, topic: "Middleware в HTTP сервере", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 53, topic: "Фреймворк Gin/Chi: роутинг", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 54, topic: "REST API: CRUD операции", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 55, topic: "Валидация данных", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 56, topic: "Swagger/OpenAPI документация", difficulty: 3, category: 'web', practiceType: 'coding' },
  { day: 57, topic: "WebSocket в Go", difficulty: 4, category: 'web', practiceType: 'coding' },
  { day: 58, topic: "Аутентификация: JWT", difficulty: 4, category: 'security', practiceType: 'coding' },
  
  // Базы данных (Дни 59-65)
  { day: 59, topic: "SQL с database/sql", difficulty: 3, category: 'database', practiceType: 'coding' },
  { day: 60, topic: "Мини-проект: REST API с БД", difficulty: 4, category: 'project', practiceType: 'project' },
  { day: 61, topic: "Транзакции в SQL", difficulty: 3, category: 'database', practiceType: 'coding' },
  { day: 62, topic: "GORM: основы ORM", difficulty: 3, category: 'database', practiceType: 'coding' },
  { day: 63, topic: "GORM: связи моделей", difficulty: 4, category: 'database', practiceType: 'coding' },
  { day: 64, topic: "Миграции базы данных", difficulty: 3, category: 'database', practiceType: 'coding' },
  { day: 65, topic: "Работа с Redis", difficulty: 3, category: 'database', practiceType: 'coding' },
  
  // gRPC (Дни 66-70)
  { day: 66, topic: "Protocol Buffers", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 67, topic: "gRPC: создание сервиса", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 68, topic: "gRPC: клиент и сервер", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 69, topic: "gRPC: streaming", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 70, topic: "gRPC Gateway (REST + gRPC)", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  
  // Тестирование (Дни 71-74)
  { day: 71, topic: "Юнит-тестирование (пакет testing)", difficulty: 3, category: 'testing', practiceType: 'coding' },
  { day: 72, topic: "Табличное тестирование", difficulty: 3, category: 'testing', practiceType: 'coding' },
  { day: 73, topic: "Mock объекты и интерфейсы", difficulty: 4, category: 'testing', practiceType: 'coding' },
  { day: 74, topic: "Benchmark тесты", difficulty: 3, category: 'testing', practiceType: 'coding' },
  
  // Cloud Native и Kubernetes (Дни 75-84)
  { day: 75, topic: "Docker для Go приложений", difficulty: 3, category: 'devops', practiceType: 'coding' },
  { day: 76, topic: "Multi-stage Docker builds", difficulty: 4, category: 'devops', practiceType: 'coding' },
  { day: 77, topic: "Kubernetes: основы и концепции", difficulty: 4, category: 'devops', practiceType: 'theory' },
  { day: 78, topic: "Kubernetes: Deployment и Service", difficulty: 4, category: 'devops', practiceType: 'coding' },
  { day: 79, topic: "Kubernetes: ConfigMap и Secrets", difficulty: 4, category: 'devops', practiceType: 'coding' },
  { day: 80, topic: "client-go: программное взаимодействие с K8s", difficulty: 5, category: 'devops', practiceType: 'coding' },
  { day: 81, topic: "Prometheus: метрики приложения", difficulty: 4, category: 'devops', practiceType: 'coding' },
  { day: 82, topic: "OpenTelemetry: трейсинг", difficulty: 4, category: 'devops', practiceType: 'coding' },
  { day: 83, topic: "Структурированное логирование (zap, zerolog)", difficulty: 3, category: 'devops', practiceType: 'coding' },
  { day: 84, topic: "Health checks и Readiness probes", difficulty: 3, category: 'devops', practiceType: 'coding' },
  
  // Архитектура и финал (Дни 85-90)
  { day: 85, topic: "Clean Architecture в Go", difficulty: 4, category: 'advanced', practiceType: 'theory' },
  { day: 86, topic: "Принципы SOLID в Go", difficulty: 4, category: 'advanced', practiceType: 'theory' },
  { day: 87, topic: "Работа с AI API", difficulty: 3, category: 'ai-ml', practiceType: 'coding' },
  { day: 88, topic: "CI/CD с GitHub Actions", difficulty: 3, category: 'devops', practiceType: 'coding' },
  { day: 89, topic: "Профилирование (pprof)", difficulty: 4, category: 'advanced', practiceType: 'coding' },
  { day: 90, topic: "Финальный проект: Cloud-native микросервис", difficulty: 5, category: 'project', practiceType: 'project' },
];
