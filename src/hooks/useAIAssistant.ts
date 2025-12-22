/**
 * useAIAssistant Hook
 * Manages AI assistant chat state, messages, and interactions
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { getSessionManager } from '@/lib/ai-assistant/session-manager';
import type { Message, ChatResponse, ErrorResponse } from '@/lib/ai-assistant/types';
import { useProgressStore } from '@/store/progress-store';
import { useProfileStore } from '@/store/profile-store';
import { useLocaleStore } from '@/store/locale-store';
import type { UserTier } from '@/types';

/**
 * Error state for the assistant
 */
interface AssistantError {
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
}

/**
 * Hook state interface
 */
interface UseAIAssistantState {
  // UI State
  isOpen: boolean;
  isLoading: boolean;
  error: AssistantError | null;

  // Chat State
  messages: Message[];
  sessionId: string | null;

  // Usage tracking
  requestsToday: number;
  requestLimit: number;

  // Actions
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string, requestType?: 'question' | 'code-help' | 'advice' | 'general') => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearHistory: () => void;
  clearError: () => void;
}

/**
 * Get human-readable language name
 */
function getLanguageName(languageId: string): string {
  const names: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#',
    go: 'Go',
  };
  return names[languageId] || languageId;
}

/**
 * Custom hook for AI Assistant functionality
 */
export function useAIAssistant(externalIsOpen?: boolean): UseAIAssistantState {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AssistantError | null>(null);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Usage tracking
  const [requestsToday, setRequestsToday] = useState(0);
  const [requestLimit, setRequestLimit] = useState(5); // Default free tier limit

  // Store last message for retry
  const lastMessageRef = useRef<{ content: string; requestType: 'question' | 'code-help' | 'advice' | 'general' } | null>(null);

  // Get stores
  const { activeDay, languageId } = useProgressStore();
  const { profile } = useProfileStore();
  const { locale } = useLocaleStore();

  // Get service instances
  const sessionManager = getSessionManager();

  // Use external isOpen if provided, otherwise use internal
  const effectiveIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;

  /**
   * Initialize session when chat opens
   */
  useEffect(() => {
    if (effectiveIsOpen && !sessionId) {
      // Create new session
      const session = sessionManager.createSession(profile.id, {
        day: activeDay,
        languageId,
      });

      setSessionId(session.id);

      // Generate simple welcome message (no AI service needed on client)
      const welcomeMessage: Message = {
        id: `msg_${Date.now()}_welcome`,
        sessionId: session.id,
        role: 'system',
        content: locale === 'ru'
          ? `Привет! 👋 Я твой AI-помощник по изучению программирования.\n\nСегодня у тебя День ${activeDay} изучения ${getLanguageName(languageId)}. Чем могу помочь? 😊`
          : `Hi! 👋 I'm your AI programming learning assistant.\n\nToday is Day ${activeDay} of learning ${getLanguageName(languageId)}. How can I help? 😊`,
        timestamp: Date.now(),
      };

      sessionManager.addMessage(session.id, welcomeMessage);
      setMessages([welcomeMessage]);
    }
  }, [effectiveIsOpen, sessionId, profile.id, activeDay, languageId, locale, sessionManager]);

  // Note: Messages are managed in component state only
  // SessionManager is not used for message persistence to avoid duplication

  /**
   * Open chat interface
   */
  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Close chat interface
   */
  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Send message to AI assistant
   */
  const sendMessage = useCallback(async (
    content: string,
    requestType: 'question' | 'code-help' | 'advice' | 'general' = 'general'
  ) => {
    console.log('[useAIAssistant] sendMessage called:', { content, requestType, sessionId });

    if (!sessionId) {
      console.error('[useAIAssistant] No active session');
      return;
    }

    if (!content.trim()) {
      console.log('[useAIAssistant] Empty content, skipping');
      return;
    }

    // Store for retry
    lastMessageRef.current = { content, requestType };

    // Clear any existing errors
    setError(null);

    // Create user message
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      sessionId,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      metadata: {
        requestType,
      },
    };

    // Optimistic update - add user message immediately
    setMessages((prev) => [...prev, userMessage]);

    // Set loading state
    setIsLoading(true);

    try {
      // Call API endpoint
      console.log('[useAIAssistant] Calling API:', '/api/ai-assistant/chat');
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          requestType,
          sessionId,
          locale,
        }),
      });

      console.log('[useAIAssistant] API response status:', response.status);

      // Update usage info from headers
      const tierHeader = response.headers.get('X-User-Tier');
      const requestsTodayHeader = response.headers.get('X-Requests-Today');
      const requestLimitHeader = response.headers.get('X-Requests-Limit');

      if (requestsTodayHeader) {
        setRequestsToday(parseInt(requestsTodayHeader, 10));
      }
      if (requestLimitHeader) {
        setRequestLimit(parseInt(requestLimitHeader, 10));
      }

      if (!response.ok) {
        // Handle error response
        console.error('[useAIAssistant] API error, status:', response.status);
        const errorData: ErrorResponse = await response.json();
        console.error('[useAIAssistant] Error data:', errorData);

        setError({
          code: errorData.error.code,
          message: errorData.error.message,
          userMessage: errorData.error.userMessage,
          retryable: errorData.error.retryable,
        });

        // Add error message to chat
        const errorMessage: Message = {
          id: `msg_${Date.now()}_error`,
          sessionId,
          role: 'system',
          content: errorData.error.userMessage,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);

        return;
      }

      // Parse successful response
      console.log('[useAIAssistant] Parsing response...');
      const data: ChatResponse = await response.json();
      console.log('[useAIAssistant] Response data:', data);

      // Update usage info if provided
      if (data.usage) {
        console.log('[useAIAssistant] Updating usage:', data.usage);
        setRequestsToday(data.usage.requestsToday);
        setRequestLimit(data.usage.limit);
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        sessionId,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        metadata: {
          codeBlocks: data.codeExamples,
          suggestions: data.suggestions,
          relatedTopics: data.relatedTopics,
        },
      };

      console.log('[useAIAssistant] Adding assistant message:', assistantMessage);

      // Add assistant message
      setMessages((prev) => {
        console.log('[useAIAssistant] Previous messages:', prev.length);
        const newMessages = [...prev, assistantMessage];
        console.log('[useAIAssistant] New messages:', newMessages.length);
        return newMessages;
      });

      console.log('[useAIAssistant] Message added successfully');

    } catch (err) {
      console.error('Failed to send message:', err);

      // Network or unexpected error
      const networkError: AssistantError = {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error',
        userMessage: locale === 'ru'
          ? 'Не удалось отправить сообщение. Проверьте подключение к интернету.'
          : 'Failed to send message. Please check your internet connection.',
        retryable: true,
      };

      setError(networkError);

      // Add error message to chat
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        sessionId,
        role: 'system',
        content: networkError.userMessage,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);

    } finally {
      setIsLoading(false);
    }
  }, [sessionId, locale]);

  /**
   * Retry last failed message
   */
  const retryLastMessage = useCallback(async () => {
    if (!lastMessageRef.current) {
      return;
    }

    const { content, requestType } = lastMessageRef.current;
    await sendMessage(content, requestType);
  }, [sendMessage]);

  /**
   * Clear chat history
   */
  const clearHistory = useCallback(() => {
    if (sessionId) {
      sessionManager.clearSession(sessionId);
      setMessages([]);
      setSessionId(null);
      setError(null);
      lastMessageRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return {
    // UI State
    isOpen,
    isLoading,
    error,

    // Chat State
    messages,
    sessionId,

    // Usage tracking
    requestsToday,
    requestLimit,

    // Actions
    openChat,
    closeChat,
    sendMessage,
    retryLastMessage,
    clearHistory,
    clearError,
  };
}
