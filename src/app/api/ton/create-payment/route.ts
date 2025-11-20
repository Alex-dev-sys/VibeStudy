import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  createPaymentData,
  isTonConfigured,
  type TierType,
} from '@/lib/ton-client';

/**
 * API Route: Create TON Payment
 * 
 * Creates a payment session for upgrading user tier
 * Generates unique payment comment and stores pending payment in database
 */

interface CreatePaymentRequest {
  tier: TierType;
}

interface CreatePaymentResponse {
  success: boolean;
  payment?: {
    id: string;
    walletAddress: string;
    amount: number;
    amountNano: string;
    comment: string;
    tier: TierType;
    usdEquivalent: number;
    expiresAt: string;
  };
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

export async function POST(request: NextRequest): Promise<NextResponse<CreatePaymentResponse>> {
  try {
    // Check if TON is configured
    if (!isTonConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'TON payment system is not configured',
        },
        { status: 503 }
      );
    }

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
    let body: CreatePaymentRequest;
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

    // Validate tier
    const { tier } = body;
    if (!tier || (tier !== 'premium' && tier !== 'pro_plus')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tier. Must be "premium" or "pro_plus"',
        },
        { status: 400 }
      );
    }

    // Create payment data
    const paymentData = createPaymentData(tier, user.id);

    // Create Supabase client
    const supabase = createSupabaseServerClient();

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Insert payment record into database
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        payment_method: 'ton',
        amount_ton: paymentData.amount,
        amount_usd: paymentData.usdEquivalent,
        tier: tier,
        status: 'pending',
        payment_comment: paymentData.comment,
        expires_at: expiresAt.toISOString(),
        metadata: {
          wallet_address: paymentData.walletAddress,
          amount_nano: paymentData.amountNano,
        },
      })
      .select('id, expires_at')
      .single();

    if (dbError) {
      console.error('[create-payment] Database error:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create payment record',
        },
        { status: 500 }
      );
    }

    // Return payment details
    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        walletAddress: paymentData.walletAddress,
        amount: paymentData.amount,
        amountNano: paymentData.amountNano,
        comment: paymentData.comment,
        tier: paymentData.tier,
        usdEquivalent: paymentData.usdEquivalent,
        expiresAt: payment.expires_at,
      },
    });
  } catch (error) {
    console.error('[create-payment] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
