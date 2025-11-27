'use client';

import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from '@/store/locale-store';

export default function AnalyticsPage() {
  const t = useTranslations();

  return (
    <main id="main-content" className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 pt-[72px] md:pt-8 pb-[80px] md:pb-8 overflow-hidden">

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Back button */}
        <Link
          href="/learn"
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.analytics.backToLearning}</span>
        </Link>

        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
              {t.analytics.title}
            </span>
          </h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl">
            {t.analytics.subtitle}
          </p>
        </header>

        {/* Dashboard */}
        <section aria-label={t.analytics.overview}>
          <AnalyticsDashboard />
        </section>
      </div>
    </main>
  );
}
