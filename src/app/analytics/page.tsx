import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Аналитика обучения | VibeStudy',
  description: 'Детальная статистика вашего прогресса, скорость обучения и персональные рекомендации',
  openGraph: {
    title: 'Аналитика обучения | VibeStudy',
    description: 'Отслеживайте свой прогресс и получайте персональные рекомендации',
    type: 'website'
  }
};

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0c061c] via-[#1a0b2e] to-[#0c061c] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            📊 Аналитика обучения
          </h1>
          <p className="mt-2 text-lg text-white/70">
            Отслеживай свой прогресс и получай персональные рекомендации
          </p>
        </div>
        
        {/* Dashboard */}
        <AnalyticsDashboard />
      </div>
    </main>
  );
}
