'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useGroupsStore } from '@/store/groups-store';
import { LANGUAGES } from '@/lib/languages';
import { toast } from 'sonner';
import type { CreateGroupData } from '@/types/groups';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGroupDialog({ isOpen, onClose }: CreateGroupDialogProps) {
  const [formData, setFormData] = useState<CreateGroupData>({
    name: '',
    description: '',
    languageId: 'python'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateGroupData, string>>>({});

  const { createGroup, isLoading } = useGroupsStore();

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateGroupData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Минимум 3 символа';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Максимум 50 символов';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Минимум 10 символов';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Максимум 500 символов';
    }

    if (!formData.languageId) {
      newErrors.languageId = 'Выберите язык';
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
      await createGroup(formData);
      toast.success('Группа успешно создана!');
      onClose();
      setFormData({ name: '', description: '', languageId: 'python' });
      setErrors({});
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('MAX_GROUPS_CREATED')) {
          toast.error('Вы можете создать максимум 3 группы');
        } else {
          toast.error('Не удалось создать группу');
        }
      }
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ name: '', description: '', languageId: 'python' });
    setErrors({});
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
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Создать группу</h2>
                <p className="mt-1 text-sm text-white/60">
                  Создайте группу для совместного обучения
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
                    {formData.name.length}/50 символов
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium text-white">
                    Описание *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Изучаем Python с нуля. Обсуждаем задачи, помогаем друг другу."
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/50 outline-none transition-colors focus:border-white/30 focus:bg-white/10"
                    maxLength={500}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                  )}
                  <p className="mt-1 text-xs text-white/40">
                    {formData.description.length}/500 символов
                  </p>
                </div>

                {/* Language */}
                <div>
                  <label htmlFor="language" className="mb-2 block text-sm font-medium text-white">
                    Язык программирования *
                  </label>
                  <select
                    id="language"
                    value={formData.languageId}
                    onChange={(e) => setFormData({ ...formData, languageId: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none transition-colors focus:border-white/30 focus:bg-white/10"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  {errors.languageId && (
                    <p className="mt-1 text-xs text-red-400">{errors.languageId}</p>
                  )}
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
                    Создать
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
