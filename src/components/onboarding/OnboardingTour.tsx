'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding-store';
import { Button } from '@/components/ui/Button';

export function OnboardingTour() {
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding
  } = useOnboardingStore();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const updateTargetPosition = () => {
      const element = document.querySelector(currentStepData.targetElement);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    };

    updateTargetPosition();
    
    // Update position on scroll or resize
    window.addEventListener('scroll', updateTargetPosition, true);
    window.addEventListener('resize', updateTargetPosition);
    
    return () => {
      window.removeEventListener('scroll', updateTargetPosition, true);
      window.removeEventListener('resize', updateTargetPosition);
    };
  }, [isActive, currentStepData]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipOnboarding();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isLastStep) {
          completeOnboarding();
        } else {
          nextStep();
        }
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        previousStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isLastStep, isFirstStep, nextStep, previousStep, skipOnboarding, completeOnboarding]);

  if (!isActive || !currentStepData) return null;

  const getTooltipPosition = () => {
    // Always center the tooltip
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  };

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
            onClick={skipOnboarding}
          />

          {/* Spotlight */}
          {targetRect && currentStepData.position !== 'center' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[9999] rounded-lg border-4 border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                pointerEvents: 'none'
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[10000] w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 shadow-2xl"
            style={getTooltipPosition()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress indicator */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-white/60">
                Шаг {currentStep + 1} из {steps.length}
              </span>
              <button
                onClick={skipOnboarding}
                className="text-sm text-white/60 hover:text-white"
                aria-label="Пропустить обучение"
              >
                Пропустить
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-accent-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <h3 className="mb-3 text-xl font-semibold text-white">
              {currentStepData.title}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-white/70">
              {currentStepData.description}
            </p>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousStep}
                disabled={isFirstStep}
                className="text-white/70 hover:text-white disabled:opacity-30"
              >
                ← Назад
              </Button>
              
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-accent'
                        : index < currentStep
                        ? 'bg-accent/50'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={isLastStep ? completeOnboarding : nextStep}
              >
                {isLastStep ? 'Завершить' : 'Далее →'}
              </Button>
            </div>

            {/* Keyboard hints */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/40">
              <span>← → Навигация</span>
              <span>Esc Пропустить</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
