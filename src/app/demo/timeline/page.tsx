'use client';

import { DayTimeline } from '@/components/dashboard/DayTimeline';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';

export default function TimelineDemo() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <GradientBackdrop blur className="-z-20" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      
      <div className="relative z-10 flex min-h-screen flex-col gap-8 px-4 py-8 md:px-8 md:py-10 lg:px-14">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">Improved Day Timeline Demo</h1>
          <p className="text-white/70 mb-8">
            Testing the redesigned day timeline navigation with horizontal scrolling, 
            progress indicators, and smooth animations.
          </p>
          
          <DayTimeline />
          
          <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Features Implemented:</h2>
            <ul className="space-y-2 text-white/80">
              <li>✓ Horizontal scrollable timeline with all 90 days</li>
              <li>✓ Visual states: completed (green), current (primary gradient), locked, available</li>
              <li>✓ Progress indicators showing completed tasks (e.g., 3/5)</li>
              <li>✓ Auto-scroll to active day on mount</li>
              <li>✓ Distinct visual treatment for current day (ring, scale, shadow)</li>
              <li>✓ Week markers below timeline</li>
              <li>✓ Smooth scroll behavior</li>
              <li>✓ Hover tooltips showing day topics</li>
              <li>✓ Framer Motion animations for interactions</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
