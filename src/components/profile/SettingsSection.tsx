'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useHelpStore } from '@/store/help-store';
import { HelpCircle, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Modal } from '@/components/ui/modal';

export function SettingsSection() {
  const { getMostAccessedTopics } = useHelpStore();
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
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-4 text-white">Настройки</h2>
        
        <div className="space-y-4">
          {/* Help Statistics */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Статистика помощи</h3>
                <p className="text-sm text-white/60">
                  Посмотри, какие темы ты просматривал чаще всего
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleViewHelpStats}>
              Показать
            </Button>
          </div>

          {/* Delete All Data */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/15 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Удалить все данные</h3>
                <p className="text-sm text-white/60">
                  Удалить весь прогресс и начать с нуля
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDeleteAllData} className="text-red-400 hover:text-red-300">
              Удалить
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="sm"
      >
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Удалить все данные?</h2>
            <p className="text-white/70">
              Это действие нельзя отменить. Весь твой прогресс, достижения и настройки будут удалены.
            </p>
          </div>

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
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={confirmDeleteAllData}
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
