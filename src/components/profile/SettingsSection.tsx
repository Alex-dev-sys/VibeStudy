'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useHelpStore } from '@/store/help-store';
import { useCosmicTheme } from '@/store/cosmic-theme-store';
import { HelpCircle, Trash2, Settings, AlertTriangle } from 'lucide-react';
import { toast } from '@/lib/ui/toast';
import { Modal } from '@/components/ui/modal';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SettingsSection() {
  const { getMostAccessedTopics } = useHelpStore();
  const { theme, setTheme } = useCosmicTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleViewHelpStats = () => {
    const topTopics = getMostAccessedTopics(5);
    if (topTopics.length === 0) {
      toast.info('Статистика помощи', 'Ты еще не использовал справочную систему');
      return;
    }

    const message = topTopics
      .map((topic, index) => `${index + 1}. ${topic.topicId}: ${topic.count} раз`)
      .join('\n');

    toast.info('Самые просматриваемые темы', message);
  };

  const handleDeleteAllData = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAllData = () => {
    // Clear all localStorage data
    const keysToDelete = Object.keys(localStorage).filter(key =>
      key.startsWith('vibestudy-')
    );

    keysToDelete.forEach(key => localStorage.removeItem(key));

    toast.success('Данные удалены', 'Все локальные данные были удалены. Страница будет перезагружена.');

    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-[#1e1e1e] shadow-lg ring-1 ring-white/5"
    >
      <div className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Настройки</h3>
            <p className="text-xs text-white/60">Управление данными</p>
          </div>
        </div>

        <div className="space-y-2">
          {/* Cosmic Theme Selector */}
          <div className="rounded-lg border border-white/5 bg-white/5 p-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                ✨
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Космическая тема</p>
                <p className="text-xs text-white/50">Выбери цвет фона</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('black')}
                className={cn(
                  "relative overflow-hidden rounded-lg border-2 p-3 transition-all duration-300",
                  theme === 'black'
                    ? "border-purple-500 ring-2 ring-purple-500/50"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="h-16 w-full rounded-md bg-gradient-to-b from-purple-900/40 to-blue-900/40 backdrop-blur-sm" />
                  <span className="text-xs font-medium text-white">Черный</span>
                </div>
                {theme === 'black' && (
                  <motion.div
                    layoutId="cosmic-theme-indicator"
                    className="absolute inset-0 bg-purple-500/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>

              <button
                onClick={() => setTheme('red')}
                className={cn(
                  "relative overflow-hidden rounded-lg border-2 p-3 transition-all duration-300",
                  theme === 'red'
                    ? "border-pink-500 ring-2 ring-pink-500/50"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="h-16 w-full rounded-md bg-gradient-to-br from-pink-900/40 via-red-900/40 to-orange-900/40 backdrop-blur-sm" />
                  <span className="text-xs font-medium text-white">Красный</span>
                </div>
                {theme === 'red' && (
                  <motion.div
                    layoutId="cosmic-theme-indicator"
                    className="absolute inset-0 bg-pink-500/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Help Statistics */}
          <button
            onClick={handleViewHelpStats}
            className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Статистика помощи</p>
                <p className="text-xs text-white/50">Часто просматриваемые темы</p>
              </div>
            </div>
            <span className="text-xs text-white/40">Показать</span>
          </button>

          {/* Delete All Data */}
          <button
            onClick={handleDeleteAllData}
            className="flex w-full items-center justify-between rounded-lg border border-red-500/10 bg-red-500/5 p-3 transition-colors hover:bg-red-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-red-200">Сбросить прогресс</p>
                <p className="text-xs text-red-200/50">Удалить все данные и начать заново</p>
              </div>
            </div>
            <AlertTriangle className="h-4 w-4 text-red-400/50" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="sm"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-white">Удалить все данные?</h2>
          <p className="mb-6 text-sm text-white/60">
            Это действие необратимо. Весь ваш прогресс, достижения и настройки будут полностью удалены.
          </p>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              onClick={confirmDeleteAllData}
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

