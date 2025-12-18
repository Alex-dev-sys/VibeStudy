import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';
import { RATE_LIMITS, evaluateRateLimit, buildRateLimitHeaders } from '@/lib/core/rate-limit';
import { logError } from '@/lib/core/logger';
import { errorHandler } from '@/lib/core/error-handler';
import type { GDPRExportData } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * GDPR Data Export API
 * Exports all user data in JSON format for GDPR compliance
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateState = await evaluateRateLimit(request, RATE_LIMITS.API_GENERAL, {
      bucketId: 'gdpr-export'
    });

    if (!rateState.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: buildRateLimitHeaders(rateState) }
      );
    }

    // Authentication check
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to export your data.' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const userId = user.id;

    // Initialize export data structure
    const exportData: GDPRExportData = {
      exportDate: new Date().toISOString(),
      userId,
      profile: null,
      progress: [],
      taskAttempts: [],
      achievements: [],
      topicMastery: [],
      telegramProfile: null,
      reminderSchedules: [],
      telegramMessages: [],
      learningAnalytics: [],
      botConversations: [],
      aiQuestionTracking: [],
      payments: [],
      referrals: [],
      aiFeedback: []
    };

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      logError('Error fetching user profile for export', profileError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.profile = profile;
    }

    // Fetch user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) {
      logError('Error fetching user progress for export', progressError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.progress = progress || [];
    }

    // Fetch task attempts
    const { data: taskAttempts, error: attemptsError } = await supabase
      .from('task_attempts')
      .select('*')
      .eq('user_id', userId);

    if (attemptsError) {
      logError('Error fetching task attempts for export', attemptsError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.taskAttempts = taskAttempts || [];
    }

    // Fetch achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (achievementsError) {
      logError('Error fetching achievements for export', achievementsError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.achievements = achievements || [];
    }

    // Fetch topic mastery
    const { data: topicMastery, error: masteryError } = await supabase
      .from('topic_mastery')
      .select('*')
      .eq('user_id', userId);

    if (masteryError) {
      logError('Error fetching topic mastery for export', masteryError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.topicMastery = topicMastery || [];
    }

    // Fetch Telegram profile
    const { data: telegramProfile, error: telegramError } = await supabase
      .from('user_telegram_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (telegramError && telegramError.code !== 'PGRST116') {
      logError('Error fetching telegram profile for export', telegramError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.telegramProfile = telegramProfile;
    }

    // Fetch reminder schedules
    const { data: reminders, error: remindersError } = await supabase
      .from('reminder_schedules')
      .select('*')
      .eq('user_id', userId);

    if (remindersError) {
      logError('Error fetching reminders for export', remindersError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.reminderSchedules = reminders || [];
    }

    // Fetch telegram messages
    const { data: messages, error: messagesError } = await supabase
      .from('telegram_messages')
      .select('*')
      .eq('user_id', userId);

    if (messagesError) {
      logError('Error fetching telegram messages for export', messagesError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.telegramMessages = messages || [];
    }

    // Fetch learning analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('learning_analytics')
      .select('*')
      .eq('user_id', userId);

    if (analyticsError) {
      logError('Error fetching learning analytics for export', analyticsError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.learningAnalytics = analytics || [];
    }

    // Fetch bot conversations
    const { data: conversations, error: conversationsError } = await supabase
      .from('bot_conversations')
      .select('*')
      .eq('user_id', userId);

    if (conversationsError) {
      logError('Error fetching bot conversations for export', conversationsError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.botConversations = conversations || [];
    }

    // Fetch AI question tracking
    const { data: aiTracking, error: aiTrackingError } = await supabase
      .from('ai_question_tracking')
      .select('*')
      .eq('user_id', userId);

    if (aiTrackingError) {
      logError('Error fetching AI tracking for export', aiTrackingError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.aiQuestionTracking = aiTracking || [];
    }

    // Fetch payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId);

    if (paymentsError) {
      logError('Error fetching payments for export', paymentsError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.payments = payments || [];
    }

    // Fetch referrals (both as referrer and referred)
    const { data: referralsAsReferrer, error: referralsError1 } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);

    const { data: referralsAsReferred, error: referralsError2 } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', userId);

    if (referralsError1 || referralsError2) {
      logError('Error fetching referrals for export', referralsError1 || referralsError2, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.referrals = [
        ...(referralsAsReferrer || []),
        ...(referralsAsReferred || [])
      ];
    }

    // Fetch AI feedback
    const { data: aiFeedback, error: feedbackError } = await supabase
      .from('ai_feedback')
      .select('*')
      .eq('user_id', userId);

    if (feedbackError) {
      logError('Error fetching AI feedback for export', feedbackError, {
        component: 'api/gdpr/export',
        userId
      });
    } else {
      exportData.aiFeedback = aiFeedback || [];
    }

    // Return the complete export
    return NextResponse.json(
      {
        success: true,
        data: exportData,
        message: 'Your data has been successfully exported. This includes all personal information, learning progress, and activity history.'
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="vibestudy-data-export-${userId}-${Date.now()}.json"`
        }
      }
    );

  } catch (error) {
    logError('Error in GDPR export endpoint', error as Error, {
      component: 'api/gdpr/export'
    });
    errorHandler.report(error as Error, {
      component: 'api/gdpr/export',
      action: 'GET'
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to export your data. Please try again later or contact support.'
      },
      { status: 500 }
    );
  }
}
