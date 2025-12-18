/**
 * Database Type Definitions
 * Proper TypeScript interfaces for Supabase database tables
 * Replaces `any` types throughout the codebase
 */

// User Progress table row
export interface UserProgressRow {
  id?: string;
  user_id: string;
  topic_id: string;
  completed: boolean;
  score: number;
  time_spent: number;
  last_accessed: string;
  metadata: {
    code?: string;
    notes?: string;
    completedTasks?: string[];
    recapAnswer?: string;
    languageId?: string;
    history?: Array<{ day: number; timestamp: number; notes?: string }>;
  };
  created_at?: string;
}

// Task Attempts table row
export interface TaskAttemptRow {
  id: string;
  user_id: string;
  task_id: string;
  topic_id: string;
  code: string;
  result: string;
  is_correct: boolean;
  hints_used: number;
  time_spent: number;
  attempted_at: string;
  created_at?: string;
}

// User Achievements table row
export interface UserAchievementRow {
  id?: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  created_at?: string;
}

// Users table row
export interface UserRow {
  id: string;
  username: string;
  email?: string;
  tier: 'free' | 'premium' | 'pro_plus';
  tier_expires_at?: string;
  ai_requests_today: number;
  ai_requests_reset_at?: string;
  metadata: {
    avatar?: string;
    bio?: string;
    preferredLanguage?: string;
    interfaceLanguage?: string;
    telegramUsername?: string;
    telegramChatId?: number;
    telegramNotifications?: boolean;
    reminderTime?: string;
  };
  created_at: string;
  updated_at?: string;
}

// Payments table row
export interface PaymentRow {
  id: string;
  user_id: string;
  payment_method: 'ton' | 'card' | 'crypto';
  amount_ton?: number;
  amount_usd?: number;
  tier: 'premium' | 'pro_plus';
  status: 'pending' | 'completed' | 'expired' | 'failed';
  payment_comment: string;
  expires_at: string;
  completed_at?: string;
  transaction_hash?: string;
  ton_sender_address?: string;
  metadata?: {
    wallet_address?: string;
    amount_nano?: string;
    [key: string]: any;
  };
  created_at: string;
}

// Topic Mastery table row
export interface TopicMasteryRow {
  id?: string;
  user_id: string;
  topic: string;
  total_attempts: number;
  successful_attempts: number;
  mastery_level: number;
  last_practiced: string;
  created_at?: string;
  updated_at?: string;
}

// Rate Limits table row
export interface RateLimitRow {
  identifier: string;
  count: number;
  reset_at: string;
  last_access: string;
  created_at?: string;
}

// AI Assistant Logs table row (if exists)
export interface AIAssistantLogRow {
  id?: string;
  user_id: string;
  tier: 'free' | 'premium' | 'pro_plus' | 'guest';
  request_type: 'question' | 'code-help' | 'advice' | 'general';
  message_length: number;
  response_length: number;
  processing_time: number;
  model_used: string;
  success: boolean;
  cache_hit: boolean;
  error_message?: string;
  created_at: string;
}

// Telegram Profiles table row
export interface TelegramProfileRow {
  id?: string;
  user_id: string;
  telegram_id: number;
  username?: string;
  chat_id: number;
  notifications_enabled: boolean;
  last_interaction?: string;
  created_at: string;
  updated_at?: string;
}

// Conversations table row
export interface ConversationRow {
  id: string;
  user_id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  created_at: string;
  updated_at?: string;
}
