'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ModernHero } from '@/components/landing/ModernHero';
import { StatsSection } from '@/components/landing/StatsSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { SocialProofBanner } from '@/components/landing/SocialProofBanner';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

import { GuestModeManager } from '@/lib/auth/guest-mode';

export default function HomePage() {
  useEffect(() => {
    // Initialize guest mode for non-authenticated users
    GuestModeManager.initGuestMode();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* Modern Hero Section */}
      <ModernHero locale="ru" />

      {/* Stats Section */}
      <StatsSection locale="ru" />

      {/* Social Proof - Build trust */}
      <SocialProofBanner />

      {/* Features Grid - Progressive disclosure */}
      <div id="benefits">
        <FeaturesGrid locale="ru" />
      </div>

      {/* How It Works - Clear steps */}
      <HowItWorksSection />

      {/* CTA Section - Final conversion */}
      <FinalCTASection />
    </main>
  );
}
