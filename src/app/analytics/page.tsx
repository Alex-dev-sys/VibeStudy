'use client';

import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from '@/store/locale-store';
import { GradientBackdrop } from '@/components/layout/GradientBackdrop';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  const t = useTranslations();

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden text-white pt-[72px] md:pt-0 pb-[80px] md:pb-0">
      <GradientBackdrop className="opacity-40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col items-start gap-6">
          <Link href="/learn">
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white pl-0 hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t.analytics.backToLearning}
            </Button>
          </Link>

          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{t.analytics.title}</span>
            </h1>
            <p className="mt-2 text-lg text-white/60 max-w-2xl">
              {t.analytics.subtitle}
            </p>
          </div>
        </div>

        {/* Dashboard */}
        <section aria-label={t.analytics.overview}>
          <AnalyticsDashboard />
        </section>
      </div>
    </main>
  );
}
