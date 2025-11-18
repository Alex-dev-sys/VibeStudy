import { NextResponse } from 'next/server';
import { getGeneratedContent } from '@/lib/db';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import { errorHandler } from '@/lib/error-handler';

interface RequestQuery {
  day: string;
  languageId: string;
}

export async function GET(request: Request) {
  const rateState = evaluateRateLimit(request, RATE_LIMITS.API_GENERAL, {
    bucketId: 'get-content'
  });

  if (!rateState.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please wait and try again.'
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(rateState)
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const day = parseInt(searchParams.get('day') ?? '1');
  const languageId = searchParams.get('languageId') ?? 'python';

  try {
    const content = await getGeneratedContent(day, languageId);

    if (!content) {
      return NextResponse.json({ exists: false }, { status: 404 });
    }

    return NextResponse.json({
      exists: true,
      theory: content.theory,
      recap: content.recap,
      recapTask: content.recapTask,
      tasks: content.tasks
    });
  } catch (error) {
    logError('Ошибка при получении контента из БД', error as Error, {
      component: 'api/get-content'
    });
    errorHandler.report(error as Error, {
      component: 'api/get-content',
      action: 'GET'
    });
    return NextResponse.json({ error: 'Ошибка базы данных' }, { status: 500 });
  }
}

