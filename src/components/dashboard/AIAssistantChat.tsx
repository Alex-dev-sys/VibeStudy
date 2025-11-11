'use client';

import { useMemo } from 'react';
import ChatBot from 'react-chatbotify';
import type { Flow, Settings, Styles } from 'react-chatbotify';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollLock } from '@/hooks/useScrollLock';

interface AIAssistantChatProps {
  day: number;
  topic: string;
  theory: string;
  languageId: string;
  isOpen: boolean;
  onClose: () => void;
}

type ExplainTheoryResponse = {
  explanation?: string;
  examples?: string[];
  relatedTopics?: string[];
};

const formatAssistantResponse = (payload: ExplainTheoryResponse) => {
  const segments: string[] = [];

  if (payload.explanation?.trim()) {
    segments.push(payload.explanation.trim());
  }

  if (payload.examples && payload.examples.length > 0) {
    const formattedExamples = payload.examples
      .filter((example) => example.trim())
      .map((example, index) => `${index + 1}. ${example.trim()}`);

    if (formattedExamples.length > 0) {
      segments.push(['📝 Примеры:', ...formattedExamples].join('\n'));
    }
  }

  if (payload.relatedTopics && payload.relatedTopics.length > 0) {
    const topics = payload.relatedTopics.filter((topic) => topic.trim());
    if (topics.length > 0) {
      segments.push(`🔗 Связанные темы: ${topics.join(', ')}`);
    }
  }

  return segments.join('\n\n') || 'Мне пока нечего добавить — попробуй задать вопрос иначе.';
};

const getTheorySummary = (theory: string, maxLength: number = 300): string => {
  if (!theory || theory.trim().length === 0) {
    return 'Теория для этого дня ещё не сгенерирована. Сгенерируйте контент дня, чтобы получить подробную теорию.';
  }

  // Убираем markdown заголовки и форматирование
  let cleaned = theory
    .replace(/^##\s+/gm, '')
    .replace(/^#\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .trim();

  // Берем первые предложения до maxLength символов
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Пытаемся обрезать по предложениям
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
  let summary = '';
  
  for (const sentence of sentences) {
    if ((summary + sentence).length <= maxLength) {
      summary += sentence;
    } else {
      break;
    }
  }

  // Если не получилось собрать по предложениям, обрезаем по словам
  if (summary.length === 0) {
    summary = cleaned.substring(0, maxLength);
    const lastSpace = summary.lastIndexOf(' ');
    if (lastSpace > 0) {
      summary = summary.substring(0, lastSpace);
    }
    summary += '...';
  } else if (summary.length < cleaned.length) {
    summary += '...';
  }

  return summary.trim();
};

export function AIAssistantChat({ day, topic, theory, languageId, isOpen, onClose }: AIAssistantChatProps) {
  useScrollLock(isOpen);

  const theorySummary = useMemo(() => getTheorySummary(theory), [theory]);

  const introMessage = useMemo(
    () =>
      `Привет! Я твой ИИ-помощник 🤖\n\nСегодня мы изучаем: ${topic}\n\nЗадай любой вопрос по теории или задачам — отвечу в дружелюбном формате.`,
    [topic]
  );

  const settings = useMemo<Settings>(
    () => ({
      general: {
        embedded: true,
        showHeader: false,
        showFooter: false,
        showInputRow: true,
        fontFamily: 'var(--font-inter)',
        flowStartTrigger: 'start'
      },
      chatWindow: {
        defaultOpen: true,
        showTypingIndicator: false,
        showScrollbar: true,
        showMessagePrompt: false
      },
      notification: { disabled: true },
      audio: { disabled: true },
      voice: { disabled: true },
      chatHistory: { disabled: true },
      emoji: { disabled: true },
      fileAttachment: { disabled: true },
      chatInput: {
        enabledPlaceholderText: 'Задайте вопрос по теории или задачам...',
        disabledPlaceholderText: 'Подождите чуть-чуть...',
        blockSpam: true,
        sendButtonIcon: '📤'
      }
    }),
    []
  );

  const styles = useMemo<Styles>(
    () => ({
      chatWindowStyle: {
        height: '100%',
        background: 'linear-gradient(160deg, rgba(17,18,40,0.9) 0%, rgba(14,15,31,0.92) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.45)'
      },
      bodyStyle: {
        padding: '1.25rem',
        background: 'transparent'
      },
      chatInputContainerStyle: {
        padding: '1rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,12,26,0.85)'
      },
      chatInputAreaStyle: {
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '16px'
      },
      chatInputAreaFocusedStyle: {
        border: '1px solid rgba(255,255,255,0.28)',
        boxShadow: '0 0 0 3px rgba(135,92,255,0.25)'
      },
      userBubbleStyle: {
        background: 'var(--accent-color, #8b5cf6)',
        color: '#fff',
        borderRadius: '20px 20px 4px 20px',
        boxShadow: '0 12px 24px rgba(139,92,246,0.35)'
      },
      botBubbleStyle: {
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.92)',
        borderRadius: '20px 20px 20px 4px',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)'
      },
      sendButtonStyle: {
        background: 'linear-gradient(140deg, #8b5cf6 0%, #ec4899 100%)',
        borderRadius: '9999px',
        color: '#fff'
      },
      sendButtonHoveredStyle: {
        filter: 'brightness(1.05)'
      },
      chatButtonStyle: {
        display: 'none'
      }
    }),
    []
  );

  const flow = useMemo<Flow>(
    () => ({
      start: {
        message: introMessage,
        path: 'awaitQuestion'
      },
      awaitQuestion: {
        function: async (params) => {
          const question = params.userInput?.trim();
          if (!question) {
            await params.goToPath('awaitQuestion');
            return;
          }

          await params.setTextAreaValue('');

          const thinkingMessage = await params.injectMessage('🤔 Думаю над ответом…', 'assistant');

          try {
            const response = await fetch('/api/explain-theory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question,
                context: {
                  day,
                  topic,
                  theory
                },
                languageId
              })
            });

            if (!response.ok) {
              throw new Error('Не удалось получить ответ от ассистента');
            }

            const data: ExplainTheoryResponse = await response.json();
            const assistantReply = formatAssistantResponse(data);

            if (thinkingMessage) {
              await params.removeMessage(thinkingMessage.id);
            }

            await params.injectMessage(assistantReply, 'assistant');
          } catch (error) {
            if (thinkingMessage) {
              await params.removeMessage(thinkingMessage.id);
            }
            await params.injectMessage(
              '❌ Извините, не получилось получить ответ. Попробуйте переформулировать вопрос или повторите позже.',
              'assistant'
            );
            console.error('Ошибка ИИ-помощника:', error);
          } finally {
            await params.goToPath('awaitQuestion');
          }
        }
      }
    }),
    [day, introMessage, languageId, theory, topic]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-panel relative flex h-[90vh] w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-3xl p-4 md:h-[85vh] md:p-6"
        >
          <button
            onClick={onClose}
            aria-label="Закрыть ИИ-помощника"
            className="absolute right-5 top-5 z-10 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/15 hover:text-white"
          >
            ✕
          </button>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30/80 p-5 backdrop-blur">
            <div className="flex flex-col gap-2 text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <h2 className="text-lg font-semibold sm:text-xl">ИИ-помощник</h2>
                  <p className="text-xs text-white/60 sm:text-sm">
                    День {day} · {topic}
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/70">
                Спроси про теорию, попроси примеры или разбор ошибки — ассистент опирается на текущую тему и поможет
                разобраться.
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-hidden md:flex-row">
            <div className="flex h-full flex-1 flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-transparent p-1">
              <div className="rounded-2xl border border-white/10 bg-white/5/30 p-4 text-sm text-white/80 shadow-inner">
                {introMessage.split('\n').map((line, index) => (
                  <p key={index} className="mt-1 first:mt-0">
                    {line}
                  </p>
                ))}
              </div>
              <div className="flex-1 min-h-0">
                <ChatBot id={`ai-assistant-${day}`} flow={flow} settings={settings} styles={styles} />
              </div>
            </div>

            <aside className="flex w-full flex-1 flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-white/70 md:max-w-[260px]">
              <div>
                <h3 className="text-sm font-semibold text-white/80">Контекст дня</h3>
                <p className="mt-1 text-xs text-white/60">
                  Ассистент учитывает твою текущую тему и теорию. Можно копировать подсказки или возвращаться к ним
                  позже.
                </p>
              </div>
              <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
                <p className="font-semibold text-white">Тема</p>
                <p>{topic}</p>
                <p className="pt-2 font-semibold text-white">Кратко о теории</p>
                <p className="max-h-48 overflow-y-auto whitespace-pre-wrap pr-1 text-white/60">{theorySummary}</p>
              </div>
              <div className="rounded-xl border border-accent/20 bg-accent/10 p-3 text-xs text-white/80">
                <p className="font-semibold">Совет</p>
                <p className="mt-1">
                  Формулируй вопросы конкретно: укажи, что именно непонятно и пример, с которым возникла трудность.
                </p>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
