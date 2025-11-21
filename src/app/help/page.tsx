'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, BookOpen, Code, BarChart3, User, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHelpStore } from '@/store/help-store';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ComponentType<{ className?: string }>;
}

const faqItems: FAQItem[] = [
  // Learning
  {
    id: 'start-day',
    category: 'Обучение',
    question: 'Как начать новый день обучения?',
    answer: 'Перейди на страницу "Обучение", выбери день и нажми кнопку "Начать день". AI сгенерирует персональную теорию и практические задания специально для тебя. Генерация может занять 30-60 секунд.',
    icon: BookOpen,
  },
  {
    id: 'complete-task',
    category: 'Обучение',
    question: 'Как выполнить задание?',
    answer: 'Открой задание, напиши код в редакторе и нажми "Проверить решение". AI проверит твой код и даст обратную связь. Если решение верное, задание будет отмечено как выполненное.',
    icon: Code,
  },
  {
    id: 'get-hint',
    category: 'Обучение',
    question: 'Как получить подсказку?',
    answer: 'Если застрял на задании, нажми кнопку "Подсказка" в модальном окне задания. AI даст тебе направление, не раскрывая полное решение. Используй подсказки разумно — они помогают учиться!',
    icon: Zap,
  },
  {
    id: 'complete-day',
    category: 'Обучение',
    question: 'Как завершить день?',
    answer: 'Выполни все задания дня, затем нажми кнопку "Завершить день". Ты получишь XP, обновишь серию дней и, возможно, разблокируешь новые достижения. Празднуй свой прогресс!',
    icon: Award,
  },
  {
    id: 'change-language',
    category: 'Обучение',
    question: 'Можно ли изменить язык программирования?',
    answer: 'Да! Перейди в профиль и выбери новый язык. Прогресс сохраняется отдельно для каждого языка, так что ты можешь изучать несколько языков параллельно.',
    icon: Code,
  },

  // Playground
  {
    id: 'playground-purpose',
    category: 'Песочница',
    question: 'Для чего нужна песочница?',
    answer: 'Playground — это место для свободных экспериментов с кодом. Тестируй идеи, пробуй новые подходы, изучай синтаксис без ограничений. Это твоя личная лаборатория!',
    icon: Code,
  },
  {
    id: 'run-code',
    category: 'Песочница',
    question: 'Как запустить код в песочнице?',
    answer: 'Напиши код в редакторе и нажми Ctrl+Enter (Cmd+Enter на Mac) или кнопку "Запустить код". Результат выполнения появится в консоли ниже.',
    icon: Zap,
  },
  {
    id: 'save-snippet',
    category: 'Песочница',
    question: 'Можно ли сохранить код?',
    answer: 'Да! Используй кнопку "Сохранить сниппет", чтобы сохранить интересные решения. Все сохраненные сниппеты доступны в боковой панели для быстрого доступа.',
    icon: BookOpen,
  },

  // Analytics
  {
    id: 'activity-calendar',
    category: 'Аналитика',
    question: 'Что показывает календарь активности?',
    answer: 'Календарь отображает твою активность по дням. Чем темнее цвет клетки, тем больше задач ты выполнил в этот день. Это помогает визуализировать твою последовательность.',
    icon: BarChart3,
  },
  {
    id: 'perfect-days',
    category: 'Аналитика',
    question: 'Что такое "идеальные дни"?',
    answer: 'Идеальный день — это день, когда ты выполнил все задания без использования подсказок. Это показатель твоей самостоятельности и глубины понимания материала.',
    icon: Award,
  },
  {
    id: 'recommendations',
    category: 'Аналитика',
    question: 'Как использовать рекомендации?',
    answer: 'Система анализирует твой прогресс и дает персональные советы: на что обратить внимание, какие темы повторить, как улучшить результаты. Следуй рекомендациям для более эффективного обучения.',
    icon: Zap,
  },

  // Profile & Progress
  {
    id: 'streak',
    category: 'Прогресс',
    question: 'Что такое серия дней?',
    answer: 'Серия — это количество дней подряд, когда ты завершал хотя бы одно задание. Серия сбрасывается, если пропустить день. Поддерживай серию для максимальной мотивации!',
    icon: Award,
  },
  {
    id: 'achievements',
    category: 'Прогресс',
    question: 'Как разблокировать достижения?',
    answer: 'Достижения разблокируются автоматически при выполнении определенных целей: завершение дней, поддержание серии, решение задач. Всего доступно 21 достижение в 4 категориях.',
    icon: Award,
  },
  {
    id: 'sync-progress',
    category: 'Прогресс',
    question: 'Как синхронизировать прогресс между устройствами?',
    answer: 'Войди в аккаунт через Google или Email, и твой прогресс будет автоматически синхронизироваться между всеми устройствами. Без аккаунта прогресс хранится только локально.',
    icon: User,
  },

  // Account
  {
    id: 'guest-mode',
    category: 'Аккаунт',
    question: 'Можно ли учиться без регистрации?',
    answer: 'Да! Ты можешь начать обучение в гостевом режиме. Прогресс будет сохраняться в браузере. Когда захочешь синхронизировать данные, просто создай аккаунт.',
    icon: User,
  },
  {
    id: 'create-account',
    category: 'Аккаунт',
    question: 'Зачем создавать аккаунт?',
    answer: 'Аккаунт дает доступ к облачной синхронизации прогресса, достижениям, детальной аналитике и Telegram-напоминаниям. Плюс, твой прогресс не потеряется при очистке браузера.',
    icon: User,
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { trackTopicAccess } = useHelpStore();

  const categories = ['all', ...Array.from(new Set(faqItems.map((item) => item.category)))];

  const filteredItems = faqItems.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (itemId: string) => {
    trackTopicAccess(itemId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c061c] via-[#1a0b2e] to-[#0c061c] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/learn">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к обучению
            </Button>
          </Link>

          <h1 className="text-4xl font-bold mb-3">Справочный центр</h1>
          <p className="text-white/70 text-lg">
            Найди ответы на часто задаваемые вопросы и узнай, как эффективно использовать платформу
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Поиск по вопросам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-[#ff0094] to-[#ff5bc8] text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {category === 'all' ? 'Все' : category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">Ничего не найдено. Попробуй другой запрос.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <details
                  key={item.id}
                  className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/8 transition-colors"
                  onClick={() => handleItemClick(item.id)}
                >
                  <summary className="flex items-center gap-4 p-5 cursor-pointer list-none">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#ff0094]/20 to-[#ff5bc8]/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#ff5bc8]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-open:text-[#ff5bc8] transition-colors">
                        {item.question}
                      </h3>
                      <p className="text-xs text-white/50 mt-1">{item.category}</p>
                    </div>
                    <div className="flex-shrink-0 text-white/40 group-open:rotate-180 transition-transform">
                      ▼
                    </div>
                  </summary>
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-white/70 leading-relaxed pl-14">{item.answer}</p>
                  </div>
                </details>
              );
            })
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-gradient-to-r from-[#ff0094]/10 to-[#ff5bc8]/10 border border-[#ff5bc8]/30 rounded-2xl">
          <h2 className="text-xl font-bold mb-3">Не нашел ответ?</h2>
          <p className="text-white/70 mb-4">
            Если у тебя остались вопросы, попробуй пройти интерактивное обучение заново или обратись в поддержку.
          </p>
          <div className="flex gap-3">
            <Button variant="primary" asChild>
              <Link href="/learn">Начать обучение</Link>
            </Button>
            <Button variant="secondary" asChild>
              <a href="mailto:support@vibestudy.com">Связаться с поддержкой</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
