'use client';

/**
 * Chat Interface Component
 * Main chat interface for AI Learning Assistant
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Send, ArrowLeft, Trash2, Shield } from 'lucide-react';
import type { Message } from '@/lib/ai-assistant/types';
import type { UserTier } from '@/types';
import { CodeBlock } from './CodeBlock';
import { QuickActions } from './QuickActions';
import { useBreakpoint } from '@/hooks/useMobileResponsive';
import { getSessionManager } from '@/lib/ai-assistant/session-manager';

/**
 * Props for ChatInterface
 */
interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: UserTier;
  locale?: 'ru' | 'en';
}

/**
 * Message component
 */
interface MessageProps {
  message: Message;
  locale: 'ru' | 'en';
}

function MessageBubble({ message, locale }: MessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if message has code blocks in metadata
  const hasCodeBlocks = message.metadata?.codeBlocks && message.metadata.codeBlocks.length > 0;

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[80%] ${
          isUser
            ? 'bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] text-white rounded-2xl px-4 py-3'
            : isSystem
            ? 'bg-[#2a2a2a] text-gray-300 border border-gray-700 rounded-2xl px-4 py-3'
            : hasCodeBlocks
            ? 'bg-transparent'
            : 'bg-[#2a2a2a] text-white rounded-2xl px-4 py-3'
        }`}
      >
        {!isUser && !isSystem && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🤖</span>
            <span className="text-sm font-medium text-[#ff4bc1]">
              AI {locale === 'ru' ? 'Ассистент' : 'Assistant'}
            </span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        
        {/* Render code blocks if present */}
        {hasCodeBlocks && (
          <div className="mt-2">
            {message.metadata!.codeBlocks!.map((block, index) => (
              <CodeBlock
                key={`${message.id}-code-${index}`}
                code={block.code}
                language={block.language}
                locale={locale}
              />
            ))}
          </div>
        )}
        
        {/* Render suggestions if present */}
        {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-sm font-medium text-[#ff4bc1] mb-2">
              {locale === 'ru' ? 'Рекомендации:' : 'Suggestions:'}
            </p>
            <ul className="space-y-1">
              {message.metadata.suggestions.map((suggestion, index) => (
                <li key={`${message.id}-suggestion-${index}`} className="text-sm text-gray-300">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Render related topics if present */}
        {message.metadata?.relatedTopics && message.metadata.relatedTopics.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-sm font-medium text-[#ff4bc1] mb-1">
              {locale === 'ru' ? 'Связанные темы:' : 'Related topics:'}
            </p>
            <p className="text-sm text-gray-400">
              {message.metadata.relatedTopics.join(', ')}
            </p>
          </div>
        )}
        
        <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

/**
 * Typing indicator component
 */
function TypingIndicator({ locale }: { locale: 'ru' | 'en' }) {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-[#2a2a2a] rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-[#ff4bc1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-[#ff4bc1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-[#ff4bc1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-400">
            {locale === 'ru' ? 'Печатает...' : 'Typing...'}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * ChatInterface component
 */
export function ChatInterface({
  isOpen,
  onClose,
  userTier,
  locale = 'ru',
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [saveConversation, setSaveConversation] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionIdRef = useRef<string>('default');
  const { isMobile } = useBreakpoint();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        sessionId: 'default',
        role: 'system',
        content:
          locale === 'ru'
            ? 'Привет! 👋 Я твой AI-помощник по изучению программирования. Чем могу помочь?'
            : 'Hi! 👋 I\'m your AI programming learning assistant. How can I help you?',
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      sessionId: 'default',
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Call API endpoint
      // For now, simulate response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        sessionId: 'default',
        role: 'assistant',
        content:
          locale === 'ru'
            ? 'Это тестовый ответ. API интеграция будет добавлена позже.'
            : 'This is a test response. API integration will be added later.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (template: string) => {
    setInput(template);
    // Focus the input after setting the template
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearHistory = () => {
    if (showClearConfirm) {
      // Clear messages from UI
      setMessages([]);
      
      // Clear session from SessionManager
      const sessionManager = getSessionManager();
      sessionManager.clearSession(sessionIdRef.current);
      
      // Add welcome message back
      const welcomeMessage: Message = {
        id: 'welcome',
        sessionId: sessionIdRef.current,
        role: 'system',
        content:
          locale === 'ru'
            ? 'Привет! 👋 Я твой AI-помощник по изучению программирования. Чем могу помочь?'
            : 'Hi! 👋 I\'m your AI programming learning assistant. How can I help you?',
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
      
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  if (!isOpen) return null;

  // Mobile: Full screen overlay
  // Desktop: Floating panel
  const containerClasses = isMobile
    ? `fixed inset-0 bg-[#1a1a1a] flex flex-col z-[1000] animate-slide-up`
    : `fixed right-4 bottom-4 w-[400px] bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-800 flex flex-col transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      } z-[1000] animate-slide-in-right`;

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 min-h-[60px]">
        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <span className="text-2xl">💬</span>
          <div>
            <h3 className="font-semibold text-white">
              AI {locale === 'ru' ? 'Ассистент' : 'Assistant'}
            </h3>
            <p className="text-xs text-gray-400">
              {userTier === 'free' && (locale === 'ru' ? 'Бесплатный' : 'Free')}
              {userTier === 'premium' && 'Premium'}
              {userTier === 'pro_plus' && 'Pro+'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isMinimized && (
            <button
              onClick={handleClearHistory}
              className={`p-2 hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                showClearConfirm ? 'bg-red-500/20 text-red-400' : 'text-gray-400'
              }`}
              aria-label={locale === 'ru' ? 'Очистить историю' : 'Clear history'}
              title={
                showClearConfirm
                  ? locale === 'ru'
                    ? 'Нажмите еще раз для подтверждения'
                    : 'Click again to confirm'
                  : locale === 'ru'
                  ? 'Очистить историю'
                  : 'Clear history'
              }
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {!isMobile && (
            <>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </>
          )}
          {isMobile && !isMinimized && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-2"
            style={{
              // Adjust for mobile keyboard
              maxHeight: isMobile ? 'calc(100vh - 60px - 120px - 80px)' : undefined,
            }}
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} locale={locale} />
            ))}
            
            {isLoading && <TypingIndicator locale={locale} />}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <QuickActions onActionClick={handleQuickAction} locale={locale} />

          {/* Privacy Controls */}
          <div className="px-4 py-3 border-t border-gray-800 bg-[#1a1a1a]">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={saveConversation}
                  onChange={(e) => setSaveConversation(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-[#2a2a2a] text-[#ff4bc1] focus:ring-2 focus:ring-[#ff4bc1] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {locale === 'ru' ? 'Сохранить разговор' : 'Save conversation'}
                </span>
              </label>
            </div>
            
            {/* Privacy Notice */}
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <p>
                {locale === 'ru' ? (
                  <>
                    История чата хранится только в текущей сессии. {saveConversation ? 'Разговор будет сохранен в базе данных.' : 'При закрытии вкладки история удаляется.'}
                  </>
                ) : (
                  <>
                    Chat history is stored only in the current session. {saveConversation ? 'Conversation will be saved to database.' : 'History is deleted when you close the tab.'}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  locale === 'ru'
                    ? 'Напиши сообщение...'
                    : 'Type a message...'
                }
                className="flex-1 bg-[#2a2a2a] text-white rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff4bc1] max-h-32 text-base"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Send"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
