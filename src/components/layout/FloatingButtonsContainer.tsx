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
        <Modal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} size="lg">
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">{contextualHelp.title}</h2>

            <div className="space-y-4">
              {contextualHelp.items.map((item, index) => {
                const topicId = `${pathname}-${index}`;
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors cursor-pointer"
                    onClick={() => handleTopicClick(topicId)}
                  >
                    <h3 className="font-semibold mb-2 text-white">{item.q}</h3>
                    <p className="text-sm text-white/70 leading-relaxed">{item.a}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-white/60 mb-3">
                Нужна дополнительная помощь? Посмотри полный справочник или пройди обучение заново.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" asChild>
                  <Link href="/help">Полный справочник</Link>
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => setIsHelpOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

