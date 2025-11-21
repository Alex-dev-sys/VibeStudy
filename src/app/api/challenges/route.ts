import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logError, logInfo } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Use service role key to bypass RLS for public read access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database service not configured' },
        { status: 503 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const date = searchParams.get('date');
    const limit = searchParams.get('limit');

    // Get today's challenge for a specific language
    if (language && !date) {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('language', language)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        return NextResponse.json(
          { error: 'No challenge available for today' },
          { status: 404 }
        );
      }

      logInfo('Fetched today\'s challenge', {
        component: 'api',
        action: 'get-challenge',
        metadata: { language, date: today }
      });

      return NextResponse.json({ challenge: data });
    }

    // Get challenge history for a language
    if (language) {
      const query = supabase
        .from('daily_challenges')
        .select('*')
        .eq('language', language)
        .order('date', { ascending: false });

      if (limit) {
        query.limit(parseInt(limit, 10));
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      logInfo('Fetched challenge history', {
        component: 'api',
        action: 'get-challenges',
        metadata: { language, count: data?.length || 0 }
      });

      return NextResponse.json({ challenges: data || [] });
    }

    return NextResponse.json(
      { error: 'Missing required parameter: language' },
      { status: 400 }
    );

  } catch (error) {
    logError('Error fetching challenges', error as Error, {
      component: 'api',
      action: 'get-challenges'
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch challenges',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
