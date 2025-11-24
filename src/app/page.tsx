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
      {/* Header with login button */}
      <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 bg-[#050505]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-[#ff4bc1] to-[#ffd34f] bg-clip-text text-transparent">
              VibeStudy
            </span>
          </div>
          <Link href="/login">
            <button
              aria-label="Войти в аккаунт"
              className="rounded-full border-2 border-white/20 bg-white/5 px-6 py-2 font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
            >
              Войти
            </button>
          </Link>
        </div>
      </header>

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
