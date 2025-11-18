import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/rate-limit';
import { analyticsTrackingSchema } from '@/lib/validation/schemas';
import { logError } from '@/lib/logger';
import { errorHandler } from '@/lib/error-handler';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const rateState = evaluateRateLimit(request, RATE_LIMITS.ANALYTICS, {
      bucketId: 'analytics-track'
    });

    if (!rateState.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: buildRateLimitHeaders(rateState) }
      );
    }

    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const rawBody = await request.json();
    let parsedBody: {
      taskId: string;
      day: number;
      startTime: number;
      endTime: number;
      success: boolean;
      attempts?: number;
    };
    try {
      parsedBody = analyticsTrackingSchema.parse(rawBody);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const { taskId, day, startTime, endTime, success, attempts } = parsedBody;
    
    const supabase = createClient();
    
    // Store task attempt in database
    const { data, error } = await supabase
      .from('task_attempts')
      .insert({
        user_id: user.id,
        task_id: taskId,
        day,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        success,
        attempts: attempts || 1
      })
      .select()
      .single();
    
    if (error) {
      logError('Error tracking analytics', error, {
        component: 'api/analytics/track'
      });
      return NextResponse.json(
        { error: 'Failed to track analytics' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logError('Error in analytics track endpoint', error as Error, {
      component: 'api/analytics/track'
    });
    errorHandler.report(error as Error, {
      component: 'api/analytics/track',
      action: 'POST'
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
