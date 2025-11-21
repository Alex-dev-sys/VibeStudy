// Telegram Bot Controller - Central orchestrator for bot interactions

import type {
  TelegramUpdate,
  BotResponse,
  CallbackQuery,
  VoiceMessage,
  TelegramMessageUpdate
} from '@/types/telegram';
import {
  getTelegramProfileByTelegramId,
  upsertTelegramProfile,
  logTelegramMessage,
  getConversation,
  upsertConversation
} from './database';
import { commandHandlers } from './commands';
import { handleCallbackQuery } from './callbacks';
import { handleVoiceMessage } from './voice-handler';

export class BotController {
  /**
   * Main entry point for handling Telegram updates
   */
  async handleMessage(update: TelegramUpdate): Promise<void> {
    try {
      // Handle different update types
      if (update.message) {
        await this.processMessage(update.message);
      } else if (update.callback_query) {
        await this.processCallback(update.callback_query);
      } else if (update.edited_message) {
        // Ignore edited messages for now
        console.log('Edited message ignored');
      }
    } catch (error) {
      console.error('Error handling message:', error);
      // Send error message to user if possible
      if (update.message?.from.id) {
        await this.sendErrorMessage(update.message.from.id);
      }
    }
  }

  /**
   * Process incoming text or voice messages
   */
  private async processMessage(message: TelegramMessageUpdate): Promise<void> {
    const telegramUserId = message.from.id;
    const chatId = message.chat.id;
    
    // Get or create user profile
    const { data: profile } = await getTelegramProfileByTelegramId(telegramUserId);
    
    if (!profile) {
      console.log('New user, creating profile...');
      // For new users, we need to link them to a VibeStudy account
      // This will be handled in the /start command
    }
    
    // Handle voice messages
    if (message.voice) {
      await this.processVoiceMessage(message.voice, telegramUserId, chatId, profile?.user_id);
      return;
    }
    
    // Handle text messages
    if (message.text) {
      await this.processTextMessage(message.text, telegramUserId, chatId, profile?.user_id);
    }
  }

  /**
   * Process text messages (commands or regular text)
   */
  private async processTextMessage(
    text: string,
    telegramUserId: number,
    chatId: number,
    userId?: string
  ): Promise<void> {
    // Check if it's a command
    if (text.startsWith('/')) {
      await this.processCommand(text, telegramUserId, chatId, userId);
    } else {
      // Handle regular text (might be answer to a question, etc.)
      await this.processRegularText(text, telegramUserId, chatId, userId);
    }
  }

  /**
   * Process bot commands
   */
  private async processCommand(
    text: string,
    telegramUserId: number,
    chatId: number,
    userId?: string
  ): Promise<void> {
    const parts = text.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    console.log(`Processing command: ${command} with args:`, args);
    
    // Log the command
    if (userId) {
      await logTelegramMessage(userId, telegramUserId, 'user_message', text, {
        command,
        args
      });
    }
    
    // Get command handler
    const handler = commandHandlers[command];
    
    if (!handler) {
      const response: BotResponse = {
        text: '❓ Неизвестная команда.\n\nИспользуй /help для списка доступных команд.',
        parseMode: 'Markdown'
      };
      await this.sendResponse(chatId, response);
      return;
    }
    
    // Allow /start command without userId (for new users)
    if (command !== '/start' && !userId) {
      const response: BotResponse = {
        text: '👋 Привет! Отправь /start чтобы начать работу с ботом.',
        parseMode: 'Markdown'
      };
      await this.sendResponse(chatId, response);
      return;
    }
    
    // Execute command handler
    try {
      const response = await handler(userId || '', telegramUserId, chatId, args);
      await this.sendResponse(chatId, response);
      
      // Log bot response
      if (userId) {
        await logTelegramMessage(userId, telegramUserId, 'bot_response', response.text, {
          command,
          parseMode: response.parseMode
        });
      }
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      await this.sendErrorMessage(chatId);
    }
  }

  /**
   * Process regular text (not commands)
   */
  private async processRegularText(
    text: string,
    telegramUserId: number,
    chatId: number,
    userId?: string
  ): Promise<void> {
    if (!userId) {
      // User not registered, prompt to start
      const response: BotResponse = {
        text: '👋 Привет! Отправь /start чтобы начать работу с ботом.',
        parseMode: 'Markdown'
      };
      await this.sendResponse(chatId, response);
      return;
    }
    
    // Check if we're waiting for input in a conversation flow
    const { data: conversation } = await getConversation(userId);
    
    if (conversation?.conversation_context.waiting_for_input) {
      // Handle expected input based on context
      await this.handleExpectedInput(text, conversation, telegramUserId, chatId, userId);
    } else {
      // Treat as a question to AI
      const response: BotResponse = {
        text: '💡 Если у тебя вопрос, используй команду /ask [твой вопрос]\n\nНапример: /ask Как работают циклы в Python?',
        parseMode: 'Markdown'
      };
      await this.sendResponse(chatId, response);
    }
  }

  /**
   * Handle expected input in conversation flow
   */
  private async handleExpectedInput(
    text: string,
    conversation: any,
    telegramUserId: number,
    chatId: number,
    userId: string
  ): Promise<void> {
    const context = conversation.conversation_context;
    
    // Handle different input types
    switch (context.expected_input_type) {
      case 'reminder_time':
        // Handle reminder time input
        await this.handleReminderTimeInput(text, userId, chatId);
        break;
      
      case 'language_selection':
        // Handle language selection
        await this.handleLanguageInput(text, userId, chatId);
        break;
      
      default:
        // Unknown input type, clear context
        await upsertConversation({
          user_id: userId,
          telegram_user_id: telegramUserId,
          conversation_context: {},
          last_interaction_at: new Date().toISOString()
        });
    }
  }

  /**
   * Process voice messages
   */
  private async processVoiceMessage(
    voice: VoiceMessage,
    telegramUserId: number,
    chatId: number,
    userId?: string
  ): Promise<void> {
    if (!userId) {
      const response: BotResponse = {
        text: '👋 Привет! Отправь /start чтобы начать работу с ботом.',
        parseMode: 'Markdown'
      };
      await this.sendResponse(chatId, response);
      return;
    }
    
    try {
      const result = await handleVoiceMessage(voice, userId, telegramUserId);
      await this.sendResponse(chatId, result);
    } catch (error) {
      console.error('Error processing voice message:', error);
      const response: BotResponse = {
        text: '❌ Не удалось обработать голосовое сообщение. Попробуй написать текстом.',
        parseMode: 'Markdown'
      };
      await this.sendResponse(chatId, response);
    }
  }

  /**
   * Process callback queries (inline button clicks)
   */
  private async processCallback(callback: CallbackQuery): Promise<void> {
    const telegramUserId = callback.from.id;
    const chatId = callback.message?.chat.id;
    
    if (!chatId) return;
    
    const { data: profile } = await getTelegramProfileByTelegramId(telegramUserId);
    
    if (!profile) {
      console.log('User not found for callback');
      return;
    }
    
    try {
      const response = await handleCallbackQuery(callback, profile.user_id);
      
      if (response) {
        await this.sendResponse(chatId, response);
      }
      
      // Answer callback query to remove loading state
      await this.answerCallbackQuery(callback.id);
    } catch (error) {
      console.error('Error processing callback:', error);
      await this.answerCallbackQuery(callback.id, 'Произошла ошибка');
    }
  }

  /**
   * Send response to user
   */
  async sendResponse(chatId: number, response: BotResponse): Promise<void> {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const body: any = {
      chat_id: chatId,
      text: response.text,
      parse_mode: response.parseMode || 'Markdown',
      disable_notification: response.disableNotification || false
    };
    
    if (response.replyMarkup) {
      body.reply_markup = response.replyMarkup;
    }
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Telegram API error:', error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Answer callback query
   */
  private async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
    
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || ''
      })
    });
  }

  /**
   * Send error message to user
   */
  private async sendErrorMessage(chatId: number): Promise<void> {
    const response: BotResponse = {
      text: '❌ Произошла ошибка. Попробуй позже или используй /help для помощи.',
      parseMode: 'Markdown'
    };
    
    try {
      await this.sendResponse(chatId, response);
    } catch (error) {
      console.error('Failed to send error message:', error);
    }
  }

  /**
   * Handle reminder time input
   */
  private async handleReminderTimeInput(text: string, userId: string, chatId: number): Promise<void> {
    // Parse time input (HH:MM format)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    
    if (!timeRegex.test(text)) {
      const response: BotResponse = {
        text: '⚠️ Неверный формат времени. Используй формат ЧЧ:ММ (например, 09:00)',
        parseMode: 'Markdown'
      };
      await this.sendResponse(chatId, response);
      return;
    }
    
    // Save reminder time (implementation in reminder commands)
    const response: BotResponse = {
      text: `✅ Время напоминания установлено: ${text}`,
      parseMode: 'Markdown'
    };
    await this.sendResponse(chatId, response);
    
    // Clear conversation context
    await upsertConversation({
      user_id: userId,
      telegram_user_id: chatId,
      conversation_context: {},
      last_interaction_at: new Date().toISOString()
    });
  }

  /**
   * Handle language input
   */
  private async handleLanguageInput(text: string, userId: string, chatId: number): Promise<void> {
    const validLanguages = ['ru', 'en', 'русский', 'english'];
    const normalizedText = text.toLowerCase();
    
    if (!validLanguages.includes(normalizedText)) {
      const response: BotResponse = {
        text: '⚠️ Выбери язык: Русский или English',
        parseMode: 'Markdown'
      };
      await this.sendResponse(chatId, response);
      return;
    }
    
    const languageCode = normalizedText === 'en' || normalizedText === 'english' ? 'en' : 'ru';
    
    // Update user language preference
    const { data: profile } = await getTelegramProfileByTelegramId(chatId);
    if (profile) {
      await upsertTelegramProfile({
        ...profile,
        language_code: languageCode
      });
    }
    
    const response: BotResponse = {
      text: languageCode === 'en' 
        ? '✅ Language set to English' 
        : '✅ Язык установлен: Русский',
      parseMode: 'Markdown'
    };
    await this.sendResponse(chatId, response);
    
    // Clear conversation context
    await upsertConversation({
      user_id: userId,
      telegram_user_id: chatId,
      conversation_context: {},
      last_interaction_at: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const botController = new BotController();

