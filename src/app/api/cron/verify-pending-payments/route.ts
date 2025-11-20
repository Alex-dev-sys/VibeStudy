import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  verifyPayment,
  getPricingForTier,
  type TierType,
} from '@/lib/ton-client';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Cron Job: Verify Pending TON Payments
 * 
 * Periodically checks pending payments on the TON blockchain
 * Updates user tiers when payments are confirmed
 * 
 * Should be called via Vercel Cron or similar scheduler
 * Recommended frequency: Every 5-10 minutes
 */

interface VerificationResult {
  paymentId: string;
  userId: string;
  status: 'verified' | 'pending' | 'expired' | 'error';
  error?: string;
}

interface CronResponse {
  success: boolean;
  processed: number;
  verified: number;
  expired: number;
  errors: number;
  results: VerificationResult[];
  error?: string;
}

/**
 * Create Supabase admin client for cron jobs
 */
function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin credentials not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Verify a single pending payment
 */
async function verifyPendingPayment(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  payment: any
): Promise<VerificationResult> {
  const result: VerificationResult = {
    paymentId: payment.id,
    userId: payment.user_id,
    status: 'pending',
  };

  try {
    // Check if payment has expired
    if (new Date(payment.expires_at) < new Date()) {
      await supabase
        .from('payments')
        .update({ status: 'expired' })
        .eq('id', payment.id);

      result.status = 'expired';
      return result;
    }

    // Verify payment on blockchain
    const pricing = getPricingForTier(payment.tier as TierType);
    const verificationResult = await verifyPayment(
      payment.payment_comment,
      pricing.amount
    );

    if (!verificationResult.verified) {
      // Still pending
      result.status = 'pending';
      return result;
    }

    // Payment verified! Update payment and user tier
    const now = new Date();
    const tierExpiresAt = new Date(now);
    tierExpiresAt.setDate(tierExpiresAt.getDate() + pricing.duration);

    // Update payment status
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        completed_at: now.toISOString(),
        transaction_hash: verificationResult.transaction?.hash,
        ton_sender_address: verificationResult.transaction?.from,
      })
      .eq('id', payment.id);

    if (updatePaymentError) {
      throw new Error(`Failed to update payment: ${updatePaymentError.message}`);
    }

    // Update user tier
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        tier: payment.tier,
        tier_expires_at: tierExpiresAt.toISOString(),
      })
      .eq('id', payment.user_id);

    if (updateUserError) {
      // Rollback payment status
      await supabase
        .from('payments')
        .update({ status: 'pending' })
        .eq('id', payment.id);

      throw new Error(`Failed to update user tier: ${updateUserError.message}`);
    }

    console.log(`[cron] Successfully verified payment ${payment.id} for user ${payment.user_id}`);
    result.status = 'verified';
    return result;
  } catch (error) {
    console.error(`[cron] Error verifying payment ${payment.id}:`, error);
    result.status = 'error';
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<CronResponse>> {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          processed: 0,
          verified: 0,
          expired: 0,
          errors: 0,
          results: [],
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Create admin Supabase client
    const supabase = createSupabaseAdminClient();

    // Fetch all pending payments
    const { data: pendingPayments, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100); // Process up to 100 payments per run

    if (fetchError) {
      console.error('[cron] Error fetching pending payments:', fetchError);
      return NextResponse.json(
        {
          success: false,
          processed: 0,
          verified: 0,
          expired: 0,
          errors: 0,
          results: [],
          error: 'Failed to fetch pending payments',
        },
        { status: 500 }
      );
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('[cron] No pending payments to process');
      return NextResponse.json({
        success: true,
        processed: 0,
        verified: 0,
        expired: 0,
        errors: 0,
        results: [],
      });
    }

    console.log(`[cron] Processing ${pendingPayments.length} pending payments`);

    // Verify each payment
    const results: VerificationResult[] = [];
    for (const payment of pendingPayments) {
      const result = await verifyPendingPayment(supabase, payment);
      results.push(result);
    }

    // Count results
    const verified = results.filter((r) => r.status === 'verified').length;
    const expired = results.filter((r) => r.status === 'expired').length;
    const errors = results.filter((r) => r.status === 'error').length;

    console.log(`[cron] Completed: ${verified} verified, ${expired} expired, ${errors} errors`);

    return NextResponse.json({
      success: true,
      processed: results.length,
      verified,
      expired,
      errors,
      results,
    });
  } catch (error) {
    console.error('[cron] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        processed: 0,
        verified: 0,
        expired: 0,
        errors: 0,
        results: [],
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
