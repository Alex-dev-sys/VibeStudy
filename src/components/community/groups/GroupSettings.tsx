'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useGroupsStore } from '@/store/groups-store';
import { LANGUAGES } from '@/lib/languages';
import { toast } from 'sonner';
import type { Group, UpdateGroupData } from '@/types/groups';

interface GroupSettingsProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupSettings({ group, isOpen, onClose }: GroupSettingsProps) {
  const [formData, setFormData] = useState<UpdateGroupData>({
    name: group.name,
    description: group.description,
    languageId: group.languageId
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateGroupData, string>>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { updateGroup, deleteGroup, isLoading } = useGroupsStore();

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateGroupData, string>> = {};

    if (formData.name !== undefined) {
      if (!formData.name.trim()) {
        newErrors.name = 'Название обязательно';
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'Минимум 3 символа';
      } else if (formData.name.trim().length > 50) {
        newErrors.name = 'Максимум 50 символов';
      }
    }

    if (formData.description !== undefined) {
      if (!formData.description.trim()) {
        newErrors.description = 'Описание обязательно';
      } else if (formData.description.trim().length < 10) {
        newErrors.description = 'Минимум 10 символов';
      } else if (formData.description.trim().length > 500) {
        newErrors.description = 'Максимум 500 символов';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await updateGroup(group.id, formData);
      toast.success('Группа успешно обновлена!');
      onClose();
    } catch (error) {
      toast.error('Не удалось обновить группу');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGroup(group.id);
      toast.success('Группа удалена');
      window.location.href = '/community/groups';
    } catch (error) {
      toast.error('Не удалось удалить группу');
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: group.name,
      description: group.description,
      languageId: group.languageId
    });
    setErrors({});
    setShowDeleteConfirm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#1a0f1f] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {!showDeleteConfirm ? (
                <>
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">Настройки группы</h2>
                    <p className="mt-1 text-sm text-white/60">
                      Редактируйте информацию о группе
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-white">
                        Название группы *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Python для начинающих"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/50 outline-none transition-colors focus:border-white/30 focus:bg-white/10"
                        maxLength={50}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                      )}
                      <p className="mt-1 text-xs text-white/40">
                        {formData.name?.length || 0}/50 символов
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="description"
                        className="mb-2 block text-sm font-medium text-white"
                      >
                        Описание *
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Изучаем Python с нуля. Обсуждаем задачи, помогаем друг другу."
                        rows={4}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/50 outline-none transition-colors focus:border-white/30 focus:bg-white/10"
                        maxLength={500}
                      />
                      {errors.description && (
                        <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                      )}
                      <p className="mt-1 text-xs text-white/40">
                        {formData.description?.length || 0}/500 символов
                      </p>
                    </div>

                    {/* Language */}
                    <div>
                      <label
                        htmlFor="language"
                        className="mb-2 block text-sm font-medium text-white"
                      >
                        Язык программирования *
                      </label>
                      <select
                        id="language"
                        value={formData.languageId}
                        onChange={(e) =>
                          setFormData({ ...formData, languageId: e.target.value })
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none transition-colors focus:border-white/30 focus:bg-white/10 [&>option]:bg-[#1a0f1f] [&>option]:text-white"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.id} value={lang.id} className="bg-[#1a0f1f] text-white">
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={handleClose}
                        disabled={isLoading}
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={isLoading}
                        isLoading={isLoading}
                      >
                        Сохранить
                      </Button>
                    </div>
                  </form>

                  {/* Delete Button */}
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <p className="mb-3 text-sm text-white/60">Опасная зона</p>
                    <Button
                      variant="secondary"
                      className="w-full border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/40 hover:bg-red-500/20"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isLoading}
                    >
                      🗑️ Удалить группу
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Delete Confirmation */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-red-400">Удалить группу?</h2>
                    <p className="mt-2 text-sm text-white/70">
                      Это действие нельзя отменить. Все сообщения и данные группы будут
                      удалены навсегда.
                    </p>
                  </div>

                  <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm text-red-200">
                      ⚠️ Вы собираетесь удалить группу "{group.name}" с {group.memberCount}{' '}
                      участниками
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isLoading}
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={handleDelete}
                      disabled={isLoading}
                      isLoading={isLoading}
                    >
                      Удалить навсегда
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
