'use client';

import Link from 'next/link';
import { BookOpen, Trophy, BarChart3, Code2, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { EmptyAchievements } from '@/components/profile/EmptyAchievements';
import { EmptyStatistics } from '@/components/profile/EmptyStatistics';
import { EmptySnippets } from '@/components/playground/EmptySnippets';
import { EmptyAnalytics } from '@/components/analytics/EmptyAnalytics';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { toast } from '@/lib/ui/toast';

export default function EmptyStatesDemo() {
  const handleAction = (action: string) => {
    toast.success('Action triggered', `You clicked: ${action}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <GradientBackdrop blur className="-z-20" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      
      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-12 px-4 py-16 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            <span>🎨</span>
            <span>UX Design System</span>
          </div>
          <h1 className="text-4xl font-bold">
            <AnimatedGradientText>Empty States Showcase</AnimatedGradientText>
          </h1>
          <p className="text-lg text-white/70 max-w-3xl">
            Comprehensive empty state components following UX requirements 6.1-6.5. 
            Each empty state uses encouraging language, clear CTAs, and contextual help.
          </p>
          <Link href="/learn">
            <Button variant="secondary" size="md">
              ← Back to Learning
            </Button>
          </Link>
        </div>

        {/* Generic EmptyState Examples */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Generic EmptyState Component</h2>
            <p className="text-white/70">
              Reusable component with customizable props for any empty state scenario
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Size: Large */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Size: Large</h3>
              <EmptyState
                icon={Sparkles}
                title="Large Empty State"
                description="This is a large empty state with a Lucide icon. Perfect for full-page empty states."
                action={{
                  label: 'Primary Action',
                  onClick: () => handleAction('Large primary'),
                }}
                secondaryAction={{
                  label: 'Secondary',
                  onClick: () => handleAction('Large secondary'),
                }}
                helpText="This is contextual help text to guide users"
                metadata={
                  <div className="flex items-center justify-center gap-4">
                    <span>✨ Feature 1</span>
                    <span>•</span>
                    <span>🎯 Feature 2</span>
                  </div>
                }
                size="lg"
              />
            </div>

            {/* Size: Medium */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Size: Medium (Default)</h3>
              <EmptyState
                icon="🎨"
                title="Medium Empty State"
                description="This is a medium empty state with an emoji icon. Great for section-level empty states."
                action={{
                  label: 'Get Started',
                  onClick: () => handleAction('Medium primary'),
                }}
                helpText="Medium size is the default and most commonly used"
                size="md"
              />
            </div>

            {/* Size: Small */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Size: Small</h3>
              <EmptyState
                icon="📝"
                title="Small Empty State"
                description="Compact empty state for smaller sections or cards."
                action={{
                  label: 'Add Item',
                  onClick: () => handleAction('Small primary'),
                }}
                size="sm"
                dashed={false}
              />
            </div>

            {/* No Action */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Informational Only</h3>
              <EmptyState
                icon="ℹ️"
                title="No Actions Available"
                description="Sometimes empty states are purely informational without any actions."
                helpText="This empty state has no CTA buttons"
                size="md"
              />
            </div>
          </div>
        </section>

        {/* Specialized Empty States */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Specialized Empty States</h2>
            <p className="text-white/70">
              Purpose-built empty states for specific platform sections
            </p>
          </div>

          <div className="grid gap-6">
            {/* Achievements */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Empty Achievements
              </h3>
              <p className="text-sm text-white/60">
                Shown in profile when no achievements are unlocked
              </p>
              <EmptyAchievements onStartLearning={() => handleAction('Start learning from achievements')} />
            </div>

            {/* Statistics */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Empty Statistics
              </h3>
              <p className="text-sm text-white/60">
                Shown in profile when no learning data exists
              </p>
              <EmptyStatistics onStartLearning={() => handleAction('Start learning from statistics')} />
            </div>

            {/* Playground Snippets */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Empty Snippets
              </h3>
              <p className="text-sm text-white/60">
                Shown in playground when no code snippets are saved
              </p>
              <EmptySnippets onCreateSnippet={() => handleAction('Create snippet')} />
            </div>

            {/* Analytics */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Empty Analytics
              </h3>
              <p className="text-sm text-white/60">
                Shown in analytics page when no data is available
              </p>
              <EmptyAnalytics onStartLearning={() => handleAction('Start learning from analytics')} />
            </div>
          </div>
        </section>

        {/* Design Guidelines */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Design Guidelines</h2>
            <p className="text-white/70">
              Key principles for creating effective empty states
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-semibold mb-2">Clear Visual Hierarchy</h3>
              <p className="text-sm text-white/70">
                Illustration → Heading → Description → CTA
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold mb-2">Encouraging Language</h3>
              <p className="text-sm text-white/70">
                Use positive, action-oriented messaging
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Single Primary Action</h3>
              <p className="text-sm text-white/70">
                One prominent CTA, optional secondary
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-semibold mb-2">Contextual Help</h3>
              <p className="text-sm text-white/70">
                Provide helpful hints when appropriate
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold mb-2">Visual Consistency</h3>
              <p className="text-sm text-white/70">
                Unified design across all empty states
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-3xl mb-3">♿</div>
              <h3 className="font-semibold mb-2">Accessibility</h3>
              <p className="text-sm text-white/70">
                Keyboard navigation and screen reader support
              </p>
            </div>
          </div>
        </section>

        {/* Documentation Link */}
        <section className="rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 to-primary/10 p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">📚 Full Documentation</h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            For complete implementation details, usage examples, and guidelines, 
            see the Empty States Guide documentation.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => {
                window.open('/src/components/ui/EMPTY_STATES_GUIDE.md', '_blank');
              }}
            >
              View Documentation
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText('src/components/ui/EmptyState.tsx');
                toast.success('Copied!', 'Component path copied to clipboard');
              }}
            >
              Copy Component Path
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
