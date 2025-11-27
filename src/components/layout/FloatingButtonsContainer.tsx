'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useHelpStore } from '@/store/help-store';
import { useAIAssistant } from '@/components/ai-assistant/AIAssistantContext';

interface HelpItem {
  q: string;
  a: string;
}

interface ContextualHelp {
  title: string;
  items: HelpItem[];
}

export function FloatingButtonsContainer() {
  const pathname = usePathname();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { trackHelpButtonClick, trackTopicAccess } = useHelpStore();
  const { isOpen: isAIAssistantOpen, onOpenClick: onAIAssistantClick } = useAIAssistant();

  const contextualHelp = useMemo((): ContextualHelp | null => {
    if (pathname?.startsWith('/learn')) {
      return {
        title: 'Как работает обучение?',
        items: [
          {
            q: 'Как начать день?',
            a: 'Нажми "Начать день" и получи персональные задания от AI. Система сгенерирует теорию и практические задачи специально для тебя.',
          },
          {
            q: 'Что делать с заданиями?',
            a: 'Открой задание, напиши код в редакторе и проверь решение. Если нужна помощь, используй кнопку "Подсказка".',
          },
          {
            q: 'Как завершить день?',
            a: 'Выполни все задания и нажми "Завершить день". Ты получишь XP, обновишь серию и, возможно, разблокируешь достижения!',
          },
          {
            q: 'Что такое серия дней?',
            a: 'Серия — это количество дней подряд, когда ты завершал хотя бы одно задание. Поддерживай серию для максимальной мотивации!',
          },
        ],
      };
    }

    if (pathname?.startsWith('/playground')) {
      return {
        title: 'Как использовать песочницу?',
        items: [
          {
            q: 'Для чего песочница?',
            a: 'Playground — это место для экспериментов с кодом без ограничений. Тестируй идеи, пробуй новые подходы и учись на практике.',
          },
          {
            q: 'Как запустить код?',
            a: 'Напиши код в редакторе и нажми Ctrl+Enter (Cmd+Enter на Mac) или кнопку "Запустить код". Результат появится в консоли.',
          },
          {
            q: 'Можно ли сохранить код?',
            a: 'Да! Используй кнопку "Сохранить сниппет", чтобы сохранить интересные решения для дальнейшего использования.',
          },
        ],
      };
    }

    if (pathname?.startsWith('/analytics')) {
      return {
        title: 'Как читать аналитику?',
        items: [
          {
            q: 'Что показывает календарь активности?',
            a: 'Календарь отображает твою активность по дням. Чем темнее цвет, тем больше задач ты выполнил в этот день.',
          },
          {
            q: 'Что такое "идеальные дни"?',
            a: 'Идеальный день — это день, когда ты выполнил все задания без использования подсказок. Стремись к большему количеству идеальных дней!',
          },
          {
            q: 'Как использовать рекомендации?',
            a: 'Система анализирует твой прогресс и дает персональные советы по улучшению. Следуй рекомендациям для более эффективного обучения.',
          },
        ],
      };
    }

    if (pathname?.startsWith('/profile')) {
      return {
        title: 'Управление профилем',
        items: [
          {
            q: 'Как изменить язык программирования?',
            a: 'Нажми на текущий язык в профиле и выбери новый. Прогресс сохраняется отдельно для каждого языка.',
          },
          {
            q: 'Что такое достижения?',
            a: 'Достижения — это награды за выполнение определенных целей: завершение дней, поддержание серии, решение задач. Собирай их все!',
          },
          {
            q: 'Как синхронизировать прогресс?',
            a: 'Войди в аккаунт через Google или Email, и твой прогресс будет автоматически синхронизироваться между устройствами.',
          },
        ],
      };
    }

    return null;
  }, [pathname]);

  const showHelp = contextualHelp !== null;
  // AI Assistant button should show on the same pages as help button
  const showAIAssistant = showHelp && onAIAssistantClick;

  const handleHelpOpen = () => {
    setIsHelpOpen(true);
    if (pathname) {
      trackHelpButtonClick(pathname);
    }
  };

  const handleTopicClick = (topicId: string) => {
    trackTopicAccess(topicId);
  };

  if (!showHelp && !showAIAssistant) return null;

  return (
    <>
      <div className="fixed right-6 z-50 flex flex-col items-end gap-3" style={{ bottom: '24px' }}>
        {/* Help Button - Always at same level */}
        {showHelp && (
          <motion.button
            onClick={handleHelpOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-[#ff0094] to-[#ff5bc8] shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow group relative order-1"
            aria-label="Открыть помощь"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <HelpCircle className="w-6 h-6 text-white" />
            {/* Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#2a2a2a] text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Помощь
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-[#2a2a2a] rotate-45" />
            </div>
          </motion.button>
        )}

        {/* AI Assistant Button - Moves down when assistant is closed */}
        {showAIAssistant && (
          <motion.button
            onClick={onAIAssistantClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative order-2"
            animate={{
              opacity: 1,
              scale: 1,
              y: isAIAssistantOpen ? 0 : 0
            }}
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            aria-label="Открыть AI ассистента"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-xl">
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>

            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] opacity-0 group-hover:opacity-20 animate-ping" />

            {/* Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#2a2a2a] text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              AI Ассистент
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-[#2a2a2a] rotate-45" />
            </div>
          </motion.button>
        )}
      </div>

      {/* Help Modal */}
      {contextualHelp && (
        <Modal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} size="lg" showCloseButton={false}>
          <div className="flex flex-col h-full">
            {/* Header with gradient background */}
            <div className="relative overflow-hidden p-6 pb-8 bg-gradient-to-br from-[#2a1b3d] to-[#1a0b2e]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff0094]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              {/* Custom Close Button */}
              <button
                onClick={() => setIsHelpOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 group"
                aria-label="Закрыть"
              >
                <div className="relative w-5 h-5">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current rotate-45 transform -translate-y-1/2 group-hover:rotate-180 transition-transform duration-300" />
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-current -rotate-45 transform -translate-y-1/2 group-hover:-rotate-180 transition-transform duration-300" />
                </div>
              </button>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md">
                    <HelpCircle className="w-6 h-6 text-[#ff0094]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{contextualHelp.title}</h2>
                </div>
                <p className="text-white/60 text-sm pl-[52px]">
                  Быстрые ответы на частые вопросы в этом разделе
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#130a21]">
              {contextualHelp.items.map((item, index) => {
                const topicId = `${pathname}-${index}`;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-[#ff0094]/50 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    onClick={() => handleTopicClick(topicId)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff0094]/0 to-[#ff0094]/0 group-hover:from-[#ff0094]/5 group-hover:to-transparent transition-all duration-500" />

                    <div className="relative p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-[#ff0094]/20 flex items-center justify-center group-hover:bg-[#ff0094] group-hover:scale-110 transition-all duration-300">
                          <span className="text-xs font-bold text-[#ff0094] group-hover:text-white transition-colors">?</span>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg text-white group-hover:text-[#ff0094] transition-colors">
                            {item.q}
                          </h3>
                          <p className="text-sm text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#0f081a] border-t border-white/10">
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <p className="text-xs text-white/40 text-center sm:text-left">
                  Не нашли ответ? <br className="sm:hidden" /> Спросите AI-ассистента или изучите базу знаний.
                </p>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border-white/10"
                    asChild
                  >
                    <Link href="/help">База знаний</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 sm:flex-none hover:bg-white/5"
                    onClick={() => setIsHelpOpen(false)}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

