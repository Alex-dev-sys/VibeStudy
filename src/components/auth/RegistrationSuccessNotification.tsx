'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocaleStore } from '@/store/locale-store';
import { showAuthNotification } from '@/lib/auth/notifications';
import { getCurrentUser } from '@/lib/supabase/auth';
import { createReferral, completeReferral } from '@/lib/supabase/referrals';

export function RegistrationSuccessNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLocaleStore();
  
  useEffect(() => {
    const registered = searchParams.get('registered');
    const isNewUser = searchParams.get('new_user');
    
    const handleRegistration = async () => {
      if (registered === 'true') {
        // Show success message using the reusable utility
        showAuthNotification({
          type: 'registration',
          locale: locale as 'ru' | 'en'
        });
        
        // Handle referral logic
        const user = await getCurrentUser();
        if (user) {
          // Check if this is a new user registration
          if (isNewUser === 'true') {
            // Get referral code from sessionStorage
            const referralCode = sessionStorage.getItem('referral_code');
            
            if (referralCode) {
              try {
                console.log('[Referral] Creating referral record for new user:', user.id, 'referred by:', referralCode);
                await createReferral(referralCode, user.id);
                
                // Complete the referral immediately after first successful login
                console.log('[Referral] Completing referral for user:', user.id);
                await completeReferral(user.id);
                
                // Clear the referral code from sessionStorage
                sessionStorage.removeItem('referral_code');
                
                console.log('[Referral] Referral process completed successfully');
              } catch (error) {
                console.error('[Referral] Error processing referral:', error);
                // Don't block the user flow if referral fails
              }
            }
          } else {
            // For returning users, check if they have a pending referral to complete
            try {
              console.log('[Referral] Checking for pending referral for user:', user.id);
              await completeReferral(user.id);
              console.log('[Referral] Completed pending referral for user:', user.id);
            } catch (error) {
              // Silently fail - user might not have a pending referral
              console.log('[Referral] No pending referral to complete or error:', error);
            }
          }
        }
        
        // Clean up URL by removing the query parameters
        if (typeof window !== 'undefined') {
          const { pathname } = window.location;
          window.history.replaceState({}, '', pathname);
          router.replace(pathname, { scroll: false });
        } else {
          router.replace('/learn', { scroll: false });
        }
      }
    };
    
    handleRegistration();
  }, [searchParams, router, locale]);
  
  return null;
}
