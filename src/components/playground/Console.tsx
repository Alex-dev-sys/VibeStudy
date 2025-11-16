'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from '@/store/locale-store';
import type { ConsoleMessage } from '@/store/playground-store';

interface ConsoleProps {
  messages: ConsoleMessage[];
  onClear: () => void;
}

type MessageFilter = 'all' | 'log' | 'error' | 'warn' | 'info';

export function Console({ messages, onClear }: ConsoleProps) {
  const t = useTranslations();
  const [filter, setFilter] = useState<MessageFilter>('all');
  
  const filteredMessages = useMemo(() => {
    if (filter === 'all') return messages;
    return messages.filter((msg) => msg.type === filter);
  }, [messages, filter]);
  
  const messageCounts = useMemo(() => {
    return {
      log: messages.filter((m) => m.type === 'log').length,
      error: messages.filter((m) => m.type === 'error').length,
      warn: messages.filter((m) => m.type === 'warn').length,
      info: messages.filter((m) => m.type === 'info').length
    };
  }, [messages]);
  
  const getMessageIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };
  
  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warn':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'info':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-white/80 bg-white/5 border-white/10';
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };
  
  return (
    <div className="flex h-full flex-col rounded-lg border border-white/10 bg-black/60">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white/90">{t.playground.output}</span>
          <Badge tone="neutral" className="text-xs">
            {filteredMessages.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter buttons */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                filter === 'all'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {t.achievements.categories.all}
            </button>
            <button
              onClick={() => setFilter('log')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                filter === 'log'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {t.console.log} ({messageCounts.log})
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                filter === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {t.console.error} ({messageCounts.error})
            </button>
            <button
              onClick={() => setFilter('warn')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                filter === 'warn'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {t.console.warn} ({messageCounts.warn})
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                filter === 'info'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {t.console.info} ({messageCounts.info})
            </button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs"
            disabled={messages.length === 0}
          >
            {t.editor.clearCode}
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-white/40">
            <p className="text-sm">{t.playground.outputPlaceholder}</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredMessages.map((message, index) => (
              <motion.div
                key={`${message.timestamp}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`group mb-1 rounded border p-2 font-mono text-xs ${getMessageColor(message.type)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-1 items-start gap-2">
                    <span className="flex-shrink-0">{getMessageIcon(message.type)}</span>
                    <div className="flex-1">
                      <pre className="whitespace-pre-wrap break-words">{message.message}</pre>
                      {message.stack && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-white/60 hover:text-white/80">
                            {t.console.stackTrace}
                          </summary>
                          <pre className="mt-1 whitespace-pre-wrap break-words text-white/60">
                            {message.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-[10px] text-white/40">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(message.message)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      title={t.console.copy}
                    >
                      📋
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
