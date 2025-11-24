export type Dictionary = typeof ruDictionary;

export const ruDictionary = {
    benefits: {
        title: 'Почему выбирают',
        subtitle: 'Всё необходимое для старта карьеры в программировании',
        items: [
            {
                icon: '🤖',
                title: 'AI-наставник 24/7',
                description: 'Персональный помощник проверяет код, даёт подсказки и объясняет сложные темы',
                details: 'Получай мгновенный фидбек на свой код, как от опытного ментора. AI анализирует твои решения и предлагает улучшения.'
            },
            {
                icon: '📚',
                title: 'Структурированная программа',
                description: '90 дней пошагового обучения от основ до уровня junior разработчика',
                details: 'Каждый день — новая тема с теорией и практикой. Программа адаптируется под твой темп и уровень знаний.'
            },
            {
                icon: '💼',
                title: 'Готовое портфолио',
                description: 'Реальные проекты для резюме, которые впечатлят работодателей',
                details: 'Собери портфолио из практических кейсов. К концу курса у тебя будет 10+ проектов для GitHub.'
            },
            {
                icon: '🎯',
                title: 'Геймификация обучения',
                description: 'Достижения, стрики и прогресс делают обучение увлекательным',
                details: 'Зарабатывай награды, поддерживай серии выполненных дней и отслеживай свой рост в детальной аналитике.'
            }
        ]
    },
    telegram: {
        motivational: {
            reminder: (hours: number, day: number) => `🎯 Привет! Заметил, что ты не занимался уже ${hours} часов.\n\nТы на дне ${day} из 90. Не теряй темп! 💪\n\nДаже 15 минут практики сегодня помогут сохранить прогресс.`,
            streak: (days: number) => `🔥 Невероятно! Серия ${days} дней подряд!\n\nТы показываешь отличную дисциплину. Продолжай в том же духе! 🚀`,
            lowScore: `💡 Вижу, что некоторые задачи даются сложно.\n\nНе переживай! Это нормальная часть обучения. Попробуй:\n• Повторить теорию\n• Использовать подсказки ИИ-помощника\n• Решать задачи попроще\n\nТы справишься! 💪`,
            standard: (day: number, completed: number, score: number) => `📚 Время для обучения!\n\nДень ${day}/90 • Пройдено: ${completed} дней\nСредний балл: ${score}\n\nГотов продолжить? Жду тебя в VibeStudy! 🚀`
        },
        advice: {
            header: (day: number) => `🎓 *Персональный совет на день ${day}*\n\n`,
            weakAreas: (areas: string[]) => `⚠️ *Требуют внимания:*\n${areas.map(a => `• ${a}`).join('\n')}\n\nРекомендую повторить эти темы перед продолжением.\n\n`,
            goodProgress: `💪 *Отличный прогресс!*\nТы можешь попробовать более сложные задачи.\n\n`,
            slowDown: `🎯 *Совет:*\nНе спеши! Лучше хорошо усвоить основы, чем быстро пройти курс.\n\n`,
            startStreak: `🔥 *Начни серию!*\nЗанимайся каждый день, чтобы получить ачивку "Неделя подряд".\n\n`,
            footer: `Удачи в обучении! 🚀`
        }
    }
};

export const enDictionary = {
    benefits: {
        title: 'Why choose',
        subtitle: 'Everything you need to start a career in programming',
        items: [
            {
                icon: '🤖',
                title: 'AI Mentor 24/7',
                description: 'Personal assistant checks code, gives hints and explains complex topics',
                details: 'Get instant feedback on your code, like from an experienced mentor. AI analyzes your solutions and suggests improvements.'
            },
            {
                icon: '📚',
                title: 'Structured Program',
                description: '90 days of step-by-step learning from basics to junior developer level',
                details: 'Every day is a new topic with theory and practice. The program adapts to your pace and knowledge level.'
            },
            {
                icon: '💼',
                title: 'Ready Portfolio',
                description: 'Real projects for your resume that will impress employers',
                details: 'Build a portfolio of practical cases. By the end of the course you will have 10+ projects for GitHub.'
            },
            {
                icon: '🎯',
                title: 'Gamified Learning',
                description: 'Achievements, streaks and progress make learning fun',
                details: 'Earn rewards, maintain streaks and track your growth in detailed analytics.'
            }
        ]
    },
    telegram: {
        motivational: {
            reminder: (hours: number, day: number) => `🎯 Hi! Noticed you haven't practiced for ${hours} hours.\n\nYou are on day ${day} of 90. Don't lose momentum! 💪\n\nEven 15 minutes of practice today will help keep your progress.`,
            streak: (days: number) => `🔥 Incredible! Streak of ${days} days in a row!\n\nYou show great discipline. Keep it up! 🚀`,
            lowScore: `💡 I see some tasks are tricky.\n\nDon't worry! This is a normal part of learning. Try:\n• Reviewing theory\n• Using AI hints\n• Solving simpler tasks\n\nYou got this! 💪`,
            standard: (day: number, completed: number, score: number) => `📚 Time to learn!\n\nDay ${day}/90 • Completed: ${completed} days\nAverage score: ${score}\n\nReady to continue? Waiting for you in VibeStudy! 🚀`
        },
        advice: {
            header: (day: number) => `🎓 *Personal advice for day ${day}*\n\n`,
            weakAreas: (areas: string[]) => `⚠️ *Needs attention:*\n${areas.map(a => `• ${a}`).join('\n')}\n\nRecommend reviewing these topics before continuing.\n\n`,
            goodProgress: `💪 *Great progress!*\nYou can try more complex tasks.\n\n`,
            slowDown: `🎯 *Advice:*\nDon't rush! Better to master the basics than to rush through the course.\n\n`,
            startStreak: `🔥 *Start a streak!*\nPractice every day to get the "Week in a row" achievement.\n\n`,
            footer: `Good luck learning! 🚀`
        }
    }
};

export const getDictionary = (locale: 'ru' | 'en') => {
    return locale === 'en' ? enDictionary : ruDictionary;
};
