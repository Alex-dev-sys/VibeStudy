import { NextResponse } from 'next/server';
import { handleBotCommand } from '@/telegram/bot';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
}

/**
 * Webhook для обработки сообщений от Telegram бота
 */
export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();
    
    if (!update.message || !update.message.text) {
      return NextResponse.json({ ok: true });
    }

    const { message } = update;
    const chatId = message.chat.id;
    const text = message.text;
    const username = message.from.username;

    // Обработка команд
    if (text && text.startsWith('/')) {
      const command = text.split(' ')[0];
      
      // Получаем прогресс пользователя из БД (если username указан)
      let progress = undefined;
      if (username) {
        // TODO: Загрузить прогресс из БД по username
        // progress = await getUserProgressByTelegramUsername(username);
      }
      
      const response = handleBotCommand(command, progress);
      
      // Отправляем ответ
      await sendBotMessage(chatId, response);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Ошибка обработки Telegram webhook:', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Отправка сообщения через Bot API
 */
async function sendBotMessage(chatId: number, text: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN не установлен');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
  }
}

