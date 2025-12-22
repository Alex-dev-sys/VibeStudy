import { CurriculumDay } from '@/types';
import { getLanguageById } from './languages';
import { getDayTheme } from '@/data/themes';
import { getPathContent } from '@/data/paths/content-registry';

interface DayTopic {
  day: number;
  topic: string;
  description: string;
}

interface ModuleTemplate {
  title: string;
  duration: number;
  focus: string[];
  theorySnippet: string;
  recap: string;
}

// Детальные темы для каждого из 90 дней
const DAY_TOPICS: DayTopic[] = [
  { day: 1, topic: 'Введение в программирование и первая программа', description: 'Знакомство с языком, установка окружения, первая программа Hello World' },
  { day: 2, topic: 'Переменные и типы данных', description: 'Объявление переменных, базовые типы данных, операции присваивания' },
  { day: 3, topic: 'Арифметические операции', description: 'Математические операции, приоритет операторов, работа с числами' },
  { day: 4, topic: 'Строки и операции со строками', description: 'Создание строк, конкатенация, форматирование, методы строк' },
  { day: 5, topic: 'Ввод и вывод данных', description: 'Чтение пользовательского ввода, вывод на экран, форматированный вывод' },
  { day: 6, topic: 'Условные операторы if-else', description: 'Логические условия, операторы сравнения, ветвление программы' },
  { day: 7, topic: 'Вложенные условия и elif', description: 'Множественные условия, вложенные if, оператор elif' },
  { day: 8, topic: 'Логические операторы', description: 'AND, OR, NOT, комбинирование условий' },
  { day: 9, topic: 'Цикл while', description: 'Циклы с предусловием, управление итерациями, бесконечные циклы' },
  { day: 10, topic: 'Цикл for и range', description: 'Итерация по последовательностям, функция range, счётчики' },

  { day: 11, topic: 'Списки (массивы)', description: 'Создание списков, индексация, срезы' },
  { day: 12, topic: 'Методы списков', description: 'Добавление, удаление, сортировка элементов' },
  { day: 13, topic: 'Кортежи', description: 'Неизменяемые последовательности, распаковка' },
  { day: 14, topic: 'Словари', description: 'Пары ключ-значение, доступ к элементам' },
  { day: 15, topic: 'Множества', description: 'Уникальные элементы, операции над множествами' },
  { day: 16, topic: 'Вложенные структуры данных', description: 'Списки списков, словари словарей' },
  { day: 17, topic: 'Итерация по коллекциям', description: 'Циклы для обхода списков, словарей, множеств' },
  { day: 18, topic: 'List comprehensions', description: 'Генераторы списков, фильтрация данных' },
  { day: 19, topic: 'Работа с индексами и enumerate', description: 'Получение индексов при итерации' },
  { day: 20, topic: 'Функции zip и map', description: 'Объединение и преобразование коллекций' },

  { day: 21, topic: 'Определение функций', description: 'Создание функций, параметры, возвращаемые значения' },
  { day: 22, topic: 'Аргументы функций', description: 'Позиционные и именованные аргументы, значения по умолчанию' },
  { day: 23, topic: 'Область видимости переменных', description: 'Локальные и глобальные переменные, nonlocal' },
  { day: 24, topic: 'Lambda-функции', description: 'Анонимные функции, применение в filter и map' },
  { day: 25, topic: 'Рекурсия', description: 'Рекурсивные вызовы, базовый случай' },
  { day: 26, topic: 'Модули и import', description: 'Создание модулей, импорт функций' },
  { day: 27, topic: 'Стандартная библиотека', description: 'Полезные встроенные модули' },
  { day: 28, topic: 'Работа с файлами - чтение', description: 'Открытие файлов, чтение содержимого' },
  { day: 29, topic: 'Работа с файлами - запись', description: 'Запись в файлы, режимы открытия' },
  { day: 30, topic: 'Обработка исключений', description: 'Try-except, обработка ошибок' },

  { day: 31, topic: 'Основы ООП - классы', description: 'Создание классов, атрибуты' },
  { day: 32, topic: 'Методы класса', description: 'Определение методов, self' },
  { day: 33, topic: 'Конструктор __init__', description: 'Инициализация объектов' },
  { day: 34, topic: 'Инкапсуляция', description: 'Приватные атрибуты, геттеры и сеттеры' },
  { day: 35, topic: 'Наследование', description: 'Создание дочерних классов, super()' },
  { day: 36, topic: 'Полиморфизм', description: 'Переопределение методов' },
  { day: 37, topic: 'Магические методы', description: '__str__, __repr__, __len__' },
  { day: 38, topic: 'Статические методы и методы класса', description: '@staticmethod, @classmethod' },
  { day: 39, topic: 'Абстрактные классы', description: 'ABC, абстрактные методы' },
  { day: 40, topic: 'Композиция vs Наследование', description: 'Проектирование классов' },

  { day: 41, topic: 'Работа со строками - продвинутое', description: 'Регулярные выражения, re модуль' },
  { day: 42, topic: 'Работа с датами и временем', description: 'datetime модуль' },
  { day: 43, topic: 'Работа с JSON', description: 'Сериализация и десериализация' },
  { day: 44, topic: 'Работа с CSV', description: 'Чтение и запись CSV файлов' },
  { day: 45, topic: 'Генераторы', description: 'yield, ленивые вычисления' },
  { day: 46, topic: 'Декораторы', description: 'Функции-обёртки, @decorator' },
  { day: 47, topic: 'Контекстные менеджеры', description: 'with statement, __enter__ и __exit__' },
  { day: 48, topic: 'Итераторы', description: '__iter__ и __next__' },
  { day: 49, topic: 'Функциональное программирование', description: 'map, filter, reduce' },
  { day: 50, topic: 'Работа с путями - pathlib', description: 'Кроссплатформенная работа с путями' },

  { day: 51, topic: 'Основы алгоритмов - поиск', description: 'Линейный и бинарный поиск' },
  { day: 52, topic: 'Алгоритмы сортировки', description: 'Пузырьковая, быстрая сортировка' },
  { day: 53, topic: 'Сложность алгоритмов', description: 'Big O нотация' },
  { day: 54, topic: 'Стек и очередь', description: 'Реализация базовых структур' },
  { day: 55, topic: 'Связные списки', description: 'Односвязные и двусвязные списки' },
  { day: 56, topic: 'Деревья', description: 'Бинарные деревья, обход' },
  { day: 57, topic: 'Хеш-таблицы', description: 'Принцип работы словарей' },
  { day: 58, topic: 'Графы - основы', description: 'Представление графов' },
  { day: 59, topic: 'Обход графов', description: 'BFS и DFS' },
  { day: 60, topic: 'Динамическое программирование', description: 'Мемоизация, табуляция' },

  { day: 61, topic: 'Тестирование - unittest', description: 'Написание юнит-тестов' },
  { day: 62, topic: 'Тестирование - pytest', description: 'Современный фреймворк тестирования' },
  { day: 63, topic: 'Отладка кода', description: 'Использование отладчика, pdb' },
  { day: 64, topic: 'Логирование', description: 'logging модуль' },
  { day: 65, topic: 'Виртуальные окружения', description: 'venv, управление зависимостями' },
  { day: 66, topic: 'Пакетный менеджер pip', description: 'Установка библиотек, requirements.txt' },
  { day: 67, topic: 'Git - основы', description: 'Инициализация репозитория, коммиты' },
  { day: 68, topic: 'Git - ветвление', description: 'Создание веток, merge' },
  { day: 69, topic: 'Документирование кода', description: 'Docstrings, генерация документации' },
  { day: 70, topic: 'Линтеры и форматтеры', description: 'pylint, black, flake8' },

  { day: 71, topic: 'Работа с API - requests', description: 'HTTP запросы, REST API' },
  { day: 72, topic: 'Парсинг HTML - BeautifulSoup', description: 'Web scraping' },
  { day: 73, topic: 'Работа с базами данных - SQL', description: 'Основы SQL, sqlite3' },
  { day: 74, topic: 'ORM - SQLAlchemy основы', description: 'Объектно-реляционное отображение' },
  { day: 75, topic: 'Асинхронное программирование', description: 'async/await, asyncio' },
  { day: 76, topic: 'Многопоточность', description: 'threading модуль' },
  { day: 77, topic: 'Многопроцессность', description: 'multiprocessing модуль' },
  { day: 78, topic: 'Работа с изображениями - Pillow', description: 'Обработка изображений' },
  { day: 79, topic: 'Работа с Excel - openpyxl', description: 'Чтение и запись Excel файлов' },
  { day: 80, topic: 'Создание CLI приложений', description: 'argparse, click' },

  { day: 81, topic: 'Проект: Консольное приложение', description: 'Планирование архитектуры' },
  { day: 82, topic: 'Проект: Реализация основного функционала', description: 'Разработка core логики' },
  { day: 83, topic: 'Проект: Работа с данными', description: 'Интеграция хранилища' },
  { day: 84, topic: 'Проект: Пользовательский интерфейс', description: 'CLI или GUI' },
  { day: 85, topic: 'Проект: Тестирование', description: 'Покрытие тестами' },
  { day: 86, topic: 'Проект: Рефакторинг', description: 'Улучшение кода' },
  { day: 87, topic: 'Проект: Документация', description: 'README, комментарии' },
  { day: 88, topic: 'Подготовка к собеседованиям', description: 'Типичные вопросы' },
  { day: 89, topic: 'Портфолио и резюме', description: 'Оформление проектов' },
  { day: 90, topic: 'План дальнейшего развития', description: 'Roadmap junior разработчика' }
];

/**
 * Получить тему дня для конкретного языка
 * @param day - День обучения (1-90)
 * @param languageId - ID языка программирования
 * @param pathId - ID пути обучения (опционально)
 * @returns Объект с темой дня
 */
export const getDayTopic = (day: number, languageId: string, pathId?: string): DayTopic => {
  const themeData = getDayTheme(languageId, day, pathId);

  if (themeData) {
    return {
      day: themeData.day,
      topic: themeData.topic,
      description: `Изучение темы: ${themeData.topic}`
    };
  }

  // Fallback к старым данным если тема не найдена и это Python
  if (languageId === 'python' && day <= 90) {
    return DAY_TOPICS[day - 1] ?? DAY_TOPICS[0];
  }

  return {
    day,
    topic: `День ${day}`,
    description: 'Тема уточняется'
  };
};

const MODULES: ModuleTemplate[] = [
  {
    title: 'Фундамент и первые шаги',
    duration: 10,
    focus: ['Синтаксис', 'переменные', 'ввод-вывод', 'типизация'],
    theorySnippet:
      'Разберём основы синтаксиса и привычки чистого кода. Выполним первые упражнения и поймём, как работает среда выполнения выбранного языка.',
    recap: 'Объясни ключевые элементы базового синтаксиса и подготовьсь к задачам на переменные и выражения.'
  },
  {
    title: 'Условная логика и циклы',
    duration: 10,
    focus: ['ветвления', 'циклы', 'итерации', 'паттерны чтения входа'],
    theorySnippet:
      'Погружаемся в управляющие конструкции. Учимся строить ветвящиеся сценарии и повторять операции, пока не достигнем нужного результата.',
    recap: 'Подумай, как описать условные конструкции и когда стоит выбирать тот или иной цикл.'
  },
  {
    title: 'Структуры данных и коллекции',
    duration: 10,
    focus: ['списки', 'словари', 'множества', 'кортежи'],
    theorySnippet:
      'Сравним основные коллекции языка, проработаем типичные операции над ними и научимся выбирать оптимальную структуру под задачу.',
    recap: 'Сформулируй отличия между ключевыми коллекциями и их применимость.'
  },
  {
    title: 'Функции и модули',
    duration: 10,
    focus: ['повторное использование', 'параметры', 'область видимости', 'тестируемость'],
    theorySnippet:
      'Рефакторим код в функции, обсуждаем чистые функции и проектируем модули. Учимся документировать поведение и писать тесты.',
    recap: 'Продумай сигнатуры функций, их возвращаемые значения и способы тестирования.'
  },
  {
    title: 'Парадигмы и ООП',
    duration: 10,
    focus: ['классы', 'объекты', 'наследование', 'инкапсуляция'],
    theorySnippet:
      'Создаём собственные типы, используем принципы SOLID и моделируем предметную область. Разбираем паттерны проектирования уровня junior.',
    recap: 'Сформулируй преимущества ООП и пример применения принципов SOLID.'
  },
  {
    title: 'Работа с данными и файлами',
    duration: 8,
    focus: ['файлы', 'форматы', 'парсинг', 'исключения'],
    theorySnippet:
      'Прикручиваем ввод-вывод, читаем и записываем данные, обрабатываем исключения и логируем всё важное.',
    recap: 'Как аккуратно обрабатывать ошибки и гарантировать закрытие ресурсов?'
  },
  {
    title: 'Инструменты разработчика',
    duration: 7,
    focus: ['git', 'рефакторинг', 'линтеры', 'дебаг'],
    theorySnippet:
      'Автоматизируем рабочий процесс: контроль версий, установка зависимостей, статический анализ и отладка.',
    recap: 'Опиши свой рабочий пайплайн и какие инструменты помогают поддерживать качество.'
  },
  {
    title: 'Проектная работа',
    duration: 15,
    focus: ['архитектура', 'API', 'слои', 'навигация'],
    theorySnippet:
      'Переходим к фичам проекта: проектируем структуру, реализуем функционал и документируем. Закладываем основу MVP.',
    recap: 'Как бы ты спланировал проект и разбил его на задачи?'
  },
  {
    title: 'Алгоритмы и оптимизация',
    duration: 7,
    focus: ['алгоритмы', 'сложность', 'оптимизация', 'тестирование'],
    theorySnippet:
      'Готовим себя к собеседованиям: анализ выполняемости, базовые алгоритмы и техники оптимизации.',
    recap: 'Оцени временную и пространственную сложность реализованных решений.'
  },
  {
    title: 'Финал и карьерный трек',
    duration: 3,
    focus: ['подготовка резюме', 'портфолио', 'интервью', 'рост'],
    theorySnippet:
      'Финализируем курс: обновляем портфолио, готовим резюме, тренируемся проходить интервью и ставим цели развития.',
    recap: 'Сформулируй свой план дальнейшего роста после курса.'
  }
];

export const buildCurriculum = (languageId: string, pathId?: string): CurriculumDay[] => {
  // 1. Попытка загрузить контент пути из реестра
  if (pathId) {
    const pathContent = getPathContent(pathId);
    if (pathContent && pathContent.length > 0) {
      return pathContent.map(day => {
        // Извлекаем концепции из задач для фокуса (убираем дубликаты)
        const taskConcepts = day.tasks?.flatMap(t => t.concepts || []) || [];
        const uniqueFocus = Array.from(new Set([day.topic, ...taskConcepts])).slice(0, 4);

        return {
          day: day.day,
          title: day.topic,
          theory: day.theory || `Теория для темы: ${day.topic}`,
          focus: uniqueFocus.length > 0 ? uniqueFocus : [day.topic],
          recapQuestion: day.recap || 'Что вы узнали сегодня?',
          theme: day.topic
        };
      });
    }
  }

  // 2. Fallback: Генерация на основе старых шаблонов (только если нет пути или путь не найден)
  // Это сохраняет работу старой логики для языков/путей, которые еще не перенесены полностью

  const language = getLanguageById(languageId);
  const descriptionEnhancer = ` на языке ${language.label}`;

  let dayCounter = 1;
  const days: CurriculumDay[] = [];

  MODULES.forEach((module) => {
    for (let i = 0; i < module.duration; i += 1) {
      const focusPoint = module.focus[i % module.focus.length];
      const theory = `${module.theorySnippet} Сегодняшняя тема: ${focusPoint}${descriptionEnhancer}. Дополнительное внимание уделяем практическим приёмам и читаем код коллег.`;

      const themeData = getDayTheme(languageId, dayCounter, pathId);
      const displayTitle = themeData ? themeData.topic : `${module.title}: день ${i + 1}`;

      days.push({
        day: dayCounter,
        title: displayTitle,
        theory,
        focus: module.focus,
        recapQuestion: module.recap,
        theme: module.title
      });

      dayCounter += 1;
    }
  });

  return days;
};

