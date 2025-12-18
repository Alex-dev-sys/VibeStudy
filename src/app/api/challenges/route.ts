import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logError, logInfo } from '@/lib/core/logger';
import type { DailyChallenge } from '@/types/database';

export const dynamic = 'force-dynamic';

// In-memory cache for challenges
const challengeCache = new Map<string, { data: DailyChallenge | DailyChallenge[]; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

function getCachedData(key: string): DailyChallenge | DailyChallenge[] | null {
  const cached = challengeCache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    challengeCache.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedData(key: string, data: DailyChallenge | DailyChallenge[]): void {
  challengeCache.set(key, { data, timestamp: Date.now() });
}

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
      const cacheKey = `challenge:${language}:${today}`;

      // Check cache first
      const cachedChallenge = getCachedData(cacheKey);
      if (cachedChallenge) {
        return NextResponse.json({ challenge: cachedChallenge });
      }

      const { data, error } = await supabase
        .from('daily_challenges')
        .select('id, language, date, title, description, difficulty, metadata')
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

      // Cache the result
      setCachedData(cacheKey, data);

      logInfo('Fetched today\'s challenge', {
        component: 'api',
        action: 'get-challenge',
        metadata: { language, date: today }
      });

      return NextResponse.json({ challenge: data });
    }

    // Get challenge history for a language
    if (language) {
      const limitValue = limit ? parseInt(limit, 10) : 30;
      const cacheKey = `challenges:${language}:${limitValue}`;

      // Check cache first
      const cachedChallenges = getCachedData(cacheKey);
      if (cachedChallenges) {
        return NextResponse.json({ challenges: cachedChallenges });
      }

      const query = supabase
        .from('daily_challenges')
        .select('id, language, date, title, description, difficulty, metadata')
        .eq('language', language)
        .order('date', { ascending: false })
        .limit(limitValue);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Cache the result
      setCachedData(cacheKey, data || []);

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
