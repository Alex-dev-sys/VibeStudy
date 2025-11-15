'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useGroupsStore } from '@/store/groups-store';
import { toast } from 'sonner';

interface MessageInputProps {
  groupId: string;
}

export function MessageInput({ groupId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { sendMessage, isLoading } = useGroupsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    if (message.trim().length > 1000) {
      toast.error('Сообщение слишком длинное (максимум 1000 символов)');
      return;
    }

    try {
      await sendMessage(groupId, message.trim());
      setMessage('');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('NOT_MEMBER')) {
          toast.error('Вы должны быть участником группы');
        } else {
          toast.error('Не удалось отправить сообщение');
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Написать сообщение... (Enter для отправки, Shift+Enter для новой строки)"
        rows={2}
        maxLength={1000}
        className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/50 outline-none transition-colors focus:border-white/30 focus:bg-white/10"
        disabled={isLoading}
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={isLoading || !message.trim()}
        className="self-end"
      >
        {isLoading ? '⏳' : '📤'}
      </Button>
    </form>
  );
}
