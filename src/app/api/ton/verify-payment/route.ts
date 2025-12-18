import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  verifyPayment,
  getPricingForTier,
  verifyPaymentCommentSignature,
  type TierType,
} from '@/lib/core/ton-client';
import { log } from '@/lib/logger/structured-logger';

// Payment verification schema
const verifyPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required').uuid('Invalid payment ID format'),
});

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
          error: 'Требуется авторизация',
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body;
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

    // Validate with Zod
    const validationResult = verifyPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          error: firstError.message,
        },
        { status: 400 }
      );
    }

    const { paymentId } = validationResult.data;

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

    // Verify payment comment signature (prevents comment reuse attacks)
    if (!verifyPaymentCommentSignature(payment.payment_comment, user.id)) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: 'Invalid payment comment signature',
        },
        { status: 400 }
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

    // Payment verified! Update payment status and user tier atomically
    const now = new Date();
    const tierExpiresAt = new Date(now);
    tierExpiresAt.setDate(tierExpiresAt.getDate() + pricing.duration);

    // Atomic update: only update if status is still 'pending' (prevents race conditions)
    const { data: updatedPayment, error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        completed_at: now.toISOString(),
        transaction_hash: verificationResult.transaction?.hash,
        ton_sender_address: verificationResult.transaction?.from,
      })
      .eq('id', paymentId)
      .eq('status', 'pending') // Critical: only update if still pending
      .select()
      .single();

    if (updatePaymentError || !updatedPayment) {
      // Payment was already processed by another request (race condition prevented)
      if (updatePaymentError?.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'Payment already processed',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update payment status',
        },
        { status: 500 }
      );
    }

    // Update user tier (now safe from race conditions)
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        tier: payment.tier,
        tier_expires_at: tierExpiresAt.toISOString(),
      })
      .eq('id', user.id);

    if (updateUserError) {
      // Rollback payment status if user update fails
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
