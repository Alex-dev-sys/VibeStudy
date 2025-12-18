import { NextResponse } from 'next/server';
// DEPRECATED: This import is from old bot structure
// import { sendTelegramMessage, generateMotivationalMessage, generatePersonalizedAdvice } from '@/telegram/bot';
// import { getUsersForReminder } from '@/lib/database/telegram-db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * API для отправки напоминаний пользователям
 * Вызывается по расписанию (cron job)
 * 
 * NOTE: This endpoint is currently disabled due to bot refactoring.
 * Reminders are now handled by the new bot architecture in /lib/telegram/
 */
export async function POST(request: Request) {
  try {
    // Проверка секретного ключа через Authorization header (более безопасно чем query/body)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement with new bot architecture
    return NextResponse.json({
      success: false,
      message: 'Endpoint temporarily disabled during bot refactoring'
    }, { status: 503 });

    /* OLD IMPLEMENTATION - COMMENTED OUT
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
    */
  } catch (error) {
    console.error('Ошибка в send-reminder:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Отправка персонального совета конкретному пользователю
 * 
 * NOTE: This endpoint is currently disabled due to bot refactoring.
 */
export async function GET(request: Request) {
  try {
    // Проверка секретного ключа через Authorization header
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      message: 'Endpoint temporarily disabled during bot refactoring'
    }, { status: 503 });
  } catch (error) {
    console.error('Ошибка отправки совета:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

