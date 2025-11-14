// Telegram Bot Types

export interface TelegramProfile {
  id: string;
  user_id: string;
  telegram_user_id: number;
  chat_id: number;
  username?: string;
  first_name?: string;
  language_code: string;
  timezone: string;
  is_active: boolean;
  preferences: TelegramPreferences;
  created_at: string;
  updated_at: string;
}

export interface TelegramPreferences {
  notifications_enabled?: boolean;
  daily_digest_time?: string; // HH:MM format
  weekly_report_enabled?: boolean;
  voice_responses_enabled?: boolean;
  do_not_disturb_start?: string; // HH:MM format
  do_not_disturb_end?: string; // HH:MM format
}

export interface ReminderSchedule {
  id: string;
  user_id: string;
  reminder_type: ReminderType;
  scheduled_time: string; // HH:MM format
  timezone: string;
  enabled: boolean;
  adaptive_mode: boolean;
  last_sent_at?: string;
  ignore_count: number;
  response_count: number;
  created_at: string;
  updated_at: string;
}

export type ReminderType = 
  | 'daily_study' 
  | 'streak_protection' 
  | 'milestone' 
  | 'weekly_report' 
  | 'daily_digest';

export interface TelegramMessage {
  id: string;
  user_id: string;
  telegram_user_id: number;
  message_type: MessageType;
  content: string;
  metadata: MessageMetadata;
  created_at: string;
}

export type MessageType = 
  | 'user_message' 
  | 'bot_response' 
  | 'reminder' 
  | 'notification' 
  | 'system';

export interface MessageMetadata {
  command?: string;
  args?: string[];
  buttons_clicked?: string[];
  voice_transcription?: string;
  response_time_ms?: number;
  error?: string;
}

export interface LearningAnalytics {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  study_duration_minutes: number;
  tasks_completed: number;
  tasks_attempted: number;
  session_count: number;
  engagement_score: number;
  weak_topics: string[];
  peak_hours: number[];
  created_at: string;
  updated_at: string;
}

export interface BotConversation {
  id: string;
  user_id: string;
  telegram_user_id: number;
  conversation_context: ConversationContext;
  last_command?: string;
  last_interaction_at: string;
  created_at: string;
}

export interface ConversationContext {
  waiting_for_input?: boolean;
  expected_input_type?: string;
  current_flow?: string;
  flow_step?: number;
  temp_data?: Record<string, any>;
}

export interface AIQuestionTracking {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  questions_asked: number;
  questions_remaining: number;
  last_question_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAnalyticsSummary {
  user_id: string;
  total_days_tracked: number;
  avg_engagement: number;
  total_study_time: number;
  total_tasks_completed: number;
  total_tasks_attempted: number;
  last_activity_date: string;
}

// Telegram Bot API Types

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessageUpdate;
  callback_query?: CallbackQuery;
  edited_message?: TelegramMessageUpdate;
}

export interface TelegramMessageUpdate {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  voice?: VoiceMessage;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface VoiceMessage {
  file_id: string;
  file_unique_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

export interface CallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessageUpdate;
  data?: string;
}

export interface InlineKeyboard {
  inline_keyboard: InlineButton[][];
}

export interface InlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface BotMessage {
  text: string;
  parseMode?: 'Markdown' | 'HTML';
  replyMarkup?: InlineKeyboard;
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
}

export interface BotResponse {
  text: string;
  parseMode?: 'Markdown' | 'HTML';
  replyMarkup?: InlineKeyboard;
  disableNotification?: boolean;
}

// Analytics and Insights Types

export interface LearningPattern {
  preferredStudyTimes: TimeSlot[];
  averageSessionDuration: number;
  studyFrequency: number; // days per week
  focusTopics: string[];
  weakTopics: string[];
  learningVelocity: number; // days completed per week
}

export interface TimeSlot {
  hour: number;
  productivity: number; // 0-100
}

export interface PredictionResult {
  estimatedCompletionDate: Date;
  confidenceScore: number; // 0-100
  riskFactors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  type: 'low_velocity' | 'weak_topic' | 'declining_engagement' | 'long_absence';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

export interface UserContext {
  userId: string;
  currentDay: number;
  completedDays: number;
  streak: number;
  weakTopics: string[];
  learningVelocity: number;
  lastActiveTime: Date;
}

export type HintLevel = 'subtle' | 'moderate' | 'detailed';

export interface WeakTopic {
  topic: string;
  masteryLevel: number;
  attemptsCount: number;
  lastPractice: Date;
}

// Command Handler Types

export interface CommandHandler {
  command: string;
  description: string;
  handler: (userId: string, args: string[]) => Promise<BotResponse>;
}

export interface ReminderContext {
  userId: string;
  reminderType: ReminderType;
  userProgress: {
    currentDay: number;
    completedDays: number;
    streak: number;
  };
  lastActiveTime: Date;
  hoursSinceLastActivity: number;
}

