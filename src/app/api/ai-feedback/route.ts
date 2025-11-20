import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contentType, contentKey, feedbackType, metadata } = body;

    // Validate required fields
    if (!contentType || !contentKey || !feedbackType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate feedback type
    if (!['positive', 'negative'].includes(feedbackType)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      );
    }

    // Validate content type
    if (!['theory', 'hint', 'explanation', 'task'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Insert feedback into database
    const { data, error } = await supabase
      .from('ai_feedback')
      .insert({
        user_id: user.id,
        content_type: contentType,
        content_key: contentKey,
        feedback_type: feedbackType,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting feedback:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in ai-feedback API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
