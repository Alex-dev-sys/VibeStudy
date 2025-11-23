'use client';

import { HelpCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useHelpStore } from '@/store/help-store';

interface HelpItem {
  q: string;
  a: string;
}

interface ContextualHelp {
  title: string;
  items: HelpItem[];
}

export function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { trackHelpButtonClick, trackTopicAccess } = useHelpStore();

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

  if (!contextualHelp) return null;

  const handleOpen = () => {
    setIsOpen(true);
    if (pathname) {
      trackHelpButtonClick(pathname);
    }
  };

  const handleTopicClick = (topicId: string) => {
    trackTopicAccess(topicId);
  };

  return (
    <>
      <motion.button
        onClick={handleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-[120px] md:bottom-[120px] right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[#ff0094] to-[#ff5bc8] shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
        aria-label="Открыть помощь"
      >
        <HelpCircle className="w-6 h-6 text-white" />
      </motion.button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
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
              <Button variant="ghost" className="flex-1" onClick={() => setIsOpen(false)}>
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
