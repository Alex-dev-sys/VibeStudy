import { requireSupabaseClient } from './client';
import { getCurrentUser } from './auth';

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed';
  completed_at: string | null;
  created_at: string;
}

/**
 * Get referral statistics for the current user
 */
export async function getReferralStats(): Promise<{
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  referrals: Referral[];
}> {
  const supabase = requireSupabaseClient();
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('User must be authenticated to view referral stats');
  }

  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referral stats:', error);
    throw error;
  }

  const referrals = data || [];
  const completedReferrals = referrals.filter(r => r.status === 'completed').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

  return {
    totalReferrals: referrals.length,
    completedReferrals,
    pendingReferrals,
    referrals
  };
}

/**
 * Create a referral record when a user registers with a referral code
 */
export async function createReferral(referrerId: string, referredId: string): Promise<void> {
  const supabase = requireSupabaseClient();

  const { error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrerId,
      referred_id: referredId,
      status: 'pending'
    });

  if (error) {
    // Ignore duplicate referral errors
    if (error.code === '23505') {
      console.log('Referral already exists');
      return;
    }
    console.error('Error creating referral:', error);
    throw error;
  }
}

/**
 * Mark a referral as completed (called after first login)
 */
export async function completeReferral(referredId: string): Promise<void> {
  const supabase = requireSupabaseClient();

  const { error } = await supabase
    .from('referrals')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('referred_id', referredId)
    .eq('status', 'pending');

  if (error) {
    console.error('Error completing referral:', error);
    throw error;
  }
}

/**
 * Generate a referral link for the current user
 */
export function generateReferralLink(userId: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'https://vibestudy.vercel.app';
  
  return `${baseUrl}/login?ref=${userId}`;
}
