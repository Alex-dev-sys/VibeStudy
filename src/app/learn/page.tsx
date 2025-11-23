import dynamicImport from 'next/dynamic';
import { Suspense } from 'react';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';

import { generatePageMetadata, generateStructuredData } from '@/lib/seo/metadata';
import { RegistrationSuccessNotification } from '@/components/auth/RegistrationSuccessNotification';
import { FirstDayCompletionPrompt } from '@/components/auth/FirstDayCompletionPrompt';
import type { Metadata } from 'next';

const LearningDashboard = dynamicImport(() => import('@/components/dashboard/LearningDashboard'), { ssr: false });

// Disable static generation for this page (AI Assistant requires client-side rendering)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  ...generatePageMetadata('learn'),
  other: {
    'structured-data': JSON.stringify(generateStructuredData('WebPage'))
  }
};

export default function LearnPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <Suspense fallback={null}>
        <RegistrationSuccessNotification />
        <FirstDayCompletionPrompt />
      </Suspense>
      <div className="absolute inset-0 -z-30 bg-[var(--hdr-gradient)]" />
      <GradientBackdrop blur className="-z-20" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <div className="relative z-10 flex min-h-screen flex-col gap-4 px-3 py-6 sm:gap-6 sm:px-4 sm:py-8 md:gap-8 md:px-8 md:py-10 lg:px-14">
        <LearningDashboard />
      </div>
    </main>
  );
}

