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
import { useAIAssistant } from '@/hooks/useAIAssistant';

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
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in group`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[80%] ${
          isUser
            ? 'bg-gradient-to-br from-[#ff4bc1] via-[#ff6bd3] to-[#ffd34f] text-white rounded-3xl rounded-br-md px-5 py-3.5 shadow-lg'
            : isSystem
            ? 'bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] text-gray-300 border border-gray-700/50 rounded-3xl px-5 py-3.5 shadow-md'
            : hasCodeBlocks
            ? 'bg-transparent'
            : 'bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] text-white rounded-3xl rounded-bl-md px-5 py-3.5 shadow-lg border border-white/5'
        }`}
      >
        {!isUser && !isSystem && (
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff4bc1] to-[#ffd34f] flex items-center justify-center shadow-md">
              <span className="text-lg">🤖</span>
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] bg-clip-text text-transparent">
              AI {locale === 'ru' ? 'Ассистент' : 'Assistant'}
            </span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
        
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
        
        <div className={`text-xs mt-2.5 flex items-center gap-1.5 ${isUser ? 'text-white/60 justify-end' : 'text-gray-500'}`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-3xl rounded-bl-md px-5 py-3.5 shadow-lg border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff4bc1] to-[#ffd34f] flex items-center justify-center shadow-md animate-pulse">
            <span className="text-lg">🤖</span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }} />
            <span className="w-2.5 h-2.5 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }} />
            <span className="w-2.5 h-2.5 bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-gray-400 font-medium">
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
  // Use AI Assistant hook for state management
  // Pass isOpen to sync with external state
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    clearError,
    requestsToday,
    requestLimit,
  } = useAIAssistant(isOpen);
  
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  // Conversation is always saved
  const saveConversation = true;
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isMobile } = useBreakpoint();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    console.log('[ChatInterface] Rendering messages:', messages.length);
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

  // Clear error when user starts typing
  useEffect(() => {
    if (error && input.trim()) {
      clearError();
    }
  }, [input, error, clearError]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    console.log('[ChatInterface] Sending message:', messageContent);
    setInput(''); // Clear input immediately for better UX
    
    // Send message using the hook
    await sendMessage(messageContent, 'general');
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
      // Clear history using the hook
      clearHistory();
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
    ? `fixed inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#0f0f0f] flex flex-col z-[1000] animate-slide-up`
    : `fixed right-4 bottom-4 w-[380px] bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a] to-[#0f0f0f] rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl flex flex-col transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[950px]'
      } z-[1000] animate-slide-in-right`;

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="relative p-5 border-b border-white/10 min-h-[90px] bg-gradient-to-br from-[#0a1628] via-[#1a2332] to-[#0f1a2e] overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,75,193,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,211,79,0.08),_transparent_50%)]" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
            )}
            
            {/* Brain Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] flex items-center justify-center shadow-xl border border-white/10">
              <svg className="w-9 h-9 text-[#4a9eff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9.5 2C7.5 2 6 3.5 6 5.5c0 1-.5 2-1 2.5C4 9 3 10 3 12s1 3 2 4c.5.5 1 1.5 1 2.5 0 2 1.5 3.5 3.5 3.5 1 0 2-.5 2.5-1 1-.5 2-1 4-1s3 .5 4 1c.5.5 1.5 1 2.5 1 2 0 3.5-1.5 3.5-3.5 0-1 .5-2 1-2.5 1-1 2-2 2-4s-1-3-2-4c-.5-.5-1-1.5-1-2.5C20 3.5 18.5 2 16.5 2c-1 0-2 .5-2.5 1-.5.5-1.5 1-2.5 1s-2-.5-2.5-1C8 2.5 7 2 6 2h-.5z" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
                <path d="M9 15c.5.5 1.5 1 3 1s2.5-.5 3-1" strokeLinecap="round" />
              </svg>
            </div>
            
            <div>
              <h3 className="font-bold text-white text-xl mb-1">
                AI {locale === 'ru' ? 'Ассистент' : 'Assistant'}
              </h3>
              {/* Premium Badge */}
              {userTier === 'premium' || userTier === 'pro_plus' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#d4a574] via-[#f4d03f] to-[#d4a574] shadow-lg">
                  <span className="text-sm font-bold text-[#1a1a1a]">Premium</span>
                  <span className="text-sm">✨</span>
                </div>
              ) : (
                <span className="text-xs font-medium text-gray-400">
                  {locale === 'ru' ? 'Бесплатная версия' : 'Free version'}
                </span>
              )}
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
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-red-400 font-medium mb-1">
                      {locale === 'ru' ? 'Ошибка' : 'Error'}
                    </p>
                    <p className="text-sm text-gray-300">{error.userMessage}</p>
                    {error.retryable && (
                      <button
                        onClick={() => {
                          clearError();
                          // Retry will happen automatically if user sends message again
                        }}
                        className="mt-2 text-sm text-[#ff4bc1] hover:text-[#ffd34f] transition-colors"
                      >
                        {locale === 'ru' ? '✕ Закрыть' : '✕ Dismiss'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>



          {/* Input */}
          <div className="p-5 border-t border-white/10 bg-gradient-to-r from-[#1a1a1a] to-[#1f1f1f]">
            <div className="flex items-end gap-3">
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
                className="flex-1 bg-[#2a2a2a] text-white rounded-2xl px-5 py-3.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff4bc1] focus:bg-[#2f2f2f] max-h-32 text-base border border-white/5 transition-all shadow-inner"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3.5 bg-gradient-to-br from-[#ff4bc1] via-[#ff6bd3] to-[#ffd34f] rounded-2xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[48px] min-h-[48px] flex items-center justify-center shadow-md"
                aria-label="Send"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Quick Actions - moved below input */}
            <div className="mt-3">
              <QuickActions onActionClick={handleQuickAction} locale={locale} />
            </div>
            
            {/* Usage counter */}
            {userTier === 'free' && (
              <div className="mt-2 text-xs text-gray-500 text-right">
                {locale === 'ru' 
                  ? `${requestsToday}/${requestLimit} запросов сегодня`
                  : `${requestsToday}/${requestLimit} requests today`
                }
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
