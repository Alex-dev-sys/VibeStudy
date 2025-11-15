'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { GroupMessage } from '@/types/groups';

interface MessageListProps {
  messages: GroupMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, GroupMessage[]>);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-4xl">⏳</div>
          <p className="text-white/70">Загрузка сообщений...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-4xl">💬</div>
          <p className="text-white/70">Пока нет сообщений</p>
          <p className="mt-1 text-sm text-white/50">Начните общение!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] overflow-y-auto p-4">
      <div className="space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                {formatDate(dateMessages[0].createdAt)}
              </div>
            </div>

            {/* Messages */}
            {dateMessages.map((message, index) => (
              <motion.div
                key={message.id}
                className="mb-3 flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold">
                  {message.user?.name?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Message Content */}
                <div className="flex-1">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="font-medium">
                      {message.user?.name || 'Пользователь'}
                    </span>
                    <span className="text-xs text-white/50">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-white/10 px-3 py-2">
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {message.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
