import { NextResponse } from 'next/server';
import { sendTelegramMessage, generateMotivationalMessage, generatePersonalizedAdvice } from '@/telegram/bot';
import { getUsersForReminder } from '@/lib/telegram-db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * API для отправки напоминаний пользователям
 * Вызывается по расписанию (cron job)
 */
export async function POST(request: Request) {
  try {
    // Проверка секретного ключа через Authorization header (более безопасно чем query/body)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentHour = new Date().getHours();
    
    // Получаем пользователей, которым нужно отправить напоминание в этот час
    const users = await getUsersForReminder(currentHour);
    
    let sentCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const message = generateMotivationalMessage({
          username: user.telegramUsername,
          currentDay: user.currentDay,
          completedDays: user.completedDays,
          streak: user.streak,
          averageScore: user.averageScore,
          lastActivity: user.lastActivity,
          languageId: user.languageId
        });

        const success = await sendTelegramMessage({
          chatId: user.telegramChatId,
          text: message,
          parseMode: 'Markdown'
        });

        if (success) {
          sentCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Ошибка отправки напоминания пользователю ${user.telegramUsername}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      total: users.length
    });
  } catch (error) {
    console.error('Ошибка в send-reminder:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Отправка персонального совета конкретному пользователю
 */
export async function GET(request: Request) {
  try {
    // Проверка секретного ключа через Authorization header
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // TODO: Получить данные пользователя из БД
    // const user = await getUserByTelegramUsername(username);
    
    return NextResponse.json({ success: true, message: 'Advice sent' });
  } catch (error) {
    console.error('Ошибка отправки совета:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

