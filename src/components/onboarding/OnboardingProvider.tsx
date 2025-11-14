'use client';

import { useEffect } from 'react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { ONBOARDING_STEPS } from '@/lib/onboarding/steps';
import { OnboardingTour } from './OnboardingTour';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { hasCompletedOnboarding, startOnboarding, setSteps } = useOnboardingStore();

  useEffect(() => {
    // Set onboarding steps
    setSteps(ONBOARDING_STEPS);

    // Auto-start onboarding for first-time users after a short delay
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        startOnboarding();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, startOnboarding, setSteps]);

  return (
    <>
      {children}
      <OnboardingTour />
    </>
  );
}
