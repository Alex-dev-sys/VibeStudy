'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocaleStore } from '@/store/locale-store';
import { showAuthNotification } from '@/lib/auth/notifications';
import { getCurrentUser } from '@/lib/supabase/auth';

export function RegistrationSuccessNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLocaleStore();
  
  useEffect(() => {
    const isNewUser = searchParams.get('new_user');
    
    const handleRegistration = async () => {
      const user = await getCurrentUser();
      
      if (user) {
        // Process referral for both new and returning users
        const referralCode = sessionStorage.getItem('referral_code');
        
        try {
          console.log('[Referral] Processing referral:', {
            userId: user.id,
            isNewUser: isNewUser === 'true',
            hasReferralCode: !!referralCode
          });
          
          // Call the API to process referral
          const response = await fetch('/api/referrals/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              referrerId: referralCode || null,
              isNewUser: isNewUser === 'true'
            }),
          });
          
          if (response.ok) {
            console.log('[Referral] Referral processed successfully');
            
            // Clear the referral code from sessionStorage
            if (referralCode) {
              sessionStorage.removeItem('referral_code');
            }
            
            // Show success notification for new users
            if (isNewUser === 'true') {
              showAuthNotification({
                type: 'registration',
                locale: locale as 'ru' | 'en'
              });
            }
          } else {
            console.error('[Referral] Failed to process referral:', await response.text());
          }
        } catch (error) {
          console.error('[Referral] Error processing referral:', error);
          // Don't block the user flow if referral fails
        }
        
        // Clean up URL by removing the query parameters
        if (isNewUser === 'true') {
          if (typeof window !== 'undefined') {
            const { pathname } = window.location;
            window.history.replaceState({}, '', pathname);
            router.replace(pathname, { scroll: false });
          } else {
            router.replace('/learn', { scroll: false });
          }
        }
      }
    };
    
    handleRegistration();
  }, [searchParams, router, locale]);
  
  return null;
}
