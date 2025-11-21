'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { usePlaygroundStore } from '@/store/playground-store';

interface SaveSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

export function SaveSnippetModal({ isOpen, onClose, code, language }: SaveSnippetModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const saveSnippet = usePlaygroundStore((state) => state.saveSnippet);
  
  const handleSave = () => {
    if (!name.trim()) {
      setError('Введите название сниппета');
      return;
    }
    
    if (name.length > 50) {
      setError('Название слишком длинное (макс. 50 символов)');
      return;
    }
    
    try {
      saveSnippet({
        name: name.trim(),
        language,
        code
      });
      
      setName('');
      setError('');
      onClose();
    } catch (err) {
      setError('Не удалось сохранить сниппет');
    }
  };
  
  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-[rgba(12,6,28,0.95)] p-6 shadow-2xl backdrop-blur-xl"
        >
          <h2 className="text-xl font-semibold text-white">Сохранить сниппет</h2>
          <p className="mt-2 text-sm text-white/60">
            Дайте название вашему сниппету для быстрого доступа
          </p>
          
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="snippet-name" className="block text-sm font-medium text-white/80">
                Название
              </label>
              <input
                id="snippet-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Например: Быстрая сортировка"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                maxLength={50}
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
              )}
            </div>
            
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/60">
                <strong>Язык:</strong> {language}
              </p>
              <p className="mt-1 text-xs text-white/60">
                <strong>Размер:</strong> {code.length} символов
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={handleClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1"
            >
              Сохранить
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
