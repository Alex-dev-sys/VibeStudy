'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocaleStore } from '@/store/locale-store';
import { showAuthNotification } from '@/lib/auth/notifications';

export function RegistrationSuccessNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLocaleStore();
  
  useEffect(() => {
    const registered = searchParams.get('registered');
    
    if (registered === 'true') {
      // Show success message using the reusable utility
      showAuthNotification({
        type: 'registration',
        locale: locale as 'ru' | 'en'
      });
      
      // Clean up URL by removing the query parameter
      router.replace('/learn', { scroll: false });
    }
  }, [searchParams, router, locale]);
  
  return null;
}
