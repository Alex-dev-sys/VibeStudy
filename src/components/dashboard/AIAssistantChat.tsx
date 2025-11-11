'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useScrollLock } from '@/hooks/useScrollLock';

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

  useScrollLock(isOpen);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-panel relative flex h-[90vh] w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-3xl p-4 md:h-[85vh] md:flex-row md:p-6"
        >
          <div className="flex h-full flex-1 flex-col overflow-hidden">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <h2 className="text-lg font-semibold text-white sm:text-xl">ИИ-помощник</h2>
                  <p className="text-xs text-white/60 sm:text-sm">
                    День {day} · {topic}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <div className="flex h-full flex-col gap-4 overflow-y-auto p-4 pr-3">
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
                          ? 'bg-accent text-white shadow-glow'
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
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
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Задайте вопрос по теории или задачам..."
                disabled={isLoading}
                className="flex-1 resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-accent/50 focus:outline-none disabled:opacity-50"
                rows={2}
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="sm:self-end"
              >
                {isLoading ? '⏳' : '📤'}
              </Button>
            </div>

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
          </div>

          <aside className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 md:max-w-[260px]">
            <div>
              <h3 className="text-sm font-semibold text-white/80">Контекст дня</h3>
              <p className="mt-1 text-xs text-white/60">
                Здесь сохраняются ответы ассистента. Пересмотри их в любое время.
              </p>
            </div>
            <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white/70">
              <p className="font-semibold text-white">Тема</p>
              <p>{topic}</p>
              <p className="pt-2 font-semibold text-white">Теория в двух словах</p>
              <p className="max-h-44 overflow-y-auto whitespace-pre-wrap pr-1 text-white/60">{theory}</p>
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/10 p-3 text-xs text-white/80">
              <p className="font-semibold">Совет</p>
              <p className="mt-1">
                Формулируй вопросы конкретно: укажи, где застрял, какое решение пробовал и какой результат ожидаешь.
              </p>
            </div>
          </aside>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
