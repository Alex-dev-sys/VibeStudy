'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InteractiveOnboarding } from '@/components/onboarding/InteractiveOnboarding';
import { useOnboardingStore } from '@/store/onboarding-store';
import { ONBOARDING_STEPS } from '@/lib/onboarding/steps';

export default function OnboardingDemoPage() {
  const { startOnboarding, resetOnboarding, setSteps, hasCompletedOnboarding } = useOnboardingStore();
  const [showDemo, setShowDemo] = useState(false);

  const handleStartDemo = () => {
    setSteps(ONBOARDING_STEPS);
    setShowDemo(true);
    setTimeout(() => {
      startOnboarding();
    }, 100);
  };

  const handleReset = () => {
    resetOnboarding();
    setShowDemo(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c061c] via-[#1a0b2e] to-[#0c061c] p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Interactive Onboarding Demo
          </h1>
          <p className="text-lg text-white/70">
            Simplified 3-step tutorial with spotlight and tooltips
          </p>
        </div>

        {/* Controls */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                Onboarding Controls
              </h2>
              <p className="text-sm text-white/60">
                Status: {hasCompletedOnboarding ? '✓ Completed' : '○ Not completed'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleReset}>
                Reset Onboarding
              </Button>
              <Button variant="primary" onClick={handleStartDemo}>
                Start Demo
              </Button>
            </div>
          </div>
        </Card>

        {/* Demo Content */}
        {showDemo && (
          <div className="space-y-6">
            {/* Step 1: Start Day */}
            <Card className="p-8" data-onboarding="start-day">
              <div className="text-center">
                <div className="mb-4 text-6xl">🚀</div>
                <h2 className="mb-3 text-2xl font-bold text-white">
                  День 1: Основы программирования
                </h2>
                <p className="mb-6 text-white/70">
                  Получи персональные задания и начни свой путь в программировании
                </p>
                <Button variant="primary" size="lg">
                  Начать день
                </Button>
              </div>
            </Card>

            {/* Step 2: Task List */}
            <Card className="p-6" data-onboarding="task-list">
              <h3 className="mb-4 text-xl font-semibold text-white">
                Практические задания
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                      {i}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        Задание {i}: Напиши свою первую программу
                      </div>
                      <div className="text-sm text-white/60">
                        Сложность: Легкая • ~10 минут
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Открыть
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Step 3: Complete Day */}
            <Card
              className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 p-6"
              data-onboarding="complete-day"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-1 font-semibold text-white">
                    Отличная работа! 🎉
                  </h3>
                  <p className="text-sm text-white/70">
                    Все задания выполнены. Завершить день?
                  </p>
                </div>
                <Button variant="primary" size="lg">
                  Завершить день
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Features */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="mb-3 text-3xl">🎯</div>
            <h3 className="mb-2 font-semibold text-white">
              Spotlight Positioning
            </h3>
            <p className="text-sm text-white/60">
              Dynamic spotlight highlights target elements with precise positioning
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-3 text-3xl">💬</div>
            <h3 className="mb-2 font-semibold text-white">
              Smart Tooltips
            </h3>
            <p className="text-sm text-white/60">
              Tooltips automatically position themselves based on available space
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-3 text-3xl">⏸️</div>
            <h3 className="mb-2 font-semibold text-white">
              Resume Progress
            </h3>
            <p className="text-sm text-white/60">
              Onboarding progress is saved and can be resumed later
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-3 text-3xl">⌨️</div>
            <h3 className="mb-2 font-semibold text-white">
              Keyboard Navigation
            </h3>
            <p className="text-sm text-white/60">
              Use arrow keys, Enter, and Esc for full keyboard control
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-3 text-3xl">🔘</div>
            <h3 className="mb-2 font-semibold text-white">
              Progress Dots
            </h3>
            <p className="text-sm text-white/60">
              Visual indicators show current step and overall progress
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-3 text-3xl">✕</div>
            <h3 className="mb-2 font-semibold text-white">
              Skip Anytime
            </h3>
            <p className="text-sm text-white/60">
              Skip button is always visible for user control
            </p>
          </Card>
        </div>

        {/* Implementation Details */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Implementation Details
          </h2>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span>3-step tutorial (start day, complete tasks, finish day)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span>Spotlight with backdrop blur overlay</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span>Dynamic tooltip positioning based on target elements</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span>Skip button visible at all times</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span>Progress dots showing current step</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span>Onboarding progress saved to localStorage for resume</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span>Keyboard navigation (Arrow keys, Enter, Esc)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span>Smooth animations with Framer Motion</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Render onboarding component */}
      {showDemo && <InteractiveOnboarding />}
    </div>
  );
}
