'use client';

import { Code2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface EmptySnippetsProps {
  onCreateSnippet?: () => void;
}

/**
 * Empty state for playground snippets list when no snippets are saved
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function EmptySnippets({ onCreateSnippet }: EmptySnippetsProps) {
  return (
    <EmptyState
      icon={Code2}
      title="Нет сохранённых сниппетов"
      description="Сохраняй интересные фрагменты кода, чтобы вернуться к ним позже. Создай свою коллекцию полезных примеров!"
      action={
        onCreateSnippet
          ? {
              label: 'Написать код',
              onClick: onCreateSnippet,
            }
          : undefined
      }
      helpText="Используй кнопку 'Сохранить сниппет' в редакторе кода"
      metadata={
        <div className="flex items-center justify-center gap-4">
          <span>💾 Неограниченное хранение</span>
          <span>•</span>
          <span>📂 Все языки</span>
        </div>
      }
      size="sm"
      dashed={false}
    />
  );
}
