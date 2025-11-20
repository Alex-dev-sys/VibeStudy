import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  verifyPayment,
  getPricingForTier,
  type TierType,
} from '@/lib/ton-client';

/**
 * API Route: Verify TON Payment
 * 
 * Verifies a TON transaction by checking the blockchain
 * Updates user tier and payment status upon successful verification
 */

interface VerifyPaymentRequest {
  paymentId: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  verified?: boolean;
  tier?: TierType;
  expiresAt?: string;
  error?: string;
}

/**
 * Create Supabase server client for API routes
 */
function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured');
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Cookie setting may fail in API routes
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // Cookie removal may fail in API routes
        }
      },
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifyPaymentResponse>> {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Parse request body
    let body: VerifyPaymentRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
        },
        { status: 400 }
      );
    }

    const { paymentId } = body;
    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment ID is required',
        },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createSupabaseServerClient();

    // Fetch payment record
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not found',
        },
        { status: 404 }
      );
    }

    // Check if payment is already completed
    if (payment.status === 'completed') {
      return NextResponse.json({
        success: true,
        verified: true,
        tier: payment.tier as TierType,
        expiresAt: payment.completed_at,
      });
    }

    // Check if payment has expired
    if (payment.status === 'expired' || new Date(payment.expires_at) < new Date()) {
      // Mark as expired if not already
      if (payment.status !== 'expired') {
        await supabase
          .from('payments')
          .update({ status: 'expired' })
          .eq('id', paymentId);
      }

      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: 'Payment has expired. Please create a new payment.',
        },
        { status: 410 }
      );
    }

    // Verify payment on TON blockchain
    const pricing = getPricingForTier(payment.tier as TierType);
    const verificationResult = await verifyPayment(
      payment.payment_comment,
      pricing.amount
    );

    if (!verificationResult.verified) {
      return NextResponse.json({
        success: true,
        verified: false,
        error: verificationResult.error || 'Transaction not found on blockchain',
      });
    }

    // Payment verified! Update payment status and user tier
    const now = new Date();
    const tierExpiresAt = new Date(now);
    tierExpiresAt.setDate(tierExpiresAt.getDate() + pricing.duration);

    // Start a transaction to update both payment and user
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        completed_at: now.toISOString(),
        transaction_hash: verificationResult.transaction?.hash,
        ton_sender_address: verificationResult.transaction?.from,
      })
      .eq('id', paymentId);

    if (updatePaymentError) {
      console.error('[verify-payment] Failed to update payment:', updatePaymentError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update payment status',
        },
        { status: 500 }
      );
    }

    // Update user tier
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        tier: payment.tier,
        tier_expires_at: tierExpiresAt.toISOString(),
      })
      .eq('id', user.id);

    if (updateUserError) {
      console.error('[verify-payment] Failed to update user tier:', updateUserError);
      // Rollback payment status
      await supabase
        .from('payments')
        .update({ status: 'pending' })
        .eq('id', paymentId);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update user tier',
        },
        { status: 500 }
      );
    }

    console.log(`[verify-payment] Successfully upgraded user ${user.id} to ${payment.tier}`);

    return NextResponse.json({
      success: true,
      verified: true,
      tier: payment.tier as TierType,
      expiresAt: tierExpiresAt.toISOString(),
    });
  } catch (error) {
    console.error('[verify-payment] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
