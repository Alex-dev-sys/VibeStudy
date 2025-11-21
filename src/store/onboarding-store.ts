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
  lastStepCompleted: number; // Track progress for resume
  
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
      lastStepCompleted: -1,
      
      startOnboarding: () => {
        const { lastStepCompleted } = get();
        // Resume from last completed step if available
        const resumeStep = lastStepCompleted >= 0 ? lastStepCompleted + 1 : 0;
        set({ isActive: true, currentStep: resumeStep });
      },
      
      nextStep: () => {
        const { currentStep, steps } = get();
        if (currentStep < steps.length - 1) {
          const nextStepIndex = currentStep + 1;
          set({ 
            currentStep: nextStepIndex,
            lastStepCompleted: currentStep // Save progress
          });
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
          currentStep: 0,
          lastStepCompleted: -1
        });
      },
      
      completeOnboarding: () => {
        const { steps } = get();
        set({ 
          isActive: false, 
          hasCompletedOnboarding: true,
          currentStep: 0,
          lastStepCompleted: steps.length - 1
        });
      },
      
      resetOnboarding: () => {
        set({ 
          isActive: false,
          currentStep: 0,
          hasCompletedOnboarding: false,
          lastStepCompleted: -1
        });
      },
      
      setSteps: (steps: OnboardingStep[]) => {
        set({ steps });
      }
    }),
    {
      name: 'vibestudy-onboarding',
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        lastStepCompleted: state.lastStepCompleted
      })
    }
  )
);
