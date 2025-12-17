/**
 * Database Types
 * Type-safe interfaces for all database tables
 * Auto-generated types based on Supabase schema
 */

// ============================================================================
// User Tables
// ============================================================================

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  tier?: 'free' | 'premium' | 'pro_plus';
  tier_expires_at?: string;
  metadata?: {
    avatar?: string;
    bio?: string;
    preferredLanguage?: string;
    interfaceLanguage?: string;
    telegramUsername?: string;
    telegramChatId?: number;
    telegramNotifications?: boolean;
    reminderTime?: string;
  };
}

export interface UserProgress {
  id?: string;
  user_id: string;
  topic_id: string;
  completed: boolean;
  score?: number;
  time_spent?: number;
  last_accessed: string;
  metadata?: {
    code?: string;
    notes?: string;
    completedTasks?: string[];
    recapAnswer?: string;
    languageId?: string;
    history?: Array<{ day: number; timestamp: number; notes?: string }>;
  };
}

export interface TaskAttempt {
  id?: string;
  user_id: string;
  task_id: string;
  topic_id: string;
  code: string;
  result: string;
  is_correct: boolean;
  hints_used: number;
  time_spent: number;
  attempted_at: string;
}

export interface TaskAttemptAnalytics {
  task_id: string;
  success?: boolean;
  is_correct: boolean;
  time_spent?: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
  day?: number;
  attempts?: number;
}

export interface UserAchievement {
  id?: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  metadata?: Record<string, unknown>;
}

export interface TopicMastery {
  id?: string;
  user_id: string;
  topic: string;
  total_attempts: number;
  successful_attempts: number;
  mastery_level: number;
  last_practiced: string;
}

// ============================================================================
// Telegram Tables
// ============================================================================

export interface UserTelegramProfile {
  id?: string;
  user_id: string;
  telegram_id: string;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  created_at: string;
  last_active?: string;
  metadata?: Record<string, unknown>;
}

export interface ReminderSchedule {
  id?: string;
  user_id: string;
  enabled: boolean;
  time: string;
  timezone?: string;
  days_of_week?: number[];
  created_at: string;
  updated_at?: string;
}

export interface TelegramMessage {
  id?: string;
  user_id: string;
  message_id: string;
  chat_id: string;
  message_type: 'text' | 'photo' | 'document' | 'command';
  content?: string;
  sent_at: string;
  metadata?: Record<string, unknown>;
}

export interface BotConversation {
  id?: string;
  user_id: string;
  conversation_id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  started_at: string;
  last_updated: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Analytics & AI Tables
// ============================================================================

export interface LearningAnalytics {
  id?: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface AIQuestionTracking {
  id?: string;
  user_id: string;
  question: string;
  answer: string;
  context?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface AIFeedback {
  id?: string;
  user_id: string;
  message_id: string;
  feedback_type: 'positive' | 'negative';
  comment?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Payment Tables
// ============================================================================

export interface Payment {
  id: string;
  user_id: string;
  tier: 'premium' | 'pro_plus';
  amount: number;
  currency: 'TON';
  status: 'pending' | 'completed' | 'expired' | 'failed';
  payment_comment: string;
  transaction_hash?: string;
  ton_sender_address?: string;
  created_at: string;
  completed_at?: string;
  expires_at: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Referral Tables
// ============================================================================

export interface Referral {
  id?: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed';
  reward_claimed: boolean;
  created_at: string;
  completed_at?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Challenge Tables
// ============================================================================

export interface DailyChallenge {
  id: string;
  language: string;
  date: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  metadata?: Record<string, unknown>;
}

export interface UserChallengeAttempt {
  id?: string;
  user_id: string;
  challenge_id: string;
  code: string;
  language: string;
  status: 'pending' | 'passed' | 'failed';
  execution_time_ms?: number;
  test_results?: TestResult[];
  submitted_at: string;
  metadata?: Record<string, unknown>;
}

export interface TestResult {
  testName: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
  error?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PistonExecutionResult {
  language: string;
  version: string;
  run?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

// ============================================================================
// GDPR Export Types
// ============================================================================

export interface GDPRExportData {
  exportDate: string;
  userId: string;
  profile: UserProfile | null;
  progress: UserProgress[];
  taskAttempts: TaskAttempt[];
  achievements: UserAchievement[];
  topicMastery: TopicMastery[];
  telegramProfile: UserTelegramProfile | null;
  reminderSchedules: ReminderSchedule[];
  telegramMessages: TelegramMessage[];
  learningAnalytics: LearningAnalytics[];
  botConversations: BotConversation[];
  aiQuestionTracking: AIQuestionTracking[];
  payments: Payment[];
  referrals: Referral[];
  aiFeedback: AIFeedback[];
}
