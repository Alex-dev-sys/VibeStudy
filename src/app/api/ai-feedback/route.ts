import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
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

    // Try to get authenticated user (optional for guest mode)
    let supabase;
    try {
      supabase = createClient();
    } catch (error) {
      console.error('Error creating Supabase client:', error);
      // Continue as guest user
      supabase = null;
    }

    let user = null;
    if (supabase) {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (!authError && authUser) {
          user = authUser;
        }
      } catch (error) {
        console.error('Error getting user:', error);
        // Continue as guest user
      }
    }

    // If user is authenticated, save to database
    if (user && supabase) {
      try {
        const { data, error } = await supabase
          .from('ai_feedback')
          .insert({
            user_id: user.id,
            content_type: contentType,
            content_key: contentKey,
            feedback_type: feedbackType,
            metadata: metadata || {},
          } as any)
          .select()
          .single();

        if (error) {
          console.error('Error inserting feedback:', error);
          // Fall back to guest mode if insert fails
          console.log('[Guest Feedback] (fallback)', {
            contentType,
            contentKey,
            feedbackType,
            metadata,
          });
          return NextResponse.json({ 
            success: true, 
            guest: true,
            message: 'Feedback recorded (guest mode)' 
          });
        }

        return NextResponse.json({ success: true, data });
      } catch (error) {
        console.error('Error saving feedback to database:', error);
        // Fall back to guest mode
      }
    }

    // For guest users, just log and return success
    console.log('[Guest Feedback]', {
      contentType,
      contentKey,
      feedbackType,
      metadata,
    });

    return NextResponse.json({ 
      success: true, 
      guest: true,
      message: 'Feedback recorded (guest mode)' 
    });
  } catch (error) {
    console.error('Error in ai-feedback API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
