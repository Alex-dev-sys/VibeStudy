import type { BotResponse } from '@/types/telegram';
import { getMainMenuKeyboard } from '../keyboards';

export async function handleMenuCommand(
    userId: string,
    telegramUserId: number,
    chatId: number,
    args: string[]
): Promise<BotResponse> {
    return {
        text: '📋 *Главное меню*\n\nВыбери раздел:',
        parseMode: 'Markdown',
        replyMarkup: getMainMenuKeyboard()
    };
}
