'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface AIAssistantChatProps {
  day: number;
  topic: string;
  theory: string;
  languageId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function AIAssistantChat({ day, topic, theory, languageId, isOpen, onClose }: AIAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Привет! Я твой ИИ-помощник 🤖\n\nСегодня мы изучаем: ${topic}\n\nЗадай мне любой вопрос по теории, попроси объяснить концепцию или помочь с задачей!`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/explain-theory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          context: {
            day,
            topic,
            theory
          },
          languageId
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось получить ответ');
      }

      const data = await response.json();

      let assistantContent = data.explanation;

      if (data.examples && data.examples.length > 0) {
        assistantContent += '\n\n📝 Примеры:\n\n';
        data.examples.forEach((example: string, i: number) => {
          assistantContent += `${i + 1}. ${example}\n\n`;
        });
      }

      if (data.relatedTopics && data.relatedTopics.length > 0) {
        assistantContent += '\n🔗 Связанные темы: ' + data.relatedTopics.join(', ');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Извините, произошла ошибка. Попробуйте переформулировать вопрос или попробуйте позже.',
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Ошибка ИИ-помощника:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-panel relative flex h-[90vh] max-h-[700px] w-full max-w-2xl flex-col rounded-3xl p-6"
        >
          {/* Заголовок */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h2 className="text-xl font-semibold text-white">ИИ-помощник</h2>
                <p className="text-sm text-white/60">День {day}: {topic}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Сообщения */}
          <div className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-accent text-white'
                      : 'border border-white/10 bg-white/5 text-white/90'
                  }`}
                >
                  <pre className="whitespace-pre-wrap text-sm font-sans">{message.content}</pre>
                  <p className="mt-2 text-xs opacity-60">
                    {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ввод */}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Задайте вопрос по теории..."
              disabled={isLoading}
              className="flex-1 resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-accent/50 focus:outline-none disabled:opacity-50"
              rows={2}
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="self-end"
            >
              {isLoading ? '⏳' : '📤'}
            </Button>
          </div>

          {/* Подсказки */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInput('Объясни основную концепцию темы')}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10"
            >
              💡 Объясни концепцию
            </button>
            <button
              onClick={() => setInput('Покажи примеры использования')}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10"
            >
              📝 Покажи примеры
            </button>
            <button
              onClick={() => setInput('Какие частые ошибки допускают новички?')}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10"
            >
              ⚠️ Частые ошибки
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
