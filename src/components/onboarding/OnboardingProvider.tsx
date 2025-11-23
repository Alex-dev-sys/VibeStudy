'use client';

interface OnboardingProviderProps {
  children: React.ReactNode;
  context?: 'landing' | 'learning' | 'playground';
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  return <>{children}</>;
}
