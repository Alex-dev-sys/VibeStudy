'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SpotlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function InteractiveOnboarding() {
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding
  } = useOnboardingStore();

  const [spotlightPosition, setSpotlightPosition] = useState<SpotlightPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: string; left: string; transform: string }>({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  });

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Calculate spotlight and tooltip positions
  const updatePositions = useCallback(() => {
    if (!currentStepData || !isActive) return;

    const element = document.querySelector(currentStepData.targetElement);
    if (!element) {
      setSpotlightPosition(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = 8;

    // Set spotlight position
    setSpotlightPosition({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    });

    // Calculate tooltip position based on step position
    const tooltipWidth = 384; // max-w-sm = 384px
    const tooltipHeight = 300; // approximate
    const spacing = 24;

    let top = '50%';
    let left = '50%';
    let transform = 'translate(-50%, -50%)';

    switch (currentStepData.position) {
      case 'top':
        top = `${rect.top - tooltipHeight - spacing}px`;
        left = `${rect.left + rect.width / 2}px`;
        transform = 'translateX(-50%)';
        break;
      case 'bottom':
        top = `${rect.bottom + spacing}px`;
        left = `${rect.left + rect.width / 2}px`;
        transform = 'translateX(-50%)';
        break;
      case 'left':
        top = `${rect.top + rect.height / 2}px`;
        left = `${rect.left - tooltipWidth - spacing}px`;
        transform = 'translateY(-50%)';
        break;
      case 'right':
        top = `${rect.top + rect.height / 2}px`;
        left = `${rect.right + spacing}px`;
        transform = 'translateY(-50%)';
        break;
      case 'center':
      default:
        // Keep centered
        break;
    }

    setTooltipPosition({ top, left, transform });

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }, [currentStepData, isActive]);

  // Update positions on mount and when step changes
  useEffect(() => {
    if (!isActive) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updatePositions, 100);

    // Update on scroll and resize
    window.addEventListener('scroll', updatePositions, true);
    window.addEventListener('resize', updatePositions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updatePositions, true);
      window.removeEventListener('resize', updatePositions);
    };
  }, [isActive, currentStep, updatePositions]);

  // Keyboard navigation
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9998]" style={{ pointerEvents: 'none' }}>
        {/* Backdrop overlay with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          style={{ pointerEvents: 'auto' }}
          onClick={skipOnboarding}
        />

        {/* Spotlight cutout effect */}
        {spotlightPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute rounded-xl"
            style={{
              top: spotlightPosition.top,
              left: spotlightPosition.left,
              width: spotlightPosition.width,
              height: spotlightPosition.height,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 4px rgb(255, 0, 148)',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="absolute w-full max-w-sm"
          style={{
            ...tooltipPosition,
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a0b2e] to-[#16213e] p-6 shadow-2xl">
            {/* Header with skip button */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">
                  {currentStepData.title}
                </h3>
              </div>
              <button
                onClick={skipOnboarding}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Пропустить обучение"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <p className="mb-6 text-sm leading-relaxed text-white/70">
              {currentStepData.description}
            </p>

            {/* Progress dots */}
            <div className="mb-6 flex items-center justify-center gap-2">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: index === currentStep ? 1.2 : 1,
                    backgroundColor: index === currentStep 
                      ? 'rgb(255, 0, 148)' 
                      : index < currentStep 
                      ? 'rgba(255, 0, 148, 0.5)' 
                      : 'rgba(255, 255, 255, 0.2)'
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-2 w-2 rounded-full"
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousStep}
                disabled={isFirstStep}
                className={cn(
                  "text-white/70 hover:text-white",
                  isFirstStep && "opacity-30 cursor-not-allowed"
                )}
              >
                ← Назад
              </Button>

              <div className="text-xs text-white/50">
                {currentStep + 1} / {steps.length}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={isLastStep ? completeOnboarding : nextStep}
              >
                {isLastStep ? 'Понятно!' : 'Далее →'}
              </Button>
            </div>

            {/* Keyboard hints */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/40">
              <span>← → Навигация</span>
              <span>•</span>
              <span>Esc Пропустить</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
