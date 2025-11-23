/**
 * AI Assistant Chat API Route
 * Handles chat requests with tier checking and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAIAssistantService } from '@/lib/ai-assistant/service';
import { filterContent } from '@/lib/ai-assistant/content-filter';
import { withTierCheck } from '@/middleware/with-tier-check';
import type { UserTier } from '@/types';
import type { AssistantRequest } from '@/lib/ai-assistant/types';

/**
 * Request validation schema
 */
const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  requestType: z.enum(['question', 'code-help', 'advice', 'general']).optional().default('general'),
  code: z.string().optional(),
  taskId: z.string().optional(),
  sessionId: z.string().optional(),
  locale: z.enum(['ru', 'en']).optional().default('ru'),
});

/**
 * POST /api/ai-assistant/chat
 * Send message to AI assistant
 */
const postHandler = async (request: NextRequest, tierInfo: any) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);

    // Filter and sanitize content
    const filterResult = filterContent(validatedData.message, validatedData.locale);
    
    if (!filterResult.allowed) {
      return NextResponse.json(
        {
          error: {
            code: 'CONTENT_FILTERED',
            message: filterResult.reason || 'Content not allowed',
            userMessage: filterResult.reason || (validatedData.locale === 'ru'
              ? 'Сообщение содержит недопустимый контент'
              : 'Message contains inappropriate content'),
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    // Use sanitized message
    validatedData.message = filterResult.sanitized;

    // Get user info from Supabase
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const userId = user?.id || 'guest';
    const tier = tierInfo.tier as UserTier;

    // Rate limiting is already handled by withTierCheck middleware
    // We just need to track usage from tierInfo
    const requestsUsed = tierInfo.requestsToday || 0;
    const requestLimit = tierInfo.limit || 5;

    // Get AI assistant service
    const service = getAIAssistantService(validatedData.locale);

    // Aggregate context
    const context = await service.aggregateContext(userId, tier);

    // Add recent messages from session if sessionId provided
    if (validatedData.sessionId) {
      const sessionManager = service.getSessionManager();
      const session = sessionManager.getSession(validatedData.sessionId);
      if (session) {
        context.recentMessages = sessionManager.getRecentMessages(
          validatedData.sessionId,
          5
        );
      }
    }

    // Build request
    const assistantRequest: AssistantRequest = {
      message: validatedData.message,
      context,
      requestType: validatedData.requestType,
      code: validatedData.code,
      taskId: validatedData.taskId,
    };

    // Send message to AI
    const response = await service.sendMessage(assistantRequest);

    // Add message to session if sessionId provided
    if (validatedData.sessionId) {
      const sessionManager = service.getSessionManager();
      let session = sessionManager.getSession(validatedData.sessionId);
      
      if (!session) {
        // Create new session with context from aggregated context
        session = sessionManager.createSession(userId, {
          day: context.currentDay || 1,
          languageId: context.languageId || 'javascript',
          taskId: validatedData.taskId,
        });
      }

      // Add user message
      sessionManager.addMessage(session.id, {
        id: `msg_${Date.now()}_user`,
        sessionId: session.id,
        role: 'user',
        content: validatedData.message,
        timestamp: Date.now(),
      });

      // Add assistant response
      sessionManager.addMessage(session.id, {
        id: `msg_${Date.now()}_assistant`,
        sessionId: session.id,
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        metadata: {
          codeBlocks: response.codeExamples,
          suggestions: response.suggestions,
          relatedTopics: response.relatedTopics,
          requestType: validatedData.requestType,
        },
      });
    }

    // Return response with usage info
    return NextResponse.json(
      {
        message: response.message,
        codeExamples: response.codeExamples,
        suggestions: response.suggestions,
        relatedTopics: response.relatedTopics,
        usage: {
          requestsToday: requestsUsed,
          limit: requestLimit,
          remaining: requestLimit - requestsUsed,
        },
      }
    );
  } catch (error) {
    console.error('AI Assistant API Error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            userMessage: 'Проверьте правильность введённых данных',
            retryable: false,
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Handle AI service errors
    if (error instanceof Error) {
      const isTimeout = error.message.includes('timeout');
      const isNetworkError = error.message.includes('network') || error.message.includes('ECONNRESET');

      return NextResponse.json(
        {
          error: {
            code: isTimeout ? 'TIMEOUT' : isNetworkError ? 'NETWORK_ERROR' : 'AI_SERVICE_ERROR',
            message: error.message,
            userMessage: isTimeout
              ? 'Превышено время ожидания. Попробуйте ещё раз.'
              : isNetworkError
              ? 'Ошибка сети. Проверьте подключение и попробуйте снова.'
              : 'Не удалось получить ответ от AI. Попробуйте позже.',
            retryable: true,
          },
        },
        { status: isTimeout ? 504 : isNetworkError ? 503 : 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          userMessage: 'Произошла ошибка. Попробуйте позже.',
          retryable: true,
        },
      },
      { status: 500 }
    );
  }
};

// Wrap with tier check middleware
export const POST = withTierCheck(postHandler);

/**
 * GET /api/ai-assistant/chat
 * Get chat session info
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const locale = (searchParams.get('locale') as 'ru' | 'en') || 'ru';

    if (!sessionId) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_SESSION_ID',
            message: 'Session ID is required',
            userMessage: locale === 'ru' ? 'Не указан ID сессии' : 'Session ID is required',
          },
        },
        { status: 400 }
      );
    }

    const service = getAIAssistantService(locale);
    const sessionManager = service.getSessionManager();
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        {
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
            userMessage: locale === 'ru' ? 'Сессия не найдена' : 'Session not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      messageCount: session.messages.length,
      startedAt: session.startedAt,
      lastActivity: session.lastActivity,
    });
  } catch (error) {
    console.error('AI Assistant GET Error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          userMessage: 'Произошла ошибка',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-assistant/chat
 * Clear chat session
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const locale = (searchParams.get('locale') as 'ru' | 'en') || 'ru';

    if (!sessionId) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_SESSION_ID',
            message: 'Session ID is required',
            userMessage: locale === 'ru' ? 'Не указан ID сессии' : 'Session ID is required',
          },
        },
        { status: 400 }
      );
    }

    const service = getAIAssistantService(locale);
    const sessionManager = service.getSessionManager();
    sessionManager.clearSession(sessionId);

    return NextResponse.json({
      success: true,
      message: locale === 'ru' ? 'История очищена' : 'History cleared',
    });
  } catch (error) {
    console.error('AI Assistant DELETE Error:', error);

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          userMessage: 'Произошла ошибка',
        },
      },
      { status: 500 }
    );
  }
}
