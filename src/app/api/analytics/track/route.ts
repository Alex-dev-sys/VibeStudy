import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { taskId, day, startTime, endTime, success, attempts } = body;
    
    if (!taskId || !day || !startTime || !endTime || success === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
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
      console.error('Error tracking analytics:', error);
      return NextResponse.json(
        { error: 'Failed to track analytics' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in analytics track endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
