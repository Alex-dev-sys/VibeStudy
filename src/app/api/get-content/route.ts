import { NextResponse } from 'next/server';
import { getGeneratedContent } from '@/lib/database/db';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/core/rate-limit';
import { logError } from '@/lib/core/logger';
import { errorHandler } from '@/lib/core/error-handler';

interface RequestQuery {
  day: string;
  languageId: string;
}

export async function GET(request: Request) {
  const rateState = await evaluateRateLimit(request, RATE_LIMITS.API_GENERAL, {
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
      // Return 200 OK with exists: false instead of 404 to avoid console errors
      return NextResponse.json({ exists: false }, {
        status: 200,
        headers: buildRateLimitHeaders(rateState)
      });
    }

    return NextResponse.json({
      exists: true,
      theory: content.theory,
      recap: content.recap,
      recapTask: content.recapTask,
      tasks: content.tasks
    }, {
      headers: buildRateLimitHeaders(rateState)
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

