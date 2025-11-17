'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboarding-store';
import { ONBOARDING_STEPS } from '@/lib/onboarding/steps';
import { OnboardingTour } from './OnboardingTour';

interface OnboardingProviderProps {
  children: React.ReactNode;
  context?: 'landing' | 'learning' | 'playground';
}

export function OnboardingProvider({ children, context }: OnboardingProviderProps) {
  const pathname = usePathname();
  const { hasCompletedOnboarding, startOnboarding, setSteps } = useOnboardingStore();

  // Determine context from pathname if not explicitly provided
  const effectiveContext = context || (
    pathname === '/' ? 'landing' :
    pathname?.startsWith('/learn') ? 'learning' :
    pathname?.startsWith('/playground') ? 'playground' :
    'landing'
  );

  useEffect(() => {
    // Set onboarding steps
    setSteps(ONBOARDING_STEPS);

    // Only auto-start onboarding in learning or playground contexts
    // Landing page shows benefit cards instead
    if (!hasCompletedOnboarding && (effectiveContext === 'learning' || effectiveContext === 'playground')) {
      const timer = setTimeout(() => {
        startOnboarding();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, startOnboarding, setSteps, effectiveContext]);

  return (
    <>
      {children}
      {/* Only show onboarding tour in learning/playground contexts */}
      {effectiveContext !== 'landing' && <OnboardingTour />}
    </>
  );
}
