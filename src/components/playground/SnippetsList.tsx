'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { usePlaygroundStore, type CodeSnippet } from '@/store/playground-store';

interface SnippetsListProps {
  onLoadSnippet: (snippet: CodeSnippet) => void;
}

export function SnippetsList({ onLoadSnippet }: SnippetsListProps) {
  const { snippets, deleteSnippet } = usePlaygroundStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const snippetsList = Object.values(snippets).sort((a, b) => b.updatedAt - a.updatedAt);
  
  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteSnippet(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-cancel after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };
  
  if (snippetsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl">📝</span>
        <p className="mt-3 text-sm text-white/60">
          У вас пока нет сохранённых сниппетов
        </p>
        <p className="mt-1 text-xs text-white/40">
          Нажмите "Сохранить сниппет" чтобы добавить первый
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {snippetsList.map((snippet) => (
          <motion.div
            key={snippet.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="group rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-sm font-medium text-white">
                  {snippet.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="neutral" className="text-xs">
                    {snippet.language}
                  </Badge>
                  <span className="text-xs text-white/40">
                    {formatDate(snippet.updatedAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => onLoadSnippet(snippet)}
                  className="rounded p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  title="Загрузить"
                >
                  📂
                </button>
                <button
                  onClick={() => handleDelete(snippet.id)}
                  className={`rounded p-1.5 transition-colors ${
                    deleteConfirm === snippet.id
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                  title={deleteConfirm === snippet.id ? 'Нажмите ещё раз для подтверждения' : 'Удалить'}
                >
                  {deleteConfirm === snippet.id ? '⚠️' : '🗑️'}
                </button>
              </div>
            </div>
            
            {deleteConfirm === snippet.id && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 text-xs text-red-400"
              >
                Нажмите ещё раз для подтверждения удаления
              </motion.p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
