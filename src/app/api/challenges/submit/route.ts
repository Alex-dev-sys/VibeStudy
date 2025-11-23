import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { logError, logInfo } from '@/lib/logger';

interface SubmitChallengeRequest {
  challengeId: string;
  code: string;
  language: string;
  status: 'pending' | 'passed' | 'failed';
  executionTimeMs?: number;
  testResults?: any;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = requireSupabaseClient();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const body: SubmitChallengeRequest = await request.json();
    const { challengeId, code, language, status, executionTimeMs, testResults } = body;

    if (!challengeId || !code || !language || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert user challenge attempt
    const { data, error } = await supabase
      .from('user_challenge_attempts')
      .upsert({
        user_id: user.id,
        challenge_id: challengeId,
        code,
        language,
        status,
        execution_time_ms: executionTimeMs,
        test_results: testResults,
        submitted_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,challenge_id'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    logInfo('Challenge attempt submitted', {
      component: 'api',
      action: 'submit-challenge',
      metadata: { 
        userId: user.id, 
        challengeId, 
        status,
        executionTimeMs 
      }
    });

    return NextResponse.json({ 
      success: true,
      attempt: data 
    });

  } catch (error) {
    logError('Error submitting challenge', error as Error, {
      component: 'api',
      action: 'submit-challenge'
    });

    return NextResponse.json(
      { 
        error: 'Failed to submit challenge',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get user's challenge attempts
export async function GET(request: NextRequest) {
  try {
    const supabase = requireSupabaseClient();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');

    let query = supabase
      .from('user_challenge_attempts')
      .select('*')
      .eq('user_id', user.id);

    if (challengeId) {
      query = query.eq('challenge_id', challengeId);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ attempts: data || [] });

  } catch (error) {
    logError('Error fetching challenge attempts', error as Error, {
      component: 'api',
      action: 'get-challenge-attempts'
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch attempts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
