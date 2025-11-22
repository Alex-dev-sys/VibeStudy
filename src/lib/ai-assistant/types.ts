/**
 * Core types for AI Learning Assistant
 */

import { UserTier } from '@/types';

/**
 * Message in a chat conversation
 */
export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    codeBlocks?: CodeBlock[];
    suggestions?: string[];
    relatedTopics?: string[];
    requestType?: string;
  };
}

/**
 * Code block within a message
 */
export interface CodeBlock {
  language: string;
  code: string;
}

/**
 * Chat session containing conversation history
 */
export interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  startedAt: number;
  lastActivity: number;
  context: {
    day: number;
    languageId: string;
    taskId?: string;
  };
}

/**
 * Context information for AI assistant
 */
export interface AssistantContext {
  // User Info
  userId: string;
  tier: UserTier;
  
  // Learning Context
  currentDay: number;
  languageId: string;
  dayState?: any; // DayStateSnapshot from types
  
  // Progress Data
  completedDays: number[];
  currentStreak: number;
  totalTasksCompleted: number;
  
  // Current Day Content
  dayTheory?: string;
  dayTasks?: any[]; // Task[] from types
  
  // Conversation History
  recentMessages: Message[];
}

/**
 * Request to AI assistant
 */
export interface AssistantRequest {
  message: string;
  context: AssistantContext;
  requestType: 'question' | 'code-help' | 'advice' | 'general';
  code?: string;
  taskId?: string;
}

/**
 * Response from AI assistant
 */
export interface AssistantResponse {
  message: string;
  codeExamples?: CodeBlock[];
  suggestions?: string[];
  relatedTopics?: string[];
}

/**
 * API request body for chat endpoint
 */
export interface ChatRequest {
  message: string;
  requestType?: 'question' | 'code-help' | 'advice' | 'general';
  code?: string;
  taskId?: string;
}

/**
 * API response body for chat endpoint
 */
export interface ChatResponse {
  message: string;
  codeExamples?: CodeBlock[];
  suggestions?: string[];
  relatedTopics?: string[];
  usage?: {
    requestsToday: number;
    limit: number;
  };
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    userMessage: string; // Friendly message for UI
    retryable: boolean;
    upgradePrompt?: {
      tier: string;
      url: string;
    };
  };
}

/**
 * Usage analytics log entry
 */
export interface AssistantUsageLog {
  id: string;
  userId: string;
  tier: UserTier;
  requestType: string;
  messageLength: number;
  responseLength: number;
  processingTime: number;
  modelUsed: string;
  timestamp: number;
  success: boolean;
  error?: string;
}
