#!/usr/bin/env node

/**
 * Grant Pro+ Subscription Script
 * Grants Pro+ tier to aleksei.kolganov.2019@gmail.com
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function grantProPlus() {
  const email = 'aleksei.kolganov.2019@gmail.com';
  
  console.log('🚀 Granting Pro+ subscription...');
  console.log(`📧 Email: ${email}`);
  
  try {
    // Update user tier
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({
        tier: 'pro_plus',
        tier_expires_at: '2099-12-31T23:59:59Z',
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      process.exit(1);
    }

    if (!user) {
      console.error('❌ User not found with email:', email);
      console.log('💡 Make sure the user has logged in at least once');
      process.exit(1);
    }

    console.log('✅ User tier updated successfully!');
    console.log('📊 User details:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Tier: ${user.tier}`);
    console.log(`   - Expires: ${user.tier_expires_at}`);

    // Log the subscription grant
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount_ton: 0,
        amount_usd: 0,
        tier: 'pro_plus',
        status: 'completed',
        payment_comment: 'Admin grant - Lifetime Pro+ subscription',
      });

    if (paymentError) {
      console.warn('⚠️  Warning: Could not log payment:', paymentError.message);
    } else {
      console.log('✅ Payment logged successfully');
    }

    console.log('\n🎉 Pro+ subscription granted successfully!');
    console.log('🔥 Features unlocked:');
    console.log('   - Claude 3.5 Sonnet AI model');
    console.log('   - 100 requests per minute');
    console.log('   - AI Learning Assistant');
    console.log('   - Priority support');
    console.log('   - Lifetime access');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

grantProPlus();
