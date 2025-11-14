import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
}

interface OnboardingStore {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  hasCompletedOnboarding: boolean;
  
  startOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setSteps: (steps: OnboardingStep[]) => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStep: 0,
      steps: [],
      hasCompletedOnboarding: false,
      
      startOnboarding: () => {
        set({ isActive: true, currentStep: 0 });
      },
      
      nextStep: () => {
        const { currentStep, steps } = get();
        if (currentStep < steps.length - 1) {
          set({ currentStep: currentStep + 1 });
        } else {
          get().completeOnboarding();
        }
      },
      
      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },
      
      skipOnboarding: () => {
        set({ 
          isActive: false, 
          hasCompletedOnboarding: true,
          currentStep: 0
        });
      },
      
      completeOnboarding: () => {
        set({ 
          isActive: false, 
          hasCompletedOnboarding: true,
          currentStep: 0
        });
      },
      
      resetOnboarding: () => {
        set({ 
          isActive: false,
          currentStep: 0,
          hasCompletedOnboarding: false
        });
      },
      
      setSteps: (steps: OnboardingStep[]) => {
        set({ steps });
      }
    }),
    {
      name: 'vibestudy-onboarding',
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding
      })
    }
  )
);
