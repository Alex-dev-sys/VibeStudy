'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { SocialProofBanner } from '@/components/landing/SocialProofBanner';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { getCurrentUser } from '@/lib/supabase/auth';
import { GuestModeManager } from '@/lib/auth/guest-mode';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          // If user is authenticated, redirect to /learn
          router.push('/learn');
        } else {
          // Initialize guest mode for non-authenticated users
          GuestModeManager.initGuestMode();
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Initialize guest mode on error
        GuestModeManager.initGuestMode();
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      
      {/* Hero Section - Single focus */}
      <HeroSection />
      
      {/* Social Proof - Build trust */}
      <SocialProofBanner />
      
      {/* Benefits - Progressive disclosure */}
      <BenefitsSection />
      
      {/* How It Works - Clear steps */}
      <HowItWorksSection />
      
      {/* CTA Section - Final conversion */}
      <FinalCTASection />
    </main>
  );
}
