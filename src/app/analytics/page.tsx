'use client';

import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from '@/store/locale-store';

export default function AnalyticsPage() {
  const t = useTranslations();
  
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-[#0c061c] via-[#1a0b2e] to-[#0c061c] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back button */}
        <Link 
          href="/learn"
          className="mb-6 inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.analytics.backToLearning}</span>
        </Link>
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            📊 {t.analytics.title}
          </h1>
          <p className="mt-2 text-lg text-white/70">
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
