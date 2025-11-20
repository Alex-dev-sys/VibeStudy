import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createReferral, completeReferral } from '@/lib/supabase/referrals';

/**
 * Process referral registration and completion
 * POST /api/referrals/process
 * 
 * Body:
 * - referrerId: string (optional) - ID of the user who referred this user
 * - isNewUser: boolean - Whether this is a new user registration
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { referrerId, isNewUser } = body;

    console.log('[Referral Process] Processing referral:', {
      userId: user.id,
      referrerId,
      isNewUser
    });

    // If this is a new user with a referrer, create the referral record
    if (isNewUser && referrerId) {
      try {
        await createReferral(referrerId, user.id);
        console.log('[Referral Process] Created referral record');
      } catch (error) {
        console.error('[Referral Process] Error creating referral:', error);
        // Don't fail the request if referral creation fails
      }
    }

    // Complete any pending referrals for this user (marks them as active)
    try {
      await completeReferral(user.id);
      console.log('[Referral Process] Completed referral');
    } catch (error) {
      console.error('[Referral Process] Error completing referral:', error);
      // Don't fail the request if completion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Referral Process] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
