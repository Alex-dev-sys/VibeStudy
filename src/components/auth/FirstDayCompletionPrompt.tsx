'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthFlow } from './AuthFlow';
import { GuestModeManager } from '@/lib/auth/guest-mode';
import { getCurrentUser } from '@/lib/supabase/auth';
import { useProgressStore } from '@/store/progress-store';
import { logInfo } from '@/lib/logger';

/**
 * Component that handles:
 * 1. Showing account creation prompt after first day completion
 * 2. Migrating guest data when user authenticates
 */
export function FirstDayCompletionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const searchParams = useSearchParams();
  const completedDays = useProgressStore(state => state.record.completedDays);

  // Check if we should show the first day completion prompt
  useEffect(() => {
    const checkPrompt = () => {
      // Temporarily disabled - modal blocks interface
      // TODO: Fix Google Sign In button and re-enable
      return;
      
      // Don't show if already showing
      if (showPrompt) return;

      // Check if user just completed first day
      const shouldPrompt = GuestModeManager.shouldPromptAccountCreation();
      
      if (shouldPrompt) {
        logInfo('Showing first day completion prompt', { 
          component: 'FirstDayCompletionPrompt'
        });
        setShowPrompt(true);
      }
    };

    // Check immediately
    checkPrompt();

    // Also check when completed days changes
  }, [completedDays, showPrompt]);

  // Handle guest data migration after authentication
  useEffect(() => {
    const migrateGuest = async () => {
      const shouldMigrate = searchParams?.get('migrate_guest') === 'true';
      
      if (!shouldMigrate) return;

      const user = await getCurrentUser();
      
      if (user && GuestModeManager.isGuestMode()) {
        logInfo('Starting guest data migration', { 
          component: 'FirstDayCompletionPrompt',
          userId: user.id 
        });

        const success = await GuestModeManager.migrateGuestToUser(user.id);
        
        if (success) {
          logInfo('Guest data migration successful', { 
            component: 'FirstDayCompletionPrompt',
            userId: user.id 
          });
          
          // Reload to fetch synced data
          window.location.href = '/learn';
        }
      }
    };

    migrateGuest();
  }, [searchParams]);

  if (!showPrompt) {
    return null;
  }

  return (
    <AuthFlow 
      trigger="first-day-complete"
      onComplete={() => {
        setShowPrompt(false);
      }}
      onSkip={() => {
        setShowPrompt(false);
      }}
    />
  );
}
