'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/store/locale-store';
import type { ConsoleMessage } from '@/store/playground-store';
import { Terminal, Trash2, Copy, AlertCircle, AlertTriangle, Info, CheckCircle2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsoleProps {
  messages: ConsoleMessage[];
  onClear: () => void;
}

type MessageFilter = 'all' | 'log' | 'error' | 'warn' | 'info';

export function Console({ messages, onClear }: ConsoleProps) {
  const t = useTranslations();
  const [filter, setFilter] = useState<MessageFilter>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
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
        return <AlertCircle className="h-3.5 w-3.5 text-red-400" />;
      case 'warn':
        return <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />;
      case 'info':
        return <Info className="h-3.5 w-3.5 text-blue-400" />;
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />;
    }
  };
  
  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-300 bg-red-500/5 border-l-2 border-red-500/50';
      case 'warn':
        return 'text-yellow-200 bg-yellow-500/5 border-l-2 border-yellow-500/50';
      case 'info':
        return 'text-blue-300 bg-blue-500/5 border-l-2 border-blue-500/50';
      default:
        return 'text-gray-300 hover:bg-white/5 border-l-2 border-transparent';
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
    <div className="flex h-full flex-col rounded-xl bg-[#1e1e1e] shadow-2xl overflow-hidden font-mono text-sm ring-1 ring-white/5">
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-4">
          {/* Traffic Lights */}
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          
          <div className="flex items-center gap-2 text-gray-400 ml-2">
            <Terminal className="h-4 w-4" />
            <span className="text-xs font-medium">Console Output</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-black/20 rounded-lg p-0.5">
            {(['all', 'log', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as MessageFilter)}
                className={cn(
                  "px-2.5 py-1 text-[10px] rounded-md transition-all",
                  filter === f 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                {f === 'all' ? 'ALL' : f.toUpperCase()}
                {f !== 'all' && messageCounts[f] > 0 && (
                  <span className="ml-1 opacity-70">({messageCounts[f]})</span>
                )}
              </button>
            ))}
          </div>
          
          <div className="h-4 w-px bg-white/10 mx-1" />
          
          <button
            onClick={onClear}
            className="flex items-center justify-center h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t.editor.clearCode}
            disabled={messages.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {filteredMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-600 gap-3">
            <Terminal className="h-12 w-12 opacity-20" />
            <p className="text-xs font-mono">
              {messages.length === 0 ? '> Ready to run code...' : '> No messages match filter'}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredMessages.map((message, index) => (
              <motion.div
                key={`${message.timestamp}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "group relative flex gap-3 p-2 rounded-md transition-colors",
                  getMessageColor(message.type)
                )}
              >
                <span className="mt-0.5 flex-shrink-0 opacity-70">
                  {getMessageIcon(message.type)}
                </span>
                
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-baseline justify-between gap-4">
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                      {message.message}
                    </pre>
                    <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 select-none">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  
                  {message.stack && (
                    <div className="mt-2 pl-2 border-l border-white/10">
                      <pre className="whitespace-pre-wrap break-words text-[10px] text-red-300/70 font-mono">
                        {message.stack}
                      </pre>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => copyToClipboard(message.message)}
                  className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded"
                  title="Copy"
                >
                  <Copy className="h-3 w-3 text-gray-400" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {/* Cursor blinking effect when idle/empty */}
        {messages.length === 0 && (
          <div className="mt-2 h-4 w-2 bg-gray-500/50 animate-pulse" />
        )}
      </div>
    </div>
  );
}
