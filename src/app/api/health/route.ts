import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json(
        { status: 'error', reason: 'supabase_not_configured' },
        { status: 500 }
      );
    }

    const { error } = await client.from('user_progress').select('id').limit(1);

    return NextResponse.json({
      status: 'ok',
      supabase: error ? 'degraded' : 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('Health check failed', error as Error, { component: 'api/health' });
    return NextResponse.json(
      { status: 'error', reason: (error as Error).message },
      { status: 500 }
    );
  }
}

