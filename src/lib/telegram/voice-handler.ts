// Voice Message Handler

import type { VoiceMessage, BotResponse } from '@/types/telegram';
import { getFileUrl } from './send-message';

export async function handleVoiceMessage(
  voice: VoiceMessage,
  userId: string,
  telegramUserId: number
): Promise<BotResponse> {
  // Get file URL
  const fileUrl = await getFileUrl(voice.file_id);
  
  if (!fileUrl) {
    return {
      text: '❌ Не удалось получить голосовое сообщение',
      parseMode: 'Markdown'
    };
  }
  
  // TODO: Implement voice transcription
  // For now, return a placeholder response
  return {
    text: '🎤 Голосовые сообщения пока не поддерживаются.\n\nПопробуй написать текстом или используй /help',
    parseMode: 'Markdown'
  };
}

