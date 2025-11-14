// Telegram Message Sending Utilities

import type { BotResponse, InlineKeyboard } from '@/types/telegram';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send message with retry logic
 */
export async function sendMessageWithRetry(
  chatId: number,
  text: string,
  options: {
    parseMode?: 'Markdown' | 'HTML';
    replyMarkup?: InlineKeyboard;
    disableNotification?: boolean;
    disableWebPagePreview?: boolean;
  } = {},
  maxRetries: number = MAX_RETRIES
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const success = await sendMessage(chatId, text, options);
      if (success) return true;
    } catch (error) {
      console.error(`Send attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error('Max retries reached, giving up');
        return false;
      }
      
      // Exponential backoff
      await sleep(RETRY_DELAY * attempt);
    }
  }
  
  return false;
}

/**
 * Send message to Telegram
 */
export async function sendMessage(
  chatId: number,
  text: string,
  options: {
    parseMode?: 'Markdown' | 'HTML';
    replyMarkup?: InlineKeyboard;
    disableNotification?: boolean;
    disableWebPagePreview?: boolean;
  } = {}
): Promise<boolean> {
  const url = `${TELEGRAM_API_URL}/sendMessage`;
  
  const body: any = {
    chat_id: chatId,
    text: text.slice(0, 4096), // Telegram limit
    parse_mode: options.parseMode || 'Markdown',
    disable_notification: options.disableNotification || false,
    disable_web_page_preview: options.disableWebPagePreview || false
  };
  
  if (options.replyMarkup) {
    body.reply_markup = options.replyMarkup;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      
      // Handle specific errors
      if (error.error_code === 429) {
        // Rate limited by Telegram
        const retryAfter = error.parameters?.retry_after || 1;
        console.warn(`Rate limited, retry after ${retryAfter}s`);
        await sleep(retryAfter * 1000);
        return false;
      }
      
      if (error.error_code === 403) {
        // Bot blocked by user
        console.warn(`Bot blocked by user ${chatId}`);
        return false;
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Network error sending message:', error);
    throw error;
  }
}

/**
 * Send message with inline keyboard
 */
export async function sendMessageWithKeyboard(
  chatId: number,
  text: string,
  keyboard: InlineKeyboard,
  options: {
    parseMode?: 'Markdown' | 'HTML';
    disableNotification?: boolean;
  } = {}
): Promise<boolean> {
  return sendMessageWithRetry(chatId, text, {
    ...options,
    replyMarkup: keyboard
  });
}

/**
 * Edit message text
 */
export async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  options: {
    parseMode?: 'Markdown' | 'HTML';
    replyMarkup?: InlineKeyboard;
  } = {}
): Promise<boolean> {
  const url = `${TELEGRAM_API_URL}/editMessageText`;
  
  const body: any = {
    chat_id: chatId,
    message_id: messageId,
    text: text.slice(0, 4096),
    parse_mode: options.parseMode || 'Markdown'
  };
  
  if (options.replyMarkup) {
    body.reply_markup = options.replyMarkup;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error editing message:', error);
    return false;
  }
}

/**
 * Delete message
 */
export async function deleteMessage(
  chatId: number,
  messageId: number
): Promise<boolean> {
  const url = `${TELEGRAM_API_URL}/deleteMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

/**
 * Send typing action
 */
export async function sendTypingAction(chatId: number): Promise<void> {
  const url = `${TELEGRAM_API_URL}/sendChatAction`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action: 'typing'
      })
    });
  } catch (error) {
    console.error('Error sending typing action:', error);
  }
}

/**
 * Get file download URL
 */
export async function getFileUrl(fileId: string): Promise<string | null> {
  const url = `${TELEGRAM_API_URL}/getFile`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId })
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const filePath = data.result.file_path;
    
    return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
}

/**
 * Answer callback query
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
): Promise<boolean> {
  const url = `${TELEGRAM_API_URL}/answerCallbackQuery`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || '',
        show_alert: showAlert
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error answering callback query:', error);
    return false;
  }
}

/**
 * Send photo
 */
export async function sendPhoto(
  chatId: number,
  photoUrl: string,
  caption?: string,
  options: {
    parseMode?: 'Markdown' | 'HTML';
    replyMarkup?: InlineKeyboard;
  } = {}
): Promise<boolean> {
  const url = `${TELEGRAM_API_URL}/sendPhoto`;
  
  const body: any = {
    chat_id: chatId,
    photo: photoUrl
  };
  
  if (caption) {
    body.caption = caption.slice(0, 1024); // Telegram caption limit
    body.parse_mode = options.parseMode || 'Markdown';
  }
  
  if (options.replyMarkup) {
    body.reply_markup = options.replyMarkup;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error sending photo:', error);
    return false;
  }
}

/**
 * Send document
 */
export async function sendDocument(
  chatId: number,
  documentUrl: string,
  caption?: string,
  filename?: string
): Promise<boolean> {
  const url = `${TELEGRAM_API_URL}/sendDocument`;
  
  const body: any = {
    chat_id: chatId,
    document: documentUrl
  };
  
  if (caption) {
    body.caption = caption.slice(0, 1024);
  }
  
  if (filename) {
    body.filename = filename;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error sending document:', error);
    return false;
  }
}

