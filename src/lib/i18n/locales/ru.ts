export const ru = {
  common: {
    loading: 'Загрузка...',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    close: 'Закрыть',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущий',
    reset: 'Сбросить'
  },
  home: {
    title: 'Стань Junior разработчиком за 90 дней',
    subtitle: 'Структурированный курс программирования с нуля до уровня junior',
    description: 'Теория, практика и AI-генерируемые задания каждый день',
    startButton: 'Начать обучение',
    playgroundButton: 'Playground',
    features: {
      theory: 'Подробная теория',
      editor: 'Интерактивный редактор',
      ai: 'AI-задания',
      progress: 'Отслеживание прогресса'
    },
    stats: {
      days: 'Дней обучения',
      tasks: 'Практических задач',
      languages: 'Языков на выбор'
    },
    footer: 'Бесплатно • Без регистрации • 7 языков программирования'
  },
  dashboard: {
    title: '90-дневный план перехода в junior',
    subtitle: 'Следи за прогрессом, переключайся между днями и отмечай выполненные задания',
    profile: 'Профиль',
    playground: 'Playground',
    completed: 'Пройдено',
    streak: 'Серия',
    achievements: 'Достижений',
    days: 'дней',
    selectLanguage: 'Выбери язык обучения',
    dayNavigation: 'Навигация по дням',
    generateTasks: 'Сгенерировать теорию и задания',
    completeDay: 'Завершить день',
    generating: 'Генерация...'
  },
  profile: {
    title: 'Профиль',
    backToLearning: 'Вернуться к обучению',
    edit: 'Редактировать',
    save: 'Сохранить',
    cancel: 'Отмена',
    namePlaceholder: 'Ваше имя',
    bioPlaceholder: 'Расскажите о себе...',
    joinedToday: 'Присоединился сегодня',
    joinedDaysAgo: 'с нами',
    stats: {
      daysCompleted: 'Дней завершено',
      achievements: 'Достижений',
      progress: 'Прогресс'
    }
  },
  achievements: {
    title: 'Достижения',
    unlocked: 'Открыто',
    progress: 'Прогресс',
    categories: {
      all: 'Все',
      progress: 'Прогресс',
      streak: 'Серии',
      tasks: 'Задачи',
      special: 'Особые'
    },
    obtained: 'Получено'
  },
  statistics: {
    title: 'Статистика обучения',
    subtitle: 'Детальная аналитика вашего прогресса и активности',
    totalDays: 'Дней завершено',
    totalTasks: 'Задач решено',
    currentStreak: 'Текущая серия',
    perfectDays: 'Идеальных дней',
    timeAndProgress: 'Время и прогресс',
    totalTime: 'Общее время обучения',
    completionRate: 'Процент завершения',
    avgTasksPerDay: 'Средняя задач/день',
    longestStreak: 'Лучшая серия',
    tasksByDifficulty: 'Задачи по сложности',
    progressByWeeks: 'Прогресс по неделям',
    activityCalendar: 'Календарь активности',
    less: 'Меньше',
    more: 'Больше'
  },
  playground: {
    title: 'Playground',
    subtitle: 'Экспериментируй с кодом, тестируй идеи и учись на практике',
    selectLanguage: 'Выбери язык программирования',
    codeEditor: 'Редактор кода',
    output: 'Вывод программы',
    outputPlaceholder: 'Результат выполнения твоего кода появится здесь',
    runCode: 'Запустить код',
    running: 'Выполнение...',
    format: 'Форматировать',
    clear: 'Очистить',
    tips: {
      title: 'Советы по использованию Playground',
      experiment: 'Экспериментируй: Пробуй разные подходы к решению задач',
      test: 'Тестируй идеи: Проверяй гипотезы перед применением в задачах',
      learn: 'Учись на ошибках: Не бойся ошибок — они помогают учиться',
      save: 'Сохраняй код: Копируй интересные решения для дальнейшего использования',
      formatting: 'Используй кнопку "✨ Форматировать" для улучшения читаемости кода'
    }
  },
  tasks: {
    theory: 'Теория дня',
    tasks: 'Задачи дня',
    recapTask: 'Контрольное задание',
    recapDescription: 'Повторение материала предыдущего дня — не забывай изученное!',
    clickToOpen: 'Нажми на любую задачу, чтобы открыть редактор и начать решение',
    checkSolution: 'Проверить решение',
    checking: 'Проверка...',
    completed: 'Выполнено',
    hint: 'Подсказка'
  }
};

export type Translations = typeof ru;

